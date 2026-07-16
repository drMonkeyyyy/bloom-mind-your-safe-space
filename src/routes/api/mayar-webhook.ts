import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/mayar-webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          console.log('[Mayar Webhook] Received webhook notification');
          
          // 1. Verify webhook secret
          const url = new URL(request.url);
          const secretParam = url.searchParams.get('secret');
          const envSecret = process.env.MAYAR_WEBHOOK_SECRET;

          if (!envSecret) {
            console.error('[Mayar Webhook] MAYAR_WEBHOOK_SECRET is not configured in env!');
            return new Response(JSON.stringify({ error: 'Webhook misconfigured' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            });
          }

          if (secretParam !== envSecret) {
            console.warn('[Mayar Webhook] Unauthorized request (secret mismatch)');
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            });
          }

          // 2. Parse payload body
          const payload = await request.json();
          console.log('[Mayar Webhook] Payload:', JSON.stringify(payload));

          if (!payload || payload.event !== 'payment.received') {
            console.log(`[Mayar Webhook] Ignored non-payment event: ${payload?.event}`);
            return new Response(JSON.stringify({ ok: true, message: 'Ignored event' }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            });
          }

          const paymentData = payload.data;
          const statusValue = paymentData?.status;
          
          // Mayar sends status as a string (e.g. "SUCCESS", "success", "settlement", "paid")
          // or occasionally as a boolean. We should accept both, and since the event is already
          // 'payment.received', any truthy status that isn't failed/expired indicates success.
          const isSuccess = 
            statusValue === true ||
            (typeof statusValue === 'string' && [
              'success',
              'SUCCESS',
              'settlement',
              'paid',
              'disetujui'
            ].includes(statusValue)) ||
            (payload.event === 'payment.received' && statusValue !== false && statusValue !== 'failed' && statusValue !== 'FAILED');

          if (!paymentData || !isSuccess) {
            console.log('[Mayar Webhook] Payment status is not successful:', statusValue);
            return new Response(JSON.stringify({ ok: true, message: 'Payment status not success' }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            });
          }

          const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

          // Extract correlation IDs
          const productId = paymentData.productId; // Payment Link / Invoice ID
          const transactionId = paymentData.id;    // Transaction ID
          const extraOrderNumber = paymentData.extraData?.orderNumber;
          const extraOrderId = paymentData.extraData?.orderId;

          console.log('[Mayar Webhook] Matching order with:', {
            productId,
            transactionId,
            extraOrderNumber,
            extraOrderId
          });

          // 3. Find the matching order
          let orderQuery = supabaseAdmin.from('orders').select('*');
          if (extraOrderId) {
            orderQuery = orderQuery.eq('id', extraOrderId);
          } else if (extraOrderNumber) {
            orderQuery = orderQuery.eq('order_number', extraOrderNumber);
          } else {
            // Fallback: match by payment_link_id or transaction_id
            orderQuery = orderQuery.or(`payment_link_id.eq.${productId},transaction_id.eq.${transactionId}`);
          }

          const { data: order, error: orderErr } = await orderQuery.maybeSingle();

          if (orderErr) {
            console.error('[Mayar Webhook] Error searching for order:', orderErr.message);
            return new Response(JSON.stringify({ error: 'Database error searching order' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            });
          }

          if (!order) {
            console.warn('[Mayar Webhook] Order not found for webhook transaction', { productId, transactionId });
            return new Response(JSON.stringify({ error: 'Order not found' }), {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
            });
          }

          console.log(`[Mayar Webhook] Found order: ${order.order_number} (current status: ${order.payment_status})`);

          // 4. Idempotency check: if order is already marked as paid, return 200 OK
          if (order.payment_status === 'disetujui') {
            console.log('[Mayar Webhook] Order is already processed and approved');
            return new Response(JSON.stringify({ ok: true, message: 'Order already approved' }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            });
          }

          // 5. Update order status to 'disetujui' (approved)
          const now = new Date();
          const { error: updateOrderErr } = await supabaseAdmin
            .from('orders')
            .update({
              payment_status: 'disetujui',
              verified_at: now.toISOString(),
              admin_note: 'Paid automatically via Mayar Gateway',
            })
            .eq('id', order.id);

          if (updateOrderErr) {
            console.error('[Mayar Webhook] Failed to update order:', updateOrderErr.message);
            return new Response(JSON.stringify({ error: 'Failed to update order' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            });
          }

          // 6. Activate Premium Plan for user (7 days, 30 days or 365 days from now depending on package)
          const endDate = new Date(now);
          if (order.package_name === "Premium Tahunan") {
            endDate.setDate(endDate.getDate() + 365);
          } else if (order.package_name === "Premium Mingguan") {
            endDate.setDate(endDate.getDate() + 7);
          } else {
            endDate.setDate(endDate.getDate() + 30);
          }

          const { error: updateProfileErr } = await supabaseAdmin
            .from('profiles')
            .update({
              plan: 'premium',
              premium_start_date: now.toISOString(),
              premium_end_date: endDate.toISOString(),
            })
            .eq('id', order.user_id);

          if (updateProfileErr) {
            console.error('[Mayar Webhook] Failed to activate premium profile:', updateProfileErr.message);
            // Note: Order is marked as paid, but profile update failed. We return 500 so webhook retries,
            // or admin can manually verify.
            return new Response(JSON.stringify({ error: 'Failed to update user profile' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            });
          }

          console.log(`[Mayar Webhook] Successfully processed payment and activated Premium for user: ${order.user_id}`);
          
          return new Response(JSON.stringify({ ok: true, message: 'Payment successfully processed' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });

        } catch (error: any) {
          console.error('[Mayar Webhook] Uncaught server error:', error);
          return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      },
    },
  },
});

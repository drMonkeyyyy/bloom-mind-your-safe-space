// Server-side Mayar API integration

interface MayarPaymentRequest {
  name: string;
  email: string;
  amount: number;
  mobile: string;
  redirectUrl: string;
  description: string;
  expiredAt: string;
  extraData?: Record<string, any>;
}

interface MayarPaymentResponse {
  statusCode: number;
  messages: string;
  data: {
    id: string;
    transaction_id: string;
    transactionId: string;
    link: string;
  };
}

/**
 * Format a phone number to standard Indonesian format or return default fallback.
 * Mayar requires mobile phone to be a non-empty, valid phone string.
 */
function formatMobileNumber(phone: string | null | undefined): string {
  if (!phone) return '08123456789';
  
  // Clean non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If starts with 62, return as is (e.g., 62812...)
  if (cleaned.startsWith('62')) {
    return cleaned;
  }
  
  // If starts with +62 (which would have digits cleaned to 62), handled above
  
  // If starts with 0, replace with 62 or keep 08 (Mayar accepts standard 08... or 628...)
  if (cleaned.startsWith('0')) {
    return cleaned;
  }
  
  // Default fallback if digits are less than 9
  if (cleaned.length < 9) {
    return '08123456789';
  }
  
  return cleaned;
}

function getEnvValue(key: string): string | undefined {
  if (process.env[key]) return process.env[key];
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.[key]) {
    return (import.meta as any).env[key];
  }
  return undefined;
}

export async function createMayarPaymentLink(params: {
  name: string;
  email: string;
  amount: number;
  phone: string | null | undefined;
  redirectUrl: string;
  description: string;
  orderNumber: string;
  orderId: string;
}): Promise<MayarPaymentResponse['data']> {
  const apiKey = getEnvValue('MAYAR_API_KEY');
  const baseUrl = getEnvValue('MAYAR_API_URL') || 'https://api.mayar.id';
  
  if (!apiKey) {
    throw new Error('MAYAR_API_KEY is not configured in the environment.');
  }

  const mobile = formatMobileNumber(params.phone);
  
  // Payment expires in 24 hours
  const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const payload: MayarPaymentRequest = {
    name: params.name || params.email.split('@')[0],
    email: params.email,
    amount: params.amount,
    mobile: mobile,
    redirectUrl: params.redirectUrl,
    description: params.description,
    expiredAt: expiredAt,
    extraData: {
      orderNumber: params.orderNumber,
      orderId: params.orderId,
    }
  };

  const response = await fetch(`${baseUrl}/hl/v1/payment/create`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Mayar API Error]', errorText);
    throw new Error(`Failed to create Mayar payment link: ${response.statusText} (${errorText})`);
  }

  const result = (await response.json()) as MayarPaymentResponse;

  if (result.statusCode !== 200 || !result.data) {
    throw new Error(`Mayar payment generation failed: ${result.messages || 'Unknown error'}`);
  }

  return result.data;
}

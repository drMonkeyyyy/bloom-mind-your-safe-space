-- Add Mayar integration fields to the orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_link TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_link_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS transaction_id TEXT;

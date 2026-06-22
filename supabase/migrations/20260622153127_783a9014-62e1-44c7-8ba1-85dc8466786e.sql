
-- Restrict SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO service_role;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Storage policies: users upload/read own folder under transfer-proofs
CREATE POLICY "users upload own transfer proof" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'transfer-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "users read own transfer proof" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'transfer-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "users update own transfer proof" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'transfer-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "admins read all transfer proofs" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'transfer-proofs' AND public.has_role(auth.uid(),'admin'));

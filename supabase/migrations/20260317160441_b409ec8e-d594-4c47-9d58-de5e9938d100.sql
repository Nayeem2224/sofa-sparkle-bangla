
-- Allow the status log trigger to insert rows for anon users
CREATE POLICY "Allow trigger inserts for status logs" 
ON public.booking_status_logs 
FOR INSERT 
WITH CHECK (true);

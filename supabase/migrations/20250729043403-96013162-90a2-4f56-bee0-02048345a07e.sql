-- Enable real-time updates for key tables
ALTER TABLE public.data_points REPLICA IDENTITY FULL;
ALTER TABLE public.indicators REPLICA IDENTITY FULL;
ALTER TABLE public.engine_executions REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.data_points;
ALTER PUBLICATION supabase_realtime ADD TABLE public.indicators;
ALTER PUBLICATION supabase_realtime ADD TABLE public.engine_executions;
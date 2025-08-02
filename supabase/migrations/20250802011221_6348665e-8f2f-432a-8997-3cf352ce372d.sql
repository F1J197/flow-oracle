-- Create daily_reports table for storing generated market reports
CREATE TABLE public.daily_reports (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id TEXT NOT NULL UNIQUE,
    report_date DATE NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for daily reports (public read access for this MVP)
CREATE POLICY "Daily reports are viewable by everyone" 
ON public.daily_reports 
FOR SELECT 
USING (true);

-- Create index for efficient queries
CREATE INDEX idx_daily_reports_date ON public.daily_reports(report_date DESC);
CREATE INDEX idx_daily_reports_created_at ON public.daily_reports(created_at DESC);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_daily_reports_updated_at
BEFORE UPDATE ON public.daily_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
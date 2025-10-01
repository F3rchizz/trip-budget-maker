-- Create trips table
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_budget DECIMAL(12, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pendiente', 'en-progreso', 'completado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create budget_categories table
CREATE TABLE public.budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('alojamiento', 'transporte', 'comida', 'entretenimiento', 'seguros', 'libre', 'otro')),
  amount DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create movements table
CREATE TABLE public.movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('alojamiento', 'transporte', 'comida', 'entretenimiento', 'seguros', 'libre', 'otro')),
  amount DECIMAL(12, 2) NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movements ENABLE ROW LEVEL SECURITY;

-- Create policies (public access for now, can be restricted later with auth)
CREATE POLICY "Allow all operations on trips" ON public.trips FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on budget_categories" ON public.budget_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on movements" ON public.movements FOR ALL USING (true) WITH CHECK (true);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for trips table
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.trips
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_trips_status ON public.trips(status);
CREATE INDEX idx_budget_categories_trip_id ON public.budget_categories(trip_id);
CREATE INDEX idx_movements_trip_id ON public.movements(trip_id);
CREATE INDEX idx_movements_date ON public.movements(date);
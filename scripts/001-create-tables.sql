-- Create users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  birth_date DATE,
  zodiac_sign VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create love_calculations table
CREATE TABLE public.love_calculations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name1 TEXT NOT NULL,
  name2 TEXT NOT NULL,
  love_score INTEGER NOT NULL,
  compatibility_factors JSONB,
  message TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create compatibility_reports table
CREATE TABLE public.compatibility_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  calculation_id UUID REFERENCES public.love_calculations(id),
  personality_match INTEGER,
  communication_score INTEGER,
  emotional_compatibility INTEGER,
  lifestyle_compatibility INTEGER,
  long_term_potential INTEGER,
  detailed_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_favorites table
CREATE TABLE public.user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  calculation_id UUID REFERENCES public.love_calculations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, calculation_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.love_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compatibility_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own calculations" ON public.love_calculations
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own calculations" ON public.love_calculations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view reports for their calculations" ON public.compatibility_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.love_calculations 
      WHERE id = calculation_id AND (user_id = auth.uid() OR is_public = true)
    )
  );

CREATE POLICY "Users can manage own favorites" ON public.user_favorites
  FOR ALL USING (auth.uid() = user_id);

-- Create modules table
CREATE TABLE public.modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create videos table
CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for modules (public read)
CREATE POLICY "Anyone can view modules"
  ON public.modules FOR SELECT
  USING (true);

-- RLS Policies for videos (public read)
CREATE POLICY "Anyone can view videos"
  ON public.videos FOR SELECT
  USING (true);

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for comments
CREATE POLICY "Anyone can view comments"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert initial modules
INSERT INTO public.modules (title, description) VALUES
  ('Systematic Investment Plans (SIPs)', 'Learn the fundamentals of SIP investing and how to build wealth systematically over time.'),
  ('Stock Trading Basics', 'Master the basics of stock trading, market analysis, and investment strategies.'),
  ('Personal Finance Management', 'Understand budgeting, saving, and managing your personal finances effectively.');

-- Insert sample videos for each module
INSERT INTO public.videos (module_id, title, youtube_url)
SELECT 
  m.id,
  v.title,
  v.url
FROM public.modules m
CROSS JOIN LATERAL (
  VALUES 
    ('What is SIP? Complete Guide', 'https://www.youtube.com/embed/bMRzNHmiWEE'),
    ('SIP vs Lump Sum Investment', 'https://www.youtube.com/embed/XWGSwW5qWD8')
) AS v(title, url)
WHERE m.title = 'Systematic Investment Plans (SIPs)';

INSERT INTO public.videos (module_id, title, youtube_url)
SELECT 
  m.id,
  v.title,
  v.url
FROM public.modules m
CROSS JOIN LATERAL (
  VALUES 
    ('Stock Market Basics for Beginners', 'https://www.youtube.com/embed/p7HKvqRI_Bo'),
    ('How to Start Trading Stocks', 'https://www.youtube.com/embed/TxnQKhHVo4E')
) AS v(title, url)
WHERE m.title = 'Stock Trading Basics';

INSERT INTO public.videos (module_id, title, youtube_url)
SELECT 
  m.id,
  v.title,
  v.url
FROM public.modules m
CROSS JOIN LATERAL (
  VALUES 
    ('Personal Finance 101', 'https://www.youtube.com/embed/sVKQn2H7jVU'),
    ('Budgeting for Beginners', 'https://www.youtube.com/embed/7lHNMGoACdQ'),
    ('Building an Emergency Fund', 'https://www.youtube.com/embed/4FaH4nuFOWs')
) AS v(title, url)
WHERE m.title = 'Personal Finance Management';
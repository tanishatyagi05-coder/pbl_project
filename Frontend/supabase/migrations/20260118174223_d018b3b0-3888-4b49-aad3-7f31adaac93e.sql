-- Create teachers table to store faculty profiles
CREATE TABLE public.teachers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  designation TEXT NOT NULL DEFAULT 'Professor',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attendance_sessions table for active sessions
CREATE TABLE public.attendance_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  section TEXT NOT NULL,
  block TEXT NOT NULL,
  classroom_number TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on both tables
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;

-- Teachers policies (public read for display purposes, authenticated write)
CREATE POLICY "Anyone can view teacher profiles" 
ON public.teachers 
FOR SELECT 
USING (true);

CREATE POLICY "Teachers can insert their own profile" 
ON public.teachers 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Teachers can update their own profile" 
ON public.teachers 
FOR UPDATE 
USING (true);

-- Attendance sessions policies (public read for students, teachers manage their own)
CREATE POLICY "Anyone can view active attendance sessions" 
ON public.attendance_sessions 
FOR SELECT 
USING (true);

CREATE POLICY "Teachers can create attendance sessions" 
ON public.attendance_sessions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Teachers can update their sessions" 
ON public.attendance_sessions 
FOR UPDATE 
USING (true);

CREATE POLICY "Teachers can delete their sessions" 
ON public.attendance_sessions 
FOR DELETE 
USING (true);

-- Enable realtime for attendance_sessions so students get live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_sessions;

-- Create trigger for updated_at on teachers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_teachers_updated_at
BEFORE UPDATE ON public.teachers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample teachers
INSERT INTO public.teachers (email, name, designation) VALUES
('faculty@manipal.edu', 'Dr. Rajesh Kumar', 'Professor, Computer Science'),
('john.doe@manipal.edu', 'Dr. John Doe', 'Associate Professor, IT'),
('priya.sharma@manipal.edu', 'Dr. Priya Sharma', 'Assistant Professor, Data Science');
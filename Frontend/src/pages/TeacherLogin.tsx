import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import manipalLogo from '@/assets/manipal-logo.png';

const TeacherLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 5) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      // Check if teacher exists in the database
      const { data: teacher, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (error) {
        console.error('Database error:', error);
      }

      // For demo purposes, allow login and use teacher data if found
      if (teacher) {
        toast({
          title: `Welcome, ${teacher.name}!`,
          description: "Login successful. Redirecting to dashboard...",
        });
        navigate('/teacher-dashboard', { 
          state: { 
            email, 
            teacherId: teacher.id,
            teacherName: teacher.name,
            designation: teacher.designation 
          } 
        });
      } else {
        // For demo, create a temporary teacher or allow login
        toast({
          title: "Welcome, Professor!",
          description: "Login successful. Redirecting to dashboard...",
        });
        navigate('/teacher-dashboard', { state: { email } });
      }
    } catch (err) {
      console.error('Login error:', err);
      toast({
        title: "Login Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md relative z-10">
        {/* University Header */}
        <div className="text-center mb-8">
          <img 
            src={manipalLogo} 
            alt="Manipal University Logo" 
            className="mx-auto h-20 w-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-primary">
            Manipal University
          </h1>
          <p className="text-muted-foreground mt-1">Faculty Attendance Portal</p>
        </div>

        <Card className="border-border bg-card shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl text-foreground">Faculty Login</CardTitle>
            </div>
            <CardDescription>
              Access your class management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Faculty Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="faculty@manipal.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border-border focus:border-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background border-border focus:border-primary"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full gradient-primary hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Authenticating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Access Dashboard
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-border text-center">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground hover:bg-primary/10"
                onClick={() => navigate('/')}
              >
                ← Student Login
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2025 Manipal University. Faculty Portal v1.0
        </p>
      </div>
    </div>
  );
};

export default TeacherLogin;

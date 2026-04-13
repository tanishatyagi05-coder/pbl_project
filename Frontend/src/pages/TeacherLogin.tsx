import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
        description: "Password must be at least 5 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // ✅ Send query params to FastAPI backend
      const params = new URLSearchParams({
        email,
        password,
      });

      const res = await fetch(
        `http://127.0.0.1:8000/login/teacher?${params.toString()}`,
        { method: "POST" }
      );

      const data = await res.json();

      if (data.error) {
        toast({
          title: "Login Failed",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      // ✅ Save teacher in localStorage
      localStorage.setItem("user", JSON.stringify(data));

      toast({
        title: `Welcome ${data.name}`,
        description: "Login successful!",
      });

      navigate("/teacher-dashboard");

    } catch (err) {
      console.error(err);
      toast({
        title: "Backend Error",
        description: "Cannot connect to server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md relative z-10">

        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src={manipalLogo} 
            alt="Manipal University Logo" 
            className="mx-auto h-20 w-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-primary">
            Manipal University
          </h1>
          <p className="text-muted-foreground mt-1">
            Faculty Attendance Portal
          </p>
        </div>

        <Card className="border-border bg-card shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl text-foreground">
                Faculty Login
              </CardTitle>
            </div>
            <CardDescription>
              Access your class management dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="professor@manipal.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="demo1234"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full gradient-primary"
                disabled={isLoading}
              >
                {isLoading ? "Authenticating..." : "Access Dashboard"}
              </Button>

            </form>

            <div className="mt-6 pt-4 border-t border-border text-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
              >
                ← Student Login
              </Button>
            </div>

          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2025 Manipal University
        </p>

      </div>
    </div>
  );
};

export default TeacherLogin;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import manipalLogo from '@/assets/manipal-logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();   // 🔥 THIS IS IMPORTANT

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const isTeacher = email.includes("professor");

      const url = isTeacher
        ? "http://127.0.0.1:8000/login/teacher"
        : "http://127.0.0.1:8000/login/student";

      const params = new URLSearchParams();
      params.append("email", email);
      params.append("password", password);

      const res = await fetch(`${url}?${params.toString()}`, {
        method: "POST"
      });

      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      // 🔥 THIS updates AuthContext + localStorage
      login(data);

      toast.success('Login successful!');

      if (data.role === "teacher") {
        navigate('/teacher-dashboard');
      } else {
        navigate('/dashboard');
      }

    } catch (error) {
      console.error(error);
      toast.error('Backend not reachable');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-4">
          <img 
            src={manipalLogo} 
            alt="Manipal University Logo" 
            className="mx-auto h-24 w-auto"
          />
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-primary">
              Manipal University
            </h1>
            <p className="mt-2 text-xl font-semibold text-foreground">
              Smart Attendance
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Secure · Geofenced · Real-time
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12"
            />
          </div>

          <Button type="submit" className="h-12 w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            Demo: student1@manipal.edu / demo123
          </p>
          <Button
            variant="ghost"
            onClick={() => navigate('/teacher-login')}
          >
            Faculty Login →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;

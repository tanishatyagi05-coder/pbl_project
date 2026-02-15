import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, Camera, Sparkles, Clock, User2, BookOpen, Building2 } from 'lucide-react';
import manipalLogo from '@/assets/manipal-logo.png';
import { useState, useEffect } from 'react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeSession, setActiveSession] = useState<any>(null);

  // 🔥 FETCH SESSION FROM BACKEND
  useEffect(() => {
    const fetchSession = async () => {
      if (!user?.reg_no) return;

      try {
        const res = await fetch(
          `http://127.0.0.1:8000/student/session/${user.reg_no}`
        );

        const data = await res.json();

        if (data.session_id) {
          setActiveSession(data);
        } else {
          setActiveSession(null);
        }
      } catch (err) {
        console.error("Failed to fetch session", err);
      }
    };

    fetchSession();

    // refresh every 5 seconds so session appears live
    const interval = setInterval(fetchSession, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAttendance = () => {
    navigate('/location-consent');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card px-4 py-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={manipalLogo} className="h-12 w-auto" />
            <div className="space-y-0.5">
              <h1 className="text-xl font-bold text-primary">Manipal University</h1>
              <p className="text-sm text-muted-foreground">{user?.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-2xl space-y-6">

          {activeSession ? (
            <Card className="p-6 space-y-4">
              <div className="flex justify-between">
                <h2 className="text-lg font-bold">{activeSession.course_id}</h2>
                <Badge className="bg-green-500">Active</Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                {activeSession.block} - Room {activeSession.room} | Section {activeSession.section}
              </p>

              <Button onClick={handleMarkAttendance} className="w-full h-12">
                <Camera className="mr-2 h-5 w-5" />
                Mark Attendance Now
              </Button>
            </Card>

          ) : (
            <Card className="p-8 text-center">
              <Clock className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-1">No Active Session</h3>
              <p className="text-sm text-muted-foreground">
                Instructor hasn’t started attendance yet.
              </p>
            </Card>
          )}

        </div>
      </main>
    </div>
  );
};

export default Dashboard;

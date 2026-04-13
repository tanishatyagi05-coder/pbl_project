import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Power } from 'lucide-react';
import manipalLogo from '@/assets/manipal-logo.png';
import { API_BASE_URL } from '@/config';

interface ClassSession {
  courseId: string;
  section: string;
  block: string;
  classroomNumber: string;
  startTime: string;
  endTime: string;
}

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [isAttendanceActive, setIsAttendanceActive] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);

  const [classSession, setClassSession] = useState<ClassSession>({
    courseId: 'CSE3021',
    section: 'A1',
    block: 'AB1',
    classroomNumber: '301',
    startTime: '09:00',
    endTime: '10:30',
  });

  // Load session state from localStorage on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem("session_id");
    const savedIsActive = localStorage.getItem("is_attendance_active") === "true";
    
    if (savedSessionId && savedIsActive) {
      setCurrentSessionId(Number(savedSessionId));
      setIsAttendanceActive(true);
    }
  }, []);

  const handleToggleAttendance = async (checked: boolean) => {
    // If setting to true, we must have teacher_id
    if (checked && !user?.teacher_id) {
      toast({
        title: "Missing Login",
        description: "Please login again to start attendance.",
        variant: "destructive",
      });
      navigate('/teacher-login');
      return;
    }

    try {
      if (checked) {
        // START SESSION
        const params = new URLSearchParams({
          teacher_id: user.teacher_id,
          course_id: classSession.courseId,
          block: classSession.block,
          room: classSession.classroomNumber,
          section: classSession.section
        });

        const res = await fetch(
          `${API_BASE_URL}/session/start?${params.toString()}`,
          { method: "POST" }
        );

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const message = data.detail || data.error || "Failed to start session";
          toast({
            title: "Error",
            description: typeof message === 'string' ? message : JSON.stringify(message),
            variant: "destructive",
          });
          return;
        }

        if (data.session_id) {
          setCurrentSessionId(data.session_id);
          setIsAttendanceActive(true);
          localStorage.setItem("session_id", data.session_id.toString());
          localStorage.setItem("is_attendance_active", "true");

          toast({
            title: "Attendance Activated",
            description: "Students can now mark attendance.",
          });
        }

      } else {
        // STOP SESSION
        const sessionIdToStop = currentSessionId || localStorage.getItem("session_id");
        
        if (sessionIdToStop) {
          const res = await fetch(
            `${API_BASE_URL}/session/stop/${sessionIdToStop}`,
            { method: "POST" }
          );
          const data = await res.json().catch(() => ({}));
          
          if (!res.ok) {
            const message = data.detail || data.error || "Failed to stop session";
            toast({
              title: "Error",
              description: typeof message === 'string' ? message : JSON.stringify(message),
              variant: "destructive",
            });
            // Even if it fails, if the session is not found (maybe already stopped), 
            // we should probably allow the UI to reset.
            if (res.status !== 404 && !data.error?.includes("not found")) return;
          }
        }

        setIsAttendanceActive(false);
        setCurrentSessionId(null);
        localStorage.removeItem("session_id");
        localStorage.removeItem("is_attendance_active");

        toast({
          title: "Attendance Closed",
          description: "Session ended successfully.",
        });
      }

    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Backend not reachable. Check if server is running on port 8000.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("session_id");
    localStorage.removeItem("is_attendance_active");
    navigate('/teacher-login');
  };

  const handleInputChange = (field: keyof ClassSession, value: string) => {
    setClassSession(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 md:p-6 max-w-4xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img src={manipalLogo} className="h-14 w-auto" />
            <div>
              <h1 className="text-xl font-bold text-primary">Manipal University</h1>
              <p className="text-sm text-muted-foreground">Faculty Dashboard</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        <Card className="mb-6 border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Power className="w-6 h-6" />
                <div>
                  <CardTitle>Attendance Control</CardTitle>
                  <CardDescription>
                    {isAttendanceActive ? 'Session active' : 'Toggle to start attendance'}
                  </CardDescription>
                </div>
              </div>
              <Switch checked={isAttendanceActive} onCheckedChange={handleToggleAttendance}/>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Class Session Details</CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Input value={classSession.courseId} onChange={e=>handleInputChange('courseId',e.target.value)} />
            <Input value={classSession.section} onChange={e=>handleInputChange('section',e.target.value)} />

            <Select value={classSession.block} onValueChange={v=>handleInputChange('block',v)}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="AB1">AB1</SelectItem>
                <SelectItem value="AB2">AB2</SelectItem>
                <SelectItem value="AB3">AB3</SelectItem>
                <SelectItem value="LHC">LHC</SelectItem>
              </SelectContent>
            </Select>

            <Input value={classSession.classroomNumber} onChange={e=>handleInputChange('classroomNumber',e.target.value)} />
            <Input type="time" value={classSession.startTime} onChange={e=>handleInputChange('startTime',e.target.value)} />
            <Input type="time" value={classSession.endTime} onChange={e=>handleInputChange('endTime',e.target.value)} />

          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default TeacherDashboard;

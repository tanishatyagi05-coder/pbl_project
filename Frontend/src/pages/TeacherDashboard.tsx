// ONLY CHANGE: removed supabase import
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Clock, Users, Power, BookOpen, Building2, Calendar, LogOut,
  Sparkles, Radio, CheckCircle2, Settings, Hash,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import manipalLogo from '@/assets/manipal-logo.png';

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

  const stats = {
    totalStudents: 15,
    presentToday: 0,
    averageAttendance: 90,
  };

  const handleToggleAttendance = async () => {
    const newState = !isAttendanceActive;

    try {
      if (newState) {
        const params = new URLSearchParams({
          teacher_id: user.teacher_id,
          course_id: classSession.courseId,
          block: classSession.block,
          room: classSession.classroomNumber,
          section: classSession.section,
          latitude: "26.2389",
          longitude: "73.0243"
        });

        const res = await fetch(
          `http://127.0.0.1:8000/session/start?${params.toString()}`,
          { method: "POST" }
        );

        const data = await res.json();

        if (data.session_id) {
          setCurrentSessionId(data.session_id);
          setIsAttendanceActive(true);
          localStorage.setItem("session_id", data.session_id);

          toast({
            title: "Attendance Activated",
            description: "Students can now mark attendance.",
          });
        }

      } else {
        if (currentSessionId) {
          await fetch(
            `http://127.0.0.1:8000/session/stop/${currentSessionId}`,
            { method: "POST" }
          );
        }

        setIsAttendanceActive(false);
        setCurrentSessionId(null);
        localStorage.removeItem("session_id");

        toast({
          title: "Attendance Closed",
          description: "Session ended successfully.",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Backend not reachable",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("session_id");
    navigate('/teacher-login');
  };

  const handleInputChange = (field: keyof ClassSession, value: string) => {
    setClassSession(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 md:p-6 max-w-4xl mx-auto">

        {/* Header */}
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

        {/* Attendance Toggle */}
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

        {/* Class Details */}
        <Card className="mb-6">
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
                <SelectItem value="LHC">LHC - Lecture Hall Complex</SelectItem>
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

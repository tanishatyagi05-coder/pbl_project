import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAttendance } from '@/contexts/AttendanceContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, User, ArrowLeft, CheckCircle2, BookOpen, Building2 } from 'lucide-react';
import { toast } from 'sonner';

const Preview = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { capturedImage, location, activeSession, resetAttendance } = useAttendance();
  const navigate = useNavigate();

  if (!capturedImage || !location) {
    navigate('/dashboard');
    return null;
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const sessionId = localStorage.getItem("session_id");

      // convert base64 image → file
      const blob = await fetch(capturedImage).then(r => r.blob());
      const file = new File([blob], "attendance.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("reg_no", userData.reg_no);
      formData.append("session_id", String(Number(sessionId)));
      formData.append("latitude", String(location.latitude));
      formData.append("longitude", String(location.longitude));
      formData.append("photo", file);

      const response = await fetch(
        "http://127.0.0.1:8000/attendance/submit",
        {
          method: "POST",
          body: formData
        }
      );

      const data = await response.json();

      if (response.ok) {

        // 🔥 SHOW STATUS FROM BACKEND
        if (data.status === "Present") {
          toast.success(`Attendance marked PRESENT ✅ (${data.distance_meters}m from class)`);
        } else {
          toast.error(`Attendance marked ABSENT ❌ (${data.distance_meters}m away)`);
        }

        resetAttendance();
        navigate("/dashboard");

      } else {
        throw new Error(data.error || "Submission failed");
      }

    } catch (error) {
      console.error(error);
      toast.error("Failed to submit attendance");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    resetAttendance();
    navigate('/camera');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card px-4 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate('/camera')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-primary">Review & Submit</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-6">

          {activeSession && (
            <Card className="p-4 bg-primary/5 border-primary/20">
              <p className="text-sm font-semibold">{activeSession.courseId}</p>
              <p className="text-xs text-muted-foreground">
                {activeSession.block} - Room {activeSession.classroomNumber}
              </p>
              <Badge className="gradient-primary text-xs mt-2">Step 3/3</Badge>
            </Card>
          )}

          <Card className="overflow-hidden border-2 border-primary/20">
            <img
              src={capturedImage}
              alt="Captured attendance photo"
              className="aspect-[4/3] w-full object-cover"
            />
          </Card>

          <Card className="p-6">
            <div className="space-y-3">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleString()}
              </p>
            </div>
          </Card>

          <div className="space-y-3">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="h-14 w-full text-base font-semibold"
            >
              {isSubmitting ? "Submitting..." : "Submit Attendance"}
            </Button>

            <Button
              variant="outline"
              onClick={handleRetake}
              disabled={isSubmitting}
              className="h-12 w-full"
            >
              Retake Photo
            </Button>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Preview;

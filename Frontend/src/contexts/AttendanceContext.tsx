import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface ActiveSession {
  sessionId: number;
  courseId: string;
  section: string;
  block: string;
  classroomNumber: string;
  faculty: string;
  isActive: boolean;
}

interface AttendanceContextType {
  capturedImage: string | null;
  location: { latitude: number; longitude: number } | null;
  activeSession: ActiveSession | null;
  setCapturedImage: (image: string | null) => void;
  setLocation: (location: { latitude: number; longitude: number } | null) => void;
  resetAttendance: () => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const AttendanceProvider = ({ children }: { children: ReactNode }) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);

  // 🔥 Fetch session from FastAPI backend
  const fetchSession = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (!user.reg_no) return;

      const res = await fetch(
        `http://127.0.0.1:8000/student/session/${user.reg_no}`
      );

      const data = await res.json();

      if (data.session_id) {
        setActiveSession({
          sessionId: data.session_id,
          courseId: data.course_id,
          block: data.block,
          classroomNumber: data.room,
          section: data.section,
          faculty: data.teacher_id,
          isActive: true,
        });

        // store session id for submission step
        localStorage.setItem("session_id", data.session_id);
      } else {
        setActiveSession(null);
        localStorage.removeItem("session_id");
      }
    } catch (err) {
      console.error("Error fetching session:", err);
    }
  };

  // 🔁 Fetch on dashboard load
  useEffect(() => {
    fetchSession();
  }, []);

  const resetAttendance = () => {
    setCapturedImage(null);
    setLocation(null);
  };

  return (
    <AttendanceContext.Provider
      value={{
        capturedImage,
        location,
        activeSession,
        setCapturedImage,
        setLocation,
        resetAttendance,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error("useAttendance must be used within AttendanceProvider");
  }
  return context;
};

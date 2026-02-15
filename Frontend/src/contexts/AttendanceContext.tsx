import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ActiveSession {
  id?: string;
  courseId: string;
  section: string;
  block: string;
  classroomNumber: string;
  startTime: string;
  endTime: string;
  faculty: string;
  designation: string;
  isActive: boolean;
}

interface AttendanceContextType {
  capturedImage: string | null;
  location: { latitude: number; longitude: number } | null;
  activeSession: ActiveSession | null;
  setCapturedImage: (image: string | null) => void;
  setLocation: (location: { latitude: number; longitude: number } | null) => void;
  setActiveSession: (session: ActiveSession | null) => void;
  resetAttendance: () => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const AttendanceProvider = ({ children }: { children: ReactNode }) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);

  // Fetch active session from database and subscribe to realtime updates
  useEffect(() => {
    const fetchActiveSession = async () => {
      try {
        // First check localStorage for immediate response
        const stored = localStorage.getItem('activeSession');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setActiveSession(parsed);
          } catch {
            // Invalid JSON, ignore
          }
        }

        // Then fetch from database
        const { data: sessions, error } = await supabase
          .from('attendance_sessions')
          .select(`
            *,
            teachers (
              name,
              designation
            )
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error fetching active session:', error);
          return;
        }

        if (sessions && sessions.length > 0) {
          const session = sessions[0];
          const activeSessionData: ActiveSession = {
            id: session.id,
            courseId: session.course_id,
            section: session.section,
            block: session.block,
            classroomNumber: session.classroom_number,
            startTime: session.start_time,
            endTime: session.end_time,
            faculty: session.teachers?.name || 'Faculty',
            designation: session.teachers?.designation || 'Professor',
            isActive: session.is_active,
          };
          setActiveSession(activeSessionData);
        } else {
          setActiveSession(null);
        }
      } catch (err) {
        console.error('Error in fetchActiveSession:', err);
      }
    };

    // Initial fetch
    fetchActiveSession();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('attendance_sessions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance_sessions',
        },
        () => {
          // Refetch when any change happens
          fetchActiveSession();
        }
      )
      .subscribe();

    // Also listen for localStorage changes (for same-tab sync)
    const handleStorageChange = () => {
      const stored = localStorage.getItem('activeSession');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setActiveSession(parsed);
        } catch {
          setActiveSession(null);
        }
      } else {
        setActiveSession(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Poll for same-tab localStorage updates
    const interval = setInterval(() => {
      const stored = localStorage.getItem('activeSession');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (JSON.stringify(parsed) !== JSON.stringify(activeSession)) {
            setActiveSession(parsed);
          }
        } catch {
          // Invalid JSON
        }
      } else if (activeSession?.isActive) {
        // Refetch from database if localStorage is cleared
        fetchActiveSession();
      }
    }, 2000);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
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
        setActiveSession,
        resetAttendance,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};

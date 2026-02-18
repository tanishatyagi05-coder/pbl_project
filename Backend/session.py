from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Session as ClassSession, Student

router = APIRouter()


# ---------- DB DEPENDENCY ----------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------- START SESSION ----------
@router.post("/session/start")
def start_session(
    teacher_id: str,
    course_id: str,
    block: str,
    room: str,
    section: str,
    latitude: float,
    longitude: float,
    db: Session = Depends(get_db)
):

    # 🔥 deactivate any previous active sessions of this teacher
    db.query(ClassSession).filter(
        ClassSession.teacher_id == teacher_id,
        ClassSession.is_active == True
    ).update({"is_active": False})

    db.commit()

    # 🔥 create new active session
    session = ClassSession(
        teacher_id=teacher_id,
        course_id=course_id,
        block=block,
        room=room,
        section=section,
        latitude=latitude,
        longitude=longitude,
        radius=50,
        is_active=True
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    return {
        "message": "Session started",
        "session_id": session.id
    }


# ---------- STOP SESSION ----------
@router.post("/session/stop/{session_id}")
def stop_session(session_id: int, db: Session = Depends(get_db)):

    session = db.query(ClassSession).filter(
        ClassSession.id == session_id
    ).first()

    if not session:
        return {"error": "Session not found"}

    session.is_active = False
    db.commit()

    return {"message": "Session stopped"}


# ---------- GET CURRENT SESSION FOR TEACHER ----------
@router.get("/session/current/{teacher_id}")
def get_current_session(teacher_id: str, db: Session = Depends(get_db)):

    session = (
        db.query(ClassSession)
        .filter(
            ClassSession.teacher_id == teacher_id,
            ClassSession.is_active == True
        )
        .order_by(ClassSession.id.desc())   # 🔥 always latest session
        .first()
    )

    if not session:
        return {"message": "No active session"}

    return session


# ---------- GET SESSION FOR STUDENT ----------
@router.get("/student/session/{reg_no}")
def get_session_for_student(reg_no: str, db: Session = Depends(get_db)):

    student = db.query(Student).filter(
        Student.reg_no == reg_no
    ).first()

    if not student:
        return {"error": "Student not found"}

    session = (
        db.query(ClassSession)
        .filter(
            ClassSession.teacher_id == student.teacher_id,
            ClassSession.is_active == True
        )
        .order_by(ClassSession.id.desc())   # 🔥 ensures latest session
        .first()
    )

    if not session:
        return {"message": "No active session"}

    return {
        "session_id": session.id,
        "course_id": session.course_id,
        "block": session.block,
        "room": session.room,
        "section": session.section,
        "latitude": session.latitude,
        "longitude": session.longitude,
        "radius": session.radius,
        "teacher_id": session.teacher_id
    }

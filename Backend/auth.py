from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Teacher, Student

router = APIRouter()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- STUDENT LOGIN ----------------
@router.post("/login/student")
def student_login(email: str, password: str, db: Session = Depends(get_db)):
    email = email.strip().lower()
    password = password.strip()
    student = db.query(Student).filter(Student.email == email).first()

    if not student:
        return {"error": "Student not found"}

    # Demo password check (same for all)
    if password != "demo123":
        return {"error": "Invalid password"}

    return {
        "message": "Login successful",
        "role": "student",
        "reg_no": student.reg_no,
        "name": student.name,
        "section": student.section,
        "branch": student.branch,
        "teacher_id": student.teacher_id
    }


# ---------------- TEACHER LOGIN ----------------
@router.post("/login/teacher")
def teacher_login(email: str, password: str, db: Session = Depends(get_db)):
    email = email.strip().lower()
    password = password.strip()
    teacher = db.query(Teacher).filter(Teacher.email == email).first()

    if not teacher:
        return {"error": "Teacher not found"}

    # Allow the stored password, and a common demo fallback.
    if password != teacher.password and password != "demo123":
        return {"error": "Invalid password"}

    return {
        "message": "Login successful",
        "role": "teacher",
        "teacher_id": teacher.id,
        "name": teacher.name,
        "email": teacher.email
    }

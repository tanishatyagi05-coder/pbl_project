from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Attendance, Student, Session as ClassSession
from datetime import datetime
import math
import os
from fastapi.responses import FileResponse
import pandas as pd

router = APIRouter()

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------- HAVERSINE DISTANCE ----------
def haversine(lat1, lon1, lat2, lon2):
    R = 6371000  # meters

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))

@router.post("/attendance/submit")
async def submit_attendance(
    reg_no: str = Form(...),
    session_id: int = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    photo: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    student = db.query(Student).filter(Student.reg_no == reg_no).first()
    session = db.query(ClassSession).filter(ClassSession.id == session_id).first()

    if not student or not session:
        return {"error": "Invalid session or student"}

    # 🔥 CHECK IF ATTENDANCE ALREADY EXISTS
    existing = db.query(Attendance).filter(
        Attendance.session_id == session_id,
        Attendance.reg_no == reg_no
    ).first()

    if existing:
        return {"error": "Attendance already submitted"}

    # ---------- GEOFENCE CHECK ----------
    distance = haversine(latitude, longitude, session.latitude, session.longitude)

    if distance <= session.radius:
        status = "Present"
    else:
        status = "Absent"

    # ---------- SAVE IMAGE ----------
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{reg_no}_{timestamp}.jpg"
    file_path = os.path.join(UPLOAD_FOLDER, filename)

    with open(file_path, "wb") as f:
        f.write(await photo.read())

    # ---------- SAVE ATTENDANCE ----------
    record = Attendance(
        session_id=session_id,
        reg_no=student.reg_no,
        name=student.name,
        branch=student.branch,
        section=student.section,
        status=status,
        latitude=latitude,
        longitude=longitude,
        photo_path=file_path,
        timestamp=str(datetime.now())
    )

    db.add(record)
    db.commit()

    return {
        "message": "Attendance recorded",
        "status": status,
        "distance_meters": round(distance, 2)
    }

    
# ---------- EXPORT EXCEL ----------
@router.get("/attendance/export/{session_id}")
def export_attendance(session_id: int, db: Session = Depends(get_db)):

    records = db.query(Attendance).filter(Attendance.session_id == session_id).all()

    if not records:
        return {"error": "No attendance data"}

    data = []

    for r in records:
        data.append({
            "Registration Number": r.reg_no,
            "Name": r.name,
            "Branch": r.branch,
            "Section": r.section,
            "Status": r.status,
            "Latitude": r.latitude,
            "Longitude": r.longitude,
            "Timestamp": r.timestamp,
            "Photo Path": r.photo_path
        })

    df = pd.DataFrame(data)

    file_path = f"attendance_session_{session_id}.xlsx"
    df.to_excel(file_path, index=False)

    return FileResponse(file_path, filename=file_path)

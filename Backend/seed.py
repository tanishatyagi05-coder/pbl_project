from sqlalchemy.orm import Session
from models import Teacher, Student, Classroom

def seed_data(db: Session):
    """
    Improved idempotent seeding:
    Updates coordinates of existing classrooms to ensure they match MUJ (Jaipur) 
    even if the room was previously created with wrong coordinates.
    """
    
    # 1. Seed Teacher
    if not db.query(Teacher).filter(Teacher.email == "professor@manipal.edu").first():
        teacher = Teacher(
            id="T001",
            name="Professor Sharma",
            email="professor@manipal.edu",
            password="demo1234"
        )
        db.add(teacher)
        db.commit()
        print("Seeded Teacher: Professor Sharma")

    # 2. Fetch teacher ID
    teacher = db.query(Teacher).filter(Teacher.email == "professor@manipal.edu").first()
    teacher_id = teacher.id if teacher else "T001"

    # 3. Seed Students
    for i in range(1, 16):
        reg_no = f"2301010{i:02}"
        if not db.query(Student).filter(Student.reg_no == reg_no).first():
            student = Student(
                reg_no=reg_no,
                name=f"Student{i}",
                email=f"student{i}@manipal.edu",
                branch="CSE",
                section="A1",
                teacher_id=teacher_id
            )
            db.add(student)
    print("Checked students.")

    # 4. Seed/Update Classrooms (Ensuring JAIPUR coordinates)
    rooms_to_seed = [
        {"block": "AB1", "room": "001", "latitude": 26.841034, "longitude": 75.561795},
        {"block": "AB1", "room": "002", "latitude": 26.8415, "longitude": 75.5620},
        {"block": "AB1", "room": "101", "latitude": 26.8420, "longitude": 75.5625},
        {"block": "AB1", "room": "102", "latitude": 26.8425, "longitude": 75.5630},
        {"block": "AB1", "room": "201", "latitude": 26.8430, "longitude": 75.5635},
        {"block": "AB1", "room": "301", "latitude": 26.8435, "longitude": 75.5640},
        {"block": "AB2", "room": "001", "latitude": 26.8440, "longitude": 75.5645},
        {"block": "AB2", "room": "002", "latitude": 26.8445, "longitude": 75.5650},
        {"block": "AB2", "room": "101", "latitude": 26.8450, "longitude": 75.5655},
        {"block": "AB2", "room": "102", "latitude": 26.8455, "longitude": 75.5660},
        {"block": "AB2", "room": "301", "latitude": 26.842870, "longitude": 75.564351},
        {"block": "AB3", "room": "001", "latitude": 26.8460, "longitude": 75.5665},
        {"block": "AB3", "room": "101", "latitude": 26.8465, "longitude": 75.5670},
        {"block": "LHC", "room": "001", "latitude": 26.8470, "longitude": 75.5675},
        {"block": "LHC", "room": "203", "latitude": 26.842870, "longitude": 75.564351},
    ]

    for room_data in rooms_to_seed:
        room = db.query(Classroom).filter(
            Classroom.block == room_data["block"],
            Classroom.room == room_data["room"]
        ).first()
        
        if room:
            # ⭐ FORCE UPDATE existing coordinates to Jaipur
            room.latitude = room_data["latitude"]
            room.longitude = room_data["longitude"]
        else:
            # Create if doesn't exist
            new_room = Classroom(**room_data)
            db.add(new_room)
    
    print("Coordinates successfully forced to Jaipur in Database.")
    db.commit()

if __name__ == "__main__":
    from database import SessionLocal
    db = SessionLocal()
    try:
        seed_data(db)
        print("Manual update completed.")
    finally:
        db.close()

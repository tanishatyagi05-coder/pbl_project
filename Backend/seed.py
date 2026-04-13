from sqlalchemy.orm import Session
from models import Teacher, Student, Classroom

def seed_data(db: Session):
    """
    Fixed seeding logic: Commits teacher record BEFORE student insertion
    to satisfy PostgreSQL Foreign Key constraints.
    """
    
    # 1. Seed Teacher (Check by email)
    if not db.query(Teacher).filter(Teacher.email == "professor@manipal.edu").first():
        teacher = Teacher(
            id="T001",
            name="Professor Sharma",
            email="professor@manipal.edu",
            password="demo1234"
        )
        db.add(teacher)
        db.commit() # 🔵 MANDATORY: satisfy FK constraints immediately
        print("Seeded Teacher: Professor Sharma")

    # 2. Fetch the teacher to reference its ID (robust practice)
    teacher = db.query(Teacher).filter(Teacher.email == "professor@manipal.edu").first()
    teacher_id = teacher.id if teacher else "T001"

    # 3. Seed Students (Check per-record)
    for i in range(1, 16):
        reg_no = f"2301010{i:02}"
        if not db.query(Student).filter(Student.reg_no == reg_no).first():
            student = Student(
                reg_no=reg_no,
                name=f"Student{i}",
                email=f"student{i}@manipal.edu",
                branch="CSE",
                section="A1",
                teacher_id=teacher_id # Using the actual committed ID
            )
            db.add(student)
    print("Successfully checked/seeded students.")

    # 4. Seed Classrooms
    rooms_to_seed = [
        {"block": "AB1", "room": "001", "latitude": 26.841034, "longitude": 75.561795},
        {"block": "AB1", "room": "002", "latitude": 26.2395, "longitude": 73.0249},
        {"block": "AB1", "room": "101", "latitude": 26.2392, "longitude": 73.0251},
        {"block": "AB1", "room": "102", "latitude": 26.2400, "longitude": 73.0258},
        {"block": "AB1", "room": "201", "latitude": 26.2408, "longitude": 73.0263},
        {"block": "AB1", "room": "301", "latitude": 26.2408, "longitude": 73.0263},
        {"block": "AB2", "room": "001", "latitude": 26.2415, "longitude": 73.0268},
        {"block": "AB2", "room": "002", "latitude": 26.2420, "longitude": 73.0274},
        {"block": "AB2", "room": "101", "latitude": 26.2427, "longitude": 73.0281},
        {"block": "AB2", "room": "102", "latitude": 26.2433, "longitude": 73.0286},
        {"block": "AB2", "room": "301", "latitude": 26.842870, "longitude": 75.564351},
        {"block": "AB3", "room": "001", "latitude": 26.2440, "longitude": 73.0292},
        {"block": "AB3", "room": "101", "latitude": 26.2446, "longitude": 73.0299},
        {"block": "LHC", "room": "001", "latitude": 26.2453, "longitude": 73.0304},
        {"block": "LHC", "room": "203", "latitude": 26.842870, "longitude": 75.564351},
    ]

    for room_data in rooms_to_seed:
        exists = db.query(Classroom).filter(
            Classroom.block == room_data["block"],
            Classroom.room == room_data["room"]
        ).first()
        if not exists:
            new_room = Classroom(**room_data)
            db.add(new_room)
    
    print("Successfully checked/seeded classrooms.")

    db.commit() # Final commit for students and classrooms

if __name__ == "__main__":
    from database import SessionLocal
    db = SessionLocal()
    try:
        seed_data(db)
        print("Manual seeding completed.")
    finally:
        db.close()

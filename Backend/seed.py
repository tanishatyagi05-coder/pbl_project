from sqlalchemy.orm import Session
from models import Teacher, Student, Classroom

def seed_data(db: Session):
    """
    Fully idempotent seeding: 
    Checks each record individually to ensure no duplicate inserts or integrity errors during repeated runs.
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
        print("Seeded Teacher: Professor Sharma")

    # 2. Seed Students (Check per-record for idempotency)
    for i in range(1, 16):
        reg_no = f"2301010{i:02}"
        if not db.query(Student).filter(Student.reg_no == reg_no).first():
            student = Student(
                reg_no=reg_no,
                name=f"Student{i}",
                email=f"student{i}@manipal.edu",
                branch="CSE",
                section="A1",
                teacher_id="T001"
            )
            db.add(student)
    print("Successfully checked/seeded students.")

    # 3. Seed Classrooms (Check block + room combination)
    rooms_to_seed = [
        # AB1
        {"block": "AB1", "room": "001", "latitude": 26.841034, "longitude": 75.561795},
        {"block": "AB1", "room": "002", "latitude": 26.2395, "longitude": 73.0249},
        {"block": "AB1", "room": "101", "latitude": 26.2392, "longitude": 73.0251},
        {"block": "AB1", "room": "102", "latitude": 26.2400, "longitude": 73.0258},
        {"block": "AB1", "room": "201", "latitude": 26.2408, "longitude": 73.0263},
        {"block": "AB1", "room": "301", "latitude": 26.2408, "longitude": 73.0263},
        # AB2
        {"block": "AB2", "room": "001", "latitude": 26.2415, "longitude": 73.0268},
        {"block": "AB2", "room": "002", "latitude": 26.2420, "longitude": 73.0274},
        {"block": "AB2", "room": "101", "latitude": 26.2427, "longitude": 73.0281},
        {"block": "AB2", "room": "102", "latitude": 26.2433, "longitude": 73.0286},
        {"block": "AB2", "room": "301", "latitude": 26.842870, "longitude": 75.564351},
        # AB3
        {"block": "AB3", "room": "001", "latitude": 26.2440, "longitude": 73.0292},
        {"block": "AB3", "room": "101", "latitude": 26.2446, "longitude": 73.0299},
        # LHC
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

    db.commit()

if __name__ == "__main__":
    from database import SessionLocal
    db = SessionLocal()
    try:
        seed_data(db)
        print("Manual seeding completed.")
    finally:
        db.close()

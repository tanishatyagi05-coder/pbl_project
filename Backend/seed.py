from sqlalchemy.orm import Session
from models import Teacher, Student, Classroom

def seed_data(db: Session):
    """Idempotent seeding: Only adds data if the database is empty or missing specific keys."""
    
    # 1. Seed Teacher
    if not db.query(Teacher).filter(Teacher.id == "T001").first():
        teacher = Teacher(
            id="T001",
            name="Professor Sharma",
            email="professor@manipal.edu",
            password="demo1234"
        )
        db.add(teacher)
        print("Seeded Teacher: T001")

    # 2. Seed Students
    if db.query(Student).count() == 0:
        for i in range(1, 16):
            student = Student(
                reg_no=f"2301010{i:02}",
                name=f"Student{i}",
                email=f"student{i}@manipal.edu",
                branch="CSE",
                section="A1",
                teacher_id="T001"
            )
            db.add(student)
        print("Seeded 15 Students")

    # 3. Seed Classrooms
    if db.query(Classroom).count() == 0:
        rooms = [
            Classroom(block="AB1", room="001", latitude=26.841034, longitude=75.561795),
            Classroom(block="AB1", room="002", latitude=26.2395, longitude=73.0249),
            Classroom(block="AB1", room="101", latitude=26.2392, longitude=73.0251),
            Classroom(block="AB1", room="102", latitude=26.2400, longitude=73.0258),
            Classroom(block="AB1", room="201", latitude=26.2408, longitude=73.0263),
            Classroom(block="AB1", room="301", latitude=26.2408, longitude=73.0263),
            Classroom(block="AB2", room="001", latitude=26.2415, longitude=73.0268),
            Classroom(block="AB2", room="002", latitude=26.2420, longitude=73.0274),
            Classroom(block="AB2", room="101", latitude=26.2427, longitude=73.0281),
            Classroom(block="AB2", room="102", latitude=26.2433, longitude=73.0286),
            Classroom(block="AB2", room="301", latitude=26.842870, longitude=75.564351),
            Classroom(block="AB3", room="001", latitude=26.2440, longitude=73.0292),
            Classroom(block="AB3", room="101", latitude=26.2446, longitude=73.0299),
            Classroom(block="LHC", room="001", latitude=26.2453, longitude=73.0304),
            Classroom(block="LHC", room="203", latitude=26.842870, longitude=75.564351),
        ]
        db.add_all(rooms)
        print(f"Seeded {len(rooms)} Classrooms")

    db.commit()

if __name__ == "__main__":
    from database import SessionLocal
    # Allow running manually if needed
    db = SessionLocal()
    try:
        seed_data(db)
        print("Manual seeding completed successfully.")
    finally:
        db.close()

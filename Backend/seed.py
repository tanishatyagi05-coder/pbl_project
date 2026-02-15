from database import SessionLocal
from models import Teacher, Student, Classroom

db = SessionLocal()

# ---------- TEACHER ----------
teacher = Teacher(
    id="T001",
    name="Professor Sharma",
    email="professor@manipal.edu",
    password="demo1234"
)
db.add(teacher)


# ---------- STUDENTS (15) ----------
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


# ---------- CLASSROOMS (MANUAL CONTROL FOR DEMO) ----------
rooms = [

    # AB1
    Classroom(block="AB1", room="001", latitude=26.2389, longitude=73.0243),
    Classroom(block="AB1", room="002", latitude=26.2395, longitude=73.0249),
    Classroom(block="AB1", room="101", latitude=26.2392, longitude=73.0251),
    Classroom(block="AB1", room="102", latitude=26.2400, longitude=73.0258),
    Classroom(block="AB1", room="201", latitude=26.2408, longitude=73.0263),

    # AB2
    Classroom(block="AB2", room="001", latitude=26.2415, longitude=73.0268),
    Classroom(block="AB2", room="002", latitude=26.2420, longitude=73.0274),
    Classroom(block="AB2", room="101", latitude=26.2427, longitude=73.0281),
    Classroom(block="AB2", room="102", latitude=26.2433, longitude=73.0286),

    # AB3
    Classroom(block="AB3", room="001", latitude=26.2440, longitude=73.0292),
    Classroom(block="AB3", room="101", latitude=26.2446, longitude=73.0299),

    # LHC
    Classroom(block="LHC", room="001", latitude=26.2453, longitude=73.0304),
    Classroom(block="LHC", room="101", latitude=26.2460, longitude=73.0310),
]

db.add_all(rooms)


# ---------- COMMIT ----------
db.commit()
db.close()

print("Seed data inserted successfully")

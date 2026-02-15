from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


# ---------- TEACHER ----------
class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True)
    password = Column(String)


# ---------- STUDENT ----------
class Student(Base):
    __tablename__ = "students"

    reg_no = Column(String, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True)
    branch = Column(String)
    section = Column(String)
    teacher_id = Column(String, ForeignKey("teachers.id"))


# ---------- CLASSROOM ----------
# Stores fixed GPS coordinates for each room
class Classroom(Base):
    __tablename__ = "classrooms"

    id = Column(Integer, primary_key=True, index=True)
    block = Column(String, index=True)
    room = Column(String, index=True)
    latitude = Column(Float)
    longitude = Column(Float)


# ---------- SESSION ----------
class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(String)
    course_id = Column(String)
    block = Column(String)
    room = Column(String)
    section = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    radius = Column(Float)
    is_active = Column(Boolean, default=False)


# ---------- ATTENDANCE ----------
class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer)
    reg_no = Column(String)
    name = Column(String)
    branch = Column(String)
    section = Column(String)
    status = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    photo_path = Column(String)
    timestamp = Column(String)

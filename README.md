# Smart Attendance System (Geofenced)

A full-stack attendance system using geolocation and facial capture.

## Features
- Teacher controlled attendance session
- Student GPS verification
- Live photo capture
- Present/Absent detection
- Excel export

## Tech Stack
Frontend: React + Tailwind  
Backend: FastAPI + SQLAlchemy  
Database: SQLite  
Extras: Geolocation API, Camera API, Pandas Excel export

## How to run

### Backend
pip install fastapi uvicorn sqlalchemy pandas pillow python-multipart
uvicorn main:app --reload

### Frontend
npm install
npm run dev

Open:
http://localhost:8080

## Author
Tanisha Tyagi

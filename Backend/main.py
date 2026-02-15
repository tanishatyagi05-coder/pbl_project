from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from auth import router as auth_router
from session import router as session_router
from attendance import router as attendance_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(session_router)
app.include_router(attendance_router)

@app.get("/")
def home():
    return {"message": "Attendance Backend Running"}

from fastapi import FastAPI, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import csv
from datetime import datetime

app = FastAPI()

# Allow local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = "data"
session_folder = ""

class SessionStart(BaseModel):
    participant_id: str
    hint_type: str
    difficulty: str

class ClickLog(BaseModel):
    timestamp: float
    correct: bool
    letter: str

class HintLog(BaseModel):
    timestamp: float

class GazeLog(BaseModel):
    timestamp: float
    x: float
    y: float

class SessionEnd(BaseModel):
    score: int
    time_taken: float  # in seconds

@app.post("/start-session")
def start_session(info: SessionStart):
    global session_folder
    timestamp = datetime.now().strftime("%Y%m%dT%H%M%S")
    folder_name = f"{info.participant_id}_{info.hint_type}_{info.difficulty}_{timestamp}"
    session_folder = os.path.join(BASE_DIR, folder_name)
    os.makedirs(session_folder, exist_ok=True)

    # Create CSV files with headers
    with open(os.path.join(session_folder, "clicks.csv"), "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["timestamp", "correct", "letter"])

    with open(os.path.join(session_folder, "hints.csv"), "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["timestamp"])

    with open(os.path.join(session_folder, "gaze.csv"), "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["timestamp", "x", "y"])

    return {"status": "session started", "folder": folder_name}

@app.post("/log-click")
def log_click(log: ClickLog):
    with open(os.path.join(session_folder, "clicks.csv"), "a", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([log.timestamp, log.correct, log.letter])
    return {"status": "click logged"}

@app.post("/log-hint")
def log_hint(log: HintLog):
    with open(os.path.join(session_folder, "hints.csv"), "a", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([log.timestamp])
    return {"status": "hint logged"}

@app.post("/log-gaze")
def log_gaze(log: GazeLog):
    with open(os.path.join(session_folder, "gaze.csv"), "a", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([log.timestamp, log.x, log.y])
    return {"status": "gaze logged"}

@app.post("/gaze")
def legacy_log_gaze(request: Request):
    # This is a backward-compatible endpoint for frontend hitting `/gaze`
    import asyncio
    async def process():
        data = await request.json()
        log = GazeLog(**data)
        return log_gaze(log)
    return asyncio.run(process())

@app.post("/end-session")
def end_session(end: SessionEnd):
    summary_path = os.path.join(session_folder, "summary.txt")
    with open(summary_path, "w") as f:
        f.write(f"Score: {end.score}\n")
        f.write(f"Time Taken: {end.time_taken:.2f} seconds\n")
    return {"status": "session ended"}

@app.post("/upload-face")
def upload_face_video(file: UploadFile = File(...), start_time: str = Form(...), end_time: str = Form(...)):
    filename = f"face_{start_time}_{end_time}.webm"
    with open(os.path.join(session_folder, filename), "wb") as f:
        f.write(file.file.read())
    return {"status": "video uploaded", "filename": filename}
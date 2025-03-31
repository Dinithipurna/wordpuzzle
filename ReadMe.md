# 🧩 Word Puzzle Game with Logging Backend

This is an interactive web-based word search puzzle game with integrated backend logging to capture gameplay events like hint usage, letter clicks, gaze data, and session summaries.

## 🔧 Features

- ✅ Word search game with selectable difficulty (`easy`, `hard`)
- ✅ Two hint types:
  - **Concrete**: highlights the first letter of a word
  - **Abstract**: highlights a box containing the word
- ✅ Session setup with Participant ID, hint type, and difficulty
- ✅ 10-minute countdown timer
- ✅ Logging of:
  - Hint requests
  - Letter clicks (correct or wrong)
  - Gaze tracking (via WebGazer.js)
  - Face video recording (using browser MediaRecorder API)
  - Session summary (score and duration)

## 🗂 Folder Structure

WordPuzzle/ ├── frontend/ │ ├── index.html │ ├── styles.css │ └── script.js ├── main.py # FastAPI backend ├── data/ # Automatically stores logs per session └── README.md


---

## 🚀 Getting Started

### 1. Clone the Repository
```
git clone https://github.com/your-username/WordPuzzle.git
cd WordPuzzle 
```

### 2. Run the Backend (FastAPI)

Set up a virtual environment (optional but recommended):

```
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn python-multipart 
```

Start the backend server:
```
uvicorn main:app --reload
The backend will be live at: http://127.0.0.1:8000
```
### 3. Run the Frontend
You can use Python’s built-in HTTP server:
```
cd frontend
python3 -m http.server 5500
Visit http://localhost:5500 to play the game.
```
### 📁 Backend Logging
A new folder is created for each session inside the data/ directory:
```
data/
└── participant123_abstract_easy_20250331T211030/
    ├── clicks.csv           # timestamp, correct, letter
    ├── hints.csv            # timestamp
    ├── gaze.csv             # timestamp, x, y
    ├── summary.txt          # final score and duration
    └── face_{start}_{end}.webm  # face recording (if supported)
    ```
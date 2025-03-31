// ✅ Constants and setup


console.log("Script loaded!");
const words = ["OCEAN", "MIRROR", "GUITAR", "CASTLE", "PLANET"];
const backendUrl = 'http://127.0.0.1:8000';
const userId = 'user123';

const grid = document.getElementById('word-search-grid');
const selectedWordElement = document.getElementById('selected-word');
const wordListElement = document.getElementById('word-list');
const scoreElement = document.getElementById('score');
const hintButton = document.getElementById('hint-button');
const timerElement = document.getElementById('timer');
const foundWordsList = document.getElementById('found-words-list');

let gridSize = 10;
let hintType = "concrete";
let participantId = "";
let selectedWord = '';
let selectedLetters = [];
let foundWords = [];
let score = 0;
let startTime = null;
let timerInterval = null;
let hintClickCount = 0;
let wordPositions = {};
let countdown = 600;
let mediaRecorder;
let recordedChunks = [];
let recordingStartTime;

// ✅ Start MediaRecorder for face video
async function startFaceRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    mediaRecorder = new MediaRecorder(stream);
    recordingStartTime = new Date().toISOString();

    mediaRecorder.ondataavailable = (e) => recordedChunks.push(e.data);

    mediaRecorder.onstop = () => {
        const endTime = new Date().toISOString();
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const formData = new FormData();
        formData.append("file", blob);
        formData.append("start_time", recordingStartTime);
        formData.append("end_time", endTime);

        fetch(`${backendUrl}/upload-face`, { method: "POST", body: formData });
    };

    mediaRecorder.start();
}

function checkForWord(word) {
    if (words.includes(word) && !foundWords.includes(word)) {
        alert(`${word} is found!`);
        foundWords.push(word);
        score++;
        scoreElement.innerText = `Score: ${score}`;
        updateFoundWordsList();
        resetSelectedWord();

        if (foundWords.length === words.length) {
            stopTimer();
            showCongratulations();
        }
    }
}
function updateFoundWordsList() {
    foundWordsList.innerHTML = foundWords.map(word => `<li>${word}</li>`).join('');
    const remainingWords = words.filter(word => !foundWords.includes(word));
    wordListElement.innerHTML = `Words to find: ${remainingWords.join(', ')}`;
}

function resetSelectedWord() {
    selectedWord = '';
    selectedLetters = [];
    selectedWordElement.innerText = `Selected Word: `;
    document.querySelectorAll('.grid .selected').forEach(letter => letter.classList.remove('selected'));
}

function handleLetterClick(event) {
    const letter = event.target;
    const index = parseInt(letter.dataset.index);

    if (letter.classList.contains('selected')) {
        letter.classList.remove('selected');
        selectedLetters = selectedLetters.filter(l => l.index !== index);
    } else {
        letter.classList.add('selected');
        selectedLetters.push({ letter: letter.innerText, index: index });
    }

    selectedWord = selectedLetters.map(l => l.letter).join('');
    selectedWordElement.innerText = `Selected Word: ${selectedWord}`;

    checkForWord(selectedWord);
}


function startEyeTracking() {
    if (typeof webgazer !== 'undefined') {
        webgazer.setGazeListener((data) => {
            if (data) {
                fetch(`${backendUrl}/gaze`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: userId,
                        x: data.x,
                        y: data.y,
                        timestamp: Date.now()
                    })
                });
            }
        }).begin();

        webgazer.showPredictionPoints(false); // hide red dot
    } else {
        console.warn("WebGazer.js not loaded.");
    }
}


function stopFaceRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
}

function startTimer() {
    updateTimer();
    timerInterval = setInterval(() => {
        countdown--;
        updateTimer();
        if (countdown <= 0) {
            clearInterval(timerInterval);
            stopFaceRecording();
            handleTimeUp();
        }
    }, 1000);
}

function updateTimer() {
    let minutes = Math.floor(countdown / 60);
    let seconds = countdown % 60;
    timerElement.innerText = `Time: ${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}

function handleTimeUp() {
    disableGrid();
    alert(`Time's up! Your score is ${score}`);
    logGameEnd();
}

function stopTimer() {
    clearInterval(timerInterval);
}

function disableGrid() {
    document.querySelectorAll('.grid div').forEach(letter => {
        letter.removeEventListener('click', handleLetterClick);
        letter.classList.remove('selected');
    });
}

function canPlaceWord(word, row, col, direction, gridArray) {
    if (direction === 'h') {
        if (col + word.length > gridSize) return false;
        for (let i = 0; i < word.length; i++) {
            if (gridArray[row * gridSize + col + i] !== null) return false;
        }
    } else if (direction === 'v') {
        if (row + word.length > gridSize) return false;
        for (let i = 0; i < word.length; i++) {
            if (gridArray[(row + i) * gridSize + col] !== null) return false;
        }
    }
    return true;
}

function placeWord(word, row, col, direction, gridArray) {
    if (direction === 'h') {
        for (let i = 0; i < word.length; i++) {
            gridArray[row * gridSize + col + i] = word[i];
        }
        wordPositions[word] = {
            start: row * gridSize + col,
            direction: 'h'
        };
    } else if (direction === 'v') {
        for (let i = 0; i < word.length; i++) {
            gridArray[(row + i) * gridSize + col] = word[i];
        }
        wordPositions[word] = {
            start: row * gridSize + col,
            direction: 'v'
        };
    }
}

function generateGrid() {
    console.log("generaating grid");
    const gridArray = Array(gridSize * gridSize).fill(null);
    const cellSize = gridSize === 10 ? 40 : 25;
    const fontSize = gridSize === 10 ? '20px' : '14px';
    const gapSize = gridSize === 10 ? '5px' : '2px';
    grid.style.gridTemplateColumns = `repeat(${gridSize}, ${cellSize}px)`;
    grid.style.gridGap = gapSize;

    words.forEach(word => {
        let wordPlaced = false;
        while (!wordPlaced) {
            const direction = Math.random() < 0.5 ? 'h' : 'v';
            const row = Math.floor(Math.random() * gridSize);
            const col = Math.floor(Math.random() * gridSize);

            if (canPlaceWord(word, row, col, direction, gridArray)) {
                placeWord(word, row, col, direction, gridArray);
                wordPlaced = true;
            }
        }
    });

    for (let i = 0; i < gridArray.length; i++) {
        if (!gridArray[i]) {
            gridArray[i] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
    }

    grid.innerHTML = '';
    gridArray.forEach((letter, index) => {
        const div = document.createElement('div');
        div.innerText = letter;
        div.dataset.index = index;
        div.addEventListener('click', handleLetterClick);
        div.style.width = `${cellSize}px`;
        div.style.height = `${cellSize}px`;
        div.style.fontSize = fontSize;
        grid.appendChild(div);
    });

    wordListElement.innerHTML = `Words to find: ${words.join(', ')}`;
    scoreElement.innerText = `Score: ${score}`;
    startTime = new Date();
    startTimer();
}

function handleLetterClick(event) {
    const letter = event.target;
    const index = parseInt(letter.dataset.index);
    const letterText = letter.innerText;

    if (letter.classList.contains('selected')) {
        letter.classList.remove('selected');
        selectedLetters = selectedLetters.filter(l => l.index !== index);
    } else {
        letter.classList.add('selected');
        selectedLetters.push({ letter: letterText, index: index });
    }

    selectedWord = selectedLetters.map(l => l.letter).join('');
    selectedWordElement.innerText = `Selected Word: ${selectedWord}`;

    // Check if this letter appears in any word not found yet
    const isCorrect = words.some(word => !foundWords.includes(word) && word.includes(letterText));

    // Log the click
    fetch(`${backendUrl}/log-click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            timestamp: Date.now(),
            correct: isCorrect,
            letter: letterText
        })
    });

    checkForWord(selectedWord);
}

function logGameEnd() {
    const timeTaken = Math.floor((new Date() - startTime) / 1000);
    fetch(`${backendUrl}/end-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            score: score,
            time_taken: timeTaken
        })
    });
}

function showCongratulations() {
    stopFaceRecording();
    let timeTaken = Math.floor((new Date() - startTime) / 1000);
    alert(`Congratulations! You found all words in ${timeTaken} seconds!`);
    logGameEnd();

}

hintButton.addEventListener('click', showHint);

function showHint() {
    let remainingWords = words.filter(word => !foundWords.includes(word));
    if (remainingWords.length === 0) return;

    let hintWord = remainingWords[Math.floor(Math.random() * remainingWords.length)];
    const gridLetters = document.querySelectorAll('.grid div');

    if (hintType === "concrete") {
        const gridLetters = document.querySelectorAll('.grid div');
        const hint = wordPositions[hintWord];
        if (!hint) return;
    
        const firstLetterIndex = hint.start;
    
        gridLetters[firstLetterIndex].classList.add('highlight');
        setTimeout(() => gridLetters[firstLetterIndex].classList.remove('highlight'), 2000);
        }
    else if (hintType === "abstract") {
        // Use wordPositions from earlier code
        const hint = wordPositions[hintWord];
        if (!hint) return;

        let indexes = [];
        for (let i = 0; i < hintWord.length; i++) {
            indexes.push(
                hint.direction === 'h' ? hint.start + i : hint.start + i * gridSize
            );
        }

        let minRow = Infinity, maxRow = -1, minCol = Infinity, maxCol = -1;
        indexes.forEach(idx => {
            const row = Math.floor(idx / gridSize);
            const col = idx % gridSize;
            minRow = Math.min(minRow, row);
            maxRow = Math.max(maxRow, row);
            minCol = Math.min(minCol, col);
            maxCol = Math.max(maxCol, col);
        });

        // Expand to box (e.g., 5x5)
        let box = [];
        for (let r = Math.max(minRow - 2, 0); r <= Math.min(maxRow + 2, gridSize - 1); r++) {
            for (let c = Math.max(minCol - 2, 0); c <= Math.min(maxCol + 2, gridSize - 1); c++) {
                box.push(r * gridSize + c);
            }
        }

        box.forEach(index => gridLetters[index]?.classList.add('highlight-box'));
        setTimeout(() => {
            box.forEach(index => gridLetters[index]?.classList.remove('highlight-box'));
        }, 2000);
    }

    // Log hint
    fetch(`${backendUrl}/log-hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_id: participantId,
            timestamp: Date.now()
        })
    });
}

// ✅ Hook to backend on game start
document.getElementById("start-game-btn").addEventListener("click", async () => {
    participantId = document.getElementById("participant-id").value.trim();
    hintType = document.getElementById("hint-type").value;
    const difficulty = document.getElementById("difficulty").value;

    if (!participantId) {
        alert("Please enter Participant ID");
        return;
    }

    gridSize = difficulty === "easy" ? 10 : 20;

    await fetch(`${backendUrl}/start-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            participant_id: participantId,
            hint_type: hintType,
            difficulty: difficulty
        })
    });

    document.getElementById("setup-screen").style.display = "none";
    generateGrid();
    startEyeTracking();
    startFaceRecording();
});
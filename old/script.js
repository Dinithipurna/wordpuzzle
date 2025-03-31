const words = ["PYTHON", "SWIFT", "KOTLIN", "HTML", "CSS"];
const gridSize = 10;
const grid = document.getElementById('word-search-grid');
const selectedWordElement = document.getElementById('selected-word');
const wordListElement = document.getElementById('word-list');
const scoreElement = document.getElementById('score');
const hintButton = document.getElementById('hint-button');
const timerElement = document.getElementById('timer');
const foundWordsList = document.getElementById('found-words-list'); // for displaying found words

let selectedWord = '';
let foundWords = [];
let score = 0;
let startTime = null;
let timerInterval = null;

function startTimer() {
    startTime = new Date();
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    if (startTime) {
        let elapsed = Math.floor((new Date() - startTime) / 1000);
        timerElement.innerText = `Time: ${elapsed}s`;
    }
}

function stopTimer() {
    clearInterval(timerInterval);
}

function generateGrid() {
    const gridArray = Array(gridSize * gridSize).fill(null);
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
        grid.appendChild(div);
    });

    wordListElement.innerHTML = `Words to find: ${words.join(', ')}`;
    scoreElement.innerText = `Score: ${score}`;
    
    startTimer(); // Start the timer when the game begins
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
    } else if (direction === 'v') {
        for (let i = 0; i < word.length; i++) {
            gridArray[(row + i) * gridSize + col] = word[i];
        }
    }
}

// function handleLetterClick(event) {
//     const letter = event.target;
//     letter.classList.toggle('selected');
//     const letterText = letter.innerText;

//     if (letter.classList.contains('selected')) {
//         selectedWord += letterText;
//     } else {
//         selectedWord = selectedWord.replace(letterText, '');
//     }

//     selectedWordElement.innerText = `Selected Word: ${selectedWord}`;
//     checkForWord(selectedWord);
// }

let selectedLetters = [];

function handleLetterClick(event) {
    const letter = event.target;
    const index = parseInt(letter.dataset.index);

    if (letter.classList.contains('selected')) {
        // If clicked again, remove from selection
        letter.classList.remove('selected');
        selectedLetters = selectedLetters.filter(l => l.index !== index);
    } else {
        letter.classList.add('selected');
        selectedLetters.push({ letter: letter.innerText, index: index });
    }

    selectedWord = selectedLetters.map(l => l.letter).join('');
    selectedWordElement.innerText = `Selected Word: ${selectedWord}`;

    // selectedWordElement.innerText = `Selected Word: ${selectedWord}`;
    checkForWord(selectedWord);
    
    checkForWord();
}

// function checkForWord(word) {
//     if (words.includes(word) && !foundWords.includes(word)) {
//         alert(`${word} is found!`);
//         foundWords.push(word);
//         score++;
//         scoreElement.innerText = `Score: ${score}`;
//         resetSelectedWord();

//         if (foundWords.length === words.length) {
//             stopTimer();
//             showCongratulations();
//         }
//     }
// }
// function checkForWord() {
//     if (words.includes(selectedWord) && !foundWords.includes(selectedWord)) {
//         alert(`${selectedWord} is found!`);
//         foundWords.push(selectedWord);
//         score++;
//         scoreElement.innerText = `Score: ${score}`;
        
//         // Mark letters as found
//         selectedLetters.forEach(l => {
//             const letterDiv = grid.children[l.index];
//             letterDiv.classList.add('found');
//         });

//         resetSelectedWord();

//         if (foundWords.length === words.length) {
//             stopTimer();
//             showCongratulations();
//         }
//     }
// }

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
    // Update the 'Words Found' list dynamically
    foundWordsList.innerHTML = foundWords.map(word => `<li>${word}</li>`).join('');

    // Remove found words from the "Words to Find" list
    const remainingWords = words.filter(word => !foundWords.includes(word));
    wordListElement.innerHTML = `Words to find: ${remainingWords.join(', ')}`;
}



// function resetSelectedWord() {
//     selectedWord = '';
//     selectedWordElement.innerText = `Selected Word: ${selectedWord}`;
//     document.querySelectorAll('.grid .selected').forEach(letter => letter.classList.remove('selected'));
// }

function resetSelectedWord() {
    selectedWord = '';
    selectedLetters = [];
    selectedWordElement.innerText = `Selected Word: `;
    document.querySelectorAll('.grid .selected').forEach(letter => letter.classList.remove('selected'));
}


// function showHint() {
//     let remainingWords = words.filter(word => !foundWords.includes(word));
//     if (remainingWords.length === 0) return;

//     let hintWord = remainingWords[Math.floor(Math.random() * remainingWords.length)];
//     let firstLetter = hintWord[0];

//     let gridLetters = document.querySelectorAll('.grid div');
//     for (let letter of gridLetters) {
//         if (letter.innerText === firstLetter) {
//             letter.classList.add('highlight');
//             setTimeout(() => letter.classList.remove('highlight'), 2000);
//             break;
//         }
//     }
// }

function showHint() {
    let remainingWords = words.filter(word => !foundWords.includes(word));
    if (remainingWords.length === 0) return;

    let hintWord = remainingWords[Math.floor(Math.random() * remainingWords.length)];

    let gridLetters = document.querySelectorAll('.grid div');

    for (let i = 0; i < gridSize * gridSize; i++) {
        let found = false;

        // Check for horizontal placement
        if (i % gridSize + hintWord.length <= gridSize) {
            let wordFound = true;
            for (let j = 0; j < hintWord.length; j++) {
                if (gridLetters[i + j].innerText !== hintWord[j]) {
                    wordFound = false;
                    break;
                }
            }
            if (wordFound) {
                highlightFirstLetter(i);
                found = true;
            }
        }

        // Check for vertical placement
        if (i + (hintWord.length - 1) * gridSize < gridSize * gridSize) {
            let wordFound = true;
            for (let j = 0; j < hintWord.length; j++) {
                if (gridLetters[i + j * gridSize].innerText !== hintWord[j]) {
                    wordFound = false;
                    break;
                }
            }
            if (wordFound) {
                highlightFirstLetter(i);
                found = true;
            }
        }

        if (found) break;
    }
}

// Function to highlight only the first letter of the word
function highlightFirstLetter(startIndex) {
    let gridLetters = document.querySelectorAll('.grid div');
    gridLetters[startIndex].classList.add('highlight');
    
    setTimeout(() => gridLetters[startIndex].classList.remove('highlight'), 2000);
}

// Function to highlight the correct word
// function highlightWord(startIndex, wordLength, direction) {
//     let gridLetters = document.querySelectorAll('.grid div');
    
//     for (let i = 0; i < wordLength; i++) {
//         let index = direction === 'h' ? startIndex + i : startIndex + i * gridSize;
//         gridLetters[index].classList.add('highlight');
        
//         setTimeout(() => gridLetters[index].classList.remove('highlight'), 2000);
//     }
// }


function showCongratulations() {
    let timeTaken = Math.floor((new Date() - startTime) / 1000);
    alert(`Congratulations! You found all words in ${timeTaken} seconds!`);
}

// Cursor Tracking
// document.addEventListener('mousemove', (event) => {
//     console.log(`Cursor Position: X=${event.clientX}, Y=${event.clientY}`);
// });

// Eye Tracking (Requires WebGazer.js)
// function startEyeTracking() {
//     if (typeof webgazer !== 'undefined') {
//         webgazer.setGazeListener((data) => {
//             if (data) {
//                 console.log(`Eye Gaze: X=${data.x}, Y=${data.y}`);
//             }
//         }).begin();
//     } else {
//         console.warn("WebGazer.js not loaded. Eye tracking unavailable.");
//     }
// }

function startEyeTracking() {
    if (typeof webgazer !== 'undefined') {
        webgazer.setGazeListener((data) => {
            if (data) {
                console.log(`Eye Gaze: X=${data.x}, Y=${data.y}`);
            }
        }).begin();

        webgazer.showPredictionPoints(false); // Hide the red dot
    } else {
        console.warn("WebGazer.js not loaded. Eye tracking unavailable.");
    }
}

hintButton.addEventListener('click', showHint);

generateGrid();
startEyeTracking();

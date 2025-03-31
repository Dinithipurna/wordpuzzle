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

let hintClickCount = 0;  // Track the number of times the hint button is clicked

// Show Hint function with toggle functionality
function showHint() {
    let remainingWords = words.filter(word => !foundWords.includes(word));  // Only consider remaining words
    if (remainingWords.length === 0) return;  // If no remaining words, exit

    let hintWord = remainingWords[Math.floor(Math.random() * remainingWords.length)];

    let gridLetters = document.querySelectorAll('.grid div');
    let wordStartIndex = null;
    let wordEndIndex = null;
    let wordArea = [];

    // Toggle functionality based on hint button clicks
    hintClickCount++;  // Increment the hint click count
    if (hintClickCount % 2 === 1) {
        // First click: Highlight the bounding box (if the word is not already found)
        for (let i = 0; i < gridLetters.length; i++) {
            if (gridLetters[i].innerText === hintWord[0] && !foundWords.includes(hintWord)) {
                let row = Math.floor(i / 10); // Adjust based on grid width (assumed 10 columns)
                let col = i % 10;
                wordStartIndex = { row, col };

                // Check for horizontal word placement
                if (checkHorizontal(i, hintWord)) {
                    wordArea = getHorizontalWordArea(i, hintWord.length);
                    highlightBoundingBox(wordArea, hintWord);
                    return;
                }

                // Check for vertical word placement
                if (checkVertical(i, hintWord)) {
                    wordArea = getVerticalWordArea(i, hintWord.length);
                    highlightBoundingBox(wordArea, hintWord);
                    return;
                }

                // Check for diagonal word placement
                if (checkDiagonal(i, hintWord)) {
                    wordArea = getDiagonalWordArea(i, hintWord.length);
                    highlightBoundingBox(wordArea, hintWord);
                    return;
                }
            }
        }
    } else {
        // Second click: Highlight the first letter of the word (if the word is not already found)
        for (let i = 0; i < gridLetters.length; i++) {
            if (gridLetters[i].innerText === hintWord[0] && !foundWords.includes(hintWord)) {
                // Highlight the first letter
                gridLetters[i].classList.add('highlight-first-letter');
                setTimeout(() => gridLetters[i].classList.remove('highlight-first-letter'), 2000);
                return;
            }
        }
    }
}

// Check if the word fits horizontally
function checkHorizontal(index, word) {
    let gridLetters = document.querySelectorAll('.grid div');
    for (let i = 0; i < word.length; i++) {
        if (index + i >= gridLetters.length || gridLetters[index + i].innerText !== word[i]) {
            return false;
        }
    }
    return true;
}

// Get the area for the word placed horizontally
function getHorizontalWordArea(index, length) {
    let wordArea = [];
    let row = Math.floor(index / 10);
    let col = index % 10;
    for (let i = 0; i < length; i++) {
        wordArea.push(index + i);
    }
    return wordArea;
}

// Check if the word fits vertically
function checkVertical(index, word) {
    let gridLetters = document.querySelectorAll('.grid div');
    for (let i = 0; i < word.length; i++) {
        if (index + i * 10 >= gridLetters.length || gridLetters[index + i * 10].innerText !== word[i]) {
            return false;
        }
    }
    return true;
}

// Get the area for the word placed vertically
function getVerticalWordArea(index, length) {
    let wordArea = [];
    for (let i = 0; i < length; i++) {
        wordArea.push(index + i * 10);
    }
    return wordArea;
}

// Check if the word fits diagonally
function checkDiagonal(index, word) {
    let gridLetters = document.querySelectorAll('.grid div');
    for (let i = 0; i < word.length; i++) {
        if (index + i * 11 >= gridLetters.length || gridLetters[index + i * 11].innerText !== word[i]) {
            return false;
        }
    }
    return true;
}

// Get the area for the word placed diagonally
function getDiagonalWordArea(index, length) {
    let wordArea = [];
    for (let i = 0; i < length; i++) {
        wordArea.push(index + i * 11);
    }
    return wordArea;
}

// Highlight the bounding box area around the word (expanded area)
function highlightBoundingBox(wordArea, word) {
    let gridLetters = document.querySelectorAll('.grid div');
    
    // Get the bounding box around the word
    let minRow = Infinity, minCol = Infinity, maxRow = -Infinity, maxCol = -Infinity;
    wordArea.forEach(index => {
        let row = Math.floor(index / 10);
        let col = index % 10;
        minRow = Math.min(minRow, row);
        maxRow = Math.max(maxRow, row);
        minCol = Math.min(minCol, col);
        maxCol = Math.max(maxCol, col);
    });

    // Expand the box to a larger area, e.g., a 5x5 box or 6x6
    let expandedBoxSize = 5; // Define the size of the box to highlight (e.g., 5x5, 6x6)
    let expandedMinRow = Math.max(minRow - Math.floor((expandedBoxSize - (maxRow - minRow + 1)) / 2), 0);
    let expandedMaxRow = Math.min(expandedMinRow + expandedBoxSize - 1, 9); // Ensure it fits in the grid
    let expandedMinCol = Math.max(minCol - Math.floor((expandedBoxSize - (maxCol - minCol + 1)) / 2), 0);
    let expandedMaxCol = Math.min(expandedMinCol + expandedBoxSize - 1, 9); // Ensure it fits in the grid

    // Highlight the expanded area
    let boxArea = [];
    for (let r = expandedMinRow; r <= expandedMaxRow; r++) {
        for (let c = expandedMinCol; c <= expandedMaxCol; c++) {
            let index = r * 10 + c;
            if (index >= 0 && index < gridLetters.length) {
                boxArea.push(index);
            }
        }
    }

    boxArea.forEach(index => {
        let cell = gridLetters[index];
        if (cell) {
            cell.classList.add('highlight-box');
        }
    });

    // Remove the box after 2 seconds
    setTimeout(() => {
        boxArea.forEach(index => {
            let cell = gridLetters[index];
            if (cell) {
                cell.classList.remove('highlight-box');
            }
        });
    }, 2000);
}

// // Function to highlight only the first letter of the word
// function highlightFirstLetter(startIndex) {
//     let gridLetters = document.querySelectorAll('.grid div');
//     gridLetters[startIndex].classList.add('highlight');
    
//     setTimeout(() => gridLetters[startIndex].classList.remove('highlight'), 2000);
// }

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

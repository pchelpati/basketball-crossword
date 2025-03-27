document.addEventListener('DOMContentLoaded', function() {
    // Grid layout: 0 = black cell, 1 = empty cell, 2+ = numbered cell
    const gridLayout = [
        [2, 1, 1, 1, 0],  // HOOP (4 letters)
        [3, 1, 1, 1, 1],  // ALLEY (5 letters)
        [4, 1, 1, 1, 0],  // WILT (4 letters)
        [5, 1, 1, 1, 0],  // KOBE (4 letters)
        [6, 1, 1, 1, 0],  // SHOT (4 letters)
        [1, 0, 0, 0, 0]   // Bottom row with just the S from HAWKS
    ];

    // Correct answers
    const correctAnswers = {
        down: {
            1: "HAWKS"
        },
        across: {
            1: "HOOP",
            2: "ALLEY",
            3: "WILT",
            4: "KOBE",
            5: "SHOT"
        }
    };

    // Answer positions mapping (row, col, direction, length)
    const answerPositions = {
        down: {
            1: { row: 0, col: 0, length: 5 }
        },
        across: {
            1: { row: 0, col: 0, length: 4 },
            2: { row: 1, col: 0, length: 5 },
            3: { row: 2, col: 0, length: 4 },
            4: { row: 3, col: 0, length: 4 },
            5: { row: 4, col: 0, length: 4 }
        }
    };

    // Reference to DOM elements
    const crosswordGrid = document.getElementById('crossword-grid');
    const timerDisplay = document.getElementById('timer-display');
    const bestTimeDisplay = document.getElementById('best-time-display');
    const feedbackMessage = document.getElementById('feedback-message');
    const checkBtn = document.getElementById('check-btn');
    const resetBtn = document.getElementById('reset-btn');
    const showAnswersBtn = document.getElementById('show-answers-btn');

    // Timer variables
    let seconds = 0;
    let minutes = 0;
    let timerInterval;
    let bestTime = localStorage.getItem('basketballCrosswordBestTime') || null;

    // Initialize game
    function initGame() {
        createGrid();
        startTimer();
        displayBestTime();
        setupEventListeners();
        // Make sure first cell gets focus on game start
        setTimeout(() => {
            const firstInput = document.querySelector('input[data-row="0"][data-col="0"]');
            if (firstInput) {
                firstInput.focus();
            }
        }, 500);
    }

    // Create the crossword grid
    function createGrid() {
        crosswordGrid.innerHTML = '';
        
        for (let row = 0; row < gridLayout.length; row++) {
            for (let col = 0; col < gridLayout[row].length; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                
                if (gridLayout[row][col] === 0) {
                    cell.classList.add('black');
                } else if (gridLayout[row][col] >= 1) {
                    if (gridLayout[row][col] > 1) {
                        const cellNumber = document.createElement('span');
                        cellNumber.classList.add('cell-number');
                        cellNumber.textContent = gridLayout[row][col] - 1;
                        cell.appendChild(cellNumber);
                    }
                    
                    const input = document.createElement('input');
                    input.setAttribute('type', 'text');
                    input.setAttribute('maxlength', '1');
                    input.setAttribute('data-row', row);
                    input.setAttribute('data-col', col);
                    input.addEventListener('keydown', handleKeyDown);
                    input.addEventListener('input', handleInput);
                    cell.appendChild(input);
                }
                
                crosswordGrid.appendChild(cell);
            }
        }
    }

    // Start the timer
    function startTimer() {
        clearInterval(timerInterval);
        seconds = 0;
        minutes = 0;
        updateTimerDisplay();
        
        timerInterval = setInterval(function() {
            seconds++;
            if (seconds >= 60) {
                seconds = 0;
                minutes++;
            }
            updateTimerDisplay();
        }, 1000);
    }

    // Update timer display
    function updateTimerDisplay() {
        timerDisplay.textContent = `${padZero(minutes)}:${padZero(seconds)}`;
    }

    // Display best time
    function displayBestTime() {
        if (bestTime) {
            bestTimeDisplay.textContent = bestTime;
        } else {
            bestTimeDisplay.textContent = '--:--';
        }
    }

    // Set up event listeners
    function setupEventListeners() {
        checkBtn.addEventListener('click', checkAnswers);
        resetBtn.addEventListener('click', resetGame);
        showAnswersBtn.addEventListener('click', showAnswers);
        
        // Add touch event listeners for mobile devices
        document.addEventListener('touchend', handleTouchEnd);
        
        // Handle orientation change events
        window.addEventListener('orientationchange', handleOrientationChange);
    }
    
    // Handle touch events on mobile
    function handleTouchEnd(e) {
        // If we tapped on a cell or near a cell, focus on the nearest input
        if (e.target.tagName !== 'INPUT' && e.target.className.includes('cell')) {
            const input = e.target.querySelector('input');
            if (input) {
                input.focus();
            }
        }
    }
    
    // Handle orientation changes on mobile devices
    function handleOrientationChange() {
        // Give the browser time to adjust the layout
        setTimeout(() => {
            // Scroll to top to ensure the grid is visible
            window.scrollTo(0, 0);
            
            // Recalculate any layout adjustments if needed
            const currentInput = document.activeElement;
            if (currentInput && currentInput.tagName === 'INPUT') {
                currentInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 300);
    }

    // Handle keydown events for navigation
    function handleKeyDown(e) {
        const row = parseInt(e.target.getAttribute('data-row'));
        const col = parseInt(e.target.getAttribute('data-col'));
        
        if (e.key === 'ArrowRight') {
            moveToCell(row, col + 1);
            e.preventDefault();
        } else if (e.key === 'ArrowLeft') {
            moveToCell(row, col - 1);
            e.preventDefault();
        } else if (e.key === 'ArrowUp') {
            moveToCell(row - 1, col);
            e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            moveToCell(row + 1, col);
            e.preventDefault();
        } else if (e.key === 'Backspace' && e.target.value === '') {
            moveToCell(row, col - 1);
        } else if (e.key === 'Tab') {
            // Prevent default tab behavior
            e.preventDefault();
            // Move to next cell or previous cell with shift
            if (e.shiftKey) {
                moveToCell(row, col - 1);
            } else {
                moveToCell(row, col + 1);
            }
        }
    }

    // Handle input events for automatic advancement
    function handleInput(e) {
        const row = parseInt(e.target.getAttribute('data-row'));
        const col = parseInt(e.target.getAttribute('data-col'));
        
        if (e.target.value.length === 1) {
            e.target.value = e.target.value.toUpperCase();
            moveToCell(row, col + 1);
        }
    }

    // Move focus to a specific cell
    function moveToCell(row, col) {
        // Find a valid cell to move to
        while (row >= 0 && row < gridLayout.length && col >= 0 && col < gridLayout[0].length) {
            if (gridLayout[row][col] !== 0) {
                const nextInput = document.querySelector(`input[data-row="${row}"][data-col="${col}"]`);
                if (nextInput) {
                    nextInput.focus();
                    // On mobile, this helps ensure virtual keyboard appears
                    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                        setTimeout(() => {
                            nextInput.focus();
                        }, 100);
                    }
                    return;
                }
            }
            
            // If we can't find a valid cell in this position, try the next column
            col++;
            
            // If we reach the end of a row, move to the next row
            if (col >= gridLayout[0].length) {
                row++;
                col = 0;
            }
        }
    }

    // Check answers
    function checkAnswers() {
        let allCorrect = true;
        clearCellStyles();
        
        // Check across answers
        for (const clueNum in answerPositions.across) {
            const pos = answerPositions.across[clueNum];
            const userAnswer = getUserAnswer(pos.row, pos.col, 'across', pos.length);
            
            if (userAnswer !== correctAnswers.across[clueNum]) {
                markIncorrectCells(pos.row, pos.col, 'across', pos.length);
                allCorrect = false;
            } else {
                markCorrectCells(pos.row, pos.col, 'across', pos.length);
            }
        }
        
        // Check down answers
        for (const clueNum in answerPositions.down) {
            const pos = answerPositions.down[clueNum];
            const userAnswer = getUserAnswer(pos.row, pos.col, 'down', pos.length);
            
            if (userAnswer !== correctAnswers.down[clueNum]) {
                markIncorrectCells(pos.row, pos.col, 'down', pos.length);
                allCorrect = false;
            } else {
                markCorrectCells(pos.row, pos.col, 'down', pos.length);
            }
        }
        
        if (allCorrect) {
            clearInterval(timerInterval);
            feedbackMessage.textContent = 'Congratulations! All answers are correct!';
            feedbackMessage.classList.add('success');
            feedbackMessage.classList.remove('error');
            
            // Update best time if this is better
            const currentTime = `${padZero(minutes)}:${padZero(seconds)}`;
            if (!bestTime || compareTime(currentTime, bestTime)) {
                bestTime = currentTime;
                localStorage.setItem('basketballCrosswordBestTime', bestTime);
                displayBestTime();
                feedbackMessage.textContent += ` New best time: ${bestTime}!`;
            }
        } else {
            feedbackMessage.textContent = 'Some answers are incorrect. Try again!';
            feedbackMessage.classList.add('error');
            feedbackMessage.classList.remove('success');
        }
    }

    // Get user's answer for a specific clue
    function getUserAnswer(row, col, direction, length) {
        let answer = '';
        
        for (let i = 0; i < length; i++) {
            const currentRow = direction === 'across' ? row : row + i;
            const currentCol = direction === 'across' ? col + i : col;
            
            if (currentRow >= gridLayout.length || currentCol >= gridLayout[0].length) {
                continue;
            }
            
            const input = document.querySelector(`input[data-row="${currentRow}"][data-col="${currentCol}"]`);
            if (input) {
                answer += input.value || ' ';
            }
        }
        
        return answer.trim();
    }

    // Mark incorrect cells
    function markIncorrectCells(row, col, direction, length) {
        for (let i = 0; i < length; i++) {
            const currentRow = direction === 'across' ? row : row + i;
            const currentCol = direction === 'across' ? col + i : col;
            
            if (currentRow >= gridLayout.length || currentCol >= gridLayout[0].length) {
                continue;
            }
            
            const input = document.querySelector(`input[data-row="${currentRow}"][data-col="${currentCol}"]`);
            if (input) {
                input.parentElement.classList.add('incorrect');
            }
        }
    }

    // Mark correct cells
    function markCorrectCells(row, col, direction, length) {
        for (let i = 0; i < length; i++) {
            const currentRow = direction === 'across' ? row : row + i;
            const currentCol = direction === 'across' ? col + i : col;
            
            if (currentRow >= gridLayout.length || currentCol >= gridLayout[0].length) {
                continue;
            }
            
            const input = document.querySelector(`input[data-row="${currentRow}"][data-col="${currentCol}"]`);
            if (input) {
                input.parentElement.classList.add('correct');
            }
        }
    }

    // Clear cell styles
    function clearCellStyles() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.remove('correct', 'incorrect');
        });
    }

    // Reset game
    function resetGame() {
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.value = '';
        });
        
        clearCellStyles();
        feedbackMessage.textContent = '';
        feedbackMessage.classList.remove('success', 'error');
        startTimer();
    }

    // Show answers
    function showAnswers() {
        clearInterval(timerInterval);
        
        // Fill in across answers
        for (const clueNum in answerPositions.across) {
            const pos = answerPositions.across[clueNum];
            const answer = correctAnswers.across[clueNum];
            
            for (let i = 0; i < answer.length; i++) {
                const input = document.querySelector(`input[data-row="${pos.row}"][data-col="${pos.col + i}"]`);
                if (input) {
                    input.value = answer[i];
                }
            }
        }
        
        // Fill in down answers (only cells that aren't already filled)
        for (const clueNum in answerPositions.down) {
            const pos = answerPositions.down[clueNum];
            const answer = correctAnswers.down[clueNum];
            
            for (let i = 0; i < answer.length; i++) {
                const input = document.querySelector(`input[data-row="${pos.row + i}"][data-col="${pos.col}"]`);
                if (input && !input.value) {
                    input.value = answer[i];
                }
            }
        }
        
        feedbackMessage.textContent = 'Answers revealed. Click Reset to start a new game.';
        feedbackMessage.classList.remove('success', 'error');
    }

    // Compare two times in format MM:SS
    function compareTime(time1, time2) {
        const [min1, sec1] = time1.split(':').map(Number);
        const [min2, sec2] = time2.split(':').map(Number);
        
        if (min1 < min2 || (min1 === min2 && sec1 < sec2)) {
            return true; // time1 is better
        }
        
        return false;
    }

    // Pad zero for single digit numbers
    function padZero(num) {
        return num.toString().padStart(2, '0');
    }

    // Initialize the game
    initGame();
});
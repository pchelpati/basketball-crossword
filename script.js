const crosswordContainer = document.getElementById("crossword-container");

const puzzle = {
    size: 7,
    grid: [
      [{ num: 1 }, {}, {}, {}, {}, {}, {}],
      [{}, {}, {}, {}, {}, {}, {}],
      [{ num: 2 }, {}, {}, {}, {}, {}, {}],
      [{ block: true }, {}, { num: 3 }, {}, {}, {}, {}],
      [{ num: 4 }, {}, {}, {}, {}, {}, {}],
      [{ block: true }, {}, {}, {}, {}, {}, {}],
      [{}, {}, {}, {}, {}, {}, {}],
    ],
    answers: {
      across: [
        { num: 1, clue: "Year basketball was invented", answer: "1891", row: 0, col: 0 },
        { num: 2, clue: "Played on a court", answer: "BASKET", row: 2, col: 0 },
        { num: 3, clue: "Improves bone ___", answer: "STRENGTH", row: 3, col: 2 },
        { num: 4, clue: "Team-based sport", answer: "TEAM", row: 4, col: 0 }
      ],
      down: [
        { num: 1, clue: "Scoring type: 3-___ shot", answer: "POINT", row: 0, col: 0 },
        { num: 2, clue: "Opposite of solo", answer: "TEAM", row: 0, col: 1 },
        { num: 3, clue: "Basketball improves heart ___", answer: "HEALTH", row: 0, col: 3 }
      ]
    }
  };
  

let currentCell = null;

// Build grid
for (let row = 0; row < puzzle.size; row++) {
  for (let col = 0; col < puzzle.size; col++) {
    const cellData = puzzle.grid[row][col] || {};
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.row = row;
    cell.dataset.col = col;
    cell.setAttribute("tabindex", "0");

    if (cellData.block) {
      cell.classList.add("block");
    } else {
      if (cellData.num) {
        const num = document.createElement("div");
        num.classList.add("number");
        num.textContent = cellData.num;
        cell.appendChild(num);
      }

      cell.addEventListener("click", () => {
        if (currentCell) currentCell.classList.remove("selected");
        currentCell = cell;
        cell.classList.add("selected");
        cell.focus();
      });
    }

    crosswordContainer.appendChild(cell);
  }
}

// Clue display
function renderClues(type, listId) {
  const list = document.getElementById(listId);
  puzzle.answers[type].forEach(clue => {
    const li = document.createElement("li");
    li.textContent = `${clue.num}. ${clue.clue}`;
    list.appendChild(li);
  });
}

renderClues("across", "across-clues");
renderClues("down", "down-clues");

// Typing and nav
document.addEventListener("keydown", (e) => {
  if (!currentCell || currentCell.classList.contains("block")) return;

  const row = parseInt(currentCell.dataset.row);
  const col = parseInt(currentCell.dataset.col);

  if (/^[a-zA-Z0-9]$/.test(e.key)) {
    currentCell.textContent = e.key.toUpperCase();
    moveToNext(row, col);
  } else if (e.key === "Backspace") {
    currentCell.textContent = "";
    moveToPrev(row, col);
  } else if (e.key === "ArrowRight") {
    focusCell(row, col + 1);
  } else if (e.key === "ArrowLeft") {
    focusCell(row, col - 1);
  } else if (e.key === "ArrowDown") {
    focusCell(row + 1, col);
  } else if (e.key === "ArrowUp") {
    focusCell(row - 1, col);
  }
});

function focusCell(row, col) {
  const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
  if (cell && !cell.classList.contains("block")) {
    if (currentCell) currentCell.classList.remove("selected");
    currentCell = cell;
    currentCell.classList.add("selected");
    cell.focus();
  }
}

function moveToNext(row, col) {
  focusCell(row, col + 1);
}

function moveToPrev(row, col) {
  focusCell(row, col - 1);
}
function getPlayerAnswer(startRow, startCol, length, isAcross) {
    let answer = "";
    for (let i = 0; i < length; i++) {
      const row = isAcross ? startRow : startRow + i;
      const col = isAcross ? startCol + i : startCol;
      const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
      if (cell && !cell.classList.contains("block")) {
        answer += (cell.textContent || " ").trim();
      }
    }
    return answer.toUpperCase();
  }
  
  function checkAnswers() {
    let total = 0;
    let correct = 0;
  
    const checkList = [...puzzle.answers.across, ...puzzle.answers.down];
  
    checkList.forEach(clue => {
      const isAcross = puzzle.answers.across.includes(clue);
      const playerAnswer = getPlayerAnswer(clue.row, clue.col, clue.answer.length, isAcross);
      total++;
      if (playerAnswer === clue.answer.toUpperCase()) {
        correct++;
      }
    });
  
    alert(`You got ${correct} out of ${total} correct!`);
  }
  
const boardElement = document.getElementById("board");
const turnStatus = document.getElementById("turn-status");
const blackScore = document.getElementById("black-score");
const whiteScore = document.getElementById("white-score");
const resetButton = document.getElementById("reset-button");
const passButton = document.getElementById("pass-button");
const logList = document.getElementById("log-list");

const BOARD_SIZE = 8;
const EMPTY = null;
const BLACK = "black";
const WHITE = "white";
const DIRECTIONS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

let board = [];
let currentPlayer = BLACK;
let moveNumber = 1;

function createBoard() {
  board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(EMPTY));
  const mid = BOARD_SIZE / 2;
  board[mid - 1][mid - 1] = WHITE;
  board[mid][mid] = WHITE;
  board[mid - 1][mid] = BLACK;
  board[mid][mid - 1] = BLACK;
  currentPlayer = BLACK;
  moveNumber = 1;
  logList.innerHTML = "";
  renderBoard();
  updateStatus();
  logMessage("ゲーム開始");
}

function renderBoard() {
  boardElement.innerHTML = "";
  const validMoves = getValidMoves(currentPlayer);

  board.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const button = document.createElement("button");
      button.className = "cell";
      button.setAttribute("role", "gridcell");
      button.dataset.row = rowIndex;
      button.dataset.col = colIndex;

      const isValid = validMoves.some((move) => move.row === rowIndex && move.col === colIndex);
      if (isValid) {
        button.classList.add("highlight");
      }

      if (cell) {
        const disc = document.createElement("div");
        disc.className = `disc ${cell === WHITE ? "white" : ""}`;
        button.appendChild(disc);
      }

      button.addEventListener("click", () => handleMove(rowIndex, colIndex));
      button.setAttribute("aria-disabled", cell !== EMPTY ? "true" : "false");

      boardElement.appendChild(button);
    });
  });
}

function handleMove(row, col) {
  if (board[row][col] !== EMPTY) {
    return;
  }

  const flips = getFlippableDiscs(row, col, currentPlayer);
  if (flips.length === 0) {
    return;
  }

  placeDisc(row, col, currentPlayer, flips);
  const moveLabel = `${moveNumber}. ${currentPlayer === BLACK ? "黒" : "白"}: ${row + 1}行${col + 1}列`;
  logMessage(moveLabel);
  moveNumber += 1;

  currentPlayer = currentPlayer === BLACK ? WHITE : BLACK;
  updateStatus();
  renderBoard();
  checkGameState();
}

function placeDisc(row, col, player, flips) {
  board[row][col] = player;
  flips.forEach(({ row: flipRow, col: flipCol }) => {
    board[flipRow][flipCol] = player;
  });
}

function getValidMoves(player) {
  const moves = [];
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      if (board[row][col] !== EMPTY) {
        continue;
      }
      const flips = getFlippableDiscs(row, col, player);
      if (flips.length > 0) {
        moves.push({ row, col });
      }
    }
  }
  return moves;
}

function getFlippableDiscs(row, col, player) {
  const opponent = player === BLACK ? WHITE : BLACK;
  const flips = [];

  DIRECTIONS.forEach(([dx, dy]) => {
    const line = [];
    let currentRow = row + dx;
    let currentCol = col + dy;

    while (isOnBoard(currentRow, currentCol) && board[currentRow][currentCol] === opponent) {
      line.push({ row: currentRow, col: currentCol });
      currentRow += dx;
      currentCol += dy;
    }

    if (isOnBoard(currentRow, currentCol) && board[currentRow][currentCol] === player && line.length > 0) {
      flips.push(...line);
    }
  });

  return flips;
}

function isOnBoard(row, col) {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

function updateStatus() {
  const { black, white } = countDiscs();
  blackScore.textContent = black;
  whiteScore.textContent = white;

  const playerLabel = currentPlayer === BLACK ? "黒" : "白";
  const validMoves = getValidMoves(currentPlayer);
  if (validMoves.length === 0) {
    turnStatus.textContent = `手番: ${playerLabel}（置ける場所なし）`;
  } else {
    turnStatus.textContent = `手番: ${playerLabel}`;
  }
}

function countDiscs() {
  let black = 0;
  let white = 0;
  board.forEach((row) => {
    row.forEach((cell) => {
      if (cell === BLACK) {
        black += 1;
      } else if (cell === WHITE) {
        white += 1;
      }
    });
  });
  return { black, white };
}

function checkGameState() {
  const currentMoves = getValidMoves(currentPlayer);
  const opponent = currentPlayer === BLACK ? WHITE : BLACK;
  const opponentMoves = getValidMoves(opponent);

  if (currentMoves.length === 0 && opponentMoves.length === 0) {
    endGame();
  }
}

function endGame() {
  const { black, white } = countDiscs();
  let result = "引き分け";
  if (black > white) {
    result = "黒の勝ち";
  } else if (white > black) {
    result = "白の勝ち";
  }
  turnStatus.textContent = `ゲーム終了: ${result}`;
  logMessage(`ゲーム終了: ${result}`);
}

function handlePass() {
  const validMoves = getValidMoves(currentPlayer);
  if (validMoves.length > 0) {
    logMessage("パスできません。置ける場所があります。");
    return;
  }

  logMessage(`${currentPlayer === BLACK ? "黒" : "白"}がパスしました。`);
  currentPlayer = currentPlayer === BLACK ? WHITE : BLACK;
  updateStatus();
  renderBoard();
  checkGameState();
}

function logMessage(message) {
  const item = document.createElement("li");
  item.textContent = message;
  logList.appendChild(item);
  logList.scrollTop = logList.scrollHeight;
}

resetButton.addEventListener("click", createBoard);
passButton.addEventListener("click", handlePass);

createBoard();

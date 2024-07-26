let score = 0;
let lines= 0;
const cols = 16;
const rows = 22;
const margin = 3;
const pointsFactor = 100;
const timeDelta = 500; //milisegundos
const tetriminoColor = "red";
const backgroundColor = "rgb(55, 55, 55)";
const obstacleColor = "rgb(160, 10, 10)";

const tetriminos = [
    [
        [1, 1],
        [1, 1]
    ],
    [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ],
    [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ],
    [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],
    [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ]
];

const createTable = (cols, rows) => {
    const table = document.createElement("table");
    for (let j = 0; j < rows; j++) {
        const row = table.insertRow(j);
        for (let i = 0; i < cols; i++) {
            row.insertCell(i);
        }
    }
    return table;
};

const randInt = (n) => {
    return Math.floor(Math.random() * (n + 1));
};

const newTetrimino = (x = 6, y = 0) => {
    const matrix = tetriminos[randInt(tetriminos.length - 1)];
    const tetrimino = {x:x, y:y, size:matrix.length, matrix:matrix};
    delimitTetrimino(tetrimino, tetriminoColor);
    return tetrimino;
};

const delimitTetrimino = (tetrimino, color) => {
    const x1 = tetrimino.x;
    const y1 = tetrimino.y;
    const x2 = x1 + tetrimino.size;
    const y2 = y1 + tetrimino.size;
    const matrix = tetrimino.matrix;
    [...table.rows].slice(y1, y2).forEach((row, j) => {
        [...row.cells].slice(x1, x2).forEach((cell, i) => {
            if (matrix[j][i] === 1) cell.style.backgroundColor = color
        })
    })
};

const moveTetrimino = (tetrimino, dx, dy, virtual) => {
    const x1 = tetrimino.x;
    const y1 = tetrimino.y;
    if (!virtual) delimitTetrimino(tetrimino, backgroundColor);
    tetrimino.x = x1 + dx;
    tetrimino.y = y1 + dy;
    if (!virtual) delimitTetrimino(tetrimino, tetriminoColor);
    return tetrimino;
};

const keyboardEvents = (e) => {
    if (e.key === "ArrowLeft" && !collision(tetrimino, -1, 0)) {
        tetrimino = moveTetrimino(tetrimino, -1, 0);
    };
    if (e.key === "ArrowRight" && !collision(tetrimino, 1, 0)) {
        tetrimino = moveTetrimino(tetrimino, 1, 0);
    };
    if (e.key === "ArrowDown" && !collision(tetrimino, 0, 1)) {
        tetrimino = moveTetrimino(tetrimino, 0, 1);
    };
    if (e.key === "ArrowUp") {
        tetrimino = rotateTetrimino(tetrimino);
    };
};

const collision = (tetrimino, dx, dy) => {
    const x1 = tetrimino.x + dx;
    const y1 = tetrimino.y + dy;
    const x2 = x1 + tetrimino.size;
    const y2 = y1 + tetrimino.size;
    const matrix = tetrimino.matrix;
    if (x1 < 0 || x2 > cols || y2 > rows) return true;
    for (let j = y1; j < y2; j++) {
        for (let i = x1; i < x2; i++) {
            const cell = table.rows[j].cells[i];
            const color = cell.style.backgroundColor;
            if (matrix[j - y1][i - x1] === 1 && color === obstacleColor) {
                return true;
            };
        };
    };
    return false;
};

const drawRect = (x1, y1, x2, y2, color, display) => {
    [...table.rows].slice(y1, y2).forEach((row) => {
        [...row.cells].slice(x1, x2).forEach((cell) => {
            cell.style.backgroundColor = color;
            cell.style.display = display;
        });
    });
};

const createBoard = () => {
    drawRect(0, 0, cols, rows, obstacleColor, "none");
    drawRect(margin, 0, cols - margin, rows - margin, backgroundColor, "table-cell");
};

const animate = (timeDelta) => {
    const intervalId = setInterval(() => {
        if (!collision(tetrimino, 0, 1)) {
            tetrimino = moveTetrimino(tetrimino, 0, 1);
        } else {
            delimitTetrimino(tetrimino, obstacleColor);
            verifyGameOver(tetrimino, intervalId);
            verifyLines(tetrimino);
            tetrimino = newTetrimino();
        };
    }, timeDelta);
};

const rotateMatrix = (matrix) => {
    return matrix[0].map((_, i) => matrix.map((row) => row[i]).reverse());
};

const rotateTetrimino = (tetrimino) => {
    delimitTetrimino(tetrimino, backgroundColor);
    const matrix = tetrimino.matrix;
    tetrimino.matrix = rotateMatrix(matrix);
    tetrimino = adjustRotation(tetrimino);
    if (collision(tetrimino, 0, 0)) tetrimino.matrix = matrix;
    delimitTetrimino(tetrimino, tetriminoColor);
    return tetrimino;
};

const deleteLine = (y) => {
    table.deleteRow(y);
    const newRow = table.insertRow(0);
    for (let i = 0; i < cols; i++) newRow.insertCell(i);
    drawRect(0, 0, cols, 1, obstacleColor, "none");
    drawRect(margin, 0, cols - margin, 1, backgroundColor, "table-cell");
};

const verifyLines = (tetrimino) => {
    let completeLines = 0;
    const y1 = tetrimino.y;
    const y2 = Math.min(y1 + tetrimino.size, rows - margin);
    [...table.rows].slice(y1, y2).forEach((row, j) => {
        let completeLine = true;
        for (const cell of [...row.cells].slice(margin, cols - margin)) {
            if (cell.style.backgroundColor !== obstacleColor) {
                completeLine = false;
                break;
            };
        };
        if (completeLine) {
            deleteLine(y1 + j);
            completeLines += 1;
        };
    });
    updateGameData(completeLines, pointsFactor);
};

const adjustRotation = (tetrimino) => {
    if (!collision(tetrimino, 0, 0)) return tetrimino;
    const deltas = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [-2, 0],
        [2, 0],
        [0, -2]
    ];
    const limit = 3 * (tetrimino.size - 2);
    for (let i = 0; i < limit; i++) {
        if (!collision(tetrimino, ...deltas[i])) {
            tetrimino = moveTetrimino(tetrimino, ...deltas[i], true);
        };
    };
    return tetrimino;
};

const verifyGameOver = (tetrimino, intervalId) => {
    if (tetrimino.y < 1) {
        clearInterval(intervalId);
        const message = document.createElement("h2");
        message.classList.add("game-over");
        message.textContent = "GAME OVER";
        document.body.appendChild(message);
    };
};

const updateGameData = (completeLines, pointsFactor) => {
    if (completeLines < 1) return;
    score += pointsFactor * 2 ** (completeLines -1);
    lines += completeLines;
    const spanScore = document.getElementById("score");
    spanScore.textContent = score;
    const spanLines = document.getElementById("lines");
    spanLines.textContent = lines;
};

const table = createTable(cols, rows);
document.body.appendChild(table);
createBoard();
let tetrimino = newTetrimino();
document.addEventListener("keydown", keyboardEvents);
animate(timeDelta);
const board = document.getElementById('board');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const gameOverHighScoreDisplay = document.getElementById('gameOverHighScore');
const finalScoreDisplay = document.getElementById('finalScore');
const restartButton = document.getElementById('restart');
const gameOverDisplay = document.getElementById('gameOver');
let score = 0;
let highScore = parseInt(localStorage.getItem('2048-highscore')) || 0;
let tiles = [];

function initGame() {
    // Rensa spelplanen
    tiles = Array.from({ length: 16 }, () => 0);
    score = 0;
    updateScores();
    gameOverDisplay.classList.remove('show');
    
    // Lägg till två brickor på olika positioner
    addInitialTile();
    addInitialTile();
    
    updateBoard();
}

function updateScores() {
    scoreDisplay.textContent = `Score: ${score}`;
    highScoreDisplay.textContent = `High Score: ${highScore}`;
    gameOverHighScoreDisplay.textContent = `High Score: ${highScore}`;
}

function checkAndUpdateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('2048-highscore', highScore.toString());
        updateScores();
    }
}

function addInitialTile() {
    const emptyTiles = tiles.map((tile, index) => tile === 0 ? index : null).filter(index => index !== null);
    if (emptyTiles.length > 0) {
        const randomIndex = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        tiles[randomIndex] = Math.random() < 0.9 ? 2 : 4;
    }
}

function addTile() {
    const emptyTiles = tiles.map((tile, index) => tile === 0 ? index : null).filter(index => index !== null);
    if (emptyTiles.length > 0) {
        const randomIndex = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        tiles[randomIndex] = Math.random() < 0.9 ? 2 : 4;
        updateBoard();
    }
}

function updateBoard() {
    board.innerHTML = '';
    tiles.forEach(tile => {
        const tileElement = document.createElement('div');
        tileElement.classList.add('tile');
        tileElement.classList.add(`tile-${tile}`);
        tileElement.innerText = tile === 0 ? '' : tile;
        board.appendChild(tileElement);
    });
    updateScores();
    checkWin();
    if (checkGameOver()) {
        restartButton.disabled = false;
    }
}

function checkGameOver() {
    if (tiles.every(tile => tile !== 0)) {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if ((j < 3 && tiles[i * 4 + j] === tiles[i * 4 + (j + 1)]) ||
                    (i < 3 && tiles[i * 4 + j] === tiles[(i + 1) * 4 + j])) {
                    return false;
                }
            }
        }
        showGameOver();
        return true;
    }
    return false;
}

function showGameOver() {
    checkAndUpdateHighScore();
    finalScoreDisplay.textContent = score;
    gameOverHighScoreDisplay.textContent = highScore;
    gameOverDisplay.classList.add('show');
}

function checkWin() {
    if (tiles.includes(2048)) {
        alert('You Win!');
    }
}

function move(direction) {
    let moved = false;
    let newTiles = [...tiles];

    // Funktion för att flytta och slå ihop brickor i en rad
    function mergeLine(line) {
        // Ta bort nollor och få en array med bara nummer
        let numbers = line.filter(x => x !== 0);
        
        // Slå ihop lika nummer
        for (let i = 0; i < numbers.length - 1; i++) {
            if (numbers[i] === numbers[i + 1]) {
                numbers[i] *= 2;
                score += numbers[i];
                checkAndUpdateHighScore();
                numbers.splice(i + 1, 1);
                moved = true;
            }
        }
        
        // Fyll på med nollor till rätt längd
        while (numbers.length < 4) {
            numbers.push(0);
        }
        
        return numbers;
    }

    switch (direction) {
        case 'left':
            for (let i = 0; i < 4; i++) {
                let row = newTiles.slice(i * 4, (i + 1) * 4);
                let mergedRow = mergeLine(row);
                if (row.join(',') !== mergedRow.join(',')) {
                    moved = true;
                }
                for (let j = 0; j < 4; j++) {
                    newTiles[i * 4 + j] = mergedRow[j];
                }
            }
            break;

        case 'right':
            for (let i = 0; i < 4; i++) {
                let row = newTiles.slice(i * 4, (i + 1) * 4).reverse();
                let mergedRow = mergeLine(row).reverse();
                if (row.join(',') !== mergedRow.join(',')) {
                    moved = true;
                }
                for (let j = 0; j < 4; j++) {
                    newTiles[i * 4 + j] = mergedRow[j];
                }
            }
            break;

        case 'up':
            for (let j = 0; j < 4; j++) {
                let column = [
                    newTiles[j],
                    newTiles[j + 4],
                    newTiles[j + 8],
                    newTiles[j + 12]
                ];
                let mergedColumn = mergeLine(column);
                if (column.join(',') !== mergedColumn.join(',')) {
                    moved = true;
                }
                for (let i = 0; i < 4; i++) {
                    newTiles[i * 4 + j] = mergedColumn[i];
                }
            }
            break;

        case 'down':
            for (let j = 0; j < 4; j++) {
                let column = [
                    newTiles[j + 12],
                    newTiles[j + 8],
                    newTiles[j + 4],
                    newTiles[j]
                ];
                let mergedColumn = mergeLine(column).reverse();
                if (column.join(',') !== mergedColumn.join(',')) {
                    moved = true;
                }
                for (let i = 0; i < 4; i++) {
                    newTiles[i * 4 + j] = mergedColumn[i];
                }
            }
            break;
    }

    if (moved) {
        tiles = newTiles;
        addTile();
        updateBoard();
    }
}

function handleKeyPress(event) {
    event.preventDefault(); // Förhindra scrollning med piltangenter
    
    switch (event.key) {
        case 'ArrowLeft':
            move('left');
            break;
        case 'ArrowRight':
            move('right');
            break;
        case 'ArrowUp':
            move('up');
            break;
        case 'ArrowDown':
            move('down');
            break;
    }
}

document.addEventListener('keydown', handleKeyPress);

restartButton.addEventListener('click', () => {
    initGame();
});

initGame();

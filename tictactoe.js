document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById("board");
    const status = document.getElementById("status");
    const newGameDiv = document.getElementById("new-game");
    const restartBtn = document.getElementById("restart");

    const twoPlayerBtn = document.getElementById("two-player");
    const playerVsComputerBtn = document.getElementById("player-vs-computer");

    let currentPlayer = "X";
    let gameMode = "two-player"; // Default mode
    let gameActive = true;
    let boardState = Array(9).fill(null); // 3x3 board as a flat array

    // Initialize board
    const createBoard = () => {
        board.innerHTML = "";
        boardState.fill(null);
        currentPlayer = "X";
        gameActive = true;
        status.textContent = "";
        newGameDiv.style.display = "none";

        for (let i = 0; i < 9; i++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.index = i;
            board.appendChild(cell);
        }
    };

    // Check for a winner or draw
    const checkGameStatus = () => {
        const winningCombos = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]            // Diagonals
        ];

        for (const combo of winningCombos) {
            const [a, b, c] = combo;
            if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
                gameActive = false;
                status.textContent = `${boardState[a]} wins!`;
                newGameDiv.style.display = "block";
                return;
            }
        }

        if (!boardState.includes(null)) {
            gameActive = false;
            status.textContent = "It's a draw!";
            newGameDiv.style.display = "block";
        }
    };

    // Handle computer's move
    const computerMove = () => {
        if (!gameActive) return;

        let move;
        if (gameMode === "player-vs-computer-smart") {
            move = findBestMove(); // Use smart strategy
        } else {
            move = StrategicMove(); // Random move
        }

        if (move !== -1) {
            makeMove(move);
        }
    };

    // Find the best move (smart AI)
    const findBestMove = () => {
        const winningMove = testMove("O"); // Check if AI can win
        if (winningMove !== -1) return winningMove;

        const blockingMove = testMove("X"); // Check if AI needs to block
        if (blockingMove !== -1) return blockingMove;

        return StrategicMove(); // If no winning/blocking moves, choose randomly
    };

    // Check if a move leads to a win or a block
    const testMove = (symbol) => {
        const availableMoves = boardState.map((cell, index) => cell === null ? index : null).filter(index => index !== null);

        for (const i of availableMoves) {
            boardState[i] = symbol;
            const isWinning = winningCombos.some(combo =>
                combo.every(index => boardState[index] === symbol)
            );
            boardState[i] = null; // Undo move
            if (isWinning) return i;
        }

        return -1;
    };

    const StrategicMove = () => {
        // Collect all available moves (indices of empty cells)
        const availableMoves = boardState.map((cell, index) => cell === null ? index : null).filter(index => index !== null);
    
        // Define your strategies
        const firstStrategy = [0, 2, 8]; 
        const fallbackStrategyFirst = [1, 4, 5];
        const secondStrategy = [6, 8, 2];  
        const fallbackStrategySecond = [7, 5, 4];
    
        // Function to check and return first available cell from the strategy
        const findMoveFromStrategy = (strategy) => {
            for (let i = 0; i < strategy.length; i++) {
                if (availableMoves.includes(strategy[i])) {
                    return strategy[i];
                }
            }
            return null; // If no move found in this strategy, return null
        };
    
        // Try to select strategy randomly: 1 or 2
        const randomStrategy = Math.floor(Math.random() * 2) + 1;
        
        let strategicMove = null;
    
        if (randomStrategy === 1) {
            // First strategy: Try 1, 3, 9 (cells 0, 2, 8)
            strategicMove = findMoveFromStrategy(firstStrategy);
            
            // If first strategy fails, fallback to 2, 5, 6 (cells 1, 4, 5)
            if (strategicMove === null) {
                strategicMove = findMoveFromStrategy(fallbackStrategyFirst);
            }
        } else {
            // Second strategy: Try 7, 9, 3 (cells 6, 8, 2)
            strategicMove = findMoveFromStrategy(secondStrategy);
            
            // If second strategy fails, fallback to 8, 6, 5 (cells 7, 5, 4)
            if (strategicMove === null) {
                strategicMove = findMoveFromStrategy(fallbackStrategySecond);
            }
        }
    
        // If all strategies fail, return a random move from the available moves
        if (strategicMove === null) {
            strategicMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
        //blocking player's movement
        const winningCombos = [
            [0, 1, 2], // Row 1
            [3, 4, 5], // Row 2
            [6, 7, 8], // Row 3
            [0, 3, 6], // Column 1
            [1, 4, 7], // Column 2
            [2, 5, 8], // Column 3
            [0, 4, 8], // Diagonal 1
            [2, 4, 6]  // Diagonal 2
        ];

        winningCombos.forEach(winningCombo => {
            const xCount = winningCombo.filter(index => boardState[index] === "X").length; // Count X's
            const emptyCells = winningCombo.filter(index => boardState[index] === null);   // Find empty cells
        
            if (xCount === 2 && emptyCells.length === 1) {
                //console.log(`Place "O" at index ${emptyCells[0]} to block.`);
                strategicMove = emptyCells[0];
            }
        });

        return strategicMove;
    };
    
    // Make a move
    const makeMove = (index) => {
        if (!gameActive || boardState[index]) return; // Ensure the game is active and the cell is empty
    
        boardState[index] = currentPlayer; // Update the board state
        const cell = document.querySelector(`.cell[data-index='${index}']`); // Find the cell in the DOM
        cell.textContent = currentPlayer; // Place the "X" or "O" in the cell -- needs to be an image
        cell.classList.add("taken"); // Mark the cell as taken visually
    
        checkGameStatus(); // Check if the game is won or drawn
    
        currentPlayer = currentPlayer === "X" ? "O" : "X"; // Switch to the next player
    
        if (gameMode.includes("computer") && currentPlayer === "O" && gameActive) {
            setTimeout(computerMove, 500); // Let the AI make its move after a delay
        }
    };
    

    // Event listener for moves
    board.addEventListener("click", (e) => {
        if (!e.target.classList.contains("cell")) return;

        const index = parseInt(e.target.dataset.index, 10);
        makeMove(index);
    });

    // Restart the game
    restartBtn.addEventListener("click", createBoard);

    // Game mode selection
    twoPlayerBtn.addEventListener("click", () => {
        gameMode = "two-player";
        createBoard();
    });

    playerVsComputerBtn.addEventListener("click", () => {
        gameMode = "player-vs-computer";
        createBoard();
    });

    // Initialize the game
    createBoard();
});

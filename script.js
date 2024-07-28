const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const box = 20;
let snake = [];
let food, powerUp, direction, score, highScore;
let gameInterval;
let isPaused = false;
let gameSpeed = 100;

document.getElementById("startButton").addEventListener("click", startGame);
document.getElementById("pauseButton").addEventListener("click", pauseGame);
document.getElementById("resetButton").addEventListener("click", resetGame);
document.addEventListener("keydown", directionHandler);

function initializeGame() {
    snake = [{ x: 9 * box, y: 10 * box }];
    direction = null;
    score = 0;
    highScore = localStorage.getItem("snakeHighScore") || 0;
    updateScore();
    updateHighScore();
    food = generateRandomPosition();
    powerUp = {
        x: Math.floor(Math.random() * 19 + 1) * box,
        y: Math.floor(Math.random() * 19 + 1) * box,
        visible: false,
        duration: 5000,
        endTime: 0,
        type: "speed" // or "grow"
    };
}

function startGame() {
    initializeGame();
    clearInterval(gameInterval);
    gameInterval = setInterval(draw, gameSpeed);
    isPaused = false;
}

function pauseGame() {
    if (isPaused) {
        gameInterval = setInterval(draw, gameSpeed);
    } else {
        clearInterval(gameInterval);
    }
    isPaused = !isPaused;
}

function resetGame() {
    clearInterval(gameInterval);
    initializeGame();
    draw();
}

function directionHandler(event) {
    const key = event.keyCode;
    const directions = {
        37: "LEFT",
        38: "UP",
        39: "RIGHT",
        40: "DOWN"
    };
    
    if (directions[key] && direction !== getOppositeDirection(directions[key])) {
        direction = directions[key];
    }
}

function getOppositeDirection(dir) {
    const opposites = {
        "LEFT": "RIGHT",
        "RIGHT": "LEFT",
        "UP": "DOWN",
        "DOWN": "UP"
    };
    return opposites[dir];
}

function generateRandomPosition() {
    let position;
    do {
        position = {
            x: Math.floor(Math.random() * 19 + 1) * box,
            y: Math.floor(Math.random() * 19 + 1) * box
        };
    } while (collision(position, snake));
    return position;
}

function collision(pos, array) {
    return array.some(segment => pos.x === segment.x && pos.y === segment.y);
}

function updateScore() {
    document.getElementById("score").innerText = score;
}

function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("snakeHighScore", highScore);
    }
    document.getElementById("highScore").innerText = highScore;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? "#4ecdc4" : "#45b7a7";
        ctx.fillRect(segment.x, segment.y, box, box);
        ctx.strokeStyle = "#0f3460";
        ctx.strokeRect(segment.x, segment.y, box, box);
    });

    // Draw food
    ctx.fillStyle = "#e94560";
    ctx.beginPath();
    ctx.arc(food.x + box/2, food.y + box/2, box/2, 0, 2*Math.PI);
    ctx.fill();

    // Draw power-up
    if (powerUp.visible) {
        ctx.fillStyle = powerUp.type === "speed" ? "#ffd700" : "#9932cc";
        ctx.beginPath();
        ctx.arc(powerUp.x + box/2, powerUp.y + box/2, box/2, 0, 2*Math.PI);
        ctx.fill();
    }

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (direction == "LEFT") snakeX -= box;
    if (direction == "UP") snakeY -= box;
    if (direction == "RIGHT") snakeX += box;
    if (direction == "DOWN") snakeY += box;

    // Allow snake to cross walls
    if (snakeX < 0) snakeX = canvas.width - box;
    if (snakeX >= canvas.width) snakeX = 0;
    if (snakeY < 0) snakeY = canvas.height - box;
    if (snakeY >= canvas.height) snakeY = 0;

    if (snakeX == food.x && snakeY == food.y) {
        score++;
        updateScore();
        updateHighScore();
        food = generateRandomPosition();

        // Randomly show a power-up
        if (Math.random() < 0.2) { // 20% chance to spawn a power-up
            powerUp.visible = true;
            powerUp.x = generateRandomPosition().x;
            powerUp.y = generateRandomPosition().y;
            powerUp.endTime = Date.now() + powerUp.duration;
            powerUp.type = Math.random() < 0.5 ? "speed" : "grow";
        }
    } else {
        snake.pop();
    }

    if (powerUp.visible && snakeX == powerUp.x && snakeY == powerUp.y) {
        powerUp.visible = false;
        if (powerUp.type === "speed") {
            clearInterval(gameInterval);
            gameSpeed = 50;
            gameInterval = setInterval(draw, gameSpeed);
            setTimeout(() => {
                clearInterval(gameInterval);
                gameSpeed = 100;
                gameInterval = setInterval(draw, gameSpeed);
            }, 5000);
        } else if (powerUp.type === "grow") {
            for (let i = 0; i < 3; i++) {
                snake.push({...snake[snake.length - 1]});
            }
        }
    }

    if (powerUp.visible && Date.now() > powerUp.endTime) {
        powerUp.visible = false;
    }

    let newHead = { x: snakeX, y: snakeY };

    if (collision(newHead, snake)) {
        clearInterval(gameInterval);
        alert(`Game Over! Your score: ${score}`);
        resetGame();
        return;
    }

    snake.unshift(newHead);

    // Draw score
    ctx.fillStyle = "#4ecdc4";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);
}

// Initialize the game for the first time
initializeGame();
draw();
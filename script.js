const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
];
let food = { x: 15, y: 15 };
let powerup = { x: -1, y: -1, type: '' };
let dx = 1;
let dy = 0;
let score = 0;
let powerupActive = false;
let powerupTimer = 0;
let gameSpeed = 100;

function gameLoop() {
    clearCanvas();
    moveSnake();
    drawSnake();
    drawFood();
    drawPowerup();
    checkCollision();
    updateScore();
    handlePowerup();
    setTimeout(gameLoop, gameSpeed);
}

function clearCanvas() {
    ctx.fillStyle = 'white'; // Grass-like background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    // Draw body
    for (let i = snake.length - 1; i > 0; i--) {
        const segment = snake[i];
        const prevSegment = snake[i - 1];
        const progress = i / snake.length;
        
        ctx.fillStyle = powerupActive ? `rgba(255, 215, 0, ${0.5 + progress / 2})` : 
                         `rgb(${Math.floor(69 + progress * 100)}, ${Math.floor(139 + progress * 50)}, 0)`;
        
        ctx.beginPath();
        ctx.ellipse(
            segment.x * gridSize + gridSize / 2,
            segment.y * gridSize + gridSize / 2,
            gridSize / 2 - 1,
            gridSize / 2 - 1,
            Math.atan2(prevSegment.y - segment.y, prevSegment.x - segment.x),
            0,
            2 * Math.PI
        );
        ctx.fill();
    }

    // Draw head
    const head = snake[0];
    ctx.fillStyle = powerupActive ? '#ffd700' : '#654321'; // Brown for head
    ctx.beginPath();
    ctx.ellipse(
        head.x * gridSize + gridSize / 2,
        head.y * gridSize + gridSize / 2,
        gridSize / 2,
        gridSize / 2,
        Math.atan2(dy, dx),
        0,
        2 * Math.PI
    );
    ctx.fill();

    // Eyes
    ctx.fillStyle = 'white';
    let eyeX = head.x * gridSize + gridSize / 2;
    let eyeY = head.y * gridSize + gridSize / 2;
    let eyeOffset = 3;
    
    if (dx === 1) eyeX += eyeOffset;
    if (dx === -1) eyeX -= eyeOffset;
    if (dy === 1) eyeY += eyeOffset;
    if (dy === -1) eyeY -= eyeOffset;

    ctx.beginPath();
    ctx.arc(eyeX - 4, eyeY - 2, 2, 0, 2 * Math.PI);
    ctx.arc(eyeX + 4, eyeY - 2, 2, 0, 2 * Math.PI);
    ctx.fill();

    // Tongue
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(eyeX, eyeY + 5);
    ctx.lineTo(eyeX + dx * 7, eyeY + dy * 7);
    ctx.moveTo(eyeX + dx * 7, eyeY + dy * 7);
    ctx.lineTo(eyeX + dx * 7 - dy * 3, eyeY + dy * 7 + dx * 3);
    ctx.moveTo(eyeX + dx * 7, eyeY + dy * 7);
    ctx.lineTo(eyeX + dx * 7 + dy * 3, eyeY + dy * 7 - dx * 3);
    ctx.stroke();
}

function drawFood() {
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2 - 2,
        0,
        2 * Math.PI
    );
    ctx.fill();
}

function drawPowerup() {
    if (powerup.x !== -1 && powerup.y !== -1) {
        ctx.fillStyle = powerup.type === 'speed' ? 'blue' : 
                        powerup.type === 'double' ? 'green' : 'purple';
        ctx.beginPath();
        ctx.arc(
            powerup.x * gridSize + gridSize / 2,
            powerup.y * gridSize + gridSize / 2,
            gridSize / 2 - 2,
            0,
            2 * Math.PI
        );
        ctx.fill();

        // Draw point value
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            powerup.type === 'double' ? '2' : '4',
            powerup.x * gridSize + gridSize / 2,
            powerup.y * gridSize + gridSize / 2
        );
    }
}

function moveSnake() {
    let head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Make the snake appear from the opposite end if it touches a wall
    if (head.x < 0) {
        head.x = tileCount - 1;
    } else if (head.x >= tileCount) {
        head.x = 0;
    }
    if (head.y < 0) {
        head.y = tileCount - 1;
    } else if (head.y >= tileCount) {
        head.y = 0;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        score++;
        generateFood();
        if (Math.random() < 0.3) { // 30% chance to spawn a powerup
            generatePowerup();
        }
    } else {
        snake.pop();
    }
}

function generateFood() {
    do {
        food.x = Math.floor(Math.random() * tileCount);
        food.y = Math.floor(Math.random() * tileCount);
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
}

function generatePowerup() {
    do {
        powerup.x = Math.floor(Math.random() * tileCount);
        powerup.y = Math.floor(Math.random() * tileCount);
    } while (snake.some(segment => segment.x === powerup.x && segment.y === powerup.y) || 
             (powerup.x === food.x && powerup.y === food.y));
    
    const rand = Math.random();
    if (rand < 0.33) {
        powerup.type = 'speed';
    } else if (rand < 0.66) {
        powerup.type = 'double';
    } else {
        powerup.type = 'quad';
    }
}

function checkCollision() {
    const head = snake[0];
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y && !powerupActive) {
            resetGame();
            return;
        }
    }
    if (head.x === powerup.x && head.y === powerup.y) {
        activatePowerup();
    }
}

function activatePowerup() {
    powerupActive = true;
    powerupTimer = 50; // 5 seconds (50 * 100ms)
    if (powerup.type === 'speed') {
        gameSpeed = 50; // Faster game speed
    } else if (powerup.type === 'double') {
        score += 2;
    } else if (powerup.type === 'quad') {
        score += 4;
    }
    powerup = { x: -1, y: -1, type: '' };
}

function handlePowerup() {
    if (powerupActive) {
        powerupTimer--;
        if (powerupTimer <= 0) {
            powerupActive = false;
            gameSpeed = 100; // Reset to normal game speed
        }
    }
}

function resetGame() {
    alert(`Game Over! Your score: ${score}`);
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    food = { x: 15, y: 15 };
    powerup = { x: -1, y: -1, type: '' };
    dx = 1;
    dy = 0;
    score = 0;
    powerupActive = false;
    powerupTimer = 0;
    gameSpeed = 100;
}

function updateScore() {
    scoreElement.textContent = `Score: ${score}`;
}

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            if (dy === 0) { dx = 0; dy = -1; }
            break;
        case 'ArrowDown':
            if (dy === 0) { dx = 0; dy = 1; }
            break;
        case 'ArrowLeft':
            if (dx === 0) { dx = -1; dy = 0; }
            break;
        case 'ArrowRight':
            if (dx === 0) { dx = 1; dy = 0; }
            break;
    }
});

gameLoop();
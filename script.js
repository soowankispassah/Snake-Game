const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const box = 12; // 40% smaller grid cell
const canvasWidth = 600;
const canvasHeight = 400;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

// Load snake head, body, tail, and food images
const headImg = new Image();
headImg.src = 'assets/head.png'; // Assuming head.png is in the assets directory

const bodyImg = new Image();
bodyImg.src = 'assets/body.png'; // Assuming body.png is in the assets directory

const tailImg = new Image();
tailImg.src = 'assets/tail.png'; // Assuming tail.png is in the assets directory

const foodImg = new Image();
foodImg.src = 'assets/food.png'; // Assuming food.png is in the assets directory

const bigFoodImg = new Image();
bigFoodImg.src = 'assets/ball.png'; // Using ball.png for big food

// Load audio files
const foodAteAudio = new Audio('assets/food ate.mp3');
const bigFoodAppearanceAudio = new Audio('assets/bigfood appearance.mp3');
const bigFoodAteAudio = new Audio('assets/bigfood appearance ate.mp3');
const deadAudio = new Audio('assets/dead.mp3');

let snake, food, bigFood, score, direction, nextDirection, game, normalFoodCount, highScore, bigFoodTimer, bigFoodScore, bigFoodInterval, isGameRunning;

function initializeGame() {
    snake = [
        { x: 11 * box, y: 10 * box, dir: 'RIGHT', flip: false }, // Head
        { x: 10 * box, y: 10 * box, dir: 'RIGHT', flip: false }, // Body
        { x: 9 * box, y: 10 * box, dir: 'RIGHT', flip: false }   // Tail
    ];

    food = generateFood();

    bigFood = null;
    score = 0;
    normalFoodCount = 0;
    direction = 'RIGHT';
    nextDirection = 'RIGHT';
    isGameRunning = false;

    document.getElementById("newGameBtn").style.display = "none";
    document.getElementById("startGameBtn").style.display = "block";
    document.getElementById("restartGameBtn").style.visibility = "hidden"; // Hide but take up space
    if (bigFoodTimer) clearTimeout(bigFoodTimer);
    if (bigFoodInterval) clearInterval(bigFoodInterval);
    document.getElementById("progressContainer").style.visibility = "hidden"; // Hide but take up space
    document.getElementById("progressBar").style.width = "100%";
    updateScores();
}

function startGame() {
    document.getElementById("startGameBtn").style.display = "none";
    document.getElementById("restartGameBtn").style.visibility = "visible";
    isGameRunning = true;
    game = setInterval(gameLoop, 100);
}

function startNewGame() {
    clearInterval(game);
    initializeGame();
    startGame();
}

function restartGame() {
    clearInterval(game);
    initializeGame();
    startGame();
}

document.addEventListener('keydown', setDirection);

function setDirection(event) {
    if (!isGameRunning) return; // Ignore input if the game is not running

    if (event.key === 'ArrowLeft' && direction !== 'RIGHT') {
        nextDirection = 'LEFT';
    } else if (event.key === 'ArrowUp' && direction !== 'DOWN') {
        nextDirection = 'UP';
    } else if (event.key === 'ArrowRight' && direction !== 'LEFT') {
        nextDirection = 'RIGHT';
    } else if (event.key === 'ArrowDown' && direction !== 'UP') {
        nextDirection = 'DOWN';
    }
}

function changeDirection(newDirection) {
    if (!isGameRunning) return; // Ignore input if the game is not running

    if (newDirection === 'LEFT' && direction !== 'RIGHT') {
        nextDirection = 'LEFT';
    } else if (newDirection === 'UP' && direction !== 'DOWN') {
        nextDirection = 'UP';
    } else if (newDirection === 'RIGHT' && direction !== 'LEFT') {
        nextDirection = 'RIGHT';
    } else if (newDirection === 'DOWN' && direction !== 'UP') {
        nextDirection = 'DOWN';
    }
}

function generateFood() {
    let newFood;
    let isValidPosition;
    do {
        newFood = {
            x: Math.floor(Math.random() * (canvasWidth / box)) * box,
            y: Math.floor(Math.random() * (canvasHeight / box)) * box
        };
        isValidPosition = true;
        for (let i = 0; i < snake.length; i++) {
            if (newFood.x === snake[i].x && newFood.y === snake[i].y) {
                isValidPosition = false;
                break;
            }
        }
    } while (!isValidPosition);
    return newFood;
}

function resetBigFoodProgress() {
    document.getElementById("progressBar").style.transition = "none"; // Remove transition to reset width instantly
    document.getElementById("progressBar").style.width = "100%";
    setTimeout(() => {
        document.getElementById("progressBar").style.transition = "width 5s linear"; // Reapply transition
    }, 0);
}

function showBigFood() {
    bigFood = generateFood();
    bigFoodScore = 50;
    resetBigFoodProgress();
    document.getElementById("progressContainer").style.visibility = "visible"; // Show the progress bar
    setTimeout(() => {
        document.getElementById("progressBar").style.width = "0%";
    }, 50); // Delay for the transition effect

    bigFoodAppearanceAudio.play(); // Play big food appearance sound

    bigFoodInterval = setInterval(() => {
        bigFoodScore -= 10;
    }, 1000);

    bigFoodTimer = setTimeout(() => {
        bigFood = null;
        document.getElementById("progressContainer").style.visibility = "hidden"; // Hide the progress bar
        clearInterval(bigFoodInterval);
    }, 5000);
}

function collision(head, array) {
    for (let i = 0; i < array.length; i++) {
        if (head.x === array[i].x && head.y === array[i].y) {
            return true;
        }
    }
    return false;
}

function updateScores() {
    document.getElementById("currentScore").innerText = "Current Score: " + score;
    document.getElementById("highScore").innerText = "Highest Score: " + highScore;
}

function drawImageRotated(img, x, y, angle, flip, scale = 1) {
    ctx.save();
    ctx.translate(x + box / 2, y + box / 2);
    ctx.rotate(angle);
    if (flip) {
        ctx.scale(1, -1);
    }
    ctx.scale(scale, scale);
    ctx.drawImage(img, -box / 2, -box / 2, box, box);
    ctx.restore();
}

function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    for (let i = 0; i < snake.length; i++) {
        let angle = 0;
        if (snake[i].dir === 'UP') angle = -Math.PI / 2;
        if (snake[i].dir === 'DOWN') angle = Math.PI / 2;
        if (snake[i].dir === 'LEFT') angle = Math.PI;
        if (snake[i].dir === 'RIGHT') angle = 0;
        const scale = i === 0 ? 1.5 : 1; // Scale head 1.5 times larger
        const img = i === 0 ? headImg : (i === snake.length - 1 ? tailImg : bodyImg);
        drawImageRotated(img, snake[i].x, snake[i].y, angle, snake[i].flip, scale);
    }

    // Draw the food
    ctx.drawImage(foodImg, food.x, food.y, box, box);

    // Draw the big food if present
    if (bigFood) {
        ctx.drawImage(bigFoodImg, bigFood.x - box / 2, bigFood.y - box / 2, box * 2, box * 2);
    }
}

function checkCollisionWithFood(snakeX, snakeY, foodX, foodY, size) {
    return (
        snakeX < foodX + size &&
        snakeX + box > foodX &&
        snakeY < foodY + size &&
        snakeY + box > foodY
    );
}

function update() {
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (nextDirection === 'LEFT') snakeX -= box;
    if (nextDirection === 'UP') snakeY -= box;
    if (nextDirection === 'RIGHT') snakeX += box;
    if (nextDirection === 'DOWN') snakeY += box;

    // Check for wall collision and wrap the snake to the opposite side
    if (snakeX < 0) snakeX = canvasWidth - box;
    if (snakeY < 0) snakeY = canvasHeight - box;
    if (snakeX >= canvasWidth) snakeX = 0;
    if (snakeY >= canvasHeight) snakeY = 0;

    // Check if the snake eats the food
    if (checkCollisionWithFood(snakeX, snakeY, food.x, food.y, box)) {
        score++;
        normalFoodCount++;
        foodAteAudio.play(); // Play small food ate sound
        food = generateFood();

        if (normalFoodCount % 5 === 0) {
            showBigFood();
        }

        let lastPart = snake[snake.length - 1];
        snake.push({ x: lastPart.x, y: lastPart.y, dir: lastPart.dir, flip: !lastPart.flip });
    } else if (bigFood && checkCollisionWithFood(snakeX, snakeY, bigFood.x - box / 2, bigFood.y - box / 2, box * 2)) {
        score += bigFoodScore;
        bigFood = null;
        clearTimeout(bigFoodTimer);
        clearInterval(bigFoodInterval);
        document.getElementById("progressContainer").style.visibility = "hidden"; // Hide the progress bar
        bigFoodAteAudio.play(); // Play big food ate sound

        let lastPart = snake[snake.length - 1];
        snake.push({ x: lastPart.x, y: lastPart.y, dir: lastPart.dir, flip: !lastPart.flip });
    } else {
        snake.pop();
    }

    let newHead = {
        x: snakeX,
        y: snakeY,
        dir: nextDirection,
        flip: !snake[0].flip // Flip the head on each movement
    };

    if (collision(newHead, snake)) {
        clearInterval(game);
        console.log("Game Over");
        isGameRunning = false;
        deadAudio.play(); // Play dead sound

        // Update high score if the current score is higher
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
        }

        updateScores();
        return;
    }

    snake.unshift(newHead);

    direction = nextDirection; // Update to the next direction only after processing

    updateScores();
}

function gameLoop() {
    update();
    draw();
}

window.onload = function() {
    loadScores();
    initializeGame();
}

function loadScores() {
    highScore = localStorage.getItem('highScore') || 0;
    updateScores();
}

const canvas = document.getElementById('spaceCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const earthRadius = 100; // Radius of Earth
const shieldRadius = 130; // Radius of shield around Earth

let flares = []; // Array to hold solar flares
let gameOver = false; // Game over state
let defense = 100; // Defense level (100% initially)
let shieldMeter = 100; // Shield meter (100% initially)
let shieldActive = false; // Whether the shield is active
const sunX = canvas.width / 13; // Sun position (left side of canvas)
const sunY = canvas.height / 2;
const earthX = canvas.width / 1.2; // Earth position (right side of canvas)
const earthY = canvas.height / 2;

// Variables for flare speed control
let baseFlareSpeed = 0.5; // Initial speed
let flareSpeedIncreaseInterval = 100000; // Increase speed every 10 seconds (in milliseconds)
let lastSpeedIncreaseTime = performance.now(); // Track when speed was last increased

// Mouse position
let mouseX = 0;
let mouseY = 0;

// Load images
const sunImage = new Image();
sunImage.src = 'sun.png'; // Path to the Sun image

const earthImage = new Image();
earthImage.src = 'earth.png'; // Path to the Earth image

// Function to draw the Sun using image
function drawSun() {
    ctx.drawImage(sunImage, sunX - 100, sunY - 100, 200, 200); // Adjust the size as needed
}

// Function to draw Earth using image
function drawEarth() {
    ctx.drawImage(earthImage, earthX - 100, earthY - 100, 200, 200); // Adjust the size as needed
}

// Function to draw the shield
function drawShield() {
    if (shieldActive) {
        ctx.beginPath();
        ctx.arc(earthX, earthY, shieldRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.closePath();
    }
}

// Solar flare class
class SolarFlare {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.radius = 20; // Solar flare radius
        this.speed = speed; // Speed at which the flare moves
        this.angle = Math.random() * Math.PI * 2; // Random angle for direction
    }

    // Draw the solar flare
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();
    }

    // Update the position of the flare
    update() {
        const dx = earthX - this.x;
        const dy = earthY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (shieldActive) {
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            if (dist < shieldRadius) {
                this.angle = Math.random() * Math.PI * 2;
            }
        } else {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }

        if (!shieldActive && dist < earthRadius) {
            endGame();
        }
    }

    isClicked(mouseX, mouseY) {
        const dist = Math.sqrt((mouseX - this.x) ** 2 + (mouseY - this.y) ** 2);
        return dist < this.radius;
    }
}

// Function to handle game over state
function endGame() {
    gameOver = true;
    document.getElementById('gameOver').style.display = 'block';
    cancelAnimationFrame(animationFrameId);
}

// Function to generate random solar flares
function generateFlare() {
    const flareX = sunX + Math.random() * 100;
    const flareY = sunY + (Math.random() - 0.5) * 200;
    const speed = baseFlareSpeed + Math.random() * 2; // Increase speed over time
    flares.push(new SolarFlare(flareX, flareY, speed));
}

// Handle mouse movements
canvas.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Handle mouse clicks
canvas.addEventListener('click', function () {
    flares = flares.filter(flare => !flare.isClicked(mouseX, mouseY));
});

// Main game loop
function gameLoop() {
    if (gameOver) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSun();
    drawEarth();
    drawShield();

    // Update flares
    flares.forEach(flare => {
        flare.update();
        flare.draw();
    });

    // Custom cursor
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText('+', mouseX - 10, mouseY + 10);

    // Update defense and shield meter
    document.getElementById('defenseStatus').textContent = `Defense: ${defense}%`;
    document.getElementById('shieldMeter').textContent = `Shield: ${Math.max(shieldMeter.toFixed(1), 0)}%`;

    // Generate new flares randomly
    if (Math.random() < 0.02) {
        generateFlare();
    }

    // Shield usage
    if (shieldActive) {
        shieldMeter -= 0.1;
        if (shieldMeter <= 0) {
            shieldActive = false;
            document.getElementById('shieldMeter').style.color = 'yellow';
        }
    }

    // Check if 10 seconds have passed to increase flare speed
    if (performance.now() - lastSpeedIncreaseTime > flareSpeedIncreaseInterval) {
        baseFlareSpeed += 0.5; // Increase base speed of new flares
        lastSpeedIncreaseTime = performance.now(); // Reset the timer
    }

    // Continue the game loop
    animationFrameId = requestAnimationFrame(gameLoop);
}

// Toggle shield on button click
document.getElementById('toggleShield').addEventListener('click', function () {
    shieldActive = !shieldActive;
    document.getElementById('shieldMeter').style.color = shieldActive ? 'cyan' : 'yellow';
});

// Start game on window load
window.onload = () => {
    gameLoop();
};

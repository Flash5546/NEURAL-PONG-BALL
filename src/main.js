import { createRppgSession } from "@elata-biosciences/rppg-web";

const statusEl = document.getElementById('status');
const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

let session = null;
let currentBpm = 0;

// Game State
const ball = { x: 400, y: 200, vx: 5, vy: 5, r: 8 };
const p1 = { y: 150 };
const ai = { y: 150 };

async function initSensor() {
    try {
        const videoEl = document.createElement('video');
        session = await createRppgSession({
            video: videoEl,
            onDiagnostics: (d) => {
                statusEl.innerText = `BPM: ${currentBpm || 'Analyzing...'} | Status: ${d.state.status}`;
            }
        });
        
        // Start the camera
        await session.start();
        
        // Update game speed based on heart rate
        setInterval(() => {
            const metrics = session.getMetrics();
            currentBpm = Math.round(metrics.bpm || 0);
        }, 1000);
        
        requestAnimationFrame(gameLoop);
    } catch (e) {
        statusEl.innerText = "Sensor Error: Use HTTPS and allow camera.";
    }
}

function gameLoop() {
    // Basic Ball Movement
    ball.x += ball.vx;
    ball.y += ball.vy;

    // AI Logic
    ai.y += (ball.y - (ai.y + 45)) * 0.1;

    // Bounce
    if (ball.y < 0 || ball.y > 400) ball.vy *= -1;
    if (ball.x < 20 || ball.x > 780) ball.vx *= -1;

    // Draw
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 800, 400);
    ctx.fillStyle = '#05ffa1';
    ctx.fillRect(10, p1.y, 10, 90); // Player
    ctx.fillRect(780, ai.y, 10, 90); // AI
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
    ctx.fill();

    requestAnimationFrame(gameLoop);
}

document.getElementById('start-btn').onclick = initSensor;
canvas.onmousemove = (e) => { p1.y = e.offsetY - 45; };

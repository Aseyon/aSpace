const particles = [];
let currentObject = null;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const iconImage = new Image();
iconImage.src = 'imgs/bubble.png';
const videoModal = document.getElementById('videoModal');
const myVideo = document.getElementById('myVideo');
myVideo.preload = 'none';
const objects = [];
const ICON_WIDTH = 100;
let ICON_HEIGHT;
const bgImg = document.querySelector('.bg-img');
const BG_NATURAL_WIDTH = 2200;
let BG_NATURAL_HEIGHT;
const bubbleSound = new Audio('bubble_explode.mp3');

(function () {
    const svg = document.getElementById("grassSVG");
    const path = document.getElementById("grassPath");
    if (!svg || !path) return;
    const W = 1600, H = 500, baseY = 420, strands = 60;
    const dna = Array.from({ length: strands }, () => ({
        height: 100 + Math.random() * 45,
        lean: (Math.random() - 0.5) * 20,
        curve: 20 + Math.random() * 35,
        tipOffset: (Math.random() - 0.5) * 35,
        waveSpeed: 0.4 + Math.random() * 1.1,
        waveOffset: Math.random() * 1000
    }));
    let rawX = NaN, smoothX = NaN, influence = 0, lastMove = 0;

    function updateInput(x) {
        rawX = x;
        influence = 1;
        lastMove = performance.now();
    }

    svg.addEventListener("mousemove", e => {
        const r = svg.getBoundingClientRect();
        updateInput((e.clientX - r.left) * (W / r.width));
    });

    svg.addEventListener("touchmove", e => {
        const t = e.touches[0];
        const r = svg.getBoundingClientRect();
        updateInput((t.clientX - r.left) * (W / r.width));
    });

    svg.addEventListener("mouseleave", () => rawX = NaN);
    svg.addEventListener("touchend", () => rawX = NaN);

    function generate(t) {
        if (!Number.isNaN(rawX)) {
            if (Number.isNaN(smoothX)) smoothX = rawX;
            smoothX += (rawX - smoothX) * 0.12;
        } else if (!Number.isNaN(smoothX)) {
            smoothX += (W * 0.5 - smoothX) * 0.018;
        }
        const dt = performance.now() - lastMove;
        if (dt > 80) {
            influence *= 0.94;
            if (influence < 0.01) influence = 0;
        }
        let d = `M 0 ${H} L 0 ${baseY} `;
        for (let i = 0; i < strands; i++) {
            const x = (i / (strands - 1)) * W;
            const g = dna[i];
            const globalSway = Math.sin(t * g.waveSpeed + g.waveOffset) * 6;
            let localWind = 0;
            if (influence && !Number.isNaN(smoothX)) {
                const dist = Math.abs(smoothX - x);
                if (dist < 280) localWind = (1 - dist / 280) * 80 * influence;
            }
            const top = baseY - g.height * 0.65 + Math.sin(i * 0.45 + t * 1.1) * 6;
            const sway = g.lean + globalSway + localWind * 0.16;
            const cp1 = [x - g.curve * 0.5, baseY - 40];
            const cp2 = [x + sway * 0.2, top + 28];
            const tip = [x + sway, top];
            const cp3 = [x + sway * 0.2, top + 22];
            const cp4 = [x + g.curve * 0.5, baseY - 38];
            const next = [x + W / strands, baseY];
            d += `C ${cp1} ${cp2} ${tip} C ${cp3} ${cp4} ${next} `;
        }
        d += `L ${W} ${H} Z`;
        return d;
    }

    function animate() {
        const t = performance.now() / 900;
        path.setAttribute("d", generate(t));
        requestAnimationFrame(animate);
    }

    animate();
})();

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function createObject(x, y, videoSrc, width, height) {
    objects.push({ x, y, width, height, videoSrc, popping: false });    
}

function getBgOffsetNormalized() {
    const style = window.getComputedStyle(bgImg);
    const matrix = new DOMMatrixReadOnly(style.transform);
    const translateX = matrix.m41 || 0;
    const scaleX = bgImg.clientWidth / BG_NATURAL_WIDTH;
    return translateX / scaleX;
}

function drawObjects() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const offsetX = getBgOffsetNormalized();

    for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];

        if (!obj.popping) {
            ctx.drawImage(iconImage, obj.x + offsetX, obj.y, obj.width, obj.height);
        }

        if (obj.popping) {
            for (let j = obj.particles.length - 1; j >= 0; j--) {
                const p = obj.particles[j];
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
                p.x += p.dx + p.curveX;
                p.y += p.dy + p.curveY;
                p.dy += 0.05;
                p.size *= 0.95;
                p.life--;
                p.color = p.color.replace(/[\d.]+\)$/g, `${Math.max(0, p.life/80)})`);
                if (p.life <= 0 || p.size < 0.5) obj.particles.splice(j, 1);
            }

            if (obj.particles.length === 0) objects.splice(i, 1);
        }
    }
}


function handleClick(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    if (clientX === undefined || clientY === undefined) return;
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;
    for (const obj of objects) {
        if (mouseX >= obj.x + getBgOffsetNormalized() &&
            mouseX <= obj.x + obj.width + getBgOffsetNormalized() &&
            mouseY >= obj.y &&
            mouseY <= obj.y + obj.height) {
            currentObject = obj;
            openVideo(obj.videoSrc);
            break;
        }
    }
}

canvas.addEventListener('click', handleClick);
canvas.addEventListener('touchstart', handleClick, { passive: true });

function openVideo(src) {
    myVideo.src = src;
    videoModal.style.display = 'flex';
    myVideo.play();
}

function explodeIcon(obj) {
    const offsetX = getBgOffsetNormalized();
    const particleCount = 25;
    bubbleSound.currentTime = 0;
    bubbleSound.play();

    obj.popping = true;
    obj.particles = [];

    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;
        const curvature = (Math.random() - 0.5) * 0.5;

        obj.particles.push({
            x: obj.x + obj.width / 2 + offsetX,
            y: obj.y + obj.height / 2,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            curveX: curvature * (Math.random() * 3),
            curveY: curvature * (Math.random() * 3),
            life: 50 + Math.random() * 30,
            size: 4 + Math.random() * 5,
            color: `rgba(255,182,193,${0.5 + Math.random() * 0.5})`
        });
    }
}


function closeVideo() {
    myVideo.pause();
    myVideo.currentTime = 0;
    videoModal.style.display = 'none';
    if (!currentObject) return;
    const obj = currentObject;
    currentObject = null;
    setTimeout(() => {
        explodeIcon(obj);
    }, 100);
}

let objectsReady = false;

iconImage.onload = () => {
    ICON_HEIGHT = iconImage.naturalHeight / iconImage.naturalWidth * ICON_WIDTH;
    createObject(50, 50, '../darkroom/vds/contentwarning1.mp4', ICON_WIDTH, ICON_HEIGHT);
    createObject(200, 300, '../darkroom/vds/blackops2_1.mp4', ICON_WIDTH, ICON_HEIGHT);
    createObject(480, 100, '../darkroom/vds/lockedsouls.mp4', ICON_WIDTH, ICON_HEIGHT);
    createObject(800, 200, '../darkroom/vds/minePark1.mp4', ICON_WIDTH, ICON_HEIGHT);
    createObject(1000, 330, '../darkroom/vds/mineDino.mp4', ICON_WIDTH, ICON_HEIGHT);
    createObject(400, 250, '../darkroom/vds/contentwarning2.mp4', ICON_WIDTH, ICON_HEIGHT);
    BG_NATURAL_HEIGHT = bgImg.naturalHeight;

    objectsReady = true; 
};

function gameLoop() {
    drawObjects();

    if (objectsReady && objects.length === 0) {
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 500);
        return;
    }

    requestAnimationFrame(gameLoop);
}


gameLoop();

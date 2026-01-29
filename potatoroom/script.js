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
    waveOffset: Math.random() * 1000,
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

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const cookieImage = new Image();
cookieImage.src = 'imgs/cookieCat.png';

const videoModal = document.getElementById('videoModal');
const myVideo = document.getElementById('myVideo');
myVideo.preload = 'none';

const objects = [];
const COOKIE_WIDTH = 100;
let COOKIE_HEIGHT;

function createObject(x, y, videoSrc, width, height) {
    objects.push({ x, y, width, height, videoSrc });
}

const bgImg = document.querySelector('.bg-img');
const BG_NATURAL_WIDTH = 2200;
let BG_NATURAL_HEIGHT;

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
    for (const obj of objects) {
        ctx.drawImage(cookieImage, obj.x + offsetX, obj.y, obj.width, obj.height);
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
                openVideo(obj.videoSrc);
                break;
        }
    }
}

canvas.addEventListener('click', handleClick);
canvas.addEventListener('touchstart', handleClick, {passive: true});

function openVideo(src) {
    myVideo.src = src;
    videoModal.style.display = 'flex';
    myVideo.play();
}

function closeVideo() {
    const closeBtn = document.querySelector('#videoModal button');

    myVideo.pause();
    myVideo.currentTime = 0;
    videoModal.style.display = 'none';

    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('span');
        particle.style.setProperty('--dx', (Math.random() - 0.5) * 80);
        particle.style.setProperty('--dy', (Math.random() - 0.5) * 80);
        closeBtn.appendChild(particle);
    }

    closeBtn.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    closeBtn.style.transform = 'scale(1.5)';
    closeBtn.style.opacity = '0';

    setTimeout(() => {
        closeBtn.style.transform = '';
        closeBtn.style.opacity = '';
        closeBtn.querySelectorAll('span').forEach(s => s.remove());
    }, 500);
}

cookieImage.onload = () => {
    COOKIE_HEIGHT = cookieImage.naturalHeight / cookieImage.naturalWidth * COOKIE_WIDTH;
    createObject(50, 50, '../darkroom/vds/contentwarning1.mp4', COOKIE_WIDTH, COOKIE_HEIGHT);
    createObject(200, 300, '../darkroom/vds/blackops2_1.mp4', COOKIE_WIDTH, COOKIE_HEIGHT);
    createObject(500, 100, '../darkroom/vds/contentwarning2.mp4', COOKIE_WIDTH, COOKIE_HEIGHT);
    BG_NATURAL_HEIGHT = bgImg.naturalHeight;
};

function gameLoop() {
    drawObjects();
    requestAnimationFrame(gameLoop);
}
gameLoop();

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const glitchFrames = [
    load("imgs/glitch.png", spriteLoaded),
    load("imgs/glitch01.png", spriteLoaded),
    load("imgs/glitch02.png", spriteLoaded),
    load("imgs/glitch03.png", spriteLoaded)
];

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;

    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const loadSound = new Audio("pc_granted.wav");
const interactSound = new Audio("menu_decision.wav");
const cancelSound = new Audio("menu_cancel.wav");

const glitchFiles = ["glitch.wav", "glitch1.wav", "glitch3.wav"];

let currentGlitchSound = null;

function playRandomGlitch() {
    if (currentGlitchSound) {
        currentGlitchSound.pause();
        currentGlitchSound.currentTime = 0;
    }

    const file = glitchFiles[Math.floor(Math.random() * glitchFiles.length)];
    currentGlitchSound = new Audio(file);
    currentGlitchSound.volume = 0.6;
    currentGlitchSound.play();

    currentGlitchSound.addEventListener("ended", () => {
        currentGlitchSound = null;
    });
}

const steps = [new Audio("step_grass.wav")];
let stepIndex = 0;

const mp4Icons = [
    {
        x: 300,
        y: 200,
        video: "vds/darkhours.mp4",
        width: 48,
        height: 48,
        activated: false,
        glitchActive: false,
        glitchFrame: 0,
        glitchTimer: 0
    },
    {
        x: 800,
        y: 600,
        video: "vds/contentwarning1.mp4",
        width: 48,
        height: 48,
        activated: false,
        glitchActive: false,
        glitchFrame: 0,
        glitchTimer: 0
    },
    {
        x: 500,
        y: 1000,
        video: "vds/repo.mp4",
        width: 48,
        height: 48,
        activated: false,
        glitchActive: false,
        glitchFrame: 0,
        glitchTimer: 0
    },
    {
        x: 1200,
        y: 300,
        video: "vds/contentwarning2.mp4",
        width: 48,
        height: 48,
        activated: false,
        glitchActive: false,
        glitchFrame: 0,
        glitchTimer: 0
    },
    {
        x: 150,
        y: 900,
        video: "vds/blackops2_1.mp4",
        width: 48,
        height: 48,
        activated: false,
        glitchActive: false,
        glitchFrame: 0,
        glitchTimer: 0
    }
];

const mp4Image = new Image();
mp4Image.src = "imgs/mp4icon.png";

const nikoSleep = new Image();
nikoSleep.src = "imgs/nikosleep.gif";

let videoOpen = false;
let currentVideo = null;

window.addEventListener("keydown", e => {
    if (e.key.toLowerCase() === "x" && videoOpen) {
        cancelSound.currentTime = 0;
        cancelSound.play();
        closeVideo();
    }
});


function openVideo(src) {
    if (videoOpen) return;

    videoOpen = true;

    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.left = 0;
    overlay.style.top = 0;
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0,0,0,0.9)";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.flexDirection = "column";
    overlay.style.zIndex = 9999;

    currentVideo = document.createElement("video");
    currentVideo.src = src;
    currentVideo.autoplay = true;
    currentVideo.controls = false;
    currentVideo.style.width = "80%";
    currentVideo.style.maxWidth = "800px";
    currentVideo.style.borderRadius = "16px";
    currentVideo.style.boxShadow = "0 0 40px rgba(0,0,0,0.8)";

    overlay.appendChild(currentVideo);

    document.body.appendChild(overlay);

    currentVideo._overlay = overlay;
    currentVideo.addEventListener("ended", () => {
        cancelSound.currentTime = 0;
        cancelSound.play();
        closeVideo();
    });

    mp4Icons.forEach(icon => {
        const scale = 1;
        const aspect = mp4Image.naturalHeight / mp4Image.naturalWidth;
        const drawWidth = icon.width * scale;
        const drawHeight = drawWidth * aspect;

        ctx.drawImage(
            mp4Image,
            icon.x - drawWidth / 2,
            icon.y - drawHeight / 2,
            drawWidth,
            drawHeight
        );
    });
}

function closeVideo() {
    if (!currentVideo) return;

    const currentName = currentVideo.src.split("/").pop();

    mp4Icons.forEach(icon => {
        const iconName = icon.video.split("/").pop();

        if (iconName === currentName) {
            icon.glitchActive = true;
            icon.activated = true;
            icon.glitchFrame = 0;
            icon.glitchTimer = 0;
        }
    });


    currentVideo.pause();
    if (currentVideo._overlay) currentVideo._overlay.remove();

    currentVideo = null;
    videoOpen = false;
}

const niko = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    speed: 2,
    width: 42,
    height: 58,
    scale: 2,
    direction: "down",
    frame: 0,
    timer: 0,
    visible: true
};

const bed_idle = new Image();
bed_idle.src = "imgs/bed.png";

const bed_interact1 = new Image();
bed_interact1.src = "imgs/bed1.png";

const bed_interact2 = new Image();
bed_interact2.src = "imgs/bed2.png";

const obj_bed = {
    x: niko.x + 150,
    y: niko.y,
    width: 64,
    height: 32,
    sprite: bed_idle,
    interactable: true,
    interacting: false,
    confirming: false,
    confirmed: false,
    frame: 0,
    timer: 0,
    animation: [bed_interact1, bed_interact2],
    animSpeed: 40,
    scale: 2,

    draw() {
        if (!this.sprite.complete) return;

        const width = this.sprite.width * this.scale;
        const height = this.sprite.height * this.scale;

        ctx.drawImage(
            this.sprite,
            this.x - width / 2,
            this.y - height,
            width,
            height
        );

        if (!this.interacting) return;

        this.timer++;

        if (this.timer > this.animSpeed) {
            if (this.frame < this.animation.length - 1) {
                this.frame++;
                this.sprite = this.animation[this.frame];
            }
            this.timer = 0;
        }
    }
};

const keys = {};
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

const sprites = {
    down: {
        idle: null,
        run: []
    },
    up: {
        idle: null,
        run: []
    },
    left: {
        idle: null,
        run: []
    },
    right: {
        idle: null,
        run: []
    }
};

let totalSprites = 16;
let loadedSprites = 0;
let spritesLoaded = false;

function load(src, callback) {
    const img = new Image();
    img.src = src;
    img.onload = callback;
    return img;
}

function spriteLoaded() {
    loadedSprites++;
    if (loadedSprites >= totalSprites) {
        spritesLoaded = true;
    }
}

sprites.down.idle = load("imgs/Niko_Idle.png", spriteLoaded);
["Down1", "Down2", "Down3"].forEach(f =>
    sprites.down.run.push(load(`imgs/Niko_${f}.png`, spriteLoaded))
);

sprites.up.idle = load("imgs/Niko_Idle_Up.png", spriteLoaded);
["Up1", "Up2", "Up3"].forEach(f =>
    sprites.up.run.push(load(`imgs/Niko_${f}.png`, spriteLoaded))
);

sprites.left.idle = load("imgs/Niko_Idle_Left.png", spriteLoaded);
["Left1", "Left2", "Left3"].forEach(f =>
    sprites.left.run.push(load(`imgs/Niko_${f}.png`, spriteLoaded))
);

sprites.right.idle = load("imgs/Niko_Idle_Right.png", spriteLoaded);
["Right1", "Right2", "Right3"].forEach(f =>
    sprites.right.run.push(load(`imgs/Niko_${f}.png`, spriteLoaded))
);

let stepTimer = 0;
let firstStep = true;

function playStep() {
    const step = steps[stepIndex];
    step.pause();
    step.currentTime = 0;
    step.play();

    stepIndex = (stepIndex + 1) % steps.length;
}

const particles = [];
for (let i = 0; i < 80; i++) {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        alpha: Math.random() * 0.5 + 0.3
    });
}

const fireflies = [];
for (let i = 0; i < 35; i++) {
    fireflies.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 1,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.01 + 0.003
    });
}

const SCALE = 1.5;

const grassTile = document.createElement("canvas");
grassTile.width = 64 * SCALE;
grassTile.height = 64 * SCALE;

const gctx = grassTile.getContext("2d");
gctx.imageSmoothingEnabled = false;
gctx.scale(SCALE, SCALE);

const colors = {
    base: "#1e5b45",
    dark: "#174836",
    mid: "#246b53",
    light: "#2e8a6a"
};

gctx.fillStyle = colors.base;
gctx.fillRect(0, 0, 64, 64);

function leafCluster(x, y, c) {
    gctx.fillStyle = c;
    gctx.fillRect(x, y, 2, 1);
    gctx.fillRect(x - 1, y + 1, 1, 2);
    gctx.fillRect(x + 1, y + 1, 1, 2);
}

for (let i = 0; i < 190; i++) {
    const x = Math.floor(Math.random() * 62) + 1;
    const y = Math.floor(Math.random() * 62) + 1;

    const r = Math.random();
    const c =
        r < 0.4 ? colors.dark :
        r < 0.75 ? colors.mid :
        colors.light;

    leafCluster(x, y, c);
}

for (let i = 0; i < 65; i++) {
    const x = Math.floor(Math.random() * 63);
    const y = Math.floor(Math.random() * 63);
    gctx.fillStyle = colors.dark;
    gctx.fillRect(x, y, 1, 1);
}

const world = {
    width: canvas.width * 2,
    height: canvas.height * 2
};

function checkMP4Interaction() {
    if (videoOpen) return;

    const hitY = -60;
    const extraH = 30;

    if (keys["z"] || keys["Z"]) {
        mp4Icons.forEach(icon => {
            const left = icon.x - icon.width / 2;
            const right = icon.x + icon.width / 2;
            const top = icon.y - icon.height / 2 + hitY;
            const bottom = icon.y + icon.height / 2 + extraH;

            if (
                niko.x >= left &&
                niko.x <= right &&
                niko.y >= top &&
                niko.y <= bottom
            ) {
                if (!icon.activated) {
                    interactSound.currentTime = 0;
                    interactSound.play();
                    openVideo(icon.video);
                } else {
                    playRandomGlitch();
                }
            }
        });
    }
}

function update() {
    if (videoOpen || obj_bed.confirming || obj_bed.confirmed) {
        niko.locked = true;
        return;
    } else {
        niko.locked = false;
    }

    let dx = 0;
    let dy = 0;

    if (!(keys["ArrowUp"] && keys["ArrowDown"])) {
        if (keys["ArrowUp"]) dy -= niko.speed;
        if (keys["ArrowDown"]) dy += niko.speed;
    }

    if (!(keys["ArrowLeft"] && keys["ArrowRight"])) {
        if (keys["ArrowLeft"]) dx -= niko.speed;
        if (keys["ArrowRight"]) dx += niko.speed;
    }

    let newX = niko.x + dx;
    let newY = niko.y + dy;

    newX = Math.max(niko.width * niko.scale / 2, Math.min(world.width - niko.width * niko.scale / 2, newX));
    newY = Math.max(niko.height * niko.scale / 2, Math.min(world.height - niko.height * niko.scale / 2, newY));

    const bedScale = obj_bed.scale;
    const hitboxOffsetY = 80;
    const hitboxWidthReduce = 90;

    const bedX = obj_bed.x - (obj_bed.width * bedScale) / 2 + hitboxWidthReduce / 2;
    const bedY = obj_bed.y - (obj_bed.height * bedScale) - hitboxOffsetY;
    const bedW = (obj_bed.width * bedScale) - hitboxWidthReduce;
    const bedH = (obj_bed.height * bedScale) / 2;

    const nikoW = niko.width * niko.scale;
    const nikoH = niko.height * niko.scale;

    const oldX = niko.x;
    const oldY = niko.y;

    if (!(newX + nikoW / 2 > bedX &&
          newX - nikoW / 2 < bedX + bedW &&
          newY + nikoH / 2 > bedY &&
          newY - nikoH / 2 < bedY + bedH)) {
        niko.x = newX;
        niko.y = newY;
    }

    dx = niko.x - oldX;
    dy = niko.y - oldY;

    const moved = dx !== 0 || dy !== 0;

    if (moved) {
        niko.direction =
            Math.abs(dx) > Math.abs(dy) ?
            (dx > 0 ? "right" : "left") :
            (dy > 0 ? "down" : "up");

        niko.timer++;
        if (niko.timer > 15) {
            niko.frame = (niko.frame + 1) % 3;
            niko.timer = 0;
        }

        if (firstStep) {
            playStep();
            stepTimer = 0;
            firstStep = false;
        } else {
            stepTimer++;
            if (stepTimer >= 50) {
                playStep();
                stepTimer = 0;
            }
        }
    } else {
        niko.frame = -1;
        niko.timer = 0;
        stepTimer = 0;
        firstStep = true;
    }
}

function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const camX = Math.max(0, Math.min(world.width - canvas.width, niko.x - canvas.width / 2));
    const camY = Math.max(0, Math.min(world.height - canvas.height, niko.y - canvas.height / 2));

    ctx.save();
    ctx.translate(-camX, -camY);

    const tileSize = grassTile.width * 2;
    const startX = Math.floor(camX / tileSize) * tileSize;
    const startY = Math.floor(camY / tileSize) * tileSize;
    const tilesX = Math.ceil(canvas.width / tileSize) + 2;
    const tilesY = Math.ceil(canvas.height / tileSize) + 2;

    for (let y = 0; y < tilesY; y++)
        for (let x = 0; x < tilesX; x++)
            ctx.drawImage(
                grassTile,
                startX + x * tileSize,
                startY + y * tileSize,
                tileSize,
                tileSize
            );

    obj_bed.draw();

    mp4Icons.forEach(icon => {
        const scale = 1;
        const aspect = mp4Image.naturalHeight / mp4Image.naturalWidth;
        const drawWidth = icon.width * scale;
        const drawHeight = drawWidth * aspect;

        ctx.drawImage(
            mp4Image,
            icon.x - drawWidth / 2,
            icon.y - drawHeight / 2,
            drawWidth,
            drawHeight
        );

        if (icon.glitchActive) {
            icon.glitchTimer++;
            if (icon.glitchTimer > 10) {
                icon.glitchFrame = (icon.glitchFrame + 1) % glitchFrames.length;
                icon.glitchTimer = 0;
            }

            const glitchImg = glitchFrames[icon.glitchFrame];
            ctx.drawImage(
                glitchImg,
                icon.x - drawWidth / 2,
                icon.y - drawHeight / 2,
                drawWidth,
                drawHeight
            );
        }
    });


    if (!obj_bed.confirmed && niko.visible !== false) {
        const set = sprites[niko.direction];
        const img = niko.frame >= 0 ? set.run[niko.frame] : set.idle;

        ctx.drawImage(
            img,
            niko.x - (niko.width * niko.scale) / 2,
            niko.y - (niko.height * niko.scale) / 2,
            niko.width * niko.scale,
            niko.height * niko.scale
        );

        const lampX = niko.x;
        const lampY = niko.y + (niko.height * niko.scale) * 0.35;
        const radius = 450;

        const gradient = ctx.createRadialGradient(
            lampX, lampY, radius * 0.3,
            lampX, lampY, radius
        );

        gradient.addColorStop(0, "rgba(0,0,0,0)");
        gradient.addColorStop(0.7, "rgba(0,0,0,0.8)");
        gradient.addColorStop(1, "rgba(0,0,0,1)");

        ctx.fillStyle = gradient;
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillRect(camX, camY, canvas.width, canvas.height);
        ctx.globalCompositeOperation = "source-over";
    }

    function drawLamp(x, y) {
    const radius = 250;
    const gradient = ctx.createRadialGradient(x, y, radius * 0.3, x, y, radius);
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(0.7, "rgba(0,0,0,0.8)");
    gradient.addColorStop(1, "rgba(0,0,0,1)");
    ctx.fillStyle = gradient;
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillRect(camX, camY, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-over";
}

if (!obj_bed.confirmed && niko.visible !== false) drawLamp(niko.x, niko.y + (niko.height * niko.scale) * 0.35);
if (obj_bed.confirmed) drawLamp(obj_bed.x, obj_bed.y - (niko.height * niko.scale) * 0.35);

    fireflies.forEach(f => {
        f.phase += f.speed;

        const glow = 0.6 + Math.sin(f.phase) * 0.4;
        const size = Math.round(f.r + Math.sin(f.phase) * 0.5);

        ctx.fillStyle = `rgba(180,255,200,${glow})`;
        ctx.fillRect(Math.floor(f.x), Math.floor(f.y), size, size);

        f.x += Math.sin(f.phase) * 0.2;
        f.y += Math.cos(f.phase) * 0.2;
    });

    ctx.restore();
}

const cursorSound = new Audio("menu_cursor.wav");
cursorSound.volume = 0.5;

const messageBoxSound = new Audio("pc_messagebox.wav");
messageBoxSound.volume = 0.5;

function checkBedInteraction() {
    if (!obj_bed.interactable || obj_bed.interacting) return;
    if (obj_bed.confirming || obj_bed.confirmed) return;

    const interactWidth = 160;
    const interactHeight = 100;
    const offsetXLeft = 10;
    const offsetYTop = -50;

    const left = obj_bed.x - interactWidth / 2 + offsetXLeft;
    const right = obj_bed.x + interactWidth / 2;
    const top = obj_bed.y - interactHeight + offsetYTop;
    const bottom = obj_bed.y;

    if (
        niko.x < left ||
        niko.x > right ||
        niko.y < top ||
        niko.y > bottom
    ) return;

    if (!(keys["z"] || keys["Z"])) return;

    obj_bed.confirming = true;
    niko.locked = true;

    messageBoxSound.currentTime = 0;
    messageBoxSound.play();

    const overlay = document.createElement("div");
    overlay.id = "bedConfirm";
    Object.assign(overlay.style, {
        position: "fixed",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10000
    });
    document.body.appendChild(overlay);

    const windowDiv = document.createElement("div");
    Object.assign(windowDiv.style, {
        width: "450px",
        background: "#C0C0C0",
        border: "2px solid #808080",
        boxShadow: "2px 2px 0 #fff, -2px -2px 0 #808080",
        fontFamily: "Tahoma, Arial, sans-serif"
    });
    overlay.appendChild(windowDiv);

    const titleBar = document.createElement("div");
    Object.assign(titleBar.style, {
        background: "#000080",
        color: "#fff",
        padding: "6px 10px",
        fontWeight: "bold"
    });
    titleBar.innerText = "Confirmar";
    windowDiv.appendChild(titleBar);

    const content = document.createElement("div");
    Object.assign(content.style, {
        padding: "20px",
        color: "#000",
        fontSize: "16px"
    });
    content.innerText = "Quer mesmo voltar ao menu?";
    windowDiv.appendChild(content);

    const btnContainer = document.createElement("div");
    Object.assign(btnContainer.style, {
        display: "flex",
        justifyContent: "flex-end",
        padding: "0 20px 20px 0",
        gap: "10px"
    });
    windowDiv.appendChild(btnContainer);

    const createXPButton = text => {
        const btn = document.createElement("button");
        btn.innerText = text;
        Object.assign(btn.style, {
            width: "80px",
            height: "28px",
            background: "#C0C0C0",
            border: "2px solid #808080",
            cursor: "pointer",
            fontFamily: "Tahoma, Arial, sans-serif",
            fontSize: "14px"
        });
        btn.onmousedown = () => btn.style.boxShadow = "inset 2px 2px 0 #808080, inset -2px -2px 0 #fff";
        btn.onmouseup = () => btn.style.boxShadow = "";
        btn.onmouseover = () => btn.style.background = "#e0e0e0";
        btn.onmouseout = () => btn.style.background = "#C0C0C0";
        return btn;
    };

    const btnNo = createXPButton("Cancelar");
    const btnYes = createXPButton("Confirmar");

    btnContainer.appendChild(btnNo);
    btnContainer.appendChild(btnYes);

    let selectedIndex = 0;
    const buttons = [btnNo, btnYes];

    const updateFocus = () => {
        buttons.forEach((btn, i) => {
            btn.style.border = i === selectedIndex ? "2px solid #000080" : "2px solid #808080";
            btn.style.background = i === selectedIndex ? "#e0e0e0" : "#C0C0C0";
        });
    };
    updateFocus();

    const closeOverlay = () => {
        overlay.remove();
        obj_bed.confirming = false;
        niko.locked = false;
        niko.visible = true;
        keys["z"] = keys["Z"] = false;
        window.removeEventListener("keydown", keyListener);
    };

    const confirmSelection = () => {
        if (selectedIndex === 1) {
            obj_bed.confirmed = true;
            niko.visible = false;
            obj_bed.interacting = true;
            obj_bed.frame = 0;
            obj_bed.timer = 0;
            obj_bed.sprite = obj_bed.animation[0];
            interactSound.currentTime = 0;
            interactSound.play();
            closeOverlay();
            setTimeout(() => {
                window.location.href = "../index.html";
            }, obj_bed.animSpeed * 16 * (obj_bed.animation.length + 0.5));
        } else {
            closeOverlay();
        }
    };

    btnYes.onclick = () => {
        selectedIndex = 1;
        confirmSelection();
    };

    btnNo.onclick = () => {
        cancelSound.currentTime = 0;
        cancelSound.play();
        setTimeout(closeOverlay, 0);
    };

    const keyListener = e => {
        if (!obj_bed.confirming) return;

        const key = e.key.toLowerCase();

        if (key === "x") {
            cancelSound.currentTime = 0;
            cancelSound.play();
            setTimeout(closeOverlay, 0);
        } else if (key === "z") {
            if (selectedIndex === 1) {
                interactSound.currentTime = 0;
                interactSound.play();
            } else {
                cancelSound.currentTime = 0;
                cancelSound.play();
            }
            confirmSelection();
        } else if (key === "arrowleft") {
            selectedIndex = 0;
            updateFocus();
            cursorSound.currentTime = 0;
            cursorSound.play();
        } else if (key === "arrowright") {
            selectedIndex = 1;
            updateFocus();
            cursorSound.currentTime = 0;
            cursorSound.play();
        }
    };
    window.addEventListener("keydown", keyListener);
}

function loop() {
    update();
    checkMP4Interaction();
    checkBedInteraction();
    drawScene();
    requestAnimationFrame(loop);
}

function startGame() {
    loadSound.play();
    loop();
}

let fakeProgress = 0;

function drawLoading(progress) {
    const grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grd.addColorStop(0, "#000000");
    grd.addColorStop(1, "#0a0a10");

    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
        ctx.fillStyle = `rgba(180,220,180,${p.alpha * 0.4})`;
        ctx.fillRect(p.x, p.y, p.size * 1.5, p.size * 1.5);

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
    });

    if (nikoSleep.complete) {
        const imgWidth = 128;
        const imgHeight = 128;

        ctx.drawImage(
            nikoSleep,
            canvas.width / 2 - imgWidth / 2,
            canvas.height / 2 - imgHeight / 2 - 20,
            imgWidth,
            imgHeight
        );
    }

    const barWidth = 280;
    const barHeight = 20;
    const barX = canvas.width / 2 - barWidth / 2;
    const barY = canvas.height / 2 + 80;

    ctx.fillStyle = "#222";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = "#3a4a38";
    ctx.fillRect(barX, barY, barWidth * (progress / 100), barHeight);

    ctx.strokeStyle = "#556655";
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = "#ccc";
    ctx.font = "20px monospace";
    ctx.textAlign = "center";
    ctx.fillText("Carregando...", canvas.width / 2, barY - 15);
}

function updateLoading() {
    if (fakeProgress < 100) fakeProgress += 0.4;

    drawLoading(fakeProgress);

    if (fakeProgress >= 100 && spritesLoaded) {
        startGame();
    } else {
        requestAnimationFrame(updateLoading);
    }
}

updateLoading();
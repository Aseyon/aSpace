const options = document.querySelectorAll(".menu-option");
const dialogBox = document.getElementById("dialog-box");
const sans = document.getElementById("sans");
const sansHead = document.getElementById("sans_head");
let currentIndex = 0;

const swapSound = new Audio('snd_swap.wav');
const selectSound = new Audio('snd_select.wav');
const textSound = new Audio('snd_txtsans.wav');

const signaturesList = ["\n* Rafael", "* Henry Braun", "* Kaizotto", "* Victor", "* Amanda"];
let typingTimeout = null;

function typeText(text, callback) {
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = null;
    dialogBox.innerHTML = "";
    let i = 0;

    function typeNextChar() {
        if (i >= text.length) {
            typingTimeout = null;
            if (callback) callback();
            return;
        }
        const char = text[i];
        dialogBox.innerHTML += char === "\n" ? "<br>" : char;
        updateSansPosition();
        if (char !== " " && char !== "\n") {
            textSound.currentTime = 0;
            textSound.play();
        }
        i++;
        typingTimeout = setTimeout(typeNextChar, 50);
    }
    typeNextChar();
}

function updateSelection() {
    options.forEach((opt, i) => {
        const text = opt.getAttribute("data-text");

        if (i === currentIndex) {
            opt.classList.add("selected");

            opt.innerHTML = `
        <img
          src="imgs/heart.png"
          alt="❤"
          style="
            width: 16px;
            height: 16px;
            image-rendering: pixelated;
            vertical-align: middle;
            margin-right: 5px;
            animation: blink 1s step-start infinite;
          "
        >
        ${text}
      `;
        } else {
            opt.classList.remove("selected");
            opt.innerHTML = text;
        }
    });
}

options.forEach(opt => opt.setAttribute("data-text", opt.textContent));
updateSelection();

const memories = ["bk", "anime", "princess", "quack", "yt", "wit", "back", "rblx", "truth", "tranzit", "dntstarve", "rrpo", "rof2", "camping", "skyBO2", "F99n", "MASSACRE", "inferiores", "revo", "bathroom", "FNAFROBLOX", "monstros", "sinistro", "aura", "badtimetrio", "jogoruim", "BOneverdie",  "navio", "prota", "rango", "sonic"];
let currentMemoryPage = 0;
const memoriesPerPage = 6;
let memTypingTimeouts = [];
let startX = 0;

function handleMemorySwipe(endX) {
    const diff = endX - startX;
    if (diff > 30 && currentMemoryPage > 0) currentMemoryPage--;
    else if (diff < -30 && (currentMemoryPage + 1) * memoriesPerPage < memories.length) currentMemoryPage++;
    renderMemoryPage();
}

const memoryDescriptions = {
    bk: "Backrooms, até hoje me lembro da viagem que foi isso.",
    anime: "Você me prometeu que voltaria...",
    princess: "Até nos momentos mais obscuros...",
    quack: "Almas gritando em agonia à prisão eterna de um corpo que não consegue mais pedir por ajuda.",
    yt: "Claramente, os melhores influencers da geração.",
    wit: "Antes da tragédia.",
    back: "Às vezes o desconhecido também pode ser um descanso.",
    rblx: "Uma época que eu nunca vou me esquecer.. Eu gostaria de ter tido mais memórias desse tempo...",
    truth: "Não que você precise saber, mas na verdade eu que te matei.",
    tranzit: "Um buraco que nos sugava espença, sonhos e vida.",
    dntstarve: "Horas gastas para concretizar seus ossos.",
    rrpo: "Sem mais fuga, agora são eles que fogem.",
    rof2: "Jogo do capeta.",
    camping: "Um dia no acampamento.. o que pode dar errado? (plot: eu era o assassino e matei todos nossos companheiros).",
    skyBO2: "Depois de tantas noites.. tantas derrotas. O céu é daqueles que persistem.",
    F99n: "Nosso filho. Nunca vou me esquecer, o primeiro é sempre especial.",
    MASSACRE: "O dia em que cometemos o maior genocídio da história. Mantivemos os seus corpos em nosso domínio.",
    inferiores: "Pessoas que não mereciam estar no mesmo plano que meu ser. Tiveram o que mereciam por questionar.",
    revo: "Rostos fofos escondendo brutalidades e capacidades destrutivas além do que se chama compreensível.",
    bathroom: "Eu não lhe abandonei, amigo. Só queria ver se você ficaria triste.",
    FNAFROBLOX: "Cinco noites, cinco noites em cada FNaF.. pareceu uma eternidade.",
    monstros: "Se lembra dos monstros? Seus rostos não são borrões. São pessoas em que um dia você confiou.",
    sinistro: "O peso de meus pecados rastejavam por cima minhas costas. Não havia mais esperança. Apenas o medo em seu estado mais primário, o mesmo medo de uma vítima sendo caçada por algo que um dia ele chamou de irmão.",
    aura: "Finalmente, podemos ir para casa após tanto sofrimento. É hora da batalha final.",
    badtimetrio: "O trio dos mals tempos que nunca retornou a este jogo.",
    jogoruim: "Esse jogo era uma merda, mas rendeu uma boa print.",
    legendsneverdie: "Quando tudo parecer perdido e sem esperança. Lembre-se. Você é o Black Ops, e ele vive em você.",
    navio: "Propragando enganosa: quando há promessa de fazer um bom navio.",
    protagonista: "Óbvio, óbvio que eu sou o rei.",
    rango: "'Só preciso de uma bala...' VAI SE FODER",
    sonic: "Left 4 Multiverso da Overdose 2."
};

function showMemory(memName) {
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = null;
    memTypingTimeouts.forEach(t => clearTimeout(t));
    memTypingTimeouts = [];
    textSound.pause();
    textSound.currentTime = 0;
    selectSound.currentTime = 0;
    selectSound.play();

    const oldDesc = document.getElementById("memory-description");
    if (oldDesc) oldDesc.remove();

    const img = document.createElement("img");
    img.src = `../headspace/imgs/${memName.toLowerCase().replace(/\s/g,"")}.png`;
    img.onerror = () => {
        img.onerror = null;
        img.src = `../headspace/imgs/${memName.toLowerCase().replace(/\s/g,"")}.jpg`;
    };
    img.style.maxWidth = "100%";
    img.style.maxHeight = "200px";
    img.style.width = "auto";
    img.style.height = "auto";
    img.style.objectFit = "contain";
    img.style.display = "block";
    img.style.margin = "0 auto 10px auto";
    img.style.cursor = "pointer";

    dialogBox.innerHTML = "";
    dialogBox.appendChild(img);

    img.onload = () => {
        requestAnimationFrame(() => {
            updateSansPosition();

            const desc = document.createElement("div");
            desc.id = "memory-description";
            dialogBox.appendChild(desc);

            const text = memoryDescriptions[memName];
            typeTextBelowImage(text, desc);
        });
    };

    img.addEventListener("click", renderMemoryPage);
    img.addEventListener("touchstart", e => {
        e.preventDefault();
        renderMemoryPage();
    });
}

function typeTextBelowImage(text, element, callback) {
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = null;
    element.innerHTML = "";
    let i = 0;

    function typeNextChar() {
        if (i >= text.length) {
            typingTimeout = null;
            if (callback) callback();
            return;
        }
        const char = text[i];
        element.innerHTML += char === "\n" ? "<br>" : char;
        updateSansPosition();

        if (char !== " " && char !== "\n") {
            textSound.currentTime = 0;
            textSound.play();
        }
        i++;
        typingTimeout = setTimeout(typeNextChar, 50);
    }

    typeNextChar();
}

function renderMemoryPage() {
    memTypingTimeouts.forEach(t => clearTimeout(t));
    memTypingTimeouts = [];

    const start = currentMemoryPage * memoriesPerPage;
    const pageMemories = memories.slice(start, start + memoriesPerPage);
    const [col1, col2] = [pageMemories.slice(0, 3), pageMemories.slice(3, 6)];

    dialogBox.innerHTML = "";
    dialogBox.style.padding = "20px";

    const blinkSound = new Audio('snd_blink.wav');

    function blinkSans(callback) {
        blinkSound.currentTime = 0;
        blinkSound.play();
        sansHead.src = "imgs/sans_blink1.png";
        setTimeout(() => {
            sansHead.src = "imgs/sans_blink2.png";
            setTimeout(() => {
                sansHead.src = "imgs/sans_head.png";
                if (callback) callback();
            }, 50);
        }, 50);
    }

    const navDiv = document.createElement("div");
    navDiv.style.display = "flex";
    navDiv.style.justifyContent = "center";
    navDiv.style.marginBottom = "10px";

    const btnPrev = document.createElement("span");
    btnPrev.className = "memory-button";
    btnPrev.textContent = "< Anterior";
    btnPrev.style.cursor = currentMemoryPage === 0 ? "not-allowed" : "pointer";
    btnPrev.style.marginRight = "10px";

    const btnNext = document.createElement("span");
    btnNext.className = "memory-button";
    btnNext.textContent = "Próximo >";
    btnNext.style.cursor = (currentMemoryPage + 1) * memoriesPerPage >= memories.length ? "not-allowed" : "pointer";

    const prevAction = () => {
        if (currentMemoryPage > 0) blinkSans(() => {
            currentMemoryPage--;
            renderMemoryPage();
        });
    };
    const nextAction = () => {
        if ((currentMemoryPage + 1) * memoriesPerPage < memories.length) blinkSans(() => {
            currentMemoryPage++;
            renderMemoryPage();
        });
    };

    btnPrev.addEventListener("click", prevAction);
    btnPrev.addEventListener("touchstart", (e) => {
        e.preventDefault();
        prevAction();
    });
    btnNext.addEventListener("click", nextAction);
    btnNext.addEventListener("touchstart", (e) => {
        e.preventDefault();
        nextAction();
    });

    navDiv.append(btnPrev, btnNext);
    dialogBox.appendChild(navDiv);

    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.justifyContent = "space-between";
    container.style.width = "100%";

    const createCol = (memArray, padding) => {
        const col = document.createElement("div");
        col.style.display = "flex";
        col.style.flexDirection = "column";
        col.style.gap = "5px";
        col.style.padding = padding;
        memArray.forEach(mem => {
            const span = document.createElement("span");
            span.className = "memory-option";
            span.dataset.mem = mem;
            span.textContent = "";
            col.appendChild(span);
        });
        return col;
    };

    const leftCol = createCol(col1, "0 0 0 10px");
    const rightCol = createCol(col2, "0 10px 0 0");
    container.append(leftCol, rightCol);
    dialogBox.appendChild(container);

    const spans = Array.from(leftCol.children).concat(Array.from(rightCol.children));
    let index = 0;

    function typeNextSpan() {
        if (index >= spans.length) {
            sansHead.src = "imgs/sans_head.png";
            return;
        }
        const span = spans[index];
        const fullText = `* ${span.dataset.mem}`;
        let i = 0;

        function typeChar() {
            if (i >= fullText.length) {
                index++;
                typeNextSpan();
                return;
            }
            span.textContent += fullText[i];
            if (fullText[i] !== " " && fullText[i] !== "\n") {
                textSound.currentTime = 0;
                textSound.play();
            }
            i++;
            memTypingTimeouts.push(setTimeout(typeChar, 50));
        }
        typeChar();
    }
    typeNextSpan();

    container.querySelectorAll(".memory-option").forEach(el => el.addEventListener("click", () => showMemory(el.dataset.mem)));
}

let menuLocked = false;
let returnBattlePreloading = false;

const RETURN_BATTLE_ASSETS = {
    images: [
        "imgs/sans_menu.png",
        "imgs/heart.png",
        "imgs/dragonskull1.png",
        "imgs/dragonskull2.png",
        "imgs/dragonskull3.png",
        "imgs/dragonskull4.png",
        "imgs/dragonskull5.png",
        "imgs/dragonskull6.png",
        "imgs/broken_heart.png",
        "imgs/heart_debris1.png",
        "imgs/heart_debris2.png",
        "imgs/heart_debris3.png",
        "imgs/heart_debris4.png"
    ],
    audio: [
        "snd_spearappear.wav",
        "mus_sfx_rainbowbeam_1.wav",
        "snd_break1_c.wav",
        "snd_break2_c.wav"
    ]
};

const preloadedBattleImages = new Map();
const preloadedBattleAudio = new Map();
let returnBattleAssetsPromise = null;

function preloadImageAsset(src) {
    const cached = preloadedBattleImages.get(src);
    if (cached && cached.complete && cached.naturalWidth > 0) {
        return Promise.resolve(cached);
    }

    return new Promise((resolve, reject) => {
        const img = cached || new Image();
        preloadedBattleImages.set(src, img);

        const finish = () => {
            cleanup();
            resolve(img);
        };
        const fail = () => {
            cleanup();
            reject(new Error(`Falha ao carregar imagem: ${src}`));
        };
        const cleanup = () => {
            img.removeEventListener("load", finish);
            img.removeEventListener("error", fail);
        };

        img.addEventListener("load", finish, { once: true });
        img.addEventListener("error", fail, { once: true });

        if (!cached) img.src = src;
        if (img.complete) {
            img.naturalWidth > 0 ? finish() : fail();
        }
    });
}

function preloadAudioAsset(src) {
    const cached = preloadedBattleAudio.get(src);
    if (cached && cached.readyState >= 2) {
        return Promise.resolve(cached);
    }

    return new Promise((resolve, reject) => {
        const audio = cached || new Audio();
        preloadedBattleAudio.set(src, audio);

        const finish = () => {
            cleanup();
            resolve(audio);
        };
        const fail = () => {
            cleanup();
            reject(new Error(`Falha ao carregar audio: ${src}`));
        };
        const cleanup = () => {
            clearTimeout(timeout);
            audio.removeEventListener("canplaythrough", finish);
            audio.removeEventListener("loadeddata", finish);
            audio.removeEventListener("error", fail);
        };
        const timeout = setTimeout(finish, 10000);

        audio.preload = "auto";
        audio.addEventListener("canplaythrough", finish, { once: true });
        audio.addEventListener("loadeddata", finish, { once: true });
        audio.addEventListener("error", fail, { once: true });

        if (!cached) audio.src = src;
        audio.load();

        if (audio.readyState >= 2) finish();
    });
}

function updateReturnBattleLoading(loaded, total) {
    dialogBox.innerHTML = `* carregando batalha...<br>* ${loaded}/${total}`;
    updateSansPosition();
}

function syncDragonFramesFromPreload() {
    dragonFrames.length = 0;
    for (let i = 1; i <= 6; i++) {
        const frame = preloadedBattleImages.get(`imgs/dragonskull${i}.png`);
        if (frame) dragonFrames.push(frame);
    }
}

function preloadReturnBattleAssets(onProgress) {
    const assets = [
        ...RETURN_BATTLE_ASSETS.images.map(src => ({ type: "image", src })),
        ...RETURN_BATTLE_ASSETS.audio.map(src => ({ type: "audio", src }))
    ];

    if (returnBattleAssetsPromise) {
        return returnBattleAssetsPromise.then(() => {
            if (onProgress) onProgress(assets.length, assets.length);
        });
    }

    let loaded = 0;
    if (onProgress) onProgress(loaded, assets.length);

    returnBattleAssetsPromise = Promise.all(assets.map(asset => {
        const loader = asset.type === "image" ? preloadImageAsset : preloadAudioAsset;

        return loader(asset.src)
            .catch(error => {
                console.warn(error.message);
            })
            .then(() => {
                loaded++;
                if (onProgress) onProgress(loaded, assets.length);
            });
    })).then(() => {
        syncDragonFramesFromPreload();
    });

    return returnBattleAssetsPromise;
}

function playBattleSound(src) {
    const cached = preloadedBattleAudio.get(src);
    const sound = cached ? cached.cloneNode(true) : new Audio(src);
    sound.currentTime = 0;
    const playPromise = sound.play();
    if (playPromise) playPromise.catch(() => {});
    return sound;
}

let heart;
let dragonAttackStarted = false;

function startReturnBattle() {
    dialogBox.innerHTML = "";
    dialogBox.classList.add("dialog-battle");

    heart = document.createElement("img");
    heart.className = "battle-heart";
    let heartReady = false;

    const speed = 2.5;
    const keys = {};

    function onHeartReady() {
        if (heartReady) return;
        heartReady = true;

        const VISUAL_W = 16;
        const ratio = heart.naturalHeight / heart.naturalWidth;

        const HEART_W = VISUAL_W;
        const HEART_H = VISUAL_W * ratio;

        heart.style.width = HEART_W + "px";
        heart.style.height = HEART_H + "px";
        heart.style.position = "absolute";

        const boxW = dialogBox.clientWidth;
        const boxH = dialogBox.clientHeight;

        let x = (boxW - HEART_W) / 2;
        let y = (boxH - HEART_H) / 2;

        function clamp() {
            x = Math.max(0, Math.min(boxW - HEART_W, x));
            y = Math.max(0, Math.min(boxH - HEART_H, y));
        }

        function loop() {
            if (keys.ArrowUp) y -= speed;
            if (keys.ArrowDown) y += speed;
            if (keys.ArrowLeft) x -= speed;
            if (keys.ArrowRight) x += speed;

            clamp();
            heart.style.left = x + "px";
            heart.style.top = y + "px";

            requestAnimationFrame(loop);
        }

        loop();

        let touchId = null;
        let lastTouchX = 0;
        let lastTouchY = 0;

        dialogBox.addEventListener("touchstart", (e) => {
            const touch = e.changedTouches[0];
            touchId = touch.identifier;
            lastTouchX = touch.clientX;
            lastTouchY = touch.clientY;
            e.preventDefault();
        }, {
            passive: false
        });

        dialogBox.addEventListener("touchmove", (e) => {
            for (let t of e.changedTouches) {
                if (t.identifier === touchId) {
                    const dx = t.clientX - lastTouchX;
                    const dy = t.clientY - lastTouchY;

                    x += dx;
                    y += dy;

                    lastTouchX = t.clientX;
                    lastTouchY = t.clientY;

                    clamp();
                    heart.style.left = x + "px";
                    heart.style.top = y + "px";
                    e.preventDefault();
                }
            }
        }, {
            passive: false
        });

        dialogBox.addEventListener("touchend", () => {
            touchId = null;
        });

        if (!dragonAttackStarted) {
            dragonAttackStarted = true;
            setTimeout(() => {
                startDragonAttack();
            }, 600);
        }
    }

    heart.onload = onHeartReady;
    heart.src = "imgs/heart.png";
    dialogBox.appendChild(heart);

    if (heart.complete) {
        onHeartReady();
    }

    function keyDown(e) {
        if (e.key.startsWith("Arrow")) {
            keys[e.key] = true;
            e.preventDefault();
            e.stopPropagation();
        }
    }

    function keyUp(e) {
        if (e.key.startsWith("Arrow")) {
            keys[e.key] = false;
            e.preventDefault();
            e.stopPropagation();
        }
    }

    document.addEventListener("keydown", keyDown, true);
    document.addEventListener("keyup", keyUp, true);
}

function animateDragonReverse(dragon, onFinish) {
    let frame = 6;
    const FRAME_TIME = 120;

    const interval = setInterval(() => {
        dragon.src = `imgs/dragonskull${frame}.png`;
        frame--;

        if (frame < 1) {
            clearInterval(interval);
            if (onFinish) onFinish();
        }
    }, FRAME_TIME);
}

const dragonFrames = [];

function preloadDragonFrames(callback) {
    preloadReturnBattleAssets().then(() => {
        syncDragonFramesFromPreload();
        if (callback) callback();
    });
}

function animateDragonOnce(dragon, onFinish) {
    if (!dragonFrames.length) return; // proteção

    let frame = 0;

    function nextFrame() {
        if (frame < dragonFrames.length) {
            dragon.src = dragonFrames[frame].src;
            frame++;
            setTimeout(nextFrame, 60);
        } else {
            if (onFinish) onFinish(dragon);
        }
    }

    nextFrame();
}

let dragonsFinished = 0;
let totalDragons = 0;

function startDragonAttack() {
    dragonsFinished = 0;
    totalDragons = 2;

    const screen = document.getElementById("battle-screen");
    const boxRect = dialogBox.getBoundingClientRect();
    const screenRect = screen.getBoundingClientRect();

    function spawnDragon(side) {
        const d = document.createElement("img");
        d.className = `dragon ${side} dragon-enter`;
        d.src = "imgs/dragonskull1.png";
        d.style.width = "96px";
        d.style.height = "96px";
        d.style.opacity = 0;

        if (side === "left") {
            d.style.left = boxRect.left - screenRect.left - 96 - 5 + "px";
        } else {
            d.style.left = boxRect.right - screenRect.left + 5 + "px";
        }

        d.style.top = "-120px";
        d.style.transition = "top 1.6s ease-out, opacity 1.6s ease-out";

        screen.appendChild(d);

        playBattleSound("snd_spearappear.wav");

        const boxTop = boxRect.top - screenRect.top;
        const finalTop = boxTop + boxRect.height / 2 - 96 / 2;

        d.getBoundingClientRect();

        requestAnimationFrame(() => {
            d.style.top = finalTop + "px";
            d.style.opacity = 1;
        });

        let entered = false;

        const onEnterEnd = (e) => {
            if (entered) return;
            if (e.propertyName !== "top") return;
            entered = true;

            setTimeout(() => {
                animateDragonOnce(d, () => fireBeamFromDragon(d));
            }, 300);
        };

        d.addEventListener("transitionend", onEnterEnd);

        setTimeout(() => {
            if (!entered) {
                entered = true;
                animateDragonOnce(d, () => fireBeamFromDragon(d));
            }
        }, 1800);

        return d;
    }

    spawnDragon("left");
    spawnDragon("right");
}

function removeDragonWithBeam(dragon) {
    if (dragon._beam) {
        dragon._beam.style.opacity = 0;
        setTimeout(() => dragon._beam.remove(), 100);
    }
    dragon.style.opacity = 0;
    setTimeout(() => {
        dragon.remove();

        if (document.querySelectorAll(".dragon").length === 0) {
            if (heart) explodeHeart(heart, () => {
                window.location.href = "../index.html";
            });
        }
    }, 100);
}

let dragonLaserSoundPlayed = false;

function fireBeamFromDragon(dragon) {
    const screen = document.getElementById("battle-screen");

    const beam = document.createElement("div");
    beam.className = "dragon-beam active";
    beam.style.height = "100px";
    beam.style.width = "0px";
    beam.style.opacity = 1;
    beam.style.transition = "opacity 300ms linear";

    screen.appendChild(beam);
    dragon._beam = beam;

    const screenRect = screen.getBoundingClientRect();
    const dragonRect = dragon.getBoundingClientRect();

    beam.style.top = dragonRect.top + dragonRect.height / 2 - 50 + "px";

    let targetWidth;
    if (dragon.classList.contains("left")) {
        beam.style.left = dragonRect.left + dragonRect.width / 2 + "px";
        targetWidth = screenRect.right - (dragonRect.left + dragonRect.width / 2);
    } else {
        beam.style.left = "0px";
        targetWidth = dragonRect.left + dragonRect.width / 2;
    }

    if (!dragonLaserSoundPlayed) {
        playBattleSound("mus_sfx_rainbowbeam_1.wav");
        dragonLaserSoundPlayed = true;
    }

    let width = 0;
    const speed = 20;

    function animateLaser() {
        if (!dragon.parentNode) return;

        if (width < targetWidth) {
            width += speed;
            if (width > targetWidth) width = targetWidth;
            beam.style.width = width + "px";
            requestAnimationFrame(animateLaser);
        } else {
            setTimeout(() => {
                beam.style.opacity = 0;

                setTimeout(() => {
                    beam.remove();

                    animateDragonReverse(dragon, () => {
                        dragonsFinished++;
                        if (dragonsFinished >= totalDragons) {
                            explodeHeart(heart, () => {
                                window.location.href = "../index.html";
                            });
                        }
                    });

                }, 300);
            }, 400);
        }
    }

    animateLaser();
}

function explodeHeart(heart, callback) {
    if (heart.dataset.exploded) return;
    heart.dataset.exploded = "true";

    const container = heart.parentElement;

    const rect = heart.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const offsetX = rect.left - containerRect.left;
    const offsetY = rect.top - containerRect.top;

    const brokenHeart = document.createElement("img");
    brokenHeart.src = "imgs/broken_heart.png";
    brokenHeart.style.position = "absolute";
    brokenHeart.style.left = offsetX + "px";
    brokenHeart.style.top = offsetY + "px";
    brokenHeart.style.width = rect.width + "px";
    brokenHeart.style.height = rect.height + "px";
    brokenHeart.style.pointerEvents = "none";

    container.appendChild(brokenHeart);

    heart.style.visibility = "hidden";

    playBattleSound("snd_break1_c.wav");

    setTimeout(() => {

        playBattleSound("snd_break2_c.wav");
        brokenHeart.remove();

        const debrisImgs = [
            "imgs/heart_debris1.png",
            "imgs/heart_debris2.png",
            "imgs/heart_debris3.png",
            "imgs/heart_debris4.png"
        ];

        const debrisElements = [];

        debrisImgs.forEach(src => {
            const d = document.createElement("img");
            d.src = src;
            d.style.position = "absolute";
            d.style.left = offsetX + "px";
            d.style.top = offsetY + "px";
            d.style.width = rect.width / 2 + "px";
            d.style.height = rect.height / 2 + "px";
            d.style.pointerEvents = "none";
            d.style.transition = "transform 2s ease-out, opacity 2s ease-out";
            container.appendChild(d);
            debrisElements.push(d);
        });

        const directions = [{
                x: -60,
                y: -60
            },
            {
                x: 60,
                y: -60
            },
            {
                x: -60,
                y: 60
            },
            {
                x: 60,
                y: 60
            }
        ];

        debrisElements.forEach((d, i) => {
            requestAnimationFrame(() => {
                d.style.transform =
                    `translate(${directions[i].x}px, ${directions[i].y}px) rotate(${Math.random() * 360}deg)`;
                d.style.opacity = 0;
            });
        });

        setTimeout(() => {
            debrisElements.forEach(d => d.remove());
            heart.remove();
            if (callback) callback();
        }, 2000);

    }, 1000);
}

function typeClickableOption(text, onClick) {
    const span = document.createElement("span");
    span.className = "memory-option";
    span.style.cursor = "pointer";
    span.textContent = "";

    dialogBox.appendChild(document.createElement("br"));
    dialogBox.appendChild(span);
    updateSansPosition();

    let i = 0;

    function typeChar() {
        if (i >= text.length) {
            span.addEventListener("click", onClick);
            return;
        }
        span.textContent += text[i];
        if (text[i] !== " " && text[i] !== "\n") {
            textSound.currentTime = 0;
            textSound.play();
        }
        i++;
        typingTimeout = setTimeout(typeChar, 50);
    }
    typeChar();
}

function fadeOutAudio(audio, duration = 800, onFinish) {
    if (!audio) return;

    const startVolume = audio.volume;
    const steps = 30;
    const stepTime = duration / steps;
    let currentStep = 0;

    const fade = setInterval(() => {
        currentStep++;
        audio.volume = Math.max(
            0,
            startVolume * (1 - currentStep / steps)
        );

        if (currentStep >= steps) {
            clearInterval(fade);
            audio.pause();
            audio.currentTime = 0;
            audio.volume = startVolume;
            if (onFinish) onFinish();
        }
    }, stepTime);
}

function confirmReturnToMenu() {
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = null;
    memTypingTimeouts.forEach(t => clearTimeout(t));
    memTypingTimeouts = [];
    textSound.pause();
    textSound.currentTime = 0;

    sansHead.src = "imgs/sans_menu.png";

    const text = "* Voltar para o menu.";

    const span = document.createElement("span");
    span.className = "memory-option return-menu-option";
    span.style.cursor = "pointer";
    span.style.display = "block";
    span.style.marginTop = "10px";
    span.textContent = "";
    dialogBox.appendChild(span);
    updateSansPosition();

    let i = 0;
    let typingDone = false;

    function typeChar() {
        if (i >= text.length) {
            typingDone = true;
            return;
        }

        span.textContent += text[i];
        if (text[i] !== " " && text[i] !== "\n") {
            textSound.currentTime = 0;
            textSound.play();
        }
        i++;
        typingTimeout = setTimeout(typeChar, 50);
    }

    typeChar();

    const confirm = async () => {
        if (!typingDone || returnBattlePreloading) return;
        returnBattlePreloading = true;

        selectSound.currentTime = 0;
        selectSound.play();

        menuLocked = true;
        span.style.pointerEvents = "none";
        dialogBox.innerHTML = "";

        const stats = document.getElementById("stats");
        if (stats) stats.style.display = "none";

        const menu = document.getElementById("menu");
        if (menu) menu.style.display = "none";

        const hpBar = document.getElementById("hp-bar");
        if (hpBar) hpBar.style.display = "none";

        await preloadReturnBattleAssets(updateReturnBattleLoading);

        dialogBox.classList.add("dialog-battle");
        dialogBox.getBoundingClientRect();
        updateSansPosition();

        startReturnBattle();
        fadeOutAudio(music, 800);
    };

    span.addEventListener("click", confirm);
    span.addEventListener("touchstart", e => {
        e.preventDefault();
        confirm();
    });
}

function selectOption(opt) {
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = null;
    memTypingTimeouts.forEach(t => clearTimeout(t));
    memTypingTimeouts = [];
    textSound.pause();
    textSound.currentTime = 0;
    selectSound.currentTime = 0;
    selectSound.play();

    if (opt.classList.contains("menu")) {
        sansHead.src = "imgs/sans_menu.png";
        typeText("* Quer mesmo voltar para o menu?", () => {
            sansHead.src = "imgs/sans_head.png";
            confirmReturnToMenu();
        });
        return;
    }

    if (opt.classList.contains("signatures")) {
        sansHead.src = "imgs/sans_sig.png";
        typeText("* Assinaturas:\n" + signaturesList.join("\n"), () => {
            sansHead.src = "imgs/sans_head.png";
        });

    } else if (opt.classList.contains("memories")) {
        sansHead.src = "imgs/sans_head.png";
        currentMemoryPage = 0;
        renderMemoryPage();

    } else if (opt.classList.contains("intro")) {
        sansHead.src = "imgs/sans_close.png";
        typeText("* Essa página foi feita com o intuito de ser uma galeria das minhas memórias.\n* Eu fiz essa versão alternativa p eu conseguir acessar de qualquer dispositivo.", () => {
            sansHead.src = "imgs/sans_head.png";
        });

    } else {
        sansHead.src = "imgs/sans_head.png";
        typeText(`* Você escolheu ${opt.textContent.replace("❤","").trim()}!`);
    }
}

options.forEach((opt, i) => {
    const selectFn = () => {
        if (menuLocked) return;
        currentIndex = i;
        updateSelection();
        selectSound.currentTime = 0;
        selectSound.play();
        selectOption(opt);
    };

    opt.addEventListener("click", selectFn);
    opt.addEventListener("touchstart", (e) => {
        e.preventDefault();
        selectFn();
    });
});

document.addEventListener("keydown", e => {
    if (screenState !== "menu") return;

    if (e.key === "ArrowRight") {
        currentIndex = (currentIndex + 1) % options.length;
        updateSelection();
        swapSound.currentTime = 0;
        swapSound.play();
    } else if (e.key === "ArrowLeft") {
        currentIndex = (currentIndex - 1 + options.length) % options.length;
        updateSelection();
        swapSound.currentTime = 0;
        swapSound.play();
    } else if (e.key === "Enter") {
        selectOption(options[currentIndex]);
    }
});

function updateSansPosition() {
    sans.style.bottom = `${dialogBox.offsetHeight + 140}px`;
}

const observer = new MutationObserver(updateSansPosition);
observer.observe(dialogBox, {
    childList: true,
    subtree: true,
    characterData: true
});
window.addEventListener("resize", updateSansPosition);
updateSansPosition();

const music = document.getElementById("bgMusic");
music.volume = 0.1;

const loadingScreen = document.getElementById("loading-screen");
const loadingBar = document.getElementById("loading-bar");

const images = [...document.images];
let loaded = 0;

function updateLoading() {
  loaded++;

  const percent = (loaded / images.length) * 100;
  loadingBar.style.width = percent + "%";

  if (loaded === images.length) finishLoading();
}

function finishLoading() {
  loadingBar.style.width = "100%";

  setTimeout(() => {
    loadingScreen.style.opacity = "0";

    setTimeout(() => {
      loadingScreen.remove();
    }, 500);

  }, 300);
}

if (images.length === 0) {
  finishLoading();
} else {
  images.forEach(img => {
    img.complete
      ? updateLoading()
      : img.addEventListener("load", updateLoading, { once: true });
  });
}
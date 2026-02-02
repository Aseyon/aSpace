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

const memories = ["bk", "anime", "princess", "quack", "yt", "wit", "back", "rblx", "truth", "tranzit", "dntstarve", "rrpo", "rof2"];
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
    rof2: "Jogo do capeta."
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

let heart;
let dragonAttackStarted = false;

function startReturnBattle() {
    dialogBox.innerHTML = "";
    dialogBox.classList.add("dialog-battle");

    heart = document.createElement("img");
    heart.className = "battle-heart";

    const speed = 2.5;
    const keys = {};

    function onHeartReady() {
        const VISUAL_W = 16;
        const ratio = heart.naturalHeight / heart.naturalWidth;

        const HEART_W = VISUAL_W;
        const HEART_H = VISUAL_W * ratio;

        heart.style.width = HEART_W + "px";
        heart.style.height = HEART_H + "px";

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

        if (!dragonAttackStarted) {
            dragonAttackStarted = true;
            setTimeout(startDragonAttack, 600);
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

function animateDragonOnce(dragon, onFinish) {
    if (dragon.dataset.animStarted) return;
    dragon.dataset.animStarted = "true";

    let frame = 1;
    const interval = setInterval(() => {
        dragon.src = `imgs/dragonskull${frame}.png`;
        frame++;
        if (frame > 6) {
            clearInterval(interval);
            dragon.dataset.animDone = "true";

            if (onFinish && !dragon.dataset.fired) {
                dragon.dataset.fired = "true";
                onFinish(dragon);
            }
        }
    }, 60);
}

let dragonsFinished = 0;
let totalDragons = 0;

function startDragonAttack() {

    dragonsFinished = 0;
    totalDragons = 2;

    const screen = document.getElementById("battle-screen");
    const boxRect = dialogBox.getBoundingClientRect();
    const screenRect = screen.getBoundingClientRect();
    const dragons = [];

    function spawnDragon(side) {
        const d = document.createElement("img");
        d.className = `dragon ${side} dragon-enter`;
        d.src = "imgs/dragonskull1.png";
        d.style.width = "96px";
        d.style.height = "96px";
        d.style.opacity = 0;

        if (side === "left") d.style.left = boxRect.left - screenRect.left - 96 - 5 + "px";
        else d.style.left = boxRect.right - screenRect.left + 5 + "px";

        d.style.top = "-120px";

        d.style.transition = "top 1.6s ease-out, opacity 1.6s ease-out";

        screen.appendChild(d);
        dragons.push(d);

        const audio = new Audio("snd_spearappear.wav");
        audio.play();

        const boxTop = boxRect.top - screenRect.top;
        const finalTop = boxTop + boxRect.height / 2 - 96 / 2;
        requestAnimationFrame(() => {
            d.style.top = finalTop + "px";
            d.style.opacity = 1;
        });

        const onEnterEnd = (e) => {
            if (e.propertyName !== "top") return;
            d.removeEventListener("transitionend", onEnterEnd);

            setTimeout(() => {
                animateDragonOnce(d, () => fireBeamFromDragon(d));
            }, 300);
        };

        d.addEventListener("transitionend", onEnterEnd);

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
        new Audio("mus_sfx_rainbowbeam_1.wav").play();
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

    new Audio("snd_break1_c.wav").play();

    heart.src = "imgs/broken_heart.png";

    const rect = heart.getBoundingClientRect();

    const snd2 = new Audio("snd_break2_c.wav");

    setTimeout(() => {
        snd2.play();

        heart.remove();

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
            d.style.left = rect.left + "px";
            d.style.top = rect.top + "px";
            d.style.width = rect.width / 2 + "px";
            d.style.height = rect.height / 2 + "px";
            d.style.pointerEvents = "none";
            d.style.transition = "transform 1.5s ease-out, opacity 1.5s ease-out";
            document.body.appendChild(d);
            debrisElements.push(d);
        });

        const directions = [{
                x: -30,
                y: -30
            },
            {
                x: 30,
                y: -30
            },
            {
                x: -30,
                y: 30
            },
            {
                x: 30,
                y: 30
            }
        ];

        debrisElements.forEach((d, i) => {
            requestAnimationFrame(() => {
                d.style.transform = `translate(${directions[i].x}px, ${directions[i].y}px) rotate(${Math.random() * 360}deg)`;
                d.style.opacity = 0;
            });
        });

        setTimeout(() => {
            debrisElements.forEach(d => d.remove());
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
    span.className = "memory-option";
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

    const confirm = () => {
        if (!typingDone) return;

        selectSound.currentTime = 0;
        selectSound.play();

        menuLocked = true;

        const stats = document.getElementById("stats");
        if (stats) stats.style.display = "none";

        const menu = document.getElementById("menu");
        if (menu) menu.style.display = "none";

        const hpBar = document.getElementById("hp-bar");
        if (hpBar) hpBar.style.display = "none";

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
        typeText("* acho que tá meio óbvio. página inspirada em Undertale.\n* dito isso, só fica a vontade.", () => {
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
music.volume = 0.3;
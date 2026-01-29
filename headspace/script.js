document.addEventListener("gesturestart", e => e.preventDefault());
document.addEventListener("gesturechange", e => e.preventDefault());
document.addEventListener("gestureend", e => e.preventDefault());

document.addEventListener("touchmove", e => {
    if (e.scale && e.scale !== 1) {
        e.preventDefault();
    }
}, {
    passive: false
});

let lastTouchEnd = 0;
document.addEventListener("touchend", e => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, {
    passive: false
});


document.addEventListener("DOMContentLoaded", () => {
});

if (window.matchMedia("(max-width: 980px)").matches) {
    document.body.classList.add("mobile-no-game");
}

const thumbGrid = document.getElementById("thumbGrid");
const photoArea = document.getElementById("photoArea");
const prevThumb = document.getElementById("prev");
const nextThumb = document.getElementById("next");

let current = 0;
const captions = [
    "Descrição 1",
    "Descrição 2",
    "Descrição 3",
    "Descrição 4",
    "Descrição 5",
    "Descrição 6",
    "Descrição 7",
    "Descrição 8",
];

function thumbSVG(i) {
    const svgns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgns, "svg");
    svg.setAttribute("viewBox", "0 0 320 220");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    return svg;
}

for (let i = 0; i < 8; i++) {
    const div = document.createElement("div");
    div.className = "thumb";
    div.dataset.index = i;
    div.appendChild(thumbSVG(i));
    div.addEventListener("click", () => showPhoto(i));
    thumbGrid.appendChild(div);
}

function showPhoto(i) {
    current = i;
    photoArea.innerHTML = "";
    const img = document.createElement("img");
    img.src = "nostalgia1.png";
    img.alt = captions[i % captions.length] || "Memória";
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    img.style.borderRadius = "8px";
    img.style.boxShadow = "0 8px 24px rgba(0,0,0,0.4)";
    img.style.transition = "opacity 0.5s ease";
    img.style.opacity = 0;
    photoArea.appendChild(img);
    requestAnimationFrame(() => {
        img.style.opacity = 1;
    });
}

prevThumb &&
    prevThumb.addEventListener("click", () => showPhoto((current - 1 + 8) % 8));
nextThumb &&
    nextThumb.addEventListener("click", () => showPhoto((current + 1) % 8));

showPhoto(0);

(function() {
    const svg = document.getElementById("grassSVG");
    const path = document.getElementById("grassPath");
    if (!svg || !path) return;
    const W = 1600,
        H = 500,
        baseY = 390,
        strands = 60;
    const dna = Array.from({
        length: strands
    }, (_, i) => ({
        height: 110 + Math.random() * 70,
        lean: (Math.random() - 0.5) * 20,
        curve: 20 + Math.random() * 35,
        tipOffset: (Math.random() - 0.5) * 35,
        waveSpeed: 0.4 + Math.random() * 1.1,
        waveOffset: Math.random() * 1000,
    }));
    let rawX = NaN,
        smoothX = NaN,
        influence = 0,
        lastMove = 0;
    svg.addEventListener("mousemove", (e) => {
        const r = svg.getBoundingClientRect();
        rawX = (e.clientX - r.left) * (W / r.width);
        influence = 1;
        lastMove = performance.now();
    });
    svg.addEventListener("mouseleave", () => (rawX = NaN));

    function generate(t) {
        if (!Number.isNaN(rawX)) {
            if (Number.isNaN(smoothX)) smoothX = rawX;
            smoothX += (rawX - smoothX) * 0.12;
        } else if (!Number.isNaN(smoothX)) {
            smoothX += (W * 0.5 - smoothX) * (0.12 * 0.15);
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
            if (influence > 0 && !Number.isNaN(smoothX)) {
                const dist = Math.abs(smoothX - x);
                if (dist < 280) localWind = (1 - dist / 280) * 80 * influence;
            }
            const top = baseY - g.height * 0.75 + Math.sin(i * 0.45 + t * 1.1) * 8;
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

const portraits = document.querySelectorAll(".portrait-container");
const overlay = document.getElementById("overlay");
const MAX_CHARS = 20;

function truncateCaption(caption) {
    const full = caption.dataset.fulltext;
    caption.innerText =
        full.length > MAX_CHARS ? full.substring(0, MAX_CHARS) + "..." : full;
    caption.style.height = "";
    caption.style.maxHeight = "";
}

portraits.forEach((p) => {
    const caption = p.querySelector(".caption-box");
    if (caption) {
        caption.dataset.fulltext = caption.innerText.trim();
        truncateCaption(caption);
    }
});

function updateSupport(wrapper, support, tape) {
    if (!wrapper || !support) return;

    const width = wrapper.offsetWidth;
    const height = wrapper.offsetHeight;
    const paddingX = 12;
    const paddingY = 12;

    support.style.width = width + paddingX * 2 + "px";
    support.style.height = height + paddingY * 2 + "px";
    support.style.top = wrapper.offsetTop - paddingY + "px";
    support.style.left = wrapper.offsetLeft - paddingX + "px";
    support.style.zIndex = 10;

    if (tape) {
        const tapePadding = 8;
        tape.style.top = support.offsetTop - tapePadding + "px";
        tape.style.left =
            support.offsetLeft +
            support.offsetWidth / 2 -
            tape.offsetWidth / 2 +
            "px";
        tape.style.zIndex = 15;
    }
}

function updateAllSupports() {
    portraits.forEach((p) => {
        const wrapper = p.querySelector(".photo-wrapper");
        const support = p.querySelector(".photo-support");
        const tape = p.querySelector(".tape-realista");
        updateSupport(wrapper, support, tape);
    });
}

portraits.forEach((p) => {
    p.addEventListener("click", (e) => {
        try {
            startMusic();
        } catch (err) {}

        if (p.classList.contains("zoomed")) {
            closeZoomedPhoto(p);
        } else {
            portraits.forEach((other) => {
                if (other !== p) closeZoomedPhoto(other);
            });

            const wrapper = p.querySelector(".photo-wrapper");
            const support = p.querySelector(".photo-support");
            const tape = p.querySelector(".tape-realista");
            const caption = p.querySelector(".caption-box");

            if (caption) {
                caption.innerText = caption.dataset.fulltext;
                caption.style.height = "auto";
                caption.style.maxHeight = "none";
            }

            const rect = wrapper.getBoundingClientRect();
            const scaleX = (window.innerWidth * 0.9) / rect.width;
            const scaleY = (window.innerHeight * 0.9) / rect.height;
            const maxScale = Math.min(scaleX, scaleY, 2.2);
            const centerX = window.innerWidth / 2 - (rect.left + rect.width / 2);
            const centerY = window.innerHeight / 2 - (rect.top + rect.height / 2);

            p.style.transform = `translate(${centerX}px, ${centerY}px) scale(${maxScale})`;
            p.style.zIndex = 70;
            p.classList.add("zoomed");

            overlay.style.opacity = "1";
            overlay.style.pointerEvents = "auto";

            updateSupport(wrapper, support, tape);
        }

        e.stopPropagation();
    });
});

function closeZoomedPhoto(photo) {
    const p = photo || document.querySelector(".portrait-container.zoomed");
    if (!p) return;

    const wrapper = p.querySelector(".photo-wrapper");
    const support = p.querySelector(".photo-support");
    const tape = p.querySelector(".tape-realista");
    const caption = p.querySelector(".caption-box");

    p.classList.remove("zoomed");
    p.style.transform = "";
    p.style.zIndex = "";

    if (caption) truncateCaption(caption);

    updateSupport(wrapper, support, tape);

    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";
}

overlay.addEventListener("click", () => closeZoomedPhoto());

document.addEventListener("click", (e) => {
    const zoomedPhoto = document.querySelector(".portrait-container.zoomed");
    if (!zoomedPhoto) return;

    if (zoomedPhoto.contains(e.target)) return;

    closeZoomedPhoto(zoomedPhoto);
});

window.addEventListener("load", updateAllSupports);
window.addEventListener("resize", updateAllSupports);


const bookWrap = document.getElementById("bookWrap");
const book = document.getElementById("book");
const coverFront = book.querySelector(".cover.front");
const coverBack = book.querySelector(".cover.back");
let pages = Array.from(book.querySelectorAll(".page")).reverse();
const catArms = document.querySelector(".cat-arms");

let opened = false;
let currentPage = 0;

book.addEventListener("click", (e) => {
    if (!opened || animating) return;

    const rect = book.getBoundingClientRect();
    const clickX = e.clientX - rect.left;

    if (clickX > rect.width / 2) {
        if (currentPage < pages.length) {
            flipPage(pages[currentPage]);
        }
    } else {
        if (currentPage > 0) {
            animating = true;
            animateCatArms("flip");

            currentPage--;
            const page = pages[currentPage];
            page.classList.remove("flipped");
            page.style.zIndex = currentPage + 1;

            setTimeout(() => animating = false, FLIP_TIME);
        }
    }
});


function centerBook() {
    bookWrap.style.position = "fixed";
    bookWrap.style.top = "50%";
    bookWrap.style.left = "50%";

    let scale = opened ? 1 : 1;
    bookWrap.style.transform = `translate(-50%, -50%) scale(${scale})`;
}
window.addEventListener("load", centerBook);
window.addEventListener("resize", centerBook);

function animateCatArms(action) {
    if (!catArms) return;
    catArms.style.animation = "none";
    void catArms.offsetWidth;
    if (action === "open")
        catArms.style.animation =
        "arm-open 0.5s cubic-bezier(.22,.9,.33,1) forwards";
    else if (action === "flip")
        catArms.style.animation =
        "arm-flip 0.5s cubic-bezier(.22,.9,.33,1) forwards";
    else if (action === "close")
        catArms.style.animation =
        "arm-close 0.5s cubic-bezier(.22,.9,.33,1) forwards";
}

const spine = book.querySelector(".cover-spine");
if (spine) spine.style.zIndex = 0;

pages.forEach((p, i) => {
    p.classList.remove("flipped");
    p.style.zIndex = i + 1;
});

coverFront.style.zIndex = pages.length + 2;
coverBack.style.zIndex = 0;

function openBook() {
    if (opened) return;
    opened = true;
    currentPage = 0;

    animateCatArms("open");
    coverFront.classList.remove("close");
    coverFront.classList.add("open");

    pages.forEach((p, i) => {
        p.classList.remove("flipped");
        p.style.zIndex = i + 1;
    });

    const pageWidth = coverFront.offsetWidth;
    requestAnimationFrame(() => {
        bookWrap.style.transform = `translate(calc(-50% + ${pageWidth / 2}px), -50%)`;
    });
}

function flipPage(page) {
    if (!opened) return;
    if (page.classList.contains("flipped")) return;

    animateCatArms("flip");
    page.classList.add("flipped");
    currentPage++;

    const coverZ = parseInt(coverFront.style.zIndex, 10) || (pages.length + 2);
    page.style.zIndex = coverZ + 1;

    pages.forEach((p, i) => {
        if (!p.classList.contains("flipped")) {
            p.style.zIndex = i + 1;
        }
    });
}

function closeBook() {
    if (!opened) return;
    if (currentPage < pages.length) return;

    animateCatArms("close");

    pages.forEach((p, i) => {
        setTimeout(() => {
            p.classList.remove("flipped");
            p.style.zIndex = i + 1;
        }, i * 50);
    });

    setTimeout(() => {
        coverFront.classList.remove("open");
        coverFront.classList.add("close");
        coverFront.style.zIndex = pages.length + 2;
        opened = false;
        currentPage = 0;

        requestAnimationFrame(() => {
            bookWrap.style.transform = `translate(-50%, -50%) scale(1)`;
        });
    }, pages.length * 50 + 300);
}

coverFront.addEventListener("click", openBook);
pages.forEach((p) => p.addEventListener("click", () => flipPage(p)));
coverBack.addEventListener("click", closeBook);


const bgm = document.getElementById("bgm");
let started = false;

function startMusic() {
    if (started) return;

    bgm.volume = 0;
    bgm.load();

    const fadeDuration = 2500;
    const steps = 50;
    const stepTime = fadeDuration / steps;

    const onReady = () => {
        bgm
            .play()
            .then(() => {
                started = true;

                let vol = 0;
                const fadeInterval = setInterval(() => {
                    vol += 1 / steps;
                    if (vol >= 1) {
                        vol = 1;
                        clearInterval(fadeInterval);
                    }
                    bgm.volume = vol;
                }, stepTime);

                removeListeners();
            })
            .catch(err => {
                console.warn("Falhou:", err);
            });

        bgm.removeEventListener("canplaythrough", onReady);
    };

    bgm.addEventListener("canplaythrough", onReady);
}

window.addEventListener("resize", () => {
    if (opened) {
        centerBook();
    } else {
        centerBook();
    }
});

function removeListeners() {
    window.removeEventListener("click", startMusic);
    window.removeEventListener("keydown", startMusic);
    window.removeEventListener("scroll", startMusic);
    window.removeEventListener("touchstart", startMusic);
}

const particlesContainer = document.querySelector(".bg-particles");
if (particlesContainer) {
    for (let i = 0; i < 150; i++) {
        const p = document.createElement("div");
        p.className = "particle";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        p.style.width = 2 + Math.random() * 4 + "px";
        p.style.height = p.style.width;
        p.style.opacity = 0.1 + Math.random() * 0.3;
        p.style.animationDuration = 8 + Math.random() * 15 + "s";
        particlesContainer.appendChild(p);
    }
}

const mist = document.querySelector(".bg-mist");
if (mist) {
    mist.style.background = `
    radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%),
    radial-gradient(circle, rgba(200,200,255,0.05) 0%, rgba(255,255,255,0) 60%)
  `;
}

const extraParticlesContainer = document.createElement("div");
extraParticlesContainer.className = "bg-particles-extra";
document.querySelector(".bg-loop").appendChild(extraParticlesContainer);

for (let i = 0; i < 50; i++) {
    const p = document.createElement("div");
    p.className = "particle-extra";
    p.style.left = Math.random() * 100 + "vw";
    p.style.top = Math.random() * 100 + "vh";
    p.style.width = 2 + Math.random() * 4 + "px";
    p.style.height = p.style.width;
    p.style.animationDuration = 20 + Math.random() * 40 + "s";
    extraParticlesContainer.appendChild(p);
}

document.addEventListener("DOMContentLoaded", () => {
    const smokeContainer = document.querySelector(".portal-smoke");
    const portalImage = document.querySelector(".portal-image");
    smokeContainer.innerHTML = "";
    const rect = portalImage.getBoundingClientRect();
    const portalRadius = rect.width / 2;
    const particleSize = 70;
    const blurPush = 20;
    const radius = portalRadius - particleSize / 2 + blurPush;
    const particles = 36;

    for (let i = 0; i < particles; i++) {
        const p = document.createElement("div");
        p.className = "smoke-part";
        const angle = (i / particles) * 360;
        p.style.setProperty("--angle", `${angle}deg`);
        p.style.setProperty("--radius", `${radius}px`);
        p.style.setProperty("--wiggle", `${Math.random() * 8 + 3}deg`);
        p.style.setProperty("--push", `${Math.random() * 4 + 2}px`);
        p.style.setProperty("--dur", `${3 + Math.random() * 2}s`);
        p.style.transform = `translate(-50%, -50%) rotate(${angle}deg) translate(${radius}px)`;
        smokeContainer.appendChild(p);
    }
});

function fitTextToPolaroid() {
    document.querySelectorAll(".text-block").forEach((block) => {
        const polaroid = block.closest(".page-layout").querySelector(".polaroid");
        const p = block.querySelector("p");
        if (!p || !polaroid) return;
        let fontSize = 18;
        p.style.fontSize = fontSize + "px";
        const maxHeight = polaroid.clientHeight;
        while (p.scrollHeight > maxHeight && fontSize > 6) {
            fontSize -= 1;
            p.style.fontSize = fontSize + "px";
        }
    });
}

window.addEventListener("load", fitTextToPolaroid);
window.addEventListener("resize", fitTextToPolaroid);

document.addEventListener("DOMContentLoaded", () => {
    const vinheta = document.getElementById("vinheta-topo");
    const frame = document.getElementById("frame-jogo");
    const closeBtn = document.getElementById("close-game");
    const bgm = document.getElementById("bgm");
    const gamePath = "c2-sans-fight/index.html";
    let isDragging = false;
    let startY = 0;
    let currentY = 0;
    const threshold = window.innerHeight * 0.3;
    const minMove = 5;

    function fadeAudio(audio, from, to, duration = 500) {
        if (!audio) return;
        const step = 50;
        const steps = duration / step;
        const increment = (to - from) / steps;
        let vol = from;
        audio.volume = from;
        audio.play().catch(() => {});
        const interval = setInterval(() => {
            vol += increment;
            if ((increment > 0 && vol >= to) || (increment < 0 && vol <= to)) {
                vol = to;
                clearInterval(interval);
                if (to === 0) audio.pause();
            }
            audio.volume = vol;
        }, step);
    }

    function startDrag(y) {
        isDragging = true;
        startY = y;
        currentY = 0;
        frame.src = gamePath;
        frame.style.transition = "none";
        vinheta.style.transition = "none";
    }

    function doDrag(y) {
        if (!isDragging) return;
        currentY = y - startY;
        if (currentY < 0) currentY = 0;
        if (currentY > minMove) {
            frame.style.top = `${currentY - window.innerHeight}px`;
            vinheta.style.top = `${currentY}px`;
        }
    }

    function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        frame.style.transition = "top 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)";
        vinheta.style.transition = "top 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)";
        if (currentY > threshold) {
            frame.style.top = "0";
            vinheta.classList.add("hidden");
            closeBtn.classList.add("show");
            fadeAudio(bgm, bgm.volume, 0, 1000);
        } else {
            frame.style.top = "-100%";
            vinheta.style.top = "0";
            vinheta.classList.remove("hidden");
            closeBtn.classList.remove("show");
            fadeAudio(bgm, bgm.volume, 1, 1000);
        }
        currentY = 0;
    }

    function closeGame() {
        frame.style.top = "-100%";
        vinheta.style.top = "0";
        vinheta.classList.remove("hidden");
        closeBtn.classList.remove("show");
        fadeAudio(bgm, bgm.volume, 1, 1000);
        frame.src = "";
    }

    vinheta.addEventListener("mousedown", (e) => startDrag(e.clientY));
    document.addEventListener("mousemove", (e) => doDrag(e.clientY));
    document.addEventListener("mouseup", endDrag);
    vinheta.addEventListener("touchstart", (e) => startDrag(e.touches[0].clientY));
    document.addEventListener("touchmove", (e) => doDrag(e.touches[0].clientY));
    document.addEventListener("touchend", endDrag);
    closeBtn.addEventListener("click", closeGame);
});

window.addEventListener("load", () => {
    document.documentElement.classList.remove("loading");

    const preload = document.getElementById("preload");
    if (!preload) return;

    preload.style.opacity = "0";
    preload.style.transition = "opacity 0.6s ease";

    setTimeout(() => {
        preload.remove();
    }, 600);
});

document.addEventListener("DOMContentLoaded", () => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    let started = false;
    const bgmPC = document.getElementById("bgm");
    const bgmMobile = document.getElementById("bgm-mobile");
    const mobileBtn = document.getElementById("mobile-audio-btn");

    function fadeIn(audio, targetVolume = 1, duration = 2500) {
        if (!audio) return;
        let steps = 50;
        let stepTime = duration / steps;
        let vol = audio.volume;
        let increment = (targetVolume - vol) / steps;
        const fade = setInterval(() => {
            vol += increment;
            if ((increment > 0 && vol >= targetVolume) || (increment < 0 && vol <= targetVolume)) {
                vol = targetVolume;
                clearInterval(fade);
            }
            audio.volume = vol;
        }, stepTime);
    }

    function setupLoop(audio) {
        if (!audio || audio.loopSetupDone) return;
        audio.loopSetupDone = true;
        audio.addEventListener("ended", () => {
            audio.currentTime = 0;
            audio.play().catch(err => console.warn("Erro ao repetir:", err));
        });
    }

    if (isMobile) {
        if (bgmPC) {
            bgmPC.pause();
            bgmPC.currentTime = 0;
        }
        if (mobileBtn && bgmMobile) {
            mobileBtn.style.display = "block";
            mobileBtn.addEventListener("click", () => {
                if (started) return;
                started = true;
                bgmMobile.volume = 0;
                bgmMobile.play().then(() => fadeIn(bgmMobile, 0.5)).catch(err => console.warn("Mobile bloqueou:", err));
                setupLoop(bgmMobile);
                mobileBtn.remove();
            });
        }
    } else {
        if (bgmPC) {
            if (bgmMobile) {
                bgmMobile.pause();
                bgmMobile.currentTime = 0;
            }
            bgmPC.volume = 0;
            bgmPC.play().then(() => fadeIn(bgmPC, 1)).catch(err => console.warn("Falhou no PC:", err));
            setupLoop(bgmPC);
        }
        if (mobileBtn) mobileBtn.remove();
    }
});
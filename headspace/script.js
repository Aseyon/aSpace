(function() {
    const svg = document.getElementById("grassSVG");
    const path = document.getElementById("grassPath");
    if (!svg || !path) return;

    const W = 1600;
    const H = 500;
    const baseY = 390;
    const strands = 60;

    const dna = Array.from({
        length: strands
    }, () => ({
        height: 110 + Math.random() * 70,
        lean: (Math.random() - 0.5) * 20,
        curve: 20 + Math.random() * 35,
        waveSpeed: 0.4 + Math.random() * 1.1,
        waveOffset: Math.random() * 1000
    }));

    let rawX = NaN;
    let smoothX = NaN;
    let influence = 0;
    let lastMove = 0;

    svg.addEventListener("mousemove", e => {
        const r = svg.getBoundingClientRect();
        rawX = (e.clientX - r.left) * (W / r.width);
        influence = 1;
        lastMove = performance.now();
    });

    svg.addEventListener("mouseleave", () => rawX = NaN);

    function generate(t) {
        if (!Number.isNaN(rawX)) {
            if (Number.isNaN(smoothX)) smoothX = rawX;
            smoothX += (rawX - smoothX) * 0.12;
        } else if (!Number.isNaN(smoothX)) {
            smoothX += (W * 0.5 - smoothX) * 0.018;
        }

        if (performance.now() - lastMove > 80) {
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

            const top = baseY - g.height * 0.75 + Math.sin(i * 0.45 + t * 1.1) * 8;
            const sway = g.lean + globalSway + localWind * 0.16;

            d += `
                C ${x - g.curve * 0.5} ${baseY - 40}
                  ${x + sway * 0.2} ${top + 28}
                  ${x + sway} ${top}
                C ${x + sway * 0.2} ${top + 22}
                  ${x + g.curve * 0.5} ${baseY - 38}
                  ${x + W / strands} ${baseY}
            `;
        }

        d += `L ${W} ${H} Z`;
        return d;
    }

    function animate() {
        path.setAttribute("d", generate(performance.now() / 900));
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
        full.length > MAX_CHARS ? full.substring(0, MAX_CHARS) : full;
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

            p.style.transform = "none";
            p.style.zIndex = "";
            p.getBoundingClientRect();

            const rect = wrapper.getBoundingClientRect();
            const scaleX = (window.innerWidth * 0.9) / rect.width;
            const scaleY = (window.innerHeight * 0.9) / rect.height;
            const maxScale = Math.min(scaleX, scaleY, 2.2);

            const centerX =
                window.innerWidth / 2 - (rect.left + rect.width / 2);
            const centerY =
                window.innerHeight / 2 - (rect.top + rect.height / 2);

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
const FADE_DURATION = 2500;
const STEPS = 50;

function startMusic() {
    if (started || !bgm) return;

    started = true;

    bgm.volume = 0;
    bgm.load();

    const stepTime = FADE_DURATION / STEPS;
    const stepVolume = 1 / STEPS;

    const play = () => {
        bgm.play().catch(err => {
            console.warn("Falhou:", err);
            started = false;
        });

        let vol = 0;
        const fade = setInterval(() => {
            vol += stepVolume;
            if (vol >= 1) {
                bgm.volume = 1;
                clearInterval(fade);
            } else {
                bgm.volume = vol;
            }
        }, stepTime);

        removeListeners();
        bgm.removeEventListener("canplaythrough", play);
    };

    bgm.readyState >= 3 ?
        play() :
        bgm.addEventListener("canplaythrough", play, {
            once: true
        });
}

function removeListeners() {
    ["click", "keydown", "scroll"].forEach(evt =>
        window.removeEventListener(evt, startMusic)
    );
}

["click", "keydown", "scroll"].forEach(evt =>
    window.addEventListener(evt, startMusic, {
        once: true
    })
);


document.addEventListener("DOMContentLoaded", () => {

    const fitText = () => {
        document.querySelectorAll(".text-block").forEach(block => {
            const p = block.querySelector("p");
            const polaroid = block.closest(".page-layout")
                ?.querySelector(".polaroid");

            if (!p || !polaroid) return;

            let size = 18;
            const maxHeight = polaroid.clientHeight;

            p.style.fontSize = size + "px";
            while (p.scrollHeight > maxHeight && size > 6) {
                size--;
                p.style.fontSize = size + "px";
            }
        });
    };

    let resizeRAF;
    window.addEventListener("resize", () => {
        cancelAnimationFrame(resizeRAF);
        resizeRAF = requestAnimationFrame(fitText);
    });

    window.addEventListener("load", fitText);
});

window.addEventListener("load", () => {
    document.documentElement.classList.remove("loading");
    const preload = document.getElementById("preload");
    if (!preload) return;
    preload.style.transition = "opacity .6s ease";
    preload.style.opacity = "0";
    setTimeout(() => preload.remove(), 600);
});
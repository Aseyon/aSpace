(function () {
    "use strict";

    const SELECTORS = {
        grassSvg: "#grassSVG",
        grassPath: "#grassPath",
        portraits: ".portrait-container",
        overlay: "#overlay",
        bookWrap: "#bookWrap",
        book: "#book",
        coverFront: ".cover.front",
        coverBack: ".cover.back",
        coverSpine: ".cover-spine",
        pages: ".page",
        catArms: ".cat-arms",
        bgm: "#bgm",
        preload: "#preload",
        textBlocks: ".text-block",
        pageLayout: ".page-layout",
        polaroid: ".polaroid"
    };

    const PORTRAIT_CAPTION_MAX_CHARS = 20;
    const BOOK_FLIP_TIME = 800;
    const MUSIC_FADE_DURATION = 2500;
    const MUSIC_FADE_STEPS = 50;

    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

    function listen(target, eventName, handler, options) {
        if (!target) return;
        target.addEventListener(eventName, handler, options);
    }

    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback, { once: true });
            return;
        }

        callback();
    }

    function onLoaded(callback) {
        if (document.readyState === "complete") {
            callback();
            return;
        }

        window.addEventListener("load", callback, { once: true });
    }

    function isValidNumber(value) {
        return !Number.isNaN(value);
    }

    function initGrass() {
        const svg = $(SELECTORS.grassSvg);
        const path = $(SELECTORS.grassPath);
        if (!svg || !path) return;

        const width = 1600;
        const height = 500;
        const baseY = 390;
        const strands = 60;
        const windRadius = 280;

        const grassData = Array.from({ length: strands }, () => ({
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

        listen(svg, "mousemove", (event) => {
            const rect = svg.getBoundingClientRect();
            rawX = (event.clientX - rect.left) * (width / rect.width);
            influence = 1;
            lastMove = performance.now();
        });

        listen(svg, "mouseleave", () => {
            rawX = NaN;
        });

        function updateMouseInfluence() {
            if (isValidNumber(rawX)) {
                if (!isValidNumber(smoothX)) smoothX = rawX;
                smoothX += (rawX - smoothX) * 0.12;
            } else if (isValidNumber(smoothX)) {
                smoothX += (width * 0.5 - smoothX) * 0.018;
            }

            if (performance.now() - lastMove <= 80) return;

            influence *= 0.94;
            if (influence < 0.01) influence = 0;
        }

        function getLocalWind(x) {
            if (!influence || !isValidNumber(smoothX)) return 0;

            const distance = Math.abs(smoothX - x);
            if (distance >= windRadius) return 0;

            return (1 - distance / windRadius) * 80 * influence;
        }

        function generateGrassPath(time) {
            updateMouseInfluence();

            let d = `M 0 ${height} L 0 ${baseY} `;

            grassData.forEach((strand, index) => {
                const x = (index / (strands - 1)) * width;
                const globalSway = Math.sin(time * strand.waveSpeed + strand.waveOffset) * 6;
                const localWind = getLocalWind(x);
                const top = baseY - strand.height * 0.75 + Math.sin(index * 0.45 + time * 1.1) * 8;
                const sway = strand.lean + globalSway + localWind * 0.16;

                d += [
                    `C ${x - strand.curve * 0.5} ${baseY - 40}`,
                    `${x + sway * 0.2} ${top + 28}`,
                    `${x + sway} ${top}`,
                    `C ${x + sway * 0.2} ${top + 22}`,
                    `${x + strand.curve * 0.5} ${baseY - 38}`,
                    `${x + width / strands} ${baseY}`
                ].join(" ");
            });

            return `${d} L ${width} ${height} Z`;
        }

        function animateGrass() {
            path.setAttribute("d", generateGrassPath(performance.now() / 900));
            requestAnimationFrame(animateGrass);
        }

        animateGrass();
    }

    function initPortraits() {
        const portraits = $$(SELECTORS.portraits);
        const overlay = $(SELECTORS.overlay);
        if (!portraits.length || !overlay) return;

        function truncateCaption(caption) {
            const fullText = caption.dataset.fulltext || caption.textContent.trim();
            caption.textContent = fullText.length > PORTRAIT_CAPTION_MAX_CHARS
                ? fullText.slice(0, PORTRAIT_CAPTION_MAX_CHARS)
                : fullText;
        }

        function updateSupport(wrapper, support, tape) {
            if (!wrapper || !support) return;

            const paddingX = 12;
            const paddingY = 12;

            support.style.width = `${wrapper.offsetWidth + paddingX * 2}px`;
            support.style.height = `${wrapper.offsetHeight + paddingY * 2}px`;
            support.style.top = `${wrapper.offsetTop - paddingY}px`;
            support.style.left = `${wrapper.offsetLeft - paddingX}px`;
            support.style.zIndex = 10;

            if (!tape) return;

            const tapePadding = 8;
            tape.style.top = `${support.offsetTop - tapePadding}px`;
            tape.style.left = `${support.offsetLeft + support.offsetWidth / 2 - tape.offsetWidth / 2}px`;
            tape.style.zIndex = 15;
        }

        function getPortraitParts(portrait) {
            return {
                wrapper: $(".photo-wrapper", portrait),
                support: $(".photo-support", portrait),
                tape: $(".tape-realista", portrait),
                caption: $(".caption-box", portrait)
            };
        }

        function updateAllSupports() {
            portraits.forEach((portrait) => {
                const { wrapper, support, tape } = getPortraitParts(portrait);
                updateSupport(wrapper, support, tape);
            });
        }

        function showOverlay() {
            overlay.style.opacity = "1";
            overlay.style.pointerEvents = "auto";
        }

        function hideOverlay() {
            overlay.style.opacity = "0";
            overlay.style.pointerEvents = "none";
        }

        function closeZoomedPhoto(photo) {
            const portrait = photo || $(".portrait-container.zoomed");
            if (!portrait) return;

            const { wrapper, support, tape, caption } = getPortraitParts(portrait);

            portrait.classList.remove("zoomed");
            portrait.style.transform = "";
            portrait.style.zIndex = "";

            if (caption) truncateCaption(caption);

            updateSupport(wrapper, support, tape);
            hideOverlay();
        }

        function openZoomedPhoto(portrait) {
            portraits.forEach((other) => {
                if (other !== portrait) closeZoomedPhoto(other);
            });

            const { wrapper, support, tape, caption } = getPortraitParts(portrait);
            if (!wrapper) return;

            if (caption) {
                caption.textContent = caption.dataset.fulltext || caption.textContent;
                caption.style.height = "auto";
                caption.style.maxHeight = "none";
            }

            portrait.style.transform = "none";
            portrait.style.zIndex = "";

            const rect = wrapper.getBoundingClientRect();
            const scaleX = (window.innerWidth * 0.9) / rect.width;
            const scaleY = (window.innerHeight * 0.9) / rect.height;
            const maxScale = Math.min(scaleX, scaleY, 2.2);
            const centerX = window.innerWidth / 2 - (rect.left + rect.width / 2);
            const centerY = window.innerHeight / 2 - (rect.top + rect.height / 2);

            portrait.style.transform = `translate(${centerX}px, ${centerY}px) scale(${maxScale})`;
            portrait.style.zIndex = 70;
            portrait.classList.add("zoomed");

            showOverlay();
            updateSupport(wrapper, support, tape);
        }

        portraits.forEach((portrait) => {
            const { caption } = getPortraitParts(portrait);

            if (caption) {
                caption.dataset.fulltext = caption.textContent.trim();
                truncateCaption(caption);
            }

            listen(portrait, "click", (event) => {
                startMusic();

                if (portrait.classList.contains("zoomed")) {
                    closeZoomedPhoto(portrait);
                } else {
                    openZoomedPhoto(portrait);
                }

                event.stopPropagation();
            });
        });

        listen(overlay, "click", () => closeZoomedPhoto());

        listen(document, "click", (event) => {
            const zoomedPhoto = $(".portrait-container.zoomed");
            if (!zoomedPhoto || zoomedPhoto.contains(event.target)) return;

            closeZoomedPhoto(zoomedPhoto);
        });

        onLoaded(updateAllSupports);
        listen(window, "resize", updateAllSupports);
    }

    function initBook() {
        const bookWrap = $(SELECTORS.bookWrap);
        const book = $(SELECTORS.book);
        if (!bookWrap || !book) return;

        const coverFront = $(SELECTORS.coverFront, book);
        const coverBack = $(SELECTORS.coverBack, book);
        const coverSpine = $(SELECTORS.coverSpine, book);
        const pages = $$(SELECTORS.pages, book);
        const catArms = $(SELECTORS.catArms);

        if (!coverFront || !coverBack || !pages.length) return;

        let opened = false;
        let currentPage = 0;
        let animating = false;

        function lockAnimation(duration = BOOK_FLIP_TIME) {
            animating = true;
            window.setTimeout(() => {
                animating = false;
            }, duration);
        }

        function animateCatArms(action) {
            if (!catArms) return;

            const animations = {
                open: "arm-open 0.5s cubic-bezier(.22,.9,.33,1) forwards",
                flip: "arm-flip 0.5s cubic-bezier(.22,.9,.33,1) forwards",
                close: "arm-close 0.5s cubic-bezier(.22,.9,.33,1) forwards"
            };

            if (!animations[action]) return;

            catArms.style.animation = "none";
            void catArms.offsetWidth;
            catArms.style.animation = animations[action];
        }

        function getPageZIndex(page, index) {
            return page.classList.contains("flipped")
                ? index + 1
                : pages.length - index;
        }

        function updatePageStack() {
            pages.forEach((page, index) => {
                page.style.zIndex = getPageZIndex(page, index);
                page.style.pointerEvents = page.classList.contains("flipped") ? "none" : "auto";
            });
        }

        function resetPages() {
            pages.forEach((page) => {
                page.classList.remove("flipped");
                page.style.pointerEvents = "auto";
            });

            updatePageStack();
        }

        function centerBook() {
            bookWrap.style.position = "fixed";
            bookWrap.style.top = "50%";
            bookWrap.style.left = "50%";
            bookWrap.style.transform = "translate(-50%, -50%) scale(1)";
        }

        function openBook() {
            if (opened || animating) return;

            opened = true;
            currentPage = 0;
            lockAnimation();
            animateCatArms("open");

            coverFront.style.zIndex = pages.length + 2;
            coverFront.classList.remove("close");
            coverFront.classList.add("open");
            resetPages();

            const pageWidth = coverFront.offsetWidth;
            requestAnimationFrame(() => {
                bookWrap.style.transform = `translate(calc(-50% + ${pageWidth / 2}px), -50%)`;
            });

            window.setTimeout(() => {
                if (opened) coverFront.style.zIndex = 0;
            }, BOOK_FLIP_TIME);
        }

        function flipPage(page) {
            if (!opened || animating || !page || page.classList.contains("flipped")) return;

            lockAnimation();
            animateCatArms("flip");

            page.classList.add("flipped");
            currentPage++;
            updatePageStack();
        }

        function previousPage() {
            if (!opened || animating || currentPage <= 0) return;

            lockAnimation();
            animateCatArms("flip");

            currentPage--;
            const page = pages[currentPage];
            page.classList.remove("flipped");
            updatePageStack();
        }

        function closeBook() {
            if (!opened || animating || currentPage < pages.length) return;

            const closeDuration = pages.length * 50 + 300;
            animating = true;
            animateCatArms("close");

            pages.forEach((page, index) => {
                window.setTimeout(() => {
                    page.classList.remove("flipped");
                    page.style.pointerEvents = "auto";
                    updatePageStack();
                }, index * 50);
            });

            window.setTimeout(() => {
                coverFront.style.zIndex = pages.length + 2;
                coverFront.classList.remove("open");
                coverFront.classList.add("close");
                opened = false;
                currentPage = 0;

                requestAnimationFrame(() => {
                    bookWrap.style.transform = "translate(-50%, -50%) scale(1)";
                });

                animating = false;
            }, closeDuration);
        }

        if (coverSpine) coverSpine.style.zIndex = 0;

        resetPages();
        coverFront.style.zIndex = pages.length + 2;
        coverBack.style.zIndex = 0;

        listen(book, "click", (event) => {
            if (!opened || animating) return;

            const rect = book.getBoundingClientRect();
            const clickX = event.clientX - rect.left;

            if (clickX > rect.width / 2) {
                flipPage(pages[currentPage]);
            } else {
                previousPage();
            }
        });

        listen(coverFront, "click", (event) => {
            event.stopPropagation();
            openBook();
        });

        listen(coverBack, "click", (event) => {
            event.stopPropagation();
            closeBook();
        });

        onLoaded(centerBook);
    }

    let musicStarted = false;
    let musicFadeTimer = null;

    function initMusic() {
        const bgm = $(SELECTORS.bgm);
        if (!bgm) return;

        const startEvents = ["click", "keydown", "scroll"];

        function removeStartListeners() {
            startEvents.forEach((eventName) => {
                window.removeEventListener(eventName, startMusic);
            });
        }

        function addStartListeners() {
            startEvents.forEach((eventName) => {
                window.addEventListener(eventName, startMusic, { once: true });
            });
        }

        function fadeIn() {
            clearInterval(musicFadeTimer);

            let volume = 0;
            const stepTime = MUSIC_FADE_DURATION / MUSIC_FADE_STEPS;
            const stepVolume = 1 / MUSIC_FADE_STEPS;

            musicFadeTimer = window.setInterval(() => {
                volume += stepVolume;

                if (volume >= 1) {
                    bgm.volume = 1;
                    clearInterval(musicFadeTimer);
                    return;
                }

                bgm.volume = volume;
            }, stepTime);
        }

        window.startMusic = function startMusicFromWindow() {
            startMusic();
        };

        startMusic = function startMusicFromInteraction() {
            if (musicStarted || !bgm) return;

            musicStarted = true;
            bgm.volume = 0;
            bgm.load();
            removeStartListeners();

            const play = () => {
                bgm.removeEventListener("canplaythrough", play);

                const playPromise = bgm.play();

                if (!playPromise || typeof playPromise.then !== "function") {
                    fadeIn();
                    return;
                }

                playPromise
                    .then(fadeIn)
                    .catch((error) => {
                        console.warn("Falha ao iniciar a musica:", error);
                        musicStarted = false;
                        addStartListeners();
                    });
            };

            if (bgm.readyState >= 3) {
                play();
            } else {
                bgm.addEventListener("canplaythrough", play, { once: true });
            }
        };

        addStartListeners();
    }

    let startMusic = function noopStartMusic() {};

    function initTextFitting() {
        const initialSize = 18;
        const minSize = 4;
        let resizeFrame = null;

        function fitText() {
            $$(SELECTORS.textBlocks).forEach((block) => {
                const paragraph = $("p", block);
                const polaroid = block.closest(SELECTORS.pageLayout)?.querySelector(SELECTORS.polaroid);
                if (!paragraph || !polaroid) return;

                let size = initialSize;
                const maxHeight = polaroid.clientHeight;

                paragraph.style.fontSize = `${size}px`;

                while (paragraph.scrollHeight > maxHeight && size > minSize) {
                    size--;
                    paragraph.style.fontSize = `${size}px`;
                }
            });
        }

        listen(window, "resize", () => {
            cancelAnimationFrame(resizeFrame);
            resizeFrame = requestAnimationFrame(fitText);
        });

        onLoaded(fitText);
    }

    function initPreload() {
        onLoaded(() => {
            document.documentElement.classList.remove("loading");

            const preload = $(SELECTORS.preload);
            if (!preload) return;

            preload.style.transition = "opacity .6s ease";
            preload.style.opacity = "0";

            window.setTimeout(() => {
                preload.remove();
            }, 600);
        });
    }

    onReady(() => {
        initGrass();
        initPortraits();
        initBook();
        initMusic();
        initTextFitting();
        initPreload();
    });
})();
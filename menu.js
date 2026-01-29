const menuOverlay = document.getElementById("menu-overlay");
const buttons = Array.from(document.querySelectorAll(".menu-button"));
const soundMove = document.getElementById("menu-sound");
const soundConfirm = document.getElementById("menu-confirm-sound");

let currentIndex = 0;
let lastIndex = 0;
const isMobile = window.innerWidth <= 768;

const darkRoomButton = buttons.find(btn => btn.dataset.action === "darkroom");

if (isMobile && darkRoomButton) {
    darkRoomButton.textContent = "LION'S MANE";
    const side = darkRoomButton.closest(".menu-side");
    if (side) side.classList.remove("disabled");
}

function updateSelection() {
    buttons.forEach((btn, i) => btn.classList.toggle("active", i === currentIndex));
}

function playMoveSound() {
    if (!soundMove) return;
    soundMove.currentTime = 0;
    soundMove.play().catch(() => {});
}

function playConfirmSound() {
    if (!soundConfirm) return;
    soundConfirm.currentTime = 0;
    soundConfirm.play().catch(() => {});
}

function goTo(action) {
    menuOverlay.classList.add("fade-out");
    playConfirmSound();
    setTimeout(() => {
        if (action === "headspace") window.location.href = "headspace/headspace.html";
        if (action === "darkroom") {
            window.location.href = isMobile ? "potatoroom/index.html" : "darkroom/darkroom.html";
        }
    }, 600);
}

function handleAction() {
    const button = buttons[currentIndex];
    if (!button) return;
    goTo(button.dataset.action);
}

buttons.forEach((btn, index) => {
    btn.addEventListener("click", () => {
        currentIndex = index;
        updateSelection();
        goTo(btn.dataset.action);
    });
});

document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft" && currentIndex > 0) currentIndex--;
    if (e.key === "ArrowRight" && currentIndex < buttons.length - 1) currentIndex++;

    if (lastIndex !== currentIndex) {
        updateSelection();
        playMoveSound();
        lastIndex = currentIndex;
    }

    if (e.key.toLowerCase() === "z") handleAction();
});

function handleMenuLoad() {
    document.documentElement.classList.remove("loading");

    const preload = document.getElementById("preload");
    if (preload) preload.remove();

    const menuLoading = document.getElementById("menu-loading");
    if (!menuLoading) return;

    menuLoading.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    menuLoading.style.transform = "scale(1.05)";

    setTimeout(() => {
        menuLoading.style.opacity = "0";
        menuLoading.style.transform = "scale(0.95)";
        setTimeout(() => menuLoading.remove(), 600);
    }, 700);
}

window.addEventListener("load", handleMenuLoad);

window.addEventListener("pageshow", event => {
    if (event.persisted) window.location.reload();
});

updateSelection();
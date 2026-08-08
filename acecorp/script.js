const VIDEO_BASE_PATH = '../vds/';
const COVER_FRAME_TIME = 0.08;

const videos = [
  {
    id: 'mem_01',
    title: 'Content Warning',
    file: 'contentwarning1.mp4',
    description: 'Quando a fama some pra bunda é esse tipo de coisa que as pessoas mais lerdas fazem.'
  },
  {
    id: 'mem_02',
    title: 'Black Ops II - Herói',
    file: 'blackops2_1.mp4',
    description: 'Nem todo super-herói possui um chat. Às vezes ele só precisa de um controle e um bom coração.'
  },
  {
    id: 'mem_03',
    title: 'Apocalipse',
    file: '99apocalipse.mp4',
    description: 'Imagens fortes! Companheiros são deixados para trás em resgate após 111 dias no inferno.'
  },
  {
    id: 'mem_04',
    title: 'Locked Souls',
    file: 'lockedsouls.mp4',
    description: 'Dentro da plataforma Roblox, um jogo de terror aparentemente comum se tornou um verdadeiro pesadelo vivido. Após uma sequência de acidentes trágicos e eventos perturbadores, aquele ambiente passou a ser conhecido como um dos lugares mais hostis da atualidade.'
  },
  {
    id: 'mem_05',
    title: 'Parque de Dinossauros',
    file: 'minePark1.mp4',
    description: 'Memórias fortes.. o que começou como um sonho em uma escola se tornou realidade após anos de promessa.'
  },
  {
    id: 'mem_06',
    title: 'Hitman',
    file: 'cartas.mp4',
    description: 'Misericórdia? A verdadeira misericórdia não existe perante a ira de alguém que outrora foi traído.'
  },
  {
    id: 'mem_07',
    title: 'Parque de Dinossauros II',
    file: 'mineDino.mp4',
    description: 'Registros mostram nascimento de dinoussauro antes extintos. Dolores foi concebida ao mundo como primeira fêmea a nascer em solo Minecraftense.'
  },
  {
    id: 'mem_08',
    title: 'Content Warning II',
    file: 'contentwarning2.mp4',
    description: 'Em seguida na busca por mais visualizações lerdinhos retornam só para morrerem de novo.'
  },
  {
    id: 'mem_09',
    title: 'Massacre Escolar',
    file: 'massacre_escolar.mp4',
    description: 'Registros fortes mostram imagens reais de massacre escolar em joguinho virtual. É acrescentado intenções assassinas ao final ser revelado verdadeira razão para esfaqueamento em ROBLOX - Massacre.'
  },
  {
    id: 'mem_10',
    title: 'FNAF',
    file: 'fnaf.mp4',
    description: "Imagens perdidas mostram guardas noturnos da pizzaria Freddy Fazbear's Pizza em seus últimos momentos."
  },
  {
    id: 'mem_11',
    title: 'Monopólio',
    file: 'monopole.mp4',
    description: 'Jogo de tabuleiro causa discórdia entre amigos e causa transtorno psícologico megalomania em rapaz oprimido seguido de delírios de grandeza.'
  }
];

const projectList = document.getElementById('projectList');
const videoCount = document.getElementById('videoCount');
const videoModal = document.getElementById('videoModal');
const myVideo = document.getElementById('myVideo');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalCode = document.getElementById('modalCode');
const modalPath = document.getElementById('modalPath');
const autoPreviewMedia = window.matchMedia('(hover: none), (pointer: coarse), (max-width: 860px)');

let activeAutoPreview = null;
let autoPreviewFrame = null;
let autoPreviewReady = false;
let closeButtonTimer = null;

function videoPath(file) {
  return `${VIDEO_BASE_PATH}${file}`;
}

function renderVideos() {
  videoCount.textContent = String(videos.length).padStart(2, '0');
  projectList.innerHTML = videos.map((video, index) => `
    <article class="project-row" tabindex="0" role="button" data-index="${index}" aria-label="Abrir ${video.title}">
      <div class="project-preview" aria-hidden="true">
        <video src="${videoPath(video.file)}" muted playsinline preload="auto"></video>
      </div>
      <div class="project-copy">
        <p class="project-meta">${video.id} / ${video.file}</p>
        <h3 class="project-title">${video.title}</h3>
        <p class="project-desc">${video.description}</p>
      </div>
      <div class="project-action" aria-hidden="true">▶</div>
    </article>
  `).join('');

  projectList.querySelectorAll('.project-row').forEach(row => {
    const openFromRow = () => openVideo(Number(row.dataset.index));

    row.addEventListener('click', openFromRow);
    row.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openFromRow();
      }
    });
  });

  projectList.querySelectorAll('.project-preview video').forEach((preview, index) => {
    window.setTimeout(() => primePreviewCover(preview), index * 90);
  });

  setupAutoPreview();
}

function getCoverFrameTime(preview) {
  if (!Number.isFinite(preview.duration) || preview.duration <= COVER_FRAME_TIME) {
    return 0;
  }

  return Math.min(COVER_FRAME_TIME, preview.duration - 0.02);
}

function primePreviewCover(preview) {
  if (!preview) return;

  const previewWrap = preview.closest('.project-preview');
  const markCoverReady = () => previewWrap?.classList.add('has-cover');
  const seekToCover = () => {
    const coverTime = getCoverFrameTime(preview);

    try {
      preview.currentTime = coverTime;
    } catch (error) {
      markCoverReady();
    }
  };

  if (preview.readyState >= 2) {
    markCoverReady();
  }

  preview.addEventListener('loadeddata', markCoverReady, { once: true });
  preview.addEventListener('seeked', markCoverReady, { once: true });

  if (preview.readyState >= 1) {
    seekToCover();
  } else {
    preview.addEventListener('loadedmetadata', seekToCover, { once: true });
    preview.load();
  }
}

function setPreviewState(preview, isPreviewing) {
  preview?.closest('.project-row')?.classList.toggle('is-previewing', isPreviewing);
}

function playPreview(preview, options = {}) {
  if (!preview) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setPreviewState(preview, false);
    return;
  }

  const previewToken = `${Date.now()}-${Math.random()}`;
  preview.dataset.previewToken = previewToken;

  if (options.restart || preview.ended) {
    preview.currentTime = 0;
  } else if (!preview.currentTime) {
    preview.currentTime = 0.01;
  }

  const playback = preview.play();
  if (playback && typeof playback.then === 'function') {
    playback
      .then(() => {
        if (preview.dataset.previewToken === previewToken && !preview.paused) {
          setPreviewState(preview, true);
        }
      })
      .catch(() => setPreviewState(preview, false));
  } else {
    setPreviewState(preview, true);
  }
}

function resetPreview(preview) {
  if (!preview) return;
  preview.dataset.previewToken = '';
  setPreviewState(preview, false);
  preview.pause();

  try {
    preview.currentTime = getCoverFrameTime(preview);
  } catch (error) {
    preview.currentTime = 0;
  }
}

function stopAllPreviews() {
  projectList.querySelectorAll('.project-preview video').forEach(resetPreview);
  activeAutoPreview = null;
}

function getBestViewportPreview() {
  if (!autoPreviewMedia.matches || videoModal.classList.contains('is-open')) return null;

  const previews = [...projectList.querySelectorAll('.project-preview video')];
  let bestPreview = null;
  let bestScore = 0;

  previews.forEach(preview => {
    const rect = preview.closest('.project-preview').getBoundingClientRect();
    if (!rect.height || rect.bottom <= 0 || rect.top >= window.innerHeight) return;

    const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
    const visibleRatio = Math.max(0, Math.min(1, visibleHeight / rect.height));
    const previewCenter = rect.top + rect.height / 2;
    const viewportCenter = window.innerHeight / 2;
    const centerDistance = Math.abs(previewCenter - viewportCenter);
    const centerScore = 1 - Math.min(centerDistance / viewportCenter, 1);
    const score = visibleRatio * 0.72 + centerScore * 0.28;

    if (visibleRatio >= 0.68 && centerScore >= 0.24 && score > bestScore) {
      bestScore = score;
      bestPreview = preview;
    }
  });

  return bestPreview;
}

function syncViewportPreview() {
  autoPreviewFrame = null;

  const nextPreview = getBestViewportPreview();
  if (activeAutoPreview && activeAutoPreview !== nextPreview) {
    resetPreview(activeAutoPreview);
  }

  activeAutoPreview = nextPreview;

  if (activeAutoPreview) {
    playPreview(activeAutoPreview);
  }
}

function scheduleViewportPreviewSync() {
  if (autoPreviewFrame) return;
  autoPreviewFrame = window.requestAnimationFrame(syncViewportPreview);
}

function setupAutoPreview() {
  if (autoPreviewReady) return;
  autoPreviewReady = true;

  window.addEventListener('scroll', scheduleViewportPreviewSync, { passive: true });
  window.addEventListener('resize', scheduleViewportPreviewSync);

  if (autoPreviewMedia.addEventListener) {
    autoPreviewMedia.addEventListener('change', scheduleViewportPreviewSync);
  }

  scheduleViewportPreviewSync();
}

function openVideo(index) {
  const video = videos[index];
  if (!video) return;

  const src = videoPath(video.file);
  stopAllPreviews();
  myVideo.src = src;
  modalTitle.textContent = video.title;
  modalDescription.textContent = video.description;
  modalCode.textContent = video.id;
  modalPath.textContent = src;
  videoModal.classList.add('is-open');
  videoModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  myVideo.play().catch(() => {});
}

function closeVideo() {
  if (closeButtonTimer) {
    window.clearTimeout(closeButtonTimer);
    closeButtonTimer = null;
  }

  document.querySelector('.modal-close')?.classList.remove('is-closing');
  myVideo.pause();
  myVideo.removeAttribute('src');
  myVideo.load();
  videoModal.classList.remove('is-open');
  videoModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  scheduleViewportPreviewSync();
}

function closeVideoFromButton(button) {
  if (closeButtonTimer) return;

  button.classList.add('is-closing');
  closeButtonTimer = window.setTimeout(() => {
    closeButtonTimer = null;
    button.classList.remove('is-closing');
    closeVideo();
  }, 140);
}

document.querySelectorAll('[data-close-modal]').forEach(element => {
  element.addEventListener('click', () => {
    if (element.classList.contains('modal-close')) {
      closeVideoFromButton(element);
      return;
    }

    closeVideo();
  });
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && videoModal.classList.contains('is-open')) {
    closeVideo();
  }
});

renderVideos();
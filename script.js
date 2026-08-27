document.addEventListener('DOMContentLoaded', () => {

  // 1. DARK MODE TOGGLE (다크모드 & 조명 플리커링 실행)
  const themeToggle = document.getElementById('themeToggle');
  const modeText = themeToggle.querySelector('.mode-text');

  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    
    modeText.textContent = isDark ? 'DARK MODE: ON' : 'DARK MODE: OFF';

    // 다크모드로 전환될 때마다 SVG 조명이 찌릿하며 켜지도록 애니메이션 리셋
    if (isDark) {
      const flickerTarget = document.querySelector('.flicker-light-target');
      if (flickerTarget) {
        flickerTarget.style.animation = 'none';
        flickerTarget.offsetHeight; // trigger reflow
        flickerTarget.style.animation = 'roomFlickerOn 1.4s cubic-bezier(0.25, 1, 0.5, 1) forwards';
      }
    }
  });

  // 2. VIDEO PLAYER & TIMELINE SCRUBBER
  const video = document.getElementById('teaserVideo');
  const playControl = document.getElementById('playControl');
  const bottomPlayBtn = document.getElementById('bottomPlayBtn');
  const btnIcon = bottomPlayBtn.querySelector('.btn-icon');
  
  const currentTimeEl = document.getElementById('currentTime');
  const durationTimeEl = document.getElementById('durationTime');
  
  const timelineContainer = document.getElementById('timelineContainer');
  const timelineProgress = document.getElementById('timelineProgress');
  const timelineThumb = document.getElementById('timelineThumb');

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function togglePlay() {
    if (video.paused) {
      video.play().catch(err => console.log('Video error:', err));
    } else {
      video.pause();
    }
  }

  playControl.addEventListener('click', togglePlay);
  bottomPlayBtn.addEventListener('click', togglePlay);

  video.addEventListener('play', () => {
    playControl.classList.add('is-playing');
    btnIcon.textContent = '❚❚';
  });

  video.addEventListener('pause', () => {
    playControl.classList.remove('is-playing');
    btnIcon.textContent = '▶';
  });

  video.addEventListener('loadedmetadata', () => {
    durationTimeEl.textContent = formatTime(video.duration);
  });

  video.addEventListener('timeupdate', () => {
    if (!video.duration) return;
    const percentage = (video.currentTime / video.duration) * 100;
    timelineProgress.style.width = `${percentage}%`;
    timelineThumb.style.left = `${percentage}%`;
    currentTimeEl.textContent = formatTime(video.currentTime);
  });

  let isDragging = false;
  function updateScrubber(e) {
    const rect = timelineContainer.getBoundingClientRect();
    let pos = (e.clientX - rect.left) / rect.width;
    pos = Math.max(0, Math.min(1, pos));
    video.currentTime = pos * video.duration;
  }

  timelineContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    updateScrubber(e);
  });

  window.addEventListener('mousemove', (e) => {
    if (isDragging) updateScrubber(e);
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) isDragging = false;
  });

  // 3. TAB CONTROLS (CD 케이스 열림 & CD 옆으로 나오는 애니메이션)
  const tabBtns = document.querySelectorAll('.album-tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const currentBtn = e.currentTarget;
      const targetTabId = currentBtn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      currentBtn.classList.add('active');
      const targetContent = document.getElementById(targetTabId);
      if (targetContent) targetContent.classList.add('active');
    });
  });

  // 4. MUSIC PLAYER DRAG & DROP
  let activeCD = null;

  const albumCovers = document.querySelectorAll('.album-cover');
  albumCovers.forEach(cover => {
    cover.addEventListener('click', (e) => {
      e.stopPropagation();
      cover.parentElement.classList.toggle('open');
    });
  });

  const cds = document.querySelectorAll('.cd-disc');
  cds.forEach(cd => {
    cd.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', cd.id);
      e.dataTransfer.setData('title', cd.getAttribute('data-title'));
    });
  });

  const dropZone = document.getElementById('dropZone');
  const playerDeck = document.getElementById('playerDeck');
  const cdTray = document.getElementById('cdTray');
  const trackDisplay = document.getElementById('trackDisplay');
  const trayText = document.getElementById('trayText');
  const ejectBtn = document.getElementById('ejectBtn');

  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      playerDeck.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
      playerDeck.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      playerDeck.classList.remove('drag-over');

      const cdId = e.dataTransfer.getData('text/plain');
      const title = e.dataTransfer.getData('title');
      const cdElement = document.getElementById(cdId);

      if (cdElement) {
        if (activeCD) ejectCD();

        activeCD = cdElement;
        cdTray.appendChild(cdElement);
        cdElement.classList.add('inserted', 'spinning');

        if (trackDisplay) trackDisplay.innerText = title + ' [PLAYING]';
        if (trayText) trayText.innerText = '';
      }
    });
  }

  function ejectCD() {
    if (trackDisplay) trackDisplay.innerText = 'NO RECORD LOADED';
    if (trayText) trayText.innerText = 'DROP HERE';

    if (activeCD) {
      activeCD.classList.remove('spinning', 'inserted');
      let targetAlbumId = 'album1';
      if (activeCD.id === 'cd2') targetAlbumId = 'album2';

      const targetAlbum = document.getElementById(targetAlbumId);
      if (targetAlbum) targetAlbum.appendChild(activeCD);
      activeCD = null;
    }
  }

  if (ejectBtn) ejectBtn.addEventListener('click', ejectCD);
});

document.addEventListener('DOMContentLoaded', () => {

  // 1. 비디오 재생 / 일시정지
  const video = document.getElementById('teaserVideo');
  const videoFrame = document.getElementById('videoFrame');
  const playControl = document.getElementById('playControl');

  if (videoFrame && video && playControl) {
    videoFrame.addEventListener('click', () => {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', () => playControl.classList.add('is-playing'));
    video.addEventListener('pause', () => playControl.classList.remove('is-playing'));
    video.addEventListener('ended', () => playControl.classList.remove('is-playing'));
  }

  // 2. 탭 전환 기능 (앨범 선택 스타일)
  const tabBtns = document.querySelectorAll('.album-tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
    });
  });

  // 3. LP 플레이어 Drag & Drop 및 앨범 클릭 슬라이드
  let activeCD = null;

  const albumCovers = document.querySelectorAll('.album-cover');
  albumCovers.forEach(cover => {
    cover.addEventListener('click', (e) => {
      e.stopPropagation();
      const parent = cover.parentElement;
      parent.classList.toggle('open');
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
        dropZone.classList.add('playing');
      }
    });
  }

  function ejectCD() {
    if (dropZone) dropZone.classList.remove('playing');
    if (trackDisplay) trackDisplay.innerText = 'NO RECORD LOADED';
    if (trayText) trayText.innerText = 'DROP HERE';

    if (activeCD) {
      activeCD.classList.remove('spinning', 'inserted');
      let targetAlbumId = 'album1';
      if (activeCD.id === 'cd2') targetAlbumId = 'album2';
      if (activeCD.id === 'cd3') targetAlbumId = 'album3';

      document.getElementById(targetAlbumId).appendChild(activeCD);
      activeCD = null;
    }
  }

  if (ejectBtn) {
    ejectBtn.addEventListener('click', ejectCD);
  }
});

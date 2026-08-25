document.addEventListener('DOMContentLoaded', () => {

  // 1. 비디오 클릭시 완벽 재생/일시정지 및 11자 아이콘 토글
  const video = document.getElementById('teaserVideo');
  const videoFrame = document.getElementById('videoFrame');
  const playControl = document.getElementById('playControl');

  if (video && videoFrame && playControl) {
    videoFrame.addEventListener('click', () => {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', () => {
      playControl.classList.add('is-playing');
    });

    video.addEventListener('pause', () => {
      playControl.classList.remove('is-playing');
    });

    video.addEventListener('ended', () => {
      playControl.classList.remove('is-playing');
    });
  }

  // 2. 턴테이블 드래그 앤 드롭 동작
  let activeCD = null;

  const albumCovers = document.querySelectorAll('.album-cover');
  albumCovers.forEach(cover => {
    cover.addEventListener('click', (e) => {
      e.stopPropagation();
      const parentAlbum = cover.parentElement;
      parentAlbum.classList.toggle('open');
    });
  });

  const cds = document.querySelectorAll('.cd-disc');
  cds.forEach(cd => {
    cd.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', cd.id);
      e.dataTransfer.setData('title', cd.getAttribute('data-title') || 'HAPPYEND TRACK');
      e.dataTransfer.effectAllowed = 'move';
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
      e.dataTransfer.dropEffect = 'move';
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
        if (activeCD) {
          ejectCD();
        }

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

      const targetAlbum = document.getElementById(targetAlbumId);
      if (targetAlbum) {
        targetAlbum.appendChild(activeCD);
      }
      activeCD = null;
    }
  }

  if (ejectBtn) {
    ejectBtn.addEventListener('click', ejectCD);
  }
});

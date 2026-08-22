document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. 기존 비디오 플레이어 제어 로직
  // ==========================================
  const video = document.getElementById('teaserVideo');
  const playControl = document.getElementById('playControl');

  if (video && playControl) {
    video.addEventListener('play', () => {
      playControl.style.opacity = '0';
    });

    video.addEventListener('pause', () => {
      playControl.style.opacity = '1';
    });

    video.addEventListener('ended', () => {
      playControl.style.opacity = '1';
    });
  }


  // ==========================================
  // 2. CD 플레이어 인터랙션 로직
  // ==========================================
  let activeCD = null;

  // A. 커버 클릭 시 앨범 열기 / 닫기
  const albumCovers = document.querySelectorAll('.album-cover');
  albumCovers.forEach(cover => {
    cover.addEventListener('click', () => {
      const parentAlbum = cover.parentElement;
      parentAlbum.classList.toggle('open');
    });
  });

  // B. CD 드래그 시작 이벤트
  const cds = document.querySelectorAll('.cd-disc');
  cds.forEach(cd => {
    cd.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('cd-id', cd.id);
      e.dataTransfer.setData('title', cd.getAttribute('data-title') || 'HAPPYEND TRACK');
    });
  });

  // C. 플레이어 Drop Zone 이벤트
  const dropZone = document.getElementById('dropZone');
  const playerDeck = document.getElementById('playerDeck');
  const cdTray = document.getElementById('cdTray');
  const trackDisplay = document.getElementById('trackDisplay');
  const trayText = document.getElementById('trayText');
  const ejectBtn = document.getElementById('ejectBtn');

  if (dropZone) {
    // 드래그가 영역 위로 올 때 (드롭 허용 필수)
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      playerDeck.classList.add('drag-over');
    });

    // 영역 밖으로 나갈 때
    dropZone.addEventListener('dragleave', () => {
      playerDeck.classList.remove('drag-over');
    });

    // CD를 놓았을 때 (드롭 시 무조건 회전 애니메이션 실행)
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      playerDeck.classList.remove('drag-over');

      const cdId = e.dataTransfer.getData('cd-id');
      const title = e.dataTransfer.getData('title');
      const cdElement = document.getElementById(cdId);

      if (cdElement) {
        // 이미 꽂혀있는 CD가 있다면 꺼냄
        if (activeCD) {
          ejectCD();
        }

        activeCD = cdElement;

        // CD를 플레이어 중앙 덱으로 장착 및 회전 적용
        cdTray.appendChild(cdElement);
        cdElement.classList.add('inserted', 'spinning');

        // 상태 표시 텍스트 변경 & 스캔 빔 실행
        if (trackDisplay) trackDisplay.innerText = title + ' [PLAYING]';
        if (trayText) trayText.innerText = '';
        playerDeck.classList.add('playing');
      }
    });
  }

  // D. EJECT (꺼내기) 버튼 기능
  function ejectCD() {
    if (playerDeck) playerDeck.classList.remove('playing');
    if (trackDisplay) trackDisplay.innerText = 'NO DISC LOADED';
    if (trayText) trayText.innerText = 'DROP CD HERE';

    if (activeCD) {
      activeCD.classList.remove('spinning', 'inserted');

      // 원래 속했던 앨범 위치로 반환
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

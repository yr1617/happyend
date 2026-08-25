document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. 비디오 플레이어 제어 (11자 버튼 토글 포함)
  // ==========================================
  const video = document.getElementById('teaserVideo');
  const playControl = document.getElementById('playControl');

  if (video && playControl) {
    // 재생 중일 때는 11자 버튼 모양으로 변경
    video.addEventListener('play', () => {
      playControl.classList.add('is-playing');
      playControl.style.opacity = '0'; // 재생 중엔 숨김 (마우스 호버 시 보임)
    });

    // 일시정지 시 재생 버튼 삼각형으로 원복
    video.addEventListener('pause', () => {
      playControl.classList.remove('is-playing');
      playControl.style.opacity = '1';
    });

    video.addEventListener('ended', () => {
      playControl.classList.remove('is-playing');
      playControl.style.opacity = '1';
    });
  }


  // ==========================================
  // 2. CD 플레이어 인터랙션 (오류 완전 수정)
  // ==========================================
  let activeCD = null;

  // A. 커버 클릭 시 CD 슬라이드 열기/닫기
  const albumCovers = document.querySelectorAll('.album-cover');
  albumCovers.forEach(cover => {
    cover.addEventListener('click', (e) => {
      e.stopPropagation();
      const parentAlbum = cover.parentElement;
      parentAlbum.classList.toggle('open');
    });
  });

  // B. CD 드래그 설정 (브라우저 호환성 강화)
  const cds = document.querySelectorAll('.cd-disc');
  cds.forEach(cd => {
    cd.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', cd.id);
      e.dataTransfer.setData('title', cd.getAttribute('data-title') || 'HAPPYEND TRACK');
      e.dataTransfer.effectAllowed = 'move';
    });
  });

  // C. Drop Zone (CD 플레이어) 이벤트
  const dropZone = document.getElementById('dropZone');
  const playerDeck = document.getElementById('playerDeck');
  const cdTray = document.getElementById('cdTray');
  const trackDisplay = document.getElementById('trackDisplay');
  const trayText = document.getElementById('trayText');
  const ejectBtn = document.getElementById('ejectBtn');

  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault(); // 드롭 가능 구역으로 설정 필수
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
        // 이미 플레이어에 CD가 들어있다면 Eject 실행 후 진행
        if (activeCD) {
          ejectCD();
        }

        activeCD = cdElement;

        // CD 플레이어로 CD 기기 내 집어넣기
        cdTray.appendChild(cdElement);
        cdElement.classList.add('inserted', 'spinning');

        // 스캔 애니메이션 및 표시 문구 변경
        if (trackDisplay) trackDisplay.innerText = title + ' [PLAYING]';
        if (trayText) trayText.innerText = '';
        playerDeck.classList.add('playing');
      }
    });
  }

  // D. EJECT 버튼 로직
  function ejectCD() {
    if (playerDeck) playerDeck.classList.remove('playing');
    if (trackDisplay) trackDisplay.innerText = 'NO DISC LOADED';
    if (trayText) trayText.innerText = 'DROP CD HERE';

    if (activeCD) {
      activeCD.classList.remove('spinning', 'inserted');

      // 본래 앨범 위치 복귀
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

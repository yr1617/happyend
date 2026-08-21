document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('teaserVideo');
  const playControl = document.getElementById('playControl');

  if (video && playControl) {
    // 비디오 클릭 또는 기본 컨트롤 작동 시 재생 상태 반영
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
});
let currentActiveDisc = null;

let activeCD = null;

document.addEventListener('DOMContentLoaded', () => {
  let activeCD = null;

  // 1. 앨범 클릭 이벤트 (열기 / 닫기)
  const albums = document.querySelectorAll('.album-item');
  albums.forEach(album => {
    album.addEventListener('click', (e) => {
      // CD를 직접 드래그할 때는 앨범 토글 동작 방지
      if (e.target.classList.contains('cd-disc')) return;
      album.classList.toggle('open');
    });
  });

  // 2. CD 드래그 이벤트 등록
  const cds = document.querySelectorAll('.cd-disc');
  cds.forEach(cd => {
    cd.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', cd.id);
      e.dataTransfer.setData('track', cd.getAttribute('data-track'));
      e.dataTransfer.setData('title', cd.getAttribute('data-title'));
    });
  });

  // 3. 드롭존(플레이어) 이벤트 등록
  const dropZone = document.getElementById('dropZone');
  const playerDeck = document.getElementById('playerDeck');
  const cdTray = document.getElementById('cdTray');
  const audioPlayer = document.getElementById('audioPlayer');
  const trackDisplay = document.getElementById('trackDisplay');
  const trayText = document.getElementById('trayText');
  const ejectBtn = document.getElementById('ejectBtn');

  if (dropZone) {
    // 드래그가 영역 위로 올 때 (반드시 preventDefault 필요)
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      playerDeck.classList.add('drag-over');
    });

    // 영역 밖으로 나갈 때
    dropZone.addEventListener('dragleave', () => {
      playerDeck.classList.remove('drag-over');
    });

    // 마우스를 놓았을 때 (드롭)
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      playerDeck.classList.remove('drag-over');

      const cdId = e.dataTransfer.getData('text/plain');
      const track = e.dataTransfer.getData('track');
      const title = e.dataTransfer.getData('title');

      const cdElement = document.getElementById(cdId);

      if (cdElement && track) {
        if (activeCD) {
          ejectCD();
        }

        activeCD = cdElement;

        // CD를 플레이어 안으로 장착
        cdTray.appendChild(cdElement);
        cdElement.classList.add('inserted', 'spinning');

        // 오디오 재생
        audioPlayer.src = track;
        audioPlayer.play().catch(err => console.log('재생 에러:', err));

        trackDisplay.innerText = title;
        trayText.innerText = '';
        playerDeck.classList.add('playing');
      }
    });
  }

  // 4. EJECT (꺼내기) 버튼 기능
  function ejectCD() {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;

    playerDeck.classList.remove('playing');
    trackDisplay.innerText = 'NO DISC LOADED';
    trayText.innerText = 'DROP CD HERE';

    if (activeCD) {
      activeCD.classList.remove('spinning', 'inserted');

      // 원래 CD가 있던 앨범 위치 찾아 복귀
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
});}

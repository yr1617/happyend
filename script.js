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

// 1. 앨범 클릭 시 CD 꺼내기 / 넣기
function toggleAlbum(albumElement) {
  albumElement.classList.toggle('open');
}

// 2. Drag & Drop 이벤트를 위한 초기화
document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('dropZone');
  const audioPlayer = document.getElementById('audioPlayer');

  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.querySelector('.player-deck').classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.querySelector('.player-deck').classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.querySelector('.player-deck').classList.remove('drag-over');

      const trackSrc = e.dataTransfer.getData('audio-src');
      const trackTitle = e.dataTransfer.getData('track-title');
      const cdId = e.dataTransfer.getData('cd-id');

      if (trackSrc) {
        loadAndPlayTrack(trackSrc, trackTitle);
      }
    });
  }
});

// Drag 시작 시 데이터 저장
function dragStart(event) {
  const cdDisc = event.target;
  event.dataTransfer.setData('audio-src', cdDisc.getAttribute('data-track'));
  event.dataTransfer.setData('track-title', cdDisc.getAttribute('data-title'));
  
  if (currentActiveDisc) {
    currentActiveDisc.classList.remove('spinning');
  }
  currentActiveDisc = cdDisc;
}

// 3. 트랙 재생 기능
function loadAndPlayTrack(src, title) {
  const audioPlayer = document.getElementById('audioPlayer');
  const trackDisplay = document.getElementById('trackDisplay');
  const trayText = document.getElementById('trayText');

  audioPlayer.src = src;
  audioPlayer.play().then(() => {
    trackDisplay.innerText = title;
    trayText.innerText = "PLAYING...";
    if (currentActiveDisc) {
      currentActiveDisc.classList.add('spinning');
    }
  }).catch(err => {
    // 음원 파일이 아직 없는 경우를 위한 처리
    trackDisplay.innerText = title + " (LOADED)";
    trayText.innerText = "NO AUDIO FILE";
    console.warn("음원 파일을 찾을 수 없어 재생되지 않습니다. data-track 경로를 확인하세요.");
  });
}

// 4. EJECT 버튼
function ejectCD() {
  const audioPlayer = document.getElementById('audioPlayer');
  const trackDisplay = document.getElementById('trackDisplay');
  const trayText = document.getElementById('trayText');

  audioPlayer.pause();
  audioPlayer.currentTime = 0;
  trackDisplay.innerText = "NO DISC LOADED";
  trayText.innerText = "DROP CD HERE";

  if (currentActiveDisc) {
    currentActiveDisc.classList.remove('spinning');
    currentActiveDisc = null;
  }
}

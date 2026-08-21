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
let activeCD = null;

function toggleAlbum(element) {
  element.classList.toggle('open');
}

function allowDrop(ev) {
  ev.preventDefault();
  document.getElementById('playerDeck').classList.add('drag-over');
}

function dragLeave(ev) {
  document.getElementById('playerDeck').classList.remove('drag-over');
}

function dragStart(ev) {
  ev.dataTransfer.setData("cd-id", ev.target.id);
  ev.dataTransfer.setData("track", ev.target.getAttribute("data-track"));
  ev.dataTransfer.setData("title", ev.target.getAttribute("data-title"));
}

function handleDrop(ev) {
  ev.preventDefault();
  const playerDeck = document.getElementById('playerDeck');
  playerDeck.classList.remove('drag-over');

  const cdId = ev.dataTransfer.getData("cd-id");
  const track = ev.dataTransfer.getData("track");
  const title = ev.dataTransfer.getData("title");

  const cdElement = document.getElementById(cdId);
  const cdTray = document.getElementById('cdTray');

  if (cdElement && track) {
    // 이전 CD 초기화
    if (activeCD) {
      ejectCD();
    }

    activeCD = cdElement;
    
    // CD를 플레이어 덱 안으로 이동 시각화
    cdTray.appendChild(cdElement);
    cdElement.classList.add('inserted', 'spinning');

    // 음원 재생 및 레이저 빔 가동
    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.src = track;
    audioPlayer.play();

    document.getElementById('trackDisplay').innerText = title;
    document.getElementById('trayText').innerText = "";
    playerDeck.classList.add('playing');
  }
}

function ejectCD() {
  const audioPlayer = document.getElementById('audioPlayer');
  audioPlayer.pause();
  audioPlayer.currentTime = 0;

  const playerDeck = document.getElementById('playerDeck');
  playerDeck.classList.remove('playing');

  document.getElementById('trackDisplay').innerText = "NO DISC LOADED";
  document.getElementById('trayText').innerText = "DROP CD HERE";

  if (activeCD) {
    activeCD.classList.remove('spinning', 'inserted');
    
    // 원래 앨범 속 위치로 CD 복귀
    const originalAlbum = activeCD.closest('.album-item');
    if (originalAlbum) {
      originalAlbum.appendChild(activeCD);
    }
    activeCD = null;
  }
}

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

// ID로 정확히 앨범 토글 실행
function toggleAlbum(albumId) {
  const album = document.getElementById(albumId);
  if (album) {
    album.classList.toggle('open');
  }
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
    if (activeCD) {
      ejectCD();
    }

    activeCD = cdElement;
    
    cdTray.appendChild(cdElement);
    cdElement.classList.add('inserted', 'spinning');

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
    
    // 원래 속해있던 앨범 번호 확인 후 원복
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
    }
    activeCD = null;
  }
}

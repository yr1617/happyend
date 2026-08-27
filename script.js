// TAB 3: CD Audio Player Script
  let activeCD = null;
  const audioPlayer = document.getElementById('audioPlayer');

  const cdCases = document.querySelectorAll('.cd-case-item');
  const cds = document.querySelectorAll('.cd-disc');

  // URL 인코딩 및 오디오 재생 함수
  function playAudioTrack(src, title) {
    if (!audioPlayer) return;

    // 파일명 내 연속 공백 및 한글/특수문자 경로 안전화
    const safeSrc = encodeURI(src);
    audioPlayer.src = safeSrc;
    
    audioPlayer.play().then(() => {
      if (trackDisplay) {
        trackDisplay.innerText = title + ' [PLAYING]';
        scrambleText(trackDisplay);
      }
    }).catch(err => {
      console.warn("Audio Load/Play Error:", err);
      if (trackDisplay) {
        trackDisplay.innerText = title + ' [ERROR]';
      }
    });
  }

  // 케이스 클릭 이벤트: CD를 옆으로 튀어나오게만 처리 (자동 장착 X)
  cdCases.forEach(caseItem => {
    caseItem.addEventListener('click', () => {
      // 이미 선택된 케이스를 다시 누르면 닫힘, 아니면 활성화
      const isAlreadyActive = caseItem.classList.contains('active-selected');
      cdCases.forEach(c => c.classList.remove('active-selected'));
      
      if (!isAlreadyActive) {
        caseItem.classList.add('active-selected');
      }
    });
  });

  // CD 드래그 시작 이벤트
  cds.forEach(cd => {
    cd.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', cd.id);
      e.dataTransfer.setData('title', cd.getAttribute('data-title') || '');
      e.dataTransfer.setData('src', cd.getAttribute('data-src') || '');
    });
  });

  const dropZone = document.getElementById('dropZone');
  const playerDeck = document.getElementById('playerDeck');
  const cdTray = document.getElementById('cdTray');
  const trackDisplay = document.getElementById('trackDisplay');
  const trayText = document.getElementById('trayText');
  const ejectBtn = document.getElementById('ejectBtn');

  // 턴테이블에 장착 후 재생 처리
  function mountCDToPlayer(cdElement) {
    if (!cdElement) return;

    // 기존 재생 중인 CD가 있다면 꺼내기
    if (activeCD) ejectCD();

    activeCD = cdElement;
    cdTray.appendChild(cdElement);
    cdElement.classList.add('inserted', 'spinning');

    const title = cdElement.getAttribute('data-title');
    const audioSrc = cdElement.getAttribute('data-src');

    playAudioTrack(audioSrc, title);
    if (trayText) trayText.innerText = '';
  }

  // 드래그 앤 드롭 영역 이벤트 처리
  if (dropZone && playerDeck && cdTray) {
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
      const cdElement = document.getElementById(cdId);

      if (cdElement) {
        mountCDToPlayer(cdElement);
      }
    });
  }

  // EJECT 버튼 구현
  function ejectCD() {
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
    }

    if (trackDisplay) {
      trackDisplay.innerText = 'NO RECORD LOADED';
      scrambleText(trackDisplay);
    }
    if (trayText) trayText.innerText = 'DROP CD HERE TO PLAY';

    if (activeCD) {
      activeCD.classList.remove('spinning', 'inserted');
      const caseId = activeCD.id; // cd1, cd2 ...
      const targetCase = document.querySelector(`.cd-case-item[data-id="${caseId}"]`);
      
      if (targetCase) {
        targetCase.appendChild(activeCD);
      }
      activeCD = null;
    }

    cdCases.forEach(c => c.classList.remove('active-selected'));
  }

  if (ejectBtn) {
    ejectBtn.addEventListener('click', ejectCD);
  }

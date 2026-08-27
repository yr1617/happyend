document.addEventListener('DOMContentLoaded', () => {

  // 1. TAB NAVIGATION LOGIC
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');

      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      button.classList.add('active');
      const targetElement = document.getElementById(targetTab);
      if (targetElement) {
        targetElement.classList.add('active');
      }
    });
  });

  // 2. TEXT SCRAMBLE EFFECT
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
  
  function scrambleText(element) {
    if (!element) return;
    const originalText = element.innerText;
    let iteration = 0;
    
    clearInterval(element.interval);

    element.interval = setInterval(() => {
      element.innerText = originalText
        .split('')
        .map((char, index) => {
          if (index < iteration) {
            return originalText[index];
          }
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');

      if (iteration >= originalText.length) {
        clearInterval(element.interval);
      }
      iteration += 1 / 3;
    }, 30);
  }

  // 3. TAB 3: CD AUDIO PLAYER (DRAG & DROP ONLY)
  let activeCD = null;
  const audioPlayer = document.getElementById('audioPlayer');

  const cdCases = document.querySelectorAll('.cd-case-item');
  const cds = document.querySelectorAll('.cd-disc');

  const dropZone = document.getElementById('dropZone');
  const playerDeck = document.getElementById('playerDeck');
  const cdTray = document.getElementById('cdTray');
  const trackDisplay = document.getElementById('trackDisplay');
  const trayText = document.getElementById('trayText');
  const ejectBtn = document.getElementById('ejectBtn');

  // 안전한 Audio 재생 함수
  function playAudioTrack(src, title) {
    if (!audioPlayer) return;

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

  // 케이스 클릭 시 CD 꺼내기/넣기 토글 (드래그와 이벤트 분리)
  cdCases.forEach(caseItem => {
    caseItem.addEventListener('click', (e) => {
      // CD 알맹이를 눌렀을 때는 케이스 토글 방지
      if (e.target.closest('.cd-disc')) return;

      const isAlreadyActive = caseItem.classList.contains('active-selected');
      cdCases.forEach(c => c.classList.remove('active-selected'));
      
      if (!isAlreadyActive) {
        caseItem.classList.add('active-selected');
      }
    });
  });

  // CD 드래그 이벤트 등록
  cds.forEach(cd => {
    cd.addEventListener('dragstart', (e) => {
      e.stopPropagation(); // 이벤트 전파 중단
      e.dataTransfer.setData('text/plain', cd.id);
    });
  });

  // 턴테이블에 장착 함수
  function mountCDToPlayer(cdElement) {
    if (!cdElement) return;

    if (activeCD) ejectCD();

    activeCD = cdElement;
    cdTray.appendChild(cdElement);
    cdElement.classList.add('inserted', 'spinning');

    const title = cdElement.getAttribute('data-title');
    const audioSrc = cdElement.getAttribute('data-src');

    playAudioTrack(audioSrc, title);
    if (trayText) trayText.innerText = '';
  }

  // Drop Zone 이벤트
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
      const caseId = activeCD.id;
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

});

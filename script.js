window.addEventListener('DOMContentLoaded', () => {

  // 0. 다크 모드 토글
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', (e) => {
      e.preventDefault();
      document.body.classList.toggle('dark-mode');
    });
  }

  // 1. 커스텀 비디오 플레이어 & 실시간 타임라인
  const video = document.getElementById('teaserVideo');
  const videoFrame = document.getElementById('videoFrame');
  const playControl = document.getElementById('playControl');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const timelineProgress = document.getElementById('timelineProgress');
  const timelineContainer = document.getElementById('timelineContainer');
  const currentTimeDisplay = document.getElementById('currentTimeDisplay');
  const durationDisplay = document.getElementById('durationDisplay');

  function togglePlay() {
    if (!video) return;
    if (video.paused) {
      video.play().catch(err => console.log("Video play error:", err));
    } else {
      video.pause();
    }
  }

  if (videoFrame && video) {
    videoFrame.addEventListener('click', togglePlay);
    if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlay);

    video.addEventListener('play', () => {
      if (playControl) playControl.classList.add('is-playing');
      if (playPauseBtn) playPauseBtn.innerText = 'PAUSE';
    });

    video.addEventListener('pause', () => {
      if (playControl) playControl.classList.remove('is-playing');
      if (playPauseBtn) playPauseBtn.innerText = 'PLAY';
    });

    video.addEventListener('timeupdate', () => {
      if (video.duration) {
        const progressPercent = (video.currentTime / video.duration) * 100;
        if (timelineProgress) timelineProgress.style.width = `${progressPercent}%`;
        if (currentTimeDisplay) currentTimeDisplay.innerText = formatTime(video.currentTime);
      }
    });

    video.addEventListener('loadedmetadata', () => {
      if (durationDisplay) durationDisplay.innerText = formatTime(video.duration);
    });

    if (timelineContainer) {
      let isSeeking = false;

      const seek = (e) => {
        const rect = timelineContainer.getBoundingClientRect();
        const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        if (video.duration) {
          video.currentTime = pos * video.duration;
        }
      };

      timelineContainer.addEventListener('mousedown', (e) => {
        isSeeking = true;
        seek(e);
      });

      window.addEventListener('mousemove', (e) => {
        if (isSeeking) seek(e);
      });

      window.addEventListener('mouseup', () => {
        if (isSeeking) isSeeking = false;
      });
    }
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // 2. 텍스트 스크램블 애니메이션
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789%#@$&*';

  function scrambleText(element) {
    if (!element || element.dataset.scrambling === 'true') return;
    
    if (!element.dataset.originalText) {
      element.dataset.originalText = element.innerText;
    }
    
    const originalText = element.dataset.originalText;
    element.dataset.scrambling = 'true';
    let iteration = 0;
    
    clearInterval(element.scrambleInterval);

    element.scrambleInterval = setInterval(() => {
      element.innerText = originalText
        .split('')
        .map((char, index) => {
          if (char === ' ' || char === '\n') return char;
          if (index < iteration) {
            return originalText[index];
          }
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');

      if (iteration >= originalText.length) {
        clearInterval(element.scrambleInterval);
        element.innerText = originalText;
        element.dataset.scrambling = 'false';
      }

      iteration += 1 / 2;
    }, 25);
  }

  // 3. Intersection Observer
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.1
  };

  const scrambleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        scrambleText(el);
      }
    });
  }, observerOptions);

  function observeScrambleTargets(container) {
    const targets = container.querySelectorAll('.box-tag, .analysis-meta');
    targets.forEach(target => {
      scrambleObserver.observe(target);
    });
  }

  observeScrambleTargets(document);

  // 4. 탭 전환
  const tabBtns = document.querySelectorAll('.album-tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  if (tabBtns.length > 0) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const currentBtn = e.currentTarget;
        const targetTabId = currentBtn.getAttribute('data-tab');

        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        currentBtn.classList.add('active');
        const targetContent = document.getElementById(targetTabId);
        if (targetContent) {
          targetContent.classList.add('active');
          observeScrambleTargets(targetContent);
        }
      });
    });
  }

  // =========================================================
  // 5. CD 오디오 플레이어 (수정 완료: 드래그 앤 드롭 전용)
  // =========================================================
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

  // 오디오 안전 재생 (파일명 공백 인코딩 포함)
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

  // 케이스 클릭 시 CD 튀어나오기 (자동 장착 안 됨)
  cdCases.forEach(caseItem => {
    caseItem.addEventListener('click', (e) => {
      // CD 알맹이를 눌렀을 때는 케이스 토글 작동 방지
      if (e.target.closest('.cd-disc')) return;

      const isAlreadyActive = caseItem.classList.contains('active-selected');
      cdCases.forEach(c => c.classList.remove('active-selected'));
      
      if (!isAlreadyActive) {
        caseItem.classList.add('active-selected');
      }
    });
  });

  // CD 드래그 시작 (이벤트 전파 차단으로 버튼 먹통 방지)
  cds.forEach(cd => {
    cd.addEventListener('dragstart', (e) => {
      e.stopPropagation();
      e.dataTransfer.setData('text/plain', cd.id);
    });
  });

  // 턴테이블 CD 장착 처리
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

  // Drop Zone Drag & Drop
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

  // EJECT 버튼
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

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

    // 실시간 타임라인 업데이트
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

    // 타임라인 클릭/드래그 시 위치 이동
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

  // 3. Intersection Observer (스크롤 시 감지하여 애니메이션 실행)
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

  // 전체 페이지 대상 등록
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
          // 탭 활성화 시 내부 요소 재관찰
          observeScrambleTargets(targetContent);
        }
      });
    });
  }

  // 5. CD 플레이어 드래그 앤 드롭
  let activeCD = null;

  const albumCovers = document.querySelectorAll('.album-cover');
  albumCovers.forEach(cover => {
    cover.addEventListener('click', (e) => {
      e.stopPropagation();
      const parent = cover.parentElement;
      if (parent) parent.classList.toggle('open');
    });
  });

  const cds = document.querySelectorAll('.cd-disc');
  cds.forEach(cd => {
    cd.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', cd.id);
      e.dataTransfer.setData('title', cd.getAttribute('data-title') || '');
    });
  });

  const dropZone = document.getElementById('dropZone');
  const playerDeck = document.getElementById('playerDeck');
  const cdTray = document.getElementById('cdTray');
  const trackDisplay = document.getElementById('trackDisplay');
  const trayText = document.getElementById('trayText');
  const ejectBtn = document.getElementById('ejectBtn');

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
      const title = e.dataTransfer.getData('title');
      const cdElement = document.getElementById(cdId);

      if (cdElement) {
        if (activeCD) ejectCD();

        activeCD = cdElement;
        cdTray.appendChild(cdElement);
        cdElement.classList.add('inserted', 'spinning');

        if (trackDisplay) {
          trackDisplay.innerText = title + ' [PLAYING]';
          scrambleText(trackDisplay);
        }
        if (trayText) trayText.innerText = '';
      }
    });
  }

  function ejectCD() {
    if (trackDisplay) {
      trackDisplay.innerText = 'NO RECORD LOADED';
      scrambleText(trackDisplay);
    }
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

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

  // 5. CD 오디오 플레이어 (오디오 재생 로직 포함)
  let activeCD = null;
  const audioPlayer = document.getElementById('audioPlayer');

  const cds = document.querySelectorAll('.cd-disc');
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
      const audioSrc = e.dataTransfer.getData('src');
      const cdElement = document.getElementById(cdId);

      if (cdElement) {
        if (activeCD) ejectCD();

        activeCD = cdElement;
        cdTray.appendChild(cdElement);
        cdElement.classList.add('inserted', 'spinning');

        // 음원 재생 로직
        if (audioPlayer && audioSrc) {
          audioPlayer.src = audioSrc;
          audioPlayer.play().catch(err => console.log("Audio playback blocked:", err));
        }

        if (trackDisplay) {
          trackDisplay.innerText = title + ' [PLAYING]';
          scrambleText(trackDisplay);
        }
        if (trayText) trayText.innerText = '';
      }
    });
  }

  function ejectCD() {
    // 오디오 정지
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
    }

    if (trackDisplay) {
      trackDisplay.innerText = 'NO RECORD LOADED';
      scrambleText(trackDisplay);
    }
    if (trayText) trayText.innerText = 'DROP HERE';

    if (activeCD) {
      activeCD.classList.remove('spinning', 'inserted');
      const num = activeCD.id.replace('cd', '');
      const targetAlbum = document.getElementById(`album${num}`);
      
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

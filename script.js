document.addEventListener('DOMContentLoaded', () => {

  /* -------------------------------------------------------------
   * 1. DARK MODE TOGGLE
   * ------------------------------------------------------------- */
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
    });
  }

  /* -------------------------------------------------------------
   * 2. VIDEO PLAYER CONTROLS
   * ------------------------------------------------------------- */
  const teaserVideo = document.getElementById('teaserVideo');
  const playControl = document.getElementById('playControl');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const timelineContainer = document.getElementById('timelineContainer');
  const timelineProgress = document.getElementById('timelineProgress');
  const currentTimeDisplay = document.getElementById('currentTimeDisplay');
  const durationDisplay = document.getElementById('durationDisplay');

  function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function togglePlay() {
    if (!teaserVideo) return;
    if (teaserVideo.paused) {
      teaserVideo.play();
      if (playControl) playControl.classList.add('is-playing');
      if (playPauseBtn) playPauseBtn.textContent = 'PAUSE';
    } else {
      teaserVideo.pause();
      if (playControl) playControl.classList.remove('is-playing');
      if (playPauseBtn) playPauseBtn.textContent = 'PLAY';
    }
  }

  if (teaserVideo) {
    const videoFrame = document.getElementById('videoFrame');
    if (videoFrame) videoFrame.addEventListener('click', togglePlay);
    if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlay);

    teaserVideo.addEventListener('loadedmetadata', () => {
      if (durationDisplay) durationDisplay.textContent = formatTime(teaserVideo.duration);
    });

    teaserVideo.addEventListener('timeupdate', () => {
      if (currentTimeDisplay) currentTimeDisplay.textContent = formatTime(teaserVideo.currentTime);
      if (timelineProgress && teaserVideo.duration) {
        const percent = (teaserVideo.currentTime / teaserVideo.duration) * 100;
        timelineProgress.style.width = `${percent}%`;
      }
    });

    if (timelineContainer) {
      timelineContainer.addEventListener('click', (e) => {
        const rect = timelineContainer.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        teaserVideo.currentTime = pos * teaserVideo.duration;
      });
    }
  }

  /* -------------------------------------------------------------
   * 3. TAB NAVIGATION SYSTEM
   * ------------------------------------------------------------- */
  const tabButtons = document.querySelectorAll('.album-tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const activeContent = document.getElementById(targetTab);
      if (activeContent) {
        activeContent.classList.add('active');
        triggerReveals();
      }
    });
  });

/* -------------------------------------------------------------
   * 4. [개선] 빠른 한글 디코딩 (글자 수 제한 & 짧은 틱틱 연출)
   * ------------------------------------------------------------- */
  // 한글 무작위 샘플 글자 세트
  const koreanNoiseChars = '가나다라마바사아자차카타파하한글음악청춘엔딩해피미래도쿄감시학교자유';

  function playFastKoreanDecode(element) {
    if (element.decodeInterval) clearInterval(element.decodeInterval);

    if (!element.dataset.originalText) {
      element.dataset.originalText = element.textContent.trim();
    }
    const targetText = element.dataset.originalText;
    const length = targetText.length;

    let frameCount = 0;
    const totalFrames = 6; // 총 6번만 빠르게 틱틱거리며 (약 0.15초) 즉시 정착

    element.decodeInterval = setInterval(() => {
      frameCount++;
      let result = '';

      for (let i = 0; i < length; i++) {
        const char = targetText[i];

        // 공백 및 줄바꿈은 그대로 유지
        if (char === ' ' || char === '\n') {
          result += char;
          continue;
        }

        // 전체 텍스트 중 뒤쪽 약 30% 영역 혹은 랜덤한 일부 글자만 아주 잠깐 노이즈 처리
        const progressThreshold = (frameCount / totalFrames) * length;
        
        if (i < progressThreshold || Math.random() > 0.4) {
          // 정착된 진짜 한글 글자
          result += char;
        } else {
          // 순간적으로 바뀌는 한글 무작위 글자
          const randomKorean = koreanNoiseChars[Math.floor(Math.random() * koreanNoiseChars.length)];
          result += `<span class="scramble-noise">${randomKorean}</span>`;
        }
      }

      element.innerHTML = result;

      // 지정한 프레임 횟수에 도달하면 곧바로 완성형 원본 텍스트로 고정
      if (frameCount >= totalFrames) {
        clearInterval(element.decodeInterval);
        element.innerHTML = targetText;
      }
    }, 25); // 25ms 간격으로 빠르게 전환
  }

  const observerOptions = {
    threshold: 0.15
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');

        const textNodes = entry.target.querySelectorAll('.scramble-text');
        textNodes.forEach(node => playFastKoreanDecode(node));
      } else {
        // 화면 밖으로 나가면 클래스 제거 (재스크롤 시 재실행)
        entry.target.classList.remove('is-visible');
      }
    });
  }, observerOptions);

  function triggerReveals() {
    const revealItems = document.querySelectorAll('.reveal-item');
    revealItems.forEach(item => {
      revealObserver.observe(item);
    });
  }

  triggerReveals();

  /* -------------------------------------------------------------
   * 5. TURNTABLE & CD STACK INTERACTION
   * ------------------------------------------------------------- */
  const caseItems = document.querySelectorAll('.case-item');
  const jewelCases = document.querySelectorAll('.opened-jewel-case');
  const stagePlaceholder = document.getElementById('stagePlaceholder');
  const cdDiscs = document.querySelectorAll('.cd-disc');
  const dropZone = document.getElementById('dropZone');
  const playerDeck = document.getElementById('playerDeck');
  const cdTray = document.getElementById('cdTray');
  const tonearm = document.getElementById('tonearm');
  const trackDisplay = document.getElementById('trackDisplay');
  const ejectBtn = document.getElementById('ejectBtn');
  const audioPlayer = document.getElementById('audioPlayer');

  let currentLoadedDisc = null;

  caseItems.forEach(item => {
    item.addEventListener('click', () => {
      const caseId = item.getAttribute('data-case');

      caseItems.forEach(i => i.classList.remove('active-selected'));
      jewelCases.forEach(j => j.classList.remove('active'));

      item.classList.add('active-selected');
      if (stagePlaceholder) stagePlaceholder.style.display = 'none';

      const targetJewel = document.getElementById(`jewel-${caseId}`);
      if (targetJewel) {
        targetJewel.classList.add('active');
      }
    });
  });

  cdDiscs.forEach(disc => {
    disc.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', disc.id);
    });
  });

  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (playerDeck) playerDeck.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
      if (playerDeck) playerDeck.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      if (playerDeck) playerDeck.classList.remove('drag-over');

      const discId = e.dataTransfer.getData('text/plain');
      const disc = document.getElementById(discId);

      if (disc) {
        loadCDToPlayer(disc);
      }
    });
  }

  function loadCDToPlayer(disc) {
    if (currentLoadedDisc) {
      ejectCD();
    }

    currentLoadedDisc = disc;
    cdTray.appendChild(disc);
    disc.classList.add('inserted');

    const title = disc.getAttribute('data-title') || 'UNKNOWN TRACK';
    const src = disc.getAttribute('data-src');

    if (trackDisplay) trackDisplay.textContent = `${title} [PLAYING]`;

    if (tonearm) tonearm.classList.add('playing');
    disc.classList.add('spinning');

    if (src && audioPlayer) {
      audioPlayer.src = src;
      audioPlayer.play().catch(() => {});
    }
  }

  function ejectCD() {
    if (!currentLoadedDisc) return;

    const discId = currentLoadedDisc.id;
    const jewelCase = document.getElementById(`jewel-${discId}`);

    if (jewelCase) {
      const tray = jewelCase.querySelector('.case-tray');
      if (tray) {
        currentLoadedDisc.classList.remove('inserted', 'spinning');
        tray.appendChild(currentLoadedDisc);
      }
    }

    if (tonearm) tonearm.classList.remove('playing');
    if (trackDisplay) trackDisplay.textContent = 'NO RECORD LOADED';

    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
    }

    currentLoadedDisc = null;
  }

  if (ejectBtn) ejectBtn.addEventListener('click', ejectCD);

});

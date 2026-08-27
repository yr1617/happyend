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
        initScrambleObserver();
      }
    });
  });

  /* -------------------------------------------------------------
   * 4. REFERO DESIGN STYLE - 한글 빠른 디코딩 연출
   * ------------------------------------------------------------- */
  const koreanNoiseChars = '가나다라마바사아자차카타파하한글음악청춘엔딩해피미래도쿄감시학교자유';

  // 순수 텍스트 노드만 안전하게 추출하는 함수 (이미지, HTML 구조 보존)
  function getTextNodes(node) {
    let textNodes = [];
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.nodeValue.trim().length > 0) {
        textNodes.push(node);
      }
    } else {
      for (let child of node.childNodes) {
        textNodes = textNodes.concat(getTextNodes(child));
      }
    }
    return textNodes;
  }

  function playFastKoreanDecode(element) {
    // 최초 1회 원본 HTML 구조 보존 백업
    if (!element.dataset.originalHTML) {
      element.dataset.originalHTML = element.innerHTML;
    }

    if (element.decodeInterval) clearInterval(element.decodeInterval);

    const textNodes = getTextNodes(element);
    if (textNodes.length === 0) return;

    // 각 노드의 순수 텍스트 백업
    const originalTexts = textNodes.map(tn => tn.nodeValue);

    let frameCount = 0;
    const totalFrames = 5; // 0.12초간 아주 짧게 틱틱거림

    element.decodeInterval = setInterval(() => {
      frameCount++;

      textNodes.forEach((node, index) => {
        const targetText = originalTexts[index];
        const charArray = Array.from(targetText);

        if (frameCount >= totalFrames) {
          node.nodeValue = targetText;
        } else {
          node.nodeValue = charArray.map(char => {
            if (char === ' ' || char === '\n' || char === '\r') return char;
            return Math.random() > 0.4 ? char : koreanNoiseChars[Math.floor(Math.random() * koreanNoiseChars.length)];
          }).join('');
        }
      });

      if (frameCount >= totalFrames) {
        clearInterval(element.decodeInterval);
        element.innerHTML = element.dataset.originalHTML; // 원본 HTML 및 이미지 복구
      }
    }, 25);
  }

  const scrambleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        playFastKoreanDecode(entry.target);
      } else {
        if (entry.target.dataset.originalHTML) {
          entry.target.innerHTML = entry.target.dataset.originalHTML;
        }
      }
    });
  }, {
    threshold: 0.05
  });

  function initScrambleObserver() {
    const textNodes = document.querySelectorAll('.scramble-text');
    textNodes.forEach(node => {
      scrambleObserver.observe(node);
    });
  }

  initScrambleObserver();

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

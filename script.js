window.addEventListener('DOMContentLoaded', () => {

  // 0. 다크 모드 토글
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', (e) => {
      e.preventDefault();
      document.body.classList.toggle('dark-mode');
    });
  }

  // 1. 비디오 재생 / 일시정지
  const video = document.getElementById('teaserVideo');
  const videoFrame = document.getElementById('videoFrame');
  const playControl = document.getElementById('playControl');

  if (videoFrame && video) {
    videoFrame.addEventListener('click', () => {
      if (video.paused) {
        video.play().catch(err => console.log("Video play error:", err));
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', () => {
      if (playControl) playControl.classList.add('is-playing');
    });

    video.addEventListener('pause', () => {
      if (playControl) playControl.classList.remove('is-playing');
    });

    video.addEventListener('ended', () => {
      if (playControl) playControl.classList.remove('is-playing');
    });
  }

  // 2. 텍스트 스크램블 / 랜덤 타이핑 애니메이션
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

      iteration += 1 / 2; // 재생 속도 조절
    }, 25);
  }

  function triggerScrambleEffects(container) {
    const scrambleTargets = container.querySelectorAll('.box-tag, .analysis-meta, .char-tag');
    scrambleTargets.forEach((el, index) => {
      setTimeout(() => {
        scrambleText(el);
      }, index * 80);
    });
  }

  // 초기 로딩 시 활성화된 탭 애니메이션
  const activeTab = document.querySelector('.tab-content.active');
  if (activeTab) triggerScrambleEffects(activeTab);

  // 3. 탭 전환
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
          triggerScrambleEffects(targetContent); // 탭 클릭 시 스크램블 재실행
        }
      });
    });
  }

  // 4. CD 플레이어 드래그 앤 드롭
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

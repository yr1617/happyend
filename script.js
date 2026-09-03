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
   * 2. SCROLL REVEAL ANIMATION (안 보이던 요소 강제 표시)
   * ------------------------------------------------------------- */
  const revealItems = document.querySelectorAll('.reveal-item');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, {
    threshold: 0.05
  });

  function initRevealObserver() {
    revealItems.forEach(item => {
      revealObserver.observe(item);
    });
  }

  initRevealObserver();

  /* -------------------------------------------------------------
   * 3. VIDEO PLAYER CONTROLS
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
   * 4. TAB NAVIGATION SYSTEM
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
        // 탭 전환 시 요소 안 보임 방지 처리
        const itemsInTab = activeContent.querySelectorAll('.reveal-item');
        itemsInTab.forEach(item => item.classList.add('is-visible'));
      }
    });
  });

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


  /* -------------------------------------------------------------
   * 6. MAIL SYSTEM INTERACTION (유타 & 코우 이메일 AI 시뮬레이션)
   * ------------------------------------------------------------- */
  const charCards = document.querySelectorAll('.char-card');
  const mailTargetImg = document.getElementById('mailTargetImg');
  const mailTargetName = document.getElementById('mailTargetName');
  const mailTargetEmail = document.getElementById('mailTargetEmail');
  const mailHistory = document.getElementById('mailHistory');
  const mailForm = document.getElementById('mailForm');
  const mailSubject = document.getElementById('mailSubject');
  const mailBody = document.getElementById('mailBody');

  let activeCharacter = 'yuta'; // 기본 수신자

  const characterProfiles = {
    yuta: {
      name: 'YUTA',
      email: 'yuta.subwoofer@happyend.tokyo',
      img: 'Yuta.jpg'
    },
    kou: {
      name: 'KOU',
      email: 'kou.02042@happyend.tokyo',
      img: 'Kou.jpg'
    }
  };

  // 캐릭터 전환 이벤트
  charCards.forEach(card => {
    card.addEventListener('click', () => {
      charCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      activeCharacter = card.getAttribute('data-character');
      const profile = characterProfiles[activeCharacter];

      if (profile) {
        mailTargetImg.src = profile.img;
        mailTargetName.textContent = profile.name;
        mailTargetEmail.textContent = profile.email;
        renderMailHistory();
      }
    });
  });

  // 메일 내역 데이터베이스 (로컬 메모리)
  const mailStore = {
    yuta: [
      {
        sender: 'yuta',
        subject: 'Re: 어이',
        body: 'ㅋㅋ 뭐야 메일은 또 처음 받아보네. 오늘 밤에 club-room 올 거임? 베이스 스피커 새로 세팅해 뒀으니까 들으러 오든가.',
        time: '18:24'
      }
    ],
    kou: [
      {
        sender: 'kou',
        subject: 'Re: 학교 쪽 카메라 관련',
        body: '학교 정문 쪽 카메라 위치가 이상하게 바뀌었어. 다들 별생각 없는 것 같은데... 그게 정말 그냥 안전 때문일까. 모르겠다.',
        time: '19:10'
      }
    ]
  };

  function renderMailHistory() {
    if (!mailHistory) return;
    mailHistory.innerHTML = '';

    const history = mailStore[activeCharacter] || [];
    history.forEach(mail => {
      const isUser = mail.sender === 'user';
      const mailEl = document.createElement('div');
      mailEl.className = `mail-item ${isUser ? 'sent-by-user' : 'received-from-char'}`;

      const avatarSrc = isUser ? '01_club.jpg' : characterProfiles[activeCharacter].img;
      const senderName = isUser ? 'YOU' : characterProfiles[activeCharacter].name;

      mailEl.innerHTML = `
        <div class="mail-item-header">
          <img src="${avatarSrc}" alt="${senderName}" class="mail-avatar-mini">
          <div class="mail-meta-info">
            <span class="mail-item-sender">${senderName}</span>
            <span class="mail-item-time">${mail.time}</span>
          </div>
        </div>
        <div class="mail-item-subject">SUB: ${escapeHtml(mail.subject)}</div>
        <div class="mail-item-body">${escapeHtml(mail.body)}</div>
      `;

      mailHistory.appendChild(mailEl);
    });

    mailHistory.scrollTop = mailHistory.scrollHeight;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // 메일 전송 이벤트
  if (mailForm) {
    mailForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const subject = mailSubject.value.trim();
      const body = mailBody.value.trim();

      if (!subject || !body) return;

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      // 1. 유저 메일 보관함에 추가
      mailStore[activeCharacter].push({
        sender: 'user',
        subject: subject,
        body: body,
        time: timeStr
      });

      renderMailHistory();

      mailSubject.value = '';
      mailBody.value = '';

      // 2. 답변 대기 로딩 표시 후 AI 응답 생성 시뮬레이션
      setTimeout(() => {
        const reply = generateCharacterReply(activeCharacter, subject, body);
        mailStore[activeCharacter].push({
          sender: activeCharacter,
          subject: `Re: ${subject}`,
          body: reply,
          time: `${now.getHours().toString().padStart(2, '0')}:${(now.getMinutes() + 1).toString().padStart(2, '0')}`
        });
        renderMailHistory();
      }, 1200);
    });
  }

  // AI 캐릭터별 규칙에 따른 자동 응답 로직
  function generateCharacterReply(char, subject, text) {
    const isAiQuestion = text.includes('AI') || text.includes('인공지능') || text.includes('챗봇') || text.includes('프로그램');
    
    if (char === 'yuta') {
      if (isAiQuestion) {
        return "ㅋㅋㅋ 뭐야 갑자기? 뭔 소리야 AI라니. 너 오늘 어디 머리 부딪혔냐? 쓸데없는 소리 말고 있다 밤에 음악이나 들으러 와라.";
      }
      if (text.includes('음악') || text.includes('DJ') || text.includes('클럽') || text.includes('곡')) {
        return "오 진짜? 베이스 울릴 때 그 느낌 제대로 아네. 이번에 리믹스해 본 트랙 있는데 밤에 와서 한 번 들어봐. 완전 괜찮아 ㅋㅋㅋ";
      }
      if (text.includes('코우') || text.includes('감시') || text.includes('학교') || text.includes('진지')) {
        return "아 코우 이야기구나... 요즘 코우 왜 이렇게 진지해졌는지 모르겠어. 어차피 졸업하면 끝나는 일 같은데 굳이 복잡하게 생각해야 하나? 그냥 예전처럼 재미있게 놀면 좋을 텐데 말이야.";
      }
      return "ㅋㅋ 읽어봤는데 재밌네. 너무 어렵게 생각하지 마, 어차피 어떻게든 되겠지 뭐! 그냥 지금 재밌으면 된 거 아니야?";
    } else if (char === 'kou') {
      if (isAiQuestion) {
        return "무슨 말을 하는 건지 모르겠네. 내가 AI라니... 그런 식의 장난은 별로 재미없어. 할 말 있으면 제대로 해줘.";
      }
      if (text.includes('감시') || text.includes('학교') || text.includes('카메라') || text.includes('사회')) {
        return "그게 생각보다 간단한 문제가 아니잖아. 다들 안전 때문이라고 쉽게 넘어가는데, 왜 아무도 그 시선이 누구를 향해 있는지 이상하게 안 여기는지 모르겠어... 나만 예민한 건가?";
      }
      if (text.includes('유타') || text.includes('음악') || text.includes('친구')) {
        return "유타는... 아직 그런 걸 깊게 생각하고 싶지 않은 거겠지. 유타랑 같이 음악 듣던 때가 싫은 건 아닌데, 예전처럼 아무렇지 않게 그냥 즐기기만 하는 건 이젠 좀 힘들 것 같아.";
      }
      return "보내준 메일 잘 읽었어. 그 문제에 대해서는 나도 요즘 계속 고민 중이야. 확신할 수는 없지만, 그렇다고 그냥 가만히 보고만 있을 수는 없잖아.";
    }
    return "메일 확인했어.";
  }

  // 초기 렌더링
  renderMailHistory();

});

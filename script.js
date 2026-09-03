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
   * 2. SCROLL REVEAL ANIMATION
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
   * 6. MAIL SYSTEM INTERACTION (자연스러운 캐릭터 대화 엔진)
   * ------------------------------------------------------------- */
  const charCards = document.querySelectorAll('.char-card');
  const mailTargetImg = document.getElementById('mailTargetImg');
  const mailTargetName = document.getElementById('mailTargetName');
  const mailTargetEmail = document.getElementById('mailTargetEmail');
  const mailHistory = document.getElementById('mailHistory');
  const mailForm = document.getElementById('mailForm');
  const mailSubject = document.getElementById('mailSubject');
  const mailBody = document.getElementById('mailBody');

  let activeCharacter = 'yuta';

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

  // 1. 초기 메일 내역을 빈 배열로 시작 (사전 메시지 제거)
  const mailStore = {
    yuta: [],
    kou: []
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

  function renderMailHistory() {
    if (!mailHistory) return;
    mailHistory.innerHTML = '';

    const history = mailStore[activeCharacter] || [];

    if (history.length === 0) {
      const emptyNotice = document.createElement('div');
      emptyNotice.className = 'mail-empty-notice';
      emptyNotice.textContent = '보낸 메일이 없습니다. 첫 메시지를 작성해보세요.';
      mailHistory.appendChild(emptyNotice);
      return;
    }

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

  // 메일 전송 이벤트 처리
  if (mailForm) {
    mailForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const subject = mailSubject.value.trim();
      const body = mailBody.value.trim();

      if (!subject || !body) return;

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      // 사용자 메일 저장
      mailStore[activeCharacter].push({
        sender: 'user',
        subject: subject,
        body: body,
        time: timeStr
      });

      renderMailHistory();

      mailSubject.value = '';
      mailBody.value = '';

      // 자연스러운 답변 시간 딜레이 (1초~1.8초)
      const delay = Math.floor(Math.random() * 800) + 1000;
      setTimeout(() => {
        const replyText = buildDynamicResponse(activeCharacter, subject, body);
        mailStore[activeCharacter].push({
          sender: activeCharacter,
          subject: `Re: ${subject.startsWith('Re:') ? subject.replace(/^Re:\s*/, '') : subject}`,
          body: replyText,
          time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
        });
        renderMailHistory();
      }, delay);
    });
  }

  /* -------------------------------------------------------------
   * 7. 동적 자연어 대화 조합 엔진 (고정 문장 배제)
   * ------------------------------------------------------------- */
  function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function buildDynamicResponse(char, subject, body) {
    const text = (subject + ' ' + body).toLowerCase();

    // 입력 내용 주제 감지 (참고용 인덱스)
    const isMusic = /음악|곡|트랙|베이스|스피커|파티|클럽|소리|리믹스/.test(text);
    const isSurveillance = /감시|카메라|학교|교장|벌점|규칙|시스템|통제/.test(text);
    const isFriendship = /코우|유타|친구|요즘|사이|얼굴|이야기|생각/.test(text);
    const isAiMeta = /ai|인공지능|챗봇|프로그램|로봇/.test(text);

    if (char === 'yuta') {
      if (isAiMeta) {
        const aiReplies = [
          "무슨 소리야 갑자기? 무슨 말을 하고 싶은 건지 잘 모르겠는데.",
          "응? 갑자기 인공지능 얘기는 왜 나와. 메일 잘못 보낸 거 아니야?",
          "글쎄, 무슨 말인지 이해하기 어렵네. 오늘 좀 피곤한가 봐."
        ];
        return getRandomItem(aiReplies);
      }

      if (isMusic) {
        const opens = ["메일 읽었어.", "보내준 얘기 생각하고 있었어.", "음악 얘기 하니까 반갑네."];
        const middles = [
          "요즘 새로 맞춰보는 리믹스가 있는데, 스피커 울림이 지난번이랑은 확실히 달라.",
          "부실에서 베이스 세팅 좀 다듬어봤거든. 시간 날 때 와서 들어봐.",
          "다 같이 음악 들으면서 있을 때가 제일 좋긴 해. 복잡한 생각도 좀 사라지고."
        ];
        const closes = [
          "오늘 밤에도 동아리 방에 있을 것 같은데 오든가.",
          "나중에 시간 되면 부실 들러.",
          "다음에 와서 들려줄게."
        ];
        return `${getRandomItem(opens)} ${getRandomItem(middles)} ${getRandomItem(closes)}`;
      }

      if (isSurveillance) {
        const opens = ["학교 분위기 요즘 좀 답답하긴 하지.", "메일 잘 확인했어.", "그 문제 가지고 다들 말이 많네."];
        const middles = [
          "카메라 늘어난 건 짜증 나긴 한데, 너무 그것만 신경 쓰다 보면 하루가 답답해지더라고.",
          "코우도 요즘 그 생각 때문에 머리 아파하는 것 같고... 난 그냥 우리 할 일 하면서 지내고 싶어.",
          "어차피 졸업도 얼마 안 남았는데 매번 신경 쓰기도 지치고 그렇네."
        ];
        const closes = [
          "아무튼 너무 스트레스 받지 마.",
          "다음에 만나면 얘기 더 하자.",
          "일단 오늘 할 일부터 해야지."
        ];
        return `${getRandomItem(opens)} ${getRandomItem(middles)} ${getRandomItem(closes)}`;
      }

      if (isFriendship) {
        const opens = ["생각해 보니 그렇네.", "요즘 다들 각자 고민이 많은 것 같아.", "응, 무슨 말인지 알아."];
        const middles = [
          "코우랑은 어릴 때부터 계속 같이 지내왔으니까 잘 알지. 다만 요즘은 서로 바라보는 방향이 조금씩 달라지는 느낌이 들 때가 있어.",
          "다 같이 모여서 아무 생각 없이 웃을 때가 제일 좋은데, 요즘은 다들 조금씩 서먹해진 것 같기도 하고.",
          "서로 상황이 달라져도 그래도 친구는 친구니까 너무 걱정 안 하려고."
        ];
        const closes = [
          "나중에 다 같이 모여서 밥이나 먹자.",
          "조만간 부실에서 보자.",
          "언제 한번 다 같이 만나자."
        ];
        return `${getRandomItem(opens)} ${getRandomItem(middles)} ${getRandomItem(closes)}`;
      }

      // 일반/일상 대화
      const genOpens = ["메일 고마워.", "잘 읽어봤어.", "요즘 별일 없지?"];
      const genMiddles = [
        "오늘 수업은 생각보다 길게 느껴졌네. 졸업 전까지 조용히 지나갔으면 좋겠는데.",
        "그냥 평소처럼 지내는 중이야. 동아리 방 정리를 좀 해야 하는데 미루고 있네.",
        "날씨도 그렇고 요즘 분위기가 전체적으로 좀 차분한 것 같아."
      ];
      const genCloses = [
        "또 연락해.",
        "다음에 만나서 얘기 나누자.",
        "좋은 하루 보내."
      ];
      return `${getRandomItem(genOpens)} ${getRandomItem(genMiddles)} ${getRandomItem(genCloses)}`;

    } else if (char === 'kou') {
      if (isAiMeta) {
        const aiReplies = [
          "무슨 말을 하려는 건지 잘 이해하지 못했어.",
          "장난치는 거라면 그다지 재미있진 않네. 할 말이 있으면 편하게 해줘.",
          "갑자기 그게 무슨 소리야. 내가 이상한 말을 한 적이 있었나?"
        ];
        return getRandomItem(aiReplies);
      }

      if (isSurveillance) {
        const opens = ["메일 잘 받았어.", "나도 그 문제에 대해 계속 보고 있었어.", "생각보다 상황이 가볍지 않은 것 같아."];
        const middles = [
          "다들 안전을 위한 거라고 말하지만, 시선이 우리를 향해 있다는 사실은 변하지 않잖아.",
          "교문에 들어설 때마다 기분이 이상해. 단순히 규칙의 문제가 아니라 우리 삶을 통제하려는 것 같아.",
          "유타나 다른 친구들은 너무 깊게 생각하지 말라고 하지만, 난 그냥 넘어가기가 어렵네."
        ];
        const closes = [
          "너는 어떻게 생각하는지 궁금하다.",
          "나중에 시간 되면 조금 더 이야기해보자.",
          "조심해서 다녀."
        ];
        return `${getRandomItem(opens)} ${getRandomItem(middles)} ${getRandomItem(closes)}`;
      }

      if (isMusic) {
        const opens = ["음악 얘기구나.", "메일 확인했어.", "유타가 만든 곡 들었어?"];
        const middles = [
          "유타랑 같이 음악 듣거나 작업할 때는 그래도 마음이 편해져.",
          "요즘은 소리에 집중하는 시간이 고맙게 느껴져. 시끄러운 생각들이 잠시 멈추니까.",
          "부실 스피커 소리가 요즘 들어 더 선명하게 들리는 것 같기도 하고."
        ];
        const closes = [
          "다음에 부실 들어갈 때 얘기해 줘.",
          "음악 들으러 들를게.",
          "천천히 더 들어보자."
        ];
        return `${getRandomItem(opens)} ${getRandomItem(middles)} ${getRandomItem(closes)}`;
      }

      if (isFriendship) {
        const opens = ["고마워, 무슨 뜻인지 알아.", "생각을 많이 하게 되네.", "솔직하게 적어줘서 고마워."];
        const middles = [
          "유타와는 어릴 때부터 항상 함께였지만, 요즘은 나 스스로 판단해야 할 일들이 많아진 것 같아.",
          "다들 그대로인데 나만 다른 생각을 하는 건가 싶어서 마음이 복잡할 때가 있어.",
          "서로 방식은 달라도 친구들을 아끼는 마음은 변함없어. 다만 표현하기가 쉽지 않네."
        ];
        const closes = [
          "늘 신경 써줘서 고마워.",
          "다음에 차분하게 이야기하자.",
          "나중에 부실에서 보자."
        ];
        return `${getRandomItem(opens)} ${getRandomItem(middles)} ${getRandomItem(closes)}`;
      }

      // 일반/일상 대화
      const genOpens = ["메일 잘 읽었어.", "보내준 내용 확인했어.", "잘 지내지?"];
      const genMiddles = [
        "요즘 학교 분위기가 전보다 더 경직된 것 같아서 마음이 편치 않아.",
        "졸업이 다가오니까 여러 생각이 드네. 앞으로 어떻게 될지도 모르겠고.",
        "도서관에 들렀다가 들어가는 길이야. 여전히 생각할 건 많지만 잘 지내고 있어."
      ];
      const genCloses = [
        "또 연락 줘.",
        "오늘 하루 잘 마무리해.",
        "조만간 보자."
      ];
      return `${getRandomItem(genOpens)} ${getRandomItem(genMiddles)} ${getRandomItem(genCloses)}`;
    }

    return "메일 확인했어. 조만간 또 연락할게.";
  }

  // 초기 상태 렌더링
  renderMailHistory();

});

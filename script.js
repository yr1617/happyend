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
   * 6. MAIL SYSTEM INTERACTION
   * ------------------------------------------------------------- */
  const charCards = document.querySelectorAll('.char-card');
  const mailTargetImg = document.getElementById('mailTargetImg');
  const mailTargetName = document.getElementById('mailTargetName');
  const mailTargetEmail = document.getElementById('mailTargetEmail');
  const mailHistory = document.getElementById('mailHistory');
  const mailForm = document.getElementById('mailForm');
  const mailSubject = document.getElementById('mailSubject');
  const mailBody = document.getElementById('mailBody');
  const mailLoadingIndicator = document.getElementById('mailLoadingIndicator');

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

  const mailStore = {
    yuta: [],
    kou: []
  };

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

    // '보낸 메일이 없습니다' 안내 문구 완전 제거 (내역이 없으면 여백 유지)
    if (history.length === 0) {
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

  if (mailForm) {
    mailForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const subject = mailSubject.value.trim();
      const body = mailBody.value.trim();

      if (!subject || !body) return;

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      mailStore[activeCharacter].push({
        sender: 'user',
        subject: subject,
        body: body,
        time: timeStr
      });

      renderMailHistory();

      mailSubject.value = '';
      mailBody.value = '';

      // 답장 대기 중: 점 3개 애니메이션 표시
      if (mailLoadingIndicator) {
        mailLoadingIndicator.style.display = 'flex';
      }

      const replyText = await fetchAiMailResponse(activeCharacter, subject, body, mailStore[activeCharacter]);

      // 답장 수신 완료: 점 3개 애니메이션 숨김
      if (mailLoadingIndicator) {
        mailLoadingIndicator.style.display = 'none';
      }

      const replyTime = new Date();
      const replyTimeStr = `${replyTime.getHours().toString().padStart(2, '0')}:${replyTime.getMinutes().toString().padStart(2, '0')}`;

      mailStore[activeCharacter].push({
        sender: activeCharacter,
        subject: `Re: ${subject.startsWith('Re:') ? subject.replace(/^Re:\s*/, '') : subject}`,
        body: replyText,
        time: replyTimeStr
      });

      renderMailHistory();
    });
  }

  /* -------------------------------------------------------------
   * 7. AI API 메일 연동 (Netlify Serverless Function 활용)
   * ------------------------------------------------------------- */
  async function fetchAiMailResponse(char, currentSubject, currentBody, historyList) {
    const systemPrompts = {
      yuta: `당신은 영화 'HAPPYEND'의 주인공 '유타(YUTA)'입니다.
- 음악, 베이스, 동아리 파티, 친구들과 함께하는 순간을 좋아하는 남고생입니다.
- 말투 및 페르소나: 과도하게 거칠거나 양아치 같지 않으며, 무심한 듯하면서도 담백하고 친근한 말투를 유지합니다.
- 핵심 지침:
  1. 키워드에만 의존하지 마세요. 사용자가 보낸 이메일의 제목과 본문의 핵심 질문/의도를 정확히 파악하여 직접 답하세요.
  2. 같은 단어(예: 음악, 코우, 학교)가 등장하더라도 질문 내용에 따라 구체적으로 다르게 답변하세요.
  3. 주어진 이전 대화 내역(history)이 있다면 해당 문맥을 이어받아 답변하세요.
  4. 자신이 AI나 프로그램이라는 사실을 언급하지 마세요.`,

      kou: `당신은 영화 'HAPPYEND'의 주인공 '코우(KOU)'입니다.
- 유타의 절친한 친구로 음악을 좋아하지만, 학교의 감시 시스템과 현실적인 문제에 대해 진중하게 고민하는 남고생입니다.
- 말투 및 페르소나: 지나치게 시적이거나 철학적으로 어려운 말투를 피하고, 생각이 깊고 솔직한 평범한 남학생 말투를 사용하세요.
- 핵심 지침:
  1. 키워드에만 의존하지 마세요. 사용자가 보낸 이메일의 제목과 본문의 핵심 질문/의도를 정확히 파악하여 직접 답하세요.
  2. 같은 단어가 나오더라도 질문의 구체적인 의도에 맞게 다르게 답변하세요.
  3. 주어진 이전 대화 내역(history)이 있다면 해당 문맥을 이어받아 답변하세요.
  4. 자신이 AI나 프로그램이라는 사실을 언급하지 마세요.`
    };

    const messages = [
      { role: "system", content: systemPrompts[char] || systemPrompts.yuta }
    ];

    // 과거 이메일 히스토리 반영
    const pastHistory = historyList.slice(0, historyList.length - 1);
    pastHistory.forEach(item => {
      if (item.sender === 'user') {
        messages.push({ role: "user", content: `[보낸 메일]\n제목: ${item.subject}\n내용: ${item.body}` });
      } else {
        messages.push({ role: "assistant", content: item.body });
      }
    });

    // 신규 수신 메일 반영
    messages.push({
      role: "user",
      content: `[수신 메일]\n제목: ${currentSubject}\n내용: ${currentBody}`
    });

    try {
      // netlify.toml 리다이렉트와 연결되는 단축 경로 사용
      const response = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages })
      });

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || "메일을 읽긴 했는데, 뭐라고 답해야 할지 잘 모르겠네.";

    } catch (error) {
      console.error("AI Response Error:", error);
      return "메일을 확인하긴 했는데... 지금 네트워크 상태가 좀 안 좋네. 나중에 다시 답장할게.";
    }
  }

  renderMailHistory();

});

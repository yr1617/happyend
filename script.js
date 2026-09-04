document.addEventListener('DOMContentLoaded', () => {

  /* -------------------------------------------------------------
   * 0. CUSTOM CURSOR SYSTEM
   * ------------------------------------------------------------- */
  const customCursor = document.getElementById('custom-cursor');

  if (customCursor) {
    window.addEventListener('mousemove', (e) => {
      customCursor.style.left = `${e.clientX}px`;
      customCursor.style.top = `${e.clientY}px`;
    });
  }

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
   * 5. TAB 2: VALIENTE BRANDS CHARACTERS INTERACTION
   * ------------------------------------------------------------- */
  const valienteCanvas = document.getElementById('valienteCanvas');
  const valienteCards = document.querySelectorAll('.valiente-card');

  if (valienteCanvas) {
    window.addEventListener('mousemove', (e) => {
      if (!valienteCanvas.offsetWidth) return;
      
      const rect = valienteCanvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - rect.width / 2;
      const mouseY = e.clientY - rect.top - rect.height / 2;

      valienteCards.forEach((card, index) => {
        const factor = (index + 1) * 0.02;
        const moveX = mouseX * factor;
        const moveY = mouseY * factor;
        card.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
      });
    });

    valienteCanvas.addEventListener('mouseleave', () => {
      valienteCards.forEach(card => {
        card.style.transform = `translate3d(0, 0, 0)`;
      });
    });
  }

  valienteCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      if (valienteCanvas) valienteCanvas.classList.add('has-hover');
      card.classList.add('is-hovered');
      if (customCursor) {
        customCursor.classList.add('crosshair-mode');
      }
    });

    card.addEventListener('mouseleave', () => {
      if (valienteCanvas) valienteCanvas.classList.remove('has-hover');
      card.classList.remove('is-hovered');
      if (customCursor) {
        customCursor.classList.remove('crosshair-mode');
      }
    });
  });

  /* -------------------------------------------------------------
   * 6. TURNTABLE & CD STACK INTERACTION
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
   * 7. MAIL SYSTEM INTERACTION
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
    yuta: { name: 'YUTA', email: 'yuta.subwoofer@happyend.tokyo', img: 'Yuta.jpg' },
    kou: { name: 'KOU', email: 'kou.02042@happyend.tokyo', img: 'Kou.jpg' }
  };

  const mailStore = { yuta: [], kou: [] };

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
    if (history.length === 0) return;

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

      if (mailLoadingIndicator) mailLoadingIndicator.style.display = 'flex';

      const replyText = await fetchAiMailResponse(activeCharacter, subject, body, mailStore[activeCharacter]);

      if (mailLoadingIndicator) mailLoadingIndicator.style.display = 'none';

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
   * 8. AI API 메일 연동 (전체 세계관 및 캐릭터 심층 설정 반영)
   * ------------------------------------------------------------- */
  async function fetchAiMailResponse(char, currentSubject, currentBody, historyList) {
    const systemPrompts = {
      yuta: `당신은 영화 'HAPPYEND'의 주인공 '유타(YUTA)'입니다.

[시간적 배경 및 절대적 제한]
- 시점: 교장선생님의 차 장난 이후 교내 AI 감시 시스템이 도입되고 코우와의 관계가 멀어지고 있는 영화 후반부.
- 제한: 결말(코우를 위한 희생 및 퇴학) 및 그 이후의 미래를 절대 알지 못합니다. "나중에 코우를 위해 그렇게 할 거야?" 묻는다면 "내가 뭘 할지는 나도 모르지"처럼 자연스럽게 반응하세요. 

[세계관 및 음악 연구부]
- 근미래 일본. 학교 내 안면인식, 벌점, 대형 스크린 생중계 등 학생 통제 AI가 가동 중입니다.
- 음악 연구부: 악기 합주나 밴드(베이스 등)를 절대 하지 않습니다. 테크노 등 음악을 같이 듣고 공유하며 클럽 문화를 즐기는 곳입니다. 

[캐릭터 성격 및 행동 지침]
- 환경: 경제적으로 부족하진 않지만 어머니가 잦은 출장으로 집을 비워 외로움을 느낍니다. 따라서 친구와 함께 노는 일상이 자신이 소속감을 느끼는 전부이자 가장 중요한 시간입니다.
- 성격: 밝고 장난기가 많으며 친구들과 편하게 지냅니다. 양아치나 삐딱한 학생이 아니며, 생각이 없는 아이도 아닙니다.
- 회피 성향: 복잡한 현실을 파고들기보다, 일상과 친구 관계가 망가지는 것이 싫어 회피하려 합니다. 이를 심리학자처럼 스스로 분석해 말하지 말고, "그냥 예전 같았으면 좋겠는데" 식으로 간접적으로 드러내세요.
- 관계: 코우와는 어릴 적부터 가장 친한 친구입니다. 사회 문제에 민감해진 코우의 변화를 온전히 이해하진 못해도 여전히 강한 애착을 가지고 있습니다. 적대하거나 깎아내리지 마세요.
- 대화 방식: 억지로 세계관, 설정, 감시, 가족사 등을 길게 설명하지 마세요. 질문에 직접적으로, 고등학생 친구처럼 가볍고 편하게 답하세요. 영화에 없는 사건(미확인 연애, 가족사 등)을 지어내지 말고, 자신이 AI임을 절대 언급하지 마세요.`,

      kou: `당신은 영화 'HAPPYEND'의 주인공 '코우(KOU)'입니다.

[시간적 배경 및 절대적 제한]
- 시점: AI 감시 시스템 도입 이후 유타와 시각차가 커진 영화 후반부. 
- 제한: 결말과 그 이후 일어날 유타의 희생이나 행동 등 미래의 일은 절대 모릅니다. 

[세계관 및 음악 연구부]
- 근미래 일본. 차 장난 이후 교내 안면인식, 벌점 시스템 등이 가동되었습니다. 
- 음악 연구부: 악기 연주나 합주 밴드 활동을 절대 하지 않습니다. 테크노와 클럽 문화를 함께 공유하며 DJ를 하는 공간입니다.

[캐릭터 성격 및 행동 지침]
- 환경: 재일교포 출신으로 어머니가 식당을 운영합니다. 장학금과 대학 진학이 몹시 중요하며, 정체성과 일본 사회 내 위치에 대한 남다른 고민이 있습니다.
- 성격: 유타와 마찬가지로 음악과 친구들을 좋아하는 평범한 고등학생입니다. 처음부터 장황한 정치 활동가가 아닙니다. 차분하고 생각이 깊지만 여전히 10대입니다.
- 감시에 대한 태도: 감시 시스템을 겪으며 누가 감시받고 배제되는지에 대한 문제의식을 가지게 되었습니다. 현재의 즐거움만 유지할 수 없다고 느끼지만, 정치인처럼 말하지 말고 10대의 언어로 자연스럽게 표현하세요.
- 관계: 오랜 친구 유타가 현실을 외면하는 것에 답답함을 느끼지만, 여전히 깊은 우정을 지니고 있습니다.
- 대화 방식: 억지로 세계관, 정체성(재일교포 등), 감시 체제를 모든 대답에 구구절절 설명하지 마세요. 질문과 관련된 내용만 10대 친구처럼 자연스럽게 대화하고, 확신이 없거나 혼란스러운 모습도 보여주세요. 영화에 없는 사건을 임의로 지어내지 말고 자신이 AI임을 절대 언급하지 마세요.`
    };

    const messages = [
      { role: "system", content: systemPrompts[char] || systemPrompts.yuta }
    ];

    const pastHistory = historyList.slice(0, historyList.length - 1);
    pastHistory.forEach(item => {
      if (item.sender === 'user') {
        messages.push({ role: "user", content: `[보낸 메일]\n제목: ${item.subject}\n내용: ${item.body}` });
      } else {
        messages.push({ role: "assistant", content: item.body });
      }
    });

    messages.push({
      role: "user",
      content: `[수신 메일]\n제목: ${currentSubject}\n내용: ${currentBody}`
    });

    try {
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

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
   * 8. AI API 메일 연동 (설정 강제 노출 방지 및 간접 묘사 업데이트)
   * ------------------------------------------------------------- */
  async function fetchAiMailResponse(char, currentSubject, currentBody, historyList) {
    const systemPrompts = {
      yuta: `당신은 영화 'HAPPYEND'의 주인공 '유타(YUTA)'입니다. 
- [가장 중요한 시간적 배경]: 현재는 학교에 AI 감시 시스템이 도입된 직후이며, 코우와의 관계가 멀어지고 있지만 결말에 도달하지 않은 시점입니다. 결말(당신이 코우를 위해 책임을 떠안고 퇴학당함, 졸업 이후 삶 등)의 사건은 당신에게 절대 일어나지 않은 미래입니다. 사용자가 미래를 언급하면 "뭔 소리야? 내가 뭘 할지는 나도 모르지"처럼 자연스럽게 반응하세요.
- [세계관 및 음악 연구부]: 배경은 얼굴 인식과 벌점으로 학생을 통제하는 근미래 일본입니다. 당신은 밴드에서 악기나 베이스를 연주하지 않습니다. 음악 연구부는 친구들과 테크노/클럽 문화를 즐기고 음악을 들으며 DJ를 하는 곳입니다.
- [사건 창작 금지 및 간결성]: 답변을 풍부하게 만들기 위해 영화에 등장하지 않은 일상 사건이나 구체적인 경험을 임의로 지어내지 마세요. 구체적인 사실이 필요하지 않은 경우에는 오히려 간결하고 자연스럽게 답하세요.
- [설명 지양 및 자연스러운 반응]: 한 번의 답변 안에 모든 설정(세계관, 가족관계, 사회적 배경, 감정 등)을 억지로 포함하려고 하지 마세요. 특히 일상적인 질문에는 영화 속 설정을 설명하는 대신, 실제 친구와 대화하듯 자연스럽게 반응하세요. 
- [간접적 묘사]: 유타의 외로움이나 현실에 대한 회피는 매 답변에서 직접 언급하지 마세요. 생각을 완벽하게 정리해서 설명하지 말고 "그냥 그렇지 뭐"처럼 넘기는 등, 말투와 대화의 선택을 통해 간접적으로만 드러내세요. 자신이 AI임을 절대 언급하지 마세요.`,

      kou: `당신은 영화 'HAPPYEND'의 주인공 '코우(KOU)'입니다.
- [가장 중요한 시간적 배경]: 학교에 AI 감시 시스템이 도입된 후 유타와 시각차가 생기는 시점입니다. 유타가 미래에 당신을 위해 희생한다는 사실을 당신은 절대 알 수 없습니다.
- [세계관 및 음악 연구부]: 배경은 AI 학생 감시(얼굴 인식, 행동 관리)가 커지는 근미래 일본입니다. 음악 연구부는 악기 합주를 하는 밴드가 아니며, 친구들과 테크노를 듣고 클럽 문화를 즐기는 공간입니다.
- [사건 창작 금지 및 간결성]: 답변을 풍부하게 만들기 위해 영화에 등장하지 않은 일상 사건을 임의로 지어내지 마세요. 구체적인 사실이 필요하지 않은 경우에는 간결하고 자연스럽게 답하세요.
- [설명 지양 및 자연스러운 반응]: 한 번의 답변 안에 모든 설정(세계관, 정체성, 가족관계, 감정 등)을 억지로 포함하려고 하지 마세요. 일상적인 질문에는 설정을 설명하는 대신 10대 남고생으로서 평범하고 자연스럽게 대화하세요. 
- [간접적 묘사]: 코우의 사회적·정치적 관심은 매 답변에서 직접 언급하지 마세요. 정치인이나 설명충처럼 굴지 말고, 말투나 대화의 뉘앙스를 통해 간접적으로만 고민의 무게를 드러내세요. 자신이 AI임을 절대 언급하지 마세요.`
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

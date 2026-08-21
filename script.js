document.addEventListener('DOMContentLoaded', () => {
  // 1. 재생 버튼 예고편 스트리밍 대화상자
  const playBtn = document.getElementById('playBtn');
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      alert('[SYSTEM NOTICE] TEASER VIDEO STREAMING INITIATED.\n\nFILM: HAPPYEND (2025.04)\nDIR: NEO SORA');
    });
  }

  // 2. 스크롤 시 감시 바운딩 박스 하이라이트 효과 (Intersection Observer)
  const sceneCards = document.querySelectorAll('.scene-card');

  const observerOptions = {
    threshold: 0.3
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bbox = entry.target.querySelector('.bounding-box-ui');
        if (bbox) {
          bbox.style.transform = 'scale(1.02)';
          bbox.style.borderColor = '#ff1a00';
          bbox.style.transition = 'transform 0.4s ease, border-color 0.4s ease';
        }
      }
    });
  }, observerOptions);

  sceneCards.forEach(card => observer.observe(card));

  // 3. 내비게이션 내 부드러운 스크롤 이동
  const navLinks = document.querySelectorAll('.corner-nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  // 1. 영상 재생/일시정지 제어
  const video = document.getElementById('teaserVideo');
  const videoFrame = document.getElementById('videoFrame');
  const playControl = document.getElementById('playControl');

  if (video && videoFrame && playControl) {
    const togglePlay = () => {
      if (video.paused) {
        video.play().then(() => {
          playControl.style.opacity = '0';
        }).catch(err => console.error("Playback error:", err));
      } else {
        video.pause();
        playControl.style.opacity = '1';
      }
    };

    videoFrame.addEventListener('click', togglePlay);

    video.addEventListener('ended', () => {
      playControl.style.opacity = '1';
    });
  }

  // 2. 상단으로 스크롤 이동 버튼 기능
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});

window.addEventListener('DOMContentLoaded', () => {
  // 1. 최상단 이동 버튼 동작 (상단 우측 전체 아이콘 영역 클릭 처리)
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // 2. 비디오 재생 / 일시정지 동작
  const video = document.getElementById('teaserVideo');
  const videoFrame = document.getElementById('videoFrame');
  const playControl = document.getElementById('playControl');

  if (video && videoFrame && playControl) {
    videoFrame.addEventListener('click', () => {
      if (video.paused) {
        video.play().then(() => {
          playControl.style.opacity = '0';
        }).catch(err => {
          console.error("비디오 재생 중 오류가 발생했습니다:", err);
        });
      } else {
        video.pause();
        playControl.style.opacity = '1';
      }
    });

    // 영상 재생이 끝났을 때 다시 재생 버튼 보이게 처리
    video.addEventListener('ended', () => {
      playControl.style.opacity = '1';
    });
  }
});

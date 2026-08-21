// 인라인 onclick 핸들러에서 직접 실행되는 확실한 함수들
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

function toggleVideoPlay() {
  const video = document.getElementById('teaserVideo');
  const playControl = document.getElementById('playControl');

  if (video && playControl) {
    if (video.paused) {
      video.play().then(() => {
        playControl.style.opacity = '0';
      }).catch(err => {
        console.error("비디오 재생 실패:", err);
      });
    } else {
      video.pause();
      playControl.style.opacity = '1';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('teaserVideo');
  const playControl = document.getElementById('playControl');

  if (video && playControl) {
    video.addEventListener('ended', () => {
      playControl.style.opacity = '1';
    });
  }
});

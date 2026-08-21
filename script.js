document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('teaserVideo');
  const playControl = document.getElementById('playControl');

  if (video && playControl) {
    // 비디오 클릭 또는 기본 컨트롤 작동 시 재생 상태 반영
    video.addEventListener('play', () => {
      playControl.style.opacity = '0';
    });

    video.addEventListener('pause', () => {
      playControl.style.opacity = '1';
    });

    video.addEventListener('ended', () => {
      playControl.style.opacity = '1';
    });
  }
});

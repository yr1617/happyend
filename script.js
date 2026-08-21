document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('teaserVideo');
  const videoFrame = document.getElementById('videoFrame');
  const playControl = document.getElementById('playControl');

  if (video && videoFrame) {
    videoFrame.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        playControl.style.opacity = '0';
      } else {
        video.pause();
        playControl.style.opacity = '1';
      }
    });

    video.addEventListener('ended', () => {
      playControl.style.opacity = '1';
    });
  }
});

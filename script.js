document.addEventListener('DOMContentLoaded', () => {
  console.log('VALIENTE SYSTEM: INITIALIZED');

  const video = document.getElementById('teaserVideo');
  const videoFrame = document.querySelector('.video-frame');
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
  }
});

function spawnFlashingStar() {
  const starField = document.getElementById('star-field');
  const star = document.createElement('div');
  star.classList.add('star');

  // Random position
  star.style.top = `${Math.random() * 100}%`;
  star.style.left = `${Math.random() * 100}%`;

  // Random flash duration & delay
  const duration = 1 + Math.random(); // Between 1 and 2 seconds
  star.style.animationDuration = `${duration}s`;
  star.style.animationDelay = `0s`;

  // Remove the star after animation completes
  setTimeout(() => {
    star.remove();
  }, duration * 1000);

  starField.appendChild(star);
}

export function animateOverlay({ minOpacity, maxOpacity, opacityStep }) {
  const overlay = document.getElementById("background-overlay");
  let opacity = (minOpacity + maxOpacity) / 2;
  let increasing = true;

  function updateOpacity() {
    if (increasing) {
      opacity += opacityStep;
      if (opacity >= maxOpacity) increasing = false;
    } else {
      opacity -= opacityStep;
      if (opacity <= minOpacity) increasing = true;
    }
    overlay.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
    requestAnimationFrame(updateOpacity);
  }

  updateOpacity();
}

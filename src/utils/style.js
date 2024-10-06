export function setLogoWidth(logoWidth) {
  document.documentElement.style.setProperty("--logo-width", `${logoWidth}px`);
}

export function setAnimationDuration(screenWidth, logoWidth) {
  const animationDuration = (screenWidth + logoWidth) / 50; // Slower animation
  document.documentElement.style.setProperty(
    "--animation-duration",
    `${animationDuration}s`
  );
}

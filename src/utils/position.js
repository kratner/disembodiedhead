export function getRandomPosition(head, isPortrait) {
  const headRect = head.getBoundingClientRect();
  const containerRect = document.body.getBoundingClientRect();

  let x, y;
  if (isPortrait) {
    x = Math.random() * (containerRect.width - 200) + 100;
    y =
      headRect.bottom +
      Math.random() * (containerRect.height - headRect.bottom - 100);
  } else {
    x = Math.random() * (containerRect.width - 200) + 100;
    y = Math.random() * (containerRect.height - 200) + 100;
  }

  return [x, y];
}

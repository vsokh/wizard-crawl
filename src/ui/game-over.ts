export function setupGameOver(): void {
  const btn = document.getElementById('btn-restart');
  if (btn) {
    btn.addEventListener('click', () => location.reload());
  }
  const victoryBtn = document.getElementById('btn-victory-restart');
  if (victoryBtn) {
    victoryBtn.addEventListener('click', () => location.reload());
  }
}

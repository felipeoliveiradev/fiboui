

export const createRipple = (event: { clientX: number, clientY: number }, button: HTMLElement, color: string = 'rgba(255, 255, 255, 0.3)') => {
  if (!button) return;
  const circle = document.createElement('span');
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;

  const rect = button.getBoundingClientRect();  
  
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - rect.left - radius}px`;
  circle.style.top = `${event.clientY - rect.top - radius}px`;
  circle.style.position = 'absolute';
  circle.style.borderRadius = '50%';
  circle.style.transform = 'scale(0)';
  circle.style.animation = 'fibo-ripple 600ms linear';
  circle.style.backgroundColor = color;
  circle.style.pointerEvents = 'none';

  const rippleContainer = button.querySelector('.fibo-ripple-container') || button;
  rippleContainer.appendChild(circle);

  setTimeout(() => {
    circle.remove();
  }, 600);
};

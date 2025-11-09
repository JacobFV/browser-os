// Performance optimization notes
// - Ensure drag operations run at 60fps using requestAnimationFrame
// - Window open should complete in < 200ms
// - Shell TTI (Time to Interactive) should be < 2s
// - Use React.memo for expensive components
// - Implement virtual scrolling for long lists
// - Lazy load app components

export const performanceTargets = {
  dragFPS: 60,
  windowOpenMs: 200,
  ttiMs: 2000,
};


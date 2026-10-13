// ÂNCORA: o GSAP não tem esse respeito embutido, então conferimos a preferência do sistema
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

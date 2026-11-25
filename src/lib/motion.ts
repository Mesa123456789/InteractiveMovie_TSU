export const timing = { feedback: 0.15, ui: 0.28, panel: 0.46, cinema: 0.88, ambient: 22 };
export const travelSeconds = 0.7;
export const travelEase = [0.35, 0, 0.25, 1] as const;
export const ease = [0.22, 1, 0.36, 1] as const;
export const spring = { type: "spring", stiffness: 260, damping: 28, mass: 0.82 } as const;
export const rise = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } };
export const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.055 } } };

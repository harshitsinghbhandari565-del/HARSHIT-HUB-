/**
 * Academic subject registry — TAD §5 (shared/config) / Dev Plan §11.6 (B5).
 *
 * `subject` is an enum in the content schema (TAD §8.2): an unmapped subject
 * fails the build, prompting an explicit two-line addition here. Gradient
 * recipes follow Dev Plan §11.6 (attributed to Design Spec v1 §9.2.1).
 */
export const SUBJECTS = ['Science', 'History', 'English', 'Geography', 'Math'] as const;

export type Subject = (typeof SUBJECTS)[number];

/** Subject → gradient (Design §11.2.1 visual identifiers), token-based. */
export const SUBJECT_GRADIENTS: Record<Subject, string> = {
  Science: 'linear-gradient(135deg, var(--color-success-100), var(--color-success-500))',
  History: 'linear-gradient(135deg, var(--color-warm-100), var(--color-warm-700))',
  English: 'linear-gradient(135deg, var(--color-primary-100), var(--color-primary-500))',
  Geography: 'linear-gradient(135deg, var(--color-accent-100), var(--color-accent-500))',
  Math: 'linear-gradient(135deg, var(--color-warning-100), var(--color-warning-500))',
};

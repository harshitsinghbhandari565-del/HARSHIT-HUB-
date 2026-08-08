/**
 * features/contact — public interface (TAD §5.1 rule 2).
 *
 * The contact form island enhances the Netlify form on /contact (the form
 * works without JavaScript — invariant I1). Netlify handles submission,
 * spam filtering, and notification with no backend code (ADR-0009).
 */
export { default as ContactForm } from './islands/ContactForm';

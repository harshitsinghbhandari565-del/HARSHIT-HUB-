/**
 * ContactForm island (Dev Plan T-G2, Design §11.10) — hydrates
 * client:visible. Enhances the Netlify form (which already works without
 * JavaScript — invariant I1) with inline validation, async submission,
 * and success/error states.
 *
 * Netlify contract (TAD §18.4): data-netlify + netlify-honeypot; the
 * honeypot field is visually hidden with aria-hidden + tabindex -1 (not
 * display:none — TAD §15.6). Honeypot handling is Netlify's job; the
 * client never rejects on it.
 */
import { useRef, useState } from 'preact/hooks';

import styles from './ContactForm.module.css';

type Status = 'idle' | 'submitting' | 'success' | 'error';

interface FieldErrors {
  name?: string;
  email?: string;
  message?: string;
}

function validate(name: string, email: string, message: string): FieldErrors {
  const errors: FieldErrors = {};
  if (name === '') errors.name = 'Please enter your name.';
  if (email === '') errors.email = 'Please enter your email address.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = 'Please enter a valid email address.';
  if (message === '') errors.message = 'Please enter a message.';
  return errors;
}

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<FieldErrors>({});
  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = async (event: Event) => {
    event.preventDefault();
    const form = formRef.current;
    if (!form) return;

    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();

    const nextErrors = validate(name, email, message);
    setErrors(nextErrors);
    const firstInvalid = (['name', 'email', 'message'] as const).find(
      (field) => nextErrors[field],
    );
    if (firstInvalid) {
      form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    setStatus('submitting');
    try {
      const body = new URLSearchParams();
      data.forEach((value, key) => body.append(key, String(value)));
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      if (!response.ok) throw new Error(`submit failed (${response.status})`);
      setStatus('success');
      form.reset();
    } catch {
      setStatus('error'); // values are preserved — the form is untouched
    }
  };

  if (status === 'success') {
    return (
      <div class={styles.success} role="status">
        <svg class={styles.successIcon} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
          <path d="m9 11 3 3L22 4"></path>
        </svg>
        <p class={styles.successText}>Message sent! I'll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      class={styles.form}
      name="contact"
      method="POST"
      action="/contact"
      data-netlify="true"
      netlify-honeypot="bot-field"
      noValidate
      onSubmit={onSubmit}
    >
      <input type="hidden" name="form-name" value="contact" />

      {/* Honeypot — bots fill it, Netlify discards the submission.
          Off-screen (not display:none), aria-hidden, tab-skipped
          (TAD §15.6). */}
      <div class={styles.honeypot} aria-hidden="true">
        <label htmlFor="contact-bot-field">
          Don't fill this out if you're human
        </label>
        <input id="contact-bot-field" name="bot-field" tabindex={-1} autocomplete="off" />
      </div>

      <div class={styles.field}>
        <label class={styles.label} htmlFor="contact-name">Name</label>
        <input
          class={styles.input}
          id="contact-name"
          name="name"
          type="text"
          autocomplete="name"
          required
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? 'contact-name-error' : undefined}
        />
        {errors.name && (
          <p class={styles.fieldError} id="contact-name-error">{errors.name}</p>
        )}
      </div>

      <div class={styles.field}>
        <label class={styles.label} htmlFor="contact-email">Email</label>
        <input
          class={styles.input}
          id="contact-email"
          name="email"
          type="email"
          autocomplete="email"
          required
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? 'contact-email-error' : undefined}
        />
        {errors.email && (
          <p class={styles.fieldError} id="contact-email-error">{errors.email}</p>
        )}
      </div>

      <div class={styles.field}>
        <label class={styles.label} htmlFor="contact-message">Message</label>
        <textarea
          class={`${styles.input} ${styles.textarea}`}
          id="contact-message"
          name="message"
          rows={5}
          required
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
        />
        {errors.message && (
          <p class={styles.fieldError} id="contact-message-error">{errors.message}</p>
        )}
      </div>

      <button class={styles.submit} type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Sending…' : 'Send Message'}
      </button>

      {status === 'error' && (
        <p class={styles.formError} role="alert">
          Something went wrong sending your message. Please try again.
        </p>
      )}

      <p class={styles.privacy}>
        Your information is only used to respond to your message and is never
        shared.
      </p>
    </form>
  );
}

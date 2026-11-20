'use client';

import { useId, useState } from 'react';
import type { Locale } from '@/i18n/config';
import { fill, getDict } from '@/i18n/ui';

type Errors = Partial<Record<'name' | 'email' | 'message', string>>;

/**
 * No backend on purpose: the form validates, then opens the visitor's mail client
 * with the message composed, so nothing is stored and nothing can fail silently.
 */
export function ContactForm({ to, locale }: { to: string; locale: Locale }) {
  const t = getDict(locale).contact;
  const TOPICS = t.topics;
  const id = useId();
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'opened' | 'copied'>('idle');

  const validate = (f: FormData): Errors => {
    const e: Errors = {};
    const name = String(f.get('name') ?? '').trim();
    const email = String(f.get('email') ?? '').trim();
    const message = String(f.get('message') ?? '').trim();
    if (!name) e.name = t.errName;
    if (!email) e.email = t.errEmail;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = t.errEmailFormat;
    if (message.length < 20) e.message = t.errMessage;
    return e;
  };

  const onSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const f = new FormData(ev.currentTarget);
    const e = validate(f);
    setErrors(e);
    if (Object.keys(e).length) {
      const first = Object.keys(e)[0];
      ev.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    const subject = `${f.get('topic')} — ${f.get('name')}`;
    const body = `${f.get('message')}\n\n— ${f.get('name')}\n${f.get('email')}`;
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus('opened');
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(to);
      setStatus('copied');
    } catch {
      setStatus('idle');
    }
  };

  const field = 'w-full rounded-[var(--radius-md)] border bg-raised px-4 py-3 text-[0.9375rem] text-ink placeholder:text-ink-4 transition-colors focus:border-accent';

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-6" aria-describedby={`${id}-status`}>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className="label mb-2.5 block text-ink-3">{t.name}</label>
          <input id={`${id}-name`} name="name" autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? `${id}-name-err` : undefined} className={`${field} ${errors.name ? 'border-dormant' : 'border-line'}`} />
          {errors.name ? <p id={`${id}-name-err`} className="mt-2 text-[0.8125rem] text-dormant">{errors.name}</p> : null}
        </div>
        <div>
          <label htmlFor={`${id}-email`} className="label mb-2.5 block text-ink-3">{t.email}</label>
          <input id={`${id}-email`} name="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? `${id}-email-err` : undefined} className={`${field} ${errors.email ? 'border-dormant' : 'border-line'}`} />
          {errors.email ? <p id={`${id}-email-err`} className="mt-2 text-[0.8125rem] text-dormant">{errors.email}</p> : null}
        </div>
      </div>

      <div>
        <label htmlFor={`${id}-topic`} className="label mb-2.5 block text-ink-3">{t.topic}</label>
        <select id={`${id}-topic`} name="topic" className={`${field} cursor-pointer border-line`} defaultValue={TOPICS[0]}>
          {TOPICS.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor={`${id}-message`} className="label mb-2.5 block text-ink-3">{t.message}</label>
        <textarea id={`${id}-message`} name="message" rows={6} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? `${id}-message-err` : `${id}-message-hint`} placeholder={t.placeholder} className={`${field} resize-y ${errors.message ? 'border-dormant' : 'border-line'}`} />
        {errors.message ? (
          <p id={`${id}-message-err`} className="mt-2 text-[0.8125rem] text-dormant">{errors.message}</p>
        ) : (
          <p id={`${id}-message-hint`} className="mt-2 text-[0.8125rem] text-ink-4">{t.hint}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button type="submit" className="label cursor-pointer rounded-[var(--radius-md)] bg-accent px-6 py-3.5 font-semibold text-accent-ink transition-opacity hover:opacity-90">
          {t.compose}
        </button>
        <button type="button" onClick={copy} className="label cursor-pointer rounded-[var(--radius-md)] border border-edge px-5 py-3.5 text-ink hover:bg-hover">
          {t.copy}
        </button>
      </div>

      <p id={`${id}-status`} role="status" aria-live="polite" className="min-h-[1.25rem] text-[0.875rem] text-ink-3">
        {status === 'opened' ? t.opened : null}
        {status === 'copied' ? fill(t.copied, { email: to }) : null}
      </p>
    </form>
  );
}

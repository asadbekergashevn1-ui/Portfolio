import type { Metadata } from 'next';
import { ContactForm } from '@/components/contact-form';
import { getProfile } from '@/content/localize';
import { CONTACT_EMAIL } from '@/content/profile';
import { isLocale } from '@/i18n/config';
import { alternates } from '@/i18n/meta';
import { getDict } from '@/i18n/ui';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDict(locale);
  return { title: t.meta.contactTitle, description: t.meta.contactDescription, alternates: alternates(locale, '/contact') };
}

export default async function ContactPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : 'en';
  const t = getDict(locale);
  const profile = getProfile(locale);
  return (
    <div className="mx-auto max-w-[1240px] px-5 pt-14 sm:px-8 sm:pt-20">
      <div className="grid gap-16 lg:grid-cols-[1fr_1.15fr]">
        <header>
          <p className="label mb-4 text-accent">{t.contact.eyebrow}</p>
          <h1 className="display balance text-[clamp(2.5rem,5.5vw,4.25rem)] text-ink">{t.contact.title}</h1>
          <p className="pretty mt-7 max-w-[44ch] text-[1.0625rem] leading-[1.7] text-ink-2">{t.contact.intro}</p>

          <dl className="mt-12 space-y-6 border-t border-line pt-8">
            {profile.contact.map((c) => (
              <div key={c.kind}>
                <dt className="label mb-1.5 text-ink-4">{c.label}</dt>
                <dd>
                  <a href={c.href} className="link-underline text-[1rem] text-ink" {...(c.kind !== 'email' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                    {c.value}
                  </a>
                </dd>
              </div>
            ))}
            <div>
              <dt className="label mb-1.5 text-ink-4">{t.contact.basedIn}</dt>
              <dd className="text-[1rem] text-ink">{profile.location} · {t.contact.remote}</dd>
            </div>
          </dl>
        </header>

        <section aria-label={t.contact.form} className="card p-6 sm:p-10">
          <ContactForm to={CONTACT_EMAIL} locale={locale} />
        </section>
      </div>
    </div>
  );
}

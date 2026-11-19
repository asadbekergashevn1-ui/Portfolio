import type { Metadata } from 'next';
import { ContactForm } from '@/components/contact-form';
import { CONTACT_EMAIL, profile } from '@/content/profile';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Get in touch with ${profile.name} about a new product, an existing system, or an automation.`,
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-[1240px] px-5 pt-14 sm:px-8 sm:pt-20">
      <div className="grid gap-16 lg:grid-cols-[1fr_1.15fr]">
        <header>
          <p className="label mb-4 text-accent">Contact</p>
          <h1 className="display balance text-[clamp(2.5rem,5.5vw,4.25rem)] text-ink">Tell me what the business does.</h1>
          <p className="pretty mt-7 max-w-[44ch] text-[1.0625rem] leading-[1.7] text-ink-2">
            The most useful first message describes the work people are doing by hand today, and
            what it costs when it goes wrong. I usually reply within two working days.
          </p>

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
              <dt className="label mb-1.5 text-ink-4">Based in</dt>
              <dd className="text-[1rem] text-ink">{profile.location} · works remotely, in English</dd>
            </div>
          </dl>
        </header>

        <section aria-label="Contact form" className="card p-6 sm:p-10">
          <ContactForm to={CONTACT_EMAIL} />
        </section>
      </div>
    </div>
  );
}

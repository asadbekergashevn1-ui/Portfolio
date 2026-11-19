import type { Category, CategorySlug } from './types';

export const categories: Category[] = [
  { slug: 'crm', name: 'CRM & ERP', blurb: 'Systems that hold a business’s money, people and records — and have to be right about all three.' },
  { slug: 'automation', name: 'Automation & AI', blurb: 'Agents that do recurring work nobody was doing, and degrade instead of failing when a model goes down.' },
  { slug: 'mobile', name: 'Mobile', blurb: 'Cross-platform apps for the phones people actually carry, from shuttle dispatch to children’s onboarding.' },
  { slug: 'education', name: 'Education', blurb: 'Tools that teach and assess, built on how learning works rather than how it is usually measured.' },
  { slug: 'websites', name: 'Websites', blurb: 'Sites that turn attention into enquiries, built to load fast on mid-range Android phones.' },
  { slug: 'web-apps', name: 'Web Apps', blurb: 'Focused personal tools, installable and usable offline.' },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function categoryName(slug: CategorySlug): string {
  return getCategory(slug)?.name ?? slug;
}

import jonyKids from './jony-kids-english.mjs';
import levelUp from './level-up.mjs';
import jonyMath from './jony-math.mjs';
import flashy from './flashy.mjs';
import brainTrain from './brain-train.mjs';

export const scenes = [jonyKids, levelUp, jonyMath, flashy, brainTrain];

/** Projects with no demo that can be recorded honestly, and what it would take. */
export const unavailable = [
  { slug: 'xn-crm', reason: 'Self-hosted behind a quick tunnel with no stable public address; its one hosted build is blocked. The staff console needs a seeded tenant to show anything.', needs: 'A demo deployment with a seeded demo tenant (students, payments, attendance), or permission to run its Docker stack here on throwaway data.' },
  { slug: 'jony-taxi', reason: 'Every screen past sign-in needs a Supabase project with its 27 migrations applied; the public build is only the sign-in screen.', needs: 'A throwaway Supabase project with the migrations and seed applied, plus a demo driver and a demo parent account.' },
  { slug: 'ish-ritmi', reason: 'The public build opens on sign-in; getting past it means a real account on the production database.', needs: 'A demo account, or a build pointed at a throwaway Supabase project.' },
  { slug: 'link-board', reason: 'Opens on phone-and-PIN sign-in; signing up to record it would write to the production database.', needs: 'A demo account with a few saved links.' },
];

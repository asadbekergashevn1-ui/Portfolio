import jonyKids from './jony-kids-english.mjs';
import levelUp from './level-up.mjs';
import jonyMath from './jony-math.mjs';
import flashy from './flashy.mjs';
import brainTrain from './brain-train.mjs';
import xnCrm from './xn-crm.mjs';

export const scenes = [jonyKids, levelUp, jonyMath, flashy, brainTrain, xnCrm];

/** Projects with no demo that can be recorded honestly, and what it would take. */
export const unavailable = [
  { slug: 'jony-taxi', reason: 'Every screen past sign-in needs a Supabase backend (auth, REST, realtime). All 27 migrations and the seed were applied to a local Postgres here, but no local Supabase stack could be started: its container images could not be pulled, and running a downloaded API server binary was not permitted in this session. Finding while doing so: the trip generator (generate_daily_trips, migrations 0021/0023/0027) reads centers.seat_capacity and centers.stop_interval_min, which no migration creates — a database built from the migrations alone cannot generate trips.', needs: 'A throwaway Supabase project with the migrations and seed applied (plus the two missing columns), or permission to run a local PostgREST for capture.' },
  { slug: 'ish-ritmi', reason: 'The public build opens on sign-in; getting past it means a real account on the production database.', needs: 'A demo account, or a build pointed at a throwaway Supabase project.' },
  { slug: 'link-board', reason: 'Opens on phone-and-PIN sign-in; signing up to record it would write to the production database.', needs: 'A demo account with a few saved links.' },
];

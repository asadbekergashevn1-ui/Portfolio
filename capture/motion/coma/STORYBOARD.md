# COMA — motion piece storyboard

**Brief.** COMA has no interface — it lives inside Telegram and a terminal — so it cannot be screen-recorded. The piece explains what it actually does, built only from facts in its code and tests. No imitation Telegram UI and no invented messages presented as real: message texts are written as illustrations of the three kinds COMA must tell apart, and labelled as such.

**Format.** 1920×1200 (16:10, matches every card and case study on the site), 60 fps, H.264 yuv420p. **Silent by decision:** the site's cards autoplay muted per the brief, and audio that has not been listened to by a person is not shipped. A soundtrack can be added once someone can audition it.

**Thread.** *The homework window.* Every lesson opens a window in time; COMA watches it, sorts what arrives, and closes it with a verdict. The camera travels along that window as a physical corridor, so the story is literally a journey through one lesson's hour.

**Source facts used** (all from `coma/` and its tests): schedule parsed from the group title; window = lesson start … end + 60 min; early / on time (end −5 … +15) / late / not set; the AI synthesis decides and a second opinion can never turn its "no" into a "yes"; roll-call lists containing the word *homework* are not homework; reports go to the control group's topics; 4.0k lines, 3 dependencies, 23 admin commands, 0 messages written to teacher groups.

## Scenes

### S1 · 0.0–3.6 s · The title is the schedule
Variants: ① the group title splits into labelled chips ② typewriter title, then highlight boxes ③ title card rotates in 3D to reveal fields ④ a clock face assembles from the title's digits.
**Chosen ①** — it demonstrates a real feature (COMA configures itself from the title) with typography alone.
- *Action:* `Junior "Toq 17:00" | X tch` types on; three spans lift off the line on short arcs and land as chips: **17:00 start**, **odd days**, **teacher X**.
- *Space:* chips on a nearer plane than the title; soft shadow on contact.
- *Camera:* slow push-in 1.00→1.06 with a 1.5° roll settling to 0.
- *Out:* the 17:00 chip slides right and becomes the left edge of the time axis.

### S2 · 3.6–8.0 s · The window opens
Variants: ① 2.5D corridor: the hour as a floor receding in perspective ② flat timeline wiping on ③ circular dial sweeping ④ stacked bars filling.
**Chosen ①** — depth gives the camera somewhere to travel and the window something to *be*.
- *Action:* lesson block 17:00–18:30 draws on; the window extends to 19:30; zones tint in: early, **on time 18:25–18:45**, late.
- *Text:* zone labels on the floor plane; `window: lesson start … end + 60 min`.
- *Camera:* dolly along the corridor left→right with a slight upward crane; foreground tick marks pass faster than the far wall (parallax).
- *Out:* camera settles over the window's middle, where cards will land.

### S3 · 8.0–13.4 s · Three things arrive
Variants: ① index cards fall with weight onto the floor at their timestamps ② cards slide in from the right like a feed ③ cards appear as chat bubbles (rejected: reads as fake Telegram UI) ④ cards pinned to the corridor wall.
**Chosen ①** — weight, contact and inertia (skill core), and it places each message *at its time*.
- *Action:* 17:40 a lesson video; 18:12 a roll-call list — *"Homework qilmaganlar: ███, ███"* — names masked; 18:24 an assignment — *"Your homework: Unit 5, p. 42, ex. 3"*. Each lands, bounces once, settles; neighbours nudge.
- *Text:* small caption *illustrative messages* in the corner.
- *Camera:* follows the falling cards with a gentle downward tilt, motion blur on the fastest frames.

### S4 · 13.4–19.2 s · The decision
Variants: ① a scan line passes; cards sort themselves ② magnifier over each card ③ three bins: homework / not homework / unsure ④ a gate the cards must pass.
**Chosen ① + ③ as one action** — the scan *causes* the sort.
- *Action:* the scan crosses; the video card dims and sinks (*media alone is not homework*); the roll-call card is pushed back with **"roster — not homework"**; the assignment lifts and glows.
- *Text:* the rule, set large: **A second opinion can never turn a "no" into a "yes".**
- *Camera:* push in on the lifted card, focus pull, background blurs.
- *Out:* the card flips into the verdict: **✅ HW set · 18:24 · on time**.

### S5 · 19.2–23.4 s · The week adds up
Variants: ① verdict flies into a weekly board; bars fill ② calendar grid fills ③ heat map ④ a growing stack of verdicts.
**Chosen ①** — it is COMA's real weekly score format.
- *Action:* the verdict card shrinks into one row; the camera pulls back to reveal more groups; bars fill to their percentages with the report's ■ blocks.
- *Camera:* pull-back with a slow rise, depth of field on the nearest row.

### S6 · 23.4–28.0 s · End card
Variants: ① the corridor collapses into the wordmark ② wordmark over still board ③ facts typed as a terminal line ④ facts as three measured tiles.
**Chosen ① then ④** — the space the story built folds into the name, then holds still to be read.
- *Text:* **COMA** · *Reads every teacher group. Writes to none.* · tiles: 4.0k lines · 3 dependencies · 0 messages written.
- *Camera:* settles; final 1.6 s static and readable.

## Risks and test
Main risk: deterministic 60 fps rendering of a time-driven HTML scene with depth, blur and motion blur, fast enough to iterate. Test before the full build: render S3 alone and inspect frames at the landing moments.

# Danube Dubai Roadshow, Lagos — landing page

Next.js 15 landing page for the Danube Dubai Roadshow in Lagos (Saturday 12 and Sunday
13 December 2026). The page follows the conversion blueprint
(`danube-roadshow-landing-page-blueprint.md`): hero, track record, belief reframe and
benefits, delivery proof, projects with AED/USD pricing, reviews and investor stories,
programme, seat value, FAQ, two-screen registration, WhatsApp community, pass.

Registrations go to a Google Sheet, scored HOT, WARM or NURTURE. Guests must join the
WhatsApp community to receive their pass. Each project has a WhatsApp enquiry button
with a preset message.

## Run it locally (VS Code)

```bash
npm install
cp .env.example .env.local   # fill in the three values (see below)
npm run dev                  # http://localhost:3000
```

Without `GOOGLE_SCRIPT_URL`, local registrations are printed in the terminal instead
of saved, so you can test the flow before the sheet is ready. In production the form
refuses to submit until the sheet is connected.

## Edit content

| What | File |
| --- | --- |
| City, dates, venue, hours per day, countdown start, capacity | `src/config/event.ts` (`EVENT`) |
| Broker name, registration number, address, reply time | `src/config/event.ts` (`BROKER`) |
| Enquiry WhatsApp number | `src/config/event.ts` (`ENQUIRY_WHATSAPP`) |
| Track record, handed-over buildings, reviews, Nigerian testimonials, paperwork screenshots | `src/config/proof.ts` |
| Benefit stack and belief reframe | `src/components/Statement.tsx` |
| Weekend programme | `src/components/EventInfo.tsx` |
| What a seat includes | `src/components/SeatValue.tsx` |
| FAQ | `src/components/Faq.tsx` |
| The three projects: prices, handover, preset WhatsApp messages | `src/config/properties.ts` |
| Form options (budgets, home types, timelines) | `src/lib/registration.ts` |
| Images and hero video | `public/media/` |

Prices and handover dates were taken from danubeproperties.com in November 2026.
Check them with the Danube team before the event. USD figures are calculated from the
fixed AED/USD peg (3.6725), so they never go stale.

### Social proof: empty blocks stay hidden

`NIGERIAN_TESTIMONIALS` and `PROCESS_SCREENSHOTS` in `src/config/proof.ts` start
empty, and their sections don't render until you add real entries. The page never
shows placeholder testimonials. When you have real handover photographs, replace the
images in `public/media/delivered/` and set `DELIVERY_CAPTION_REAL_PHOTOS = true` for
the stronger "Keys, not renders" caption.

## Connect the Google Sheet

1. Open the sheet, then **Extensions → Apps Script**.
2. Paste in `google-apps-script/Code.gs`. Change `SECRET` to a long random string.
3. Choose the `setup` function in the toolbar and click **Run**. Approve the permissions.
   This creates a `Registrations` tab with the column headers.
4. **Deploy → New deployment → Web app**. Execute as **Me**, access **Anyone**.
   Copy the URL ending in `/exec`.
5. If you edit the script later: **Deploy → Manage deployments → Edit → New version**,
   so the URL stays the same.

Each registration adds a row: date, registration ID, **lead tier**, name, phone, email,
city, day attending, project, budget, home type, main goal, payment preference, Dubai
experience, timeline, guests, consent, whether they joined the WhatsApp community (and
when), ad source tags (`utm_source`, `utm_medium`, `utm_campaign` from the page link)
and device.

**Lead tier** follows the proposal's on-ground sales strategy and is worked out on the
server (`leadTier` in `src/lib/registration.ts`):

- **HOT:** buying within 90 days, with a budget from AED 2M or paying cash
- **WARM:** buying within 90 days, or a budget from AED 2M
- **NURTURE:** everyone else

If you already deployed the earlier version of the script, paste in the new `Code.gs`,
then add a new sheet tab (or clear row 1) and run `setup` again so the headers match.

## Environment variables

Set these in **Vercel → Project → Settings → Environment Variables** (and in
`.env.local` for local work):

| Name | Value |
| --- | --- |
| `GOOGLE_SCRIPT_URL` | The `/exec` URL from step 4 |
| `GOOGLE_SCRIPT_SECRET` | The same string as `SECRET` in `Code.gs` |
| `NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL` | The community invite link, e.g. `https://chat.whatsapp.com/...` |

`NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL` is built into the page, so after changing it you
must **redeploy** for the new link to appear.

## Push to GitHub and deploy

From the project folder in the VS Code terminal:

```bash
git init
git add .
git commit -m "Danube Roadshow landing page"
git branch -M main
git remote add origin https://github.com/Olexweb01-coder/danube-roadshow.git
git push -u origin main
```

If the repo already has a commit (for example a README created on GitHub), run
`git pull origin main --allow-unrelated-histories` before pushing.

Then in Vercel: **Add New → Project → Import** `danube-roadshow`, add the three
environment variables, and click **Deploy**. Vercel detects Next.js automatically.

## How it's built

- **Smooth scrolling:** Lenis (`src/components/SmoothScroll.tsx`), off for people who
  prefer reduced motion.
- **Hero:** the video tightens into a framed window as you scroll (`Hero.tsx`). A
  portrait cut loads on phones.
- **Projects:** one sticky viewport where each project slides over the last
  (`Projects.tsx`). The scroll timeline is documented at the top of the file.
- **Registration:** two screens in `Register.tsx` (seat details, then goals) →
  `/api/register` → Apps Script. Tapping the
  community button calls `/api/community`, which marks the row as joined. Progress is
  kept in the browser, so a guest who leaves before joining returns to that step.
- **Spam:** a hidden field that bots fill in; those submissions are silently dropped.
- **Reduced motion:** all scroll effects switch off and the projects become a plain
  list.

- **Mobile:** a slim "Reserve my seat" + WhatsApp bar replaces the floating button on
  phones, and hides itself over the project panels and the form.
- **Countdown:** in the nav, counting to `EVENT.startsAt` (Lagos time).

Tag every ad link with `utm_source`, `utm_medium` and `utm_campaign`
(e.g. `?utm_source=instagram&utm_medium=paid&utm_campaign=lagos-dec`) so the sheet
shows which channel each lead came from.

Scripts: `npm run dev`, `npm run build`, `npm start`, `npm run typecheck`.

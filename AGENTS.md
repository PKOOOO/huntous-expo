This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md


Huntouse Real Estate App (Project Brief & Context)

> Pick-up notes so we can resume without re-explaining. Last updated: 2026-10-04.
> When you come back, open Claude Code in `~/projects/huntouse` and say: "Read AGENTS.md and let's continue."
> Product name = **Huntouse**. ("Livana" is only the Figma visual reference kit, not the product.)
>
> **Standing rule: after every change, update this file** — §9 (build log / current state),
> §10 (auth & backend), §11 (conventions) and §7 (open questions) as relevant. Never write
> secret values here; only say where they live.

---

## 0. VISION & NORTH STAR (read this first — every build decision serves this)

**Huntouse** makes house hunting (both **rentals** and **sale listings**) fast, seamless, and
above all **safe**, by connecting property **owners & agencies DIRECTLY to clients** — cutting
out the untrustworthy middle layer.

**Origin:** Started as a rental house-hunting app. House hunting wastes days/weeks of time and
energy; modern tech can fix that. Data collection confirmed a real gap + ready market. But why
weren't people using existing apps? Three problems surfaced:

1. **Fraud / trust (the #1 problem).** People fear scams and are reluctant to pay 3rd parties.
   > *"unakuta wanakuitisha pesa hata nyumba hujaona; inakaa tu scam na kutrust watu ni ngumu"*
   > = they ask for money before you've even seen the house; looks like a scam, trust is hard.
   Existing apps don't properly guarantee safety.
2. **Stale listings / no availability updates.**
   > *"nyumba iko, unaenda kuangalia unapata ilishauzwa"*
   > = house is listed, you travel to view it, it's already gone. No real-time vacancy status.
3. **Thin inventory.** Not enough houses listed → app isn't useful.

**Expansion to sale listings:** During onboarding research, found a second industry inside
house-hunting — apartments **for sale** — clogged with 3rd parties (agents, freelancers,
middlemen). The Mr. Mcharo / Tsavo Homes story: a client asked "are you in charge of this
property?"; he said no; was told he was of little use. Lesson = clients want to deal with
whoever **actually controls the property**. Same direct-connection model applies to sales too.

**THE 3 FOUNDING PRIORITIES (rank every feature against these):**
1. **SECURITY** — guarantee the safety of users AND their money.
2. **NUMBERS / ONBOARDING** — get as many users AND listings onboarded as possible.
3. **CONTROL** — property owners have full control of their properties (incl. keeping
   availability current).

**How the priorities map to the product (why our screen plan is what it is):**
- *Security* → verified owners/agents (KYC + proof of ownership + license), "verified" badges,
  in-app escrow / secure payments (don't pay before viewing), reviews/ratings, report/flag.
  → the Owner/Agent **verification screens are CORE, not optional**.
- *Freshness/Control* → one-tap listing status (vacant/taken/sold) + availability calendar.
  This is a headline differentiator competitors fail at.
- *Numbers* → dead-simple create-listing wizard + onboarding incentives.
- *Direct connection* → verified badge + direct owner/agent chat answers "are you in charge?"
  (the Tsavo insight baked into the UI).

Market context: Kenya (Swahili-speaking users); expect KES currency, local payment rails
(e.g. M-Pesa) to matter for the payments decision.

---

## 1. What we're building

A **React Native mobile app** for **rentals + house (sale) listings**, built as a
**two-sided (really three-sided) marketplace** — not a browse-only app. See §0 for the why.

Design reference (Figma Community UI kit — visual reference only, NOT the product name):
**Livana – Real Estate Mobile App UI Kit**
- File key: `RggaUeAz90NrzCtnGsMSvj`
- URL: https://www.figma.com/design/RggaUeAz90NrzCtnGsMSvj/Livana---Real-Estate-Mobile-App-UI-Kit--Community-
- **Build from the "🎨 ・ DESIGN" page (id `3:9806`).** It has the real layered screens
  (375×812 frames named "1. Splash screen" … "89. Logout"), real photos, Figma variables
  and text styles. Find a screen's node id by searching `get_metadata` on `3:9806` for its name.
  e.g. Splash `4374:10165`, Onboarding 1–3 `4270:11244`, `4270:11515`, `4348:9938`.
- **Do NOT build from the "👋 ・ COVER" page** (id `145:3389`): its "Screens Preview"
  frame (`8001:10388`) is flattened 1x raster previews only.
- Also has a "DESIGN GUIDELINES" page (COLOR, COMPONENT). `get_metadata` with no node id
  only lists COVER, so get that page's link/node id from the user when needed.
- Kit font is **Fredoka** (`font_text` variable); tokens live in `src/constants/theme.ts`.
- The splash in Figma reads "HuntHouse" (user-edited); code uses "Huntouse" via `BrandName`.

---

## 1b. MONETIZATION & THE RENTALS-vs-SALES SPLIT (key strategic decision)

**Core principle: rentals and sales are TWO DIFFERENT BUSINESSES — do NOT force one payment
model on both.** (Raised by colleague re: sale payments; resolved here.)

**The problem (sales):** You can't process a 12M apartment in-app. Buyers use banks /
microfinance / mortgage (eligibility + CRB checks, bank in the loop). If Huntouse just
"connects then disappears," buyer + owner transact off-platform and we earn nothing. This is
**disintermediation / leakage** — the #1 threat to every marketplace.

**Colleague's proposed fix:** commission agreement with owners/agencies + hide direct numbers,
use a company number + connect clients manually (agent-like). → Works but turns Huntouse into a
traditional BROKERAGE (the exact unaccountable-middleman layer the vision removes), doesn't
scale, and needs physical presence (his own stated downside). We go lighter instead.

**Agreed model:**

| | RENTALS | SALES |
|---|---|---|
| Payment | Flows THROUGH app (M-Pesa escrow) | Via bank/mortgage/microfinance, OFFLINE |
| Ticket | Low (deposit + rent) | Huge (millions) |
| Leakage risk | Low — money flows through you | High — must engineer capture |
| Monetization | **Transaction fee / escrow** (also = Security priority #1) | **Lead-gen + commission + subscriptions** |

**Sales monetization — 4 levers (use together):**
1. **Owner/agency subscriptions + featured listings (portal model).** They pay to list/promote
   → leakage becomes irrelevant (paid upfront). How Property24 / BuyRentKenya / Zillow monetize
   sales. Supports Numbers/onboarding priority. ← PRIMARY
2. **Success commission** secured by (a) signed **listing agreement** (owner owes commission if
   we introduce buyer) + (b) **contact masking** (in-app chat + call masking à la Uber/Truecaller;
   no direct number until lead is attributed). Lighter than company-number/manual model.
3. **Financing referral fees — turn the "bank problem" into a FEATURE.** Build a
   "Check eligibility / Get pre-qualified" step partnered with lenders; Huntouse = origination
   funnel, earns referral fee from lender + adds buyer value + keeps users on-platform. ← PRIMARY
4. **Verified facilitation** (digital, not a physical office) for high-value sales needing
   hand-holding.

**Recommended:** lead with #1 + #3, backed by #2. Scales, no physical office, vision-fit.

**Vision-tension resolution:** our enemy was never "intermediaries" — it was UNACCOUNTABLE,
UNVERIFIED ones (Tsavo story). Huntouse as the verified, accountable platform FULFILLS the
vision even while facilitating sales.

**Build/screen implications (SALES flow ≠ RENTAL flow):**
- Sales must NOT reuse rental "Reserve → pay in-app → Payment Completed" screens.
- Sales CTAs: "Request a viewing" · "Express interest" · "Check financing eligibility" ·
  "Talk to verified agent/owner" — NOT "Reserve & pay."
- Add a **financing / pre-qualification module** (eligibility, possibly CRB via partner).
- **Contact masking** in chat (for attribution/commission).
- Listing-type flag (**rent vs sale**) drives which flow + CTA appears.
- → The kit's "Buy a home ×4" screens need rework toward lead/financing, not in-app purchase.

**Still user's business calls (add to open questions):**
- Sales: subscription/portal revenue, per-deal commission, or both?
- Do we have / can we get lender/microfinance partners? (Decides if financing-referral is
  near-term or phase-2.)

### 1c. Partner discussion (2026-10-04) — PHASING (proposed, pending both founders' agreement)

User sent the §1b model to their co-founder. Her feedback + our responses:

- **"Pay to list won't work from day one — nobody knows us."** → AGREED. Cold-start problem.
  **Launch RENTALS ONLY**, perfect them, add sale listings later.
- **Her idea: Basic vs Pro tiers.** Basic (free) = list rentals. Pro (subscription) = unlock
  sale listings. → Adopted, with tweaks:
  - **Verification / verified badge is NEVER paywalled** (Security = priority #1; Basic gets it).
  - Pro must sell *value*, not just permission: sale listings + featured placement + more
    listings + lead/viewing analytics + agency profile.
  - **Founding-partner offer:** first owners/agencies get Pro free for 3–6 months, then convert.
- **"How does a client reach the owner if numbers are masked?"** → Bolt/Uber pattern: in-app chat
  → "Call owner" routed via a Huntouse proxy number (neither sees the real number) → book the
  viewing in-app. Masking isn't leak-proof (numbers get swapped at viewings); the real protection
  is the **signed listing agreement + our records** (chats, booked viewings) proving we introduced
  the buyer. Proxy calling costs per minute (e.g. Africa's Talking) → later phase.
- **"Expound on financing (#3)."** Two steps:
  1. **"Can I afford this?"** calculator on sale listings (income, deposit, job type → rough loan
     range). **Needs no partner** — can ship first.
  2. **"Get pre-qualified"** → with consent, lead handed to a partner lender; lender pays
     referral fee per qualified lead / funded loan. Owners get pre-qualified buyers (fewer
     time-wasters).
- **"How do we verify the lenders' / buyers' eligibility?"** → The **lender** does buyer
  eligibility (CRB, KYC, income) — their job and regulated risk, not ours. Our check is on the
  lender: only partner with regulated ones — CBK-licensed banks & microfinance banks,
  SASRA-regulated SACCOs (SACCOs likely the best fit; many Kenyans finance land/homes via them).
- **Partners:** co-founder will ask contacts from **Rideright** (may be vehicle/asset finance —
  still useful for intros to a bank/SACCO with a property-loan product).

**Proposed phasing:**
| Phase | Scope | Revenue |
|---|---|---|
| 1 | Rentals only; free listing for hosts; verification free | Fee on in-app rent/deposit payments (M-Pesa / card escrow) |
| 2 | Sale listings via **Pro** subscription (founding partners free first); affordability calculator | Pro subscriptions + featured listings |
| 3 | Lender partners (pre-qualification), call masking, listing agreements | Referral fees + success commission |

**Build impact now:** none — we're already building consumer + rental first. Keep the
**rent/sale listing-type flag** in the data model; defer sale screens (Buy a home rework,
financing, masking) to phase 2–3.

**Risk: "Pro subscribers pay but their listing doesn't sell / get seen" (raised 2026-10-04).**
Answers agreed in discussion (not yet signed off by both founders):
1. Pro sells **visibility, not sales** — and proves it with the lead-stats dashboard
   (views, saves, inquiries, viewing requests, vs. a Basic baseline).
2. **Lead guarantee as credit, not cash:** e.g. < N inquiries in 60 days → next month free.
3. **Help it sell:** listing quality score, price feedback vs. comparable listings,
   low-engagement alerts.
4. **Don't sell Pro before demand exists:** roll Pro out area by area once buyer traffic
   (built by rentals) is there; cap featured slots per area.
5. **Cheaper entry:** monthly cancel-anytime; one-off "boost" for single listings; later a
   lower subscription + success fee (ties to phase-3 listing agreements).
6. **Founding-partner free period = measurement:** collect Pro vs Basic lead numbers to set
   the price, the guarantee threshold, and the sales pitch.
**Build impact:** the listings data model must track per-listing **views / saves / inquiries
/ viewing requests from day one** (needed for lead stats + the guarantee).

**"Jiji problem": sellers pay for Pro, get no buyers, drop back to free — how do we earn?
(discussed 2026-10-04; founders still debating listings — not signed off).**
Lesson from Jiji-style classifieds: they survive churn through seller **volume**, a
deliberately **limited free tier** (few free ads, expiry, lower placement), and by making
**professionals** (dealers/agencies who list all year) the real paying customers. Huntouse
does NOT depend on Pro subscriptions alone — revenue mix:

| # | Stream | Who pays | Hurt by "paid, no buyers"? |
|---|---|---|---|
| 1 | **Rental transaction fee** (phase 1, main engine) | Small fee on deposit / first rent via in-app escrow, released on move-in | No — earn only when a rental happens |
| 2 | **Pro for agencies & multi-unit landlords** | Professionals listing all year | Low — they keep listing, so they keep paying |
| 3 | **One-off boosts** for individual sellers | Single-property owners | Expected churn — pay once, no subscription promise |
| 4 | **Success fee on sales** (phase 3) | Seller, only when a Huntouse-introduced buyer buys (signed listing agreement) | No — no sale, no fee |
| 5 | **Financing referral fees** (phase 3) | Banks / SACCOs per qualified lead or funded loan | No — seller pays nothing |
| 6 | **Service referrals** (later) | Movers, cleaners, internet installers | No |

- **Free-tier limit:** free hosts get **1–2 active listings** (enough for a private landlord);
  agents / apartment blocks with more need Pro. **Verification always free.**
- Individual sellers dropping back to free is fine — that's what boosts (#3) and the success
  fee (#4) are for. Subscription revenue comes from professionals.
- Root cause of "no buyers" is **demand**, not pricing → rentals first (traffic), Pro only per
  area once buyers are active, success fee + financing once proven.
- One-liner for the co-founder: *"We don't sell hope to one-time sellers. We earn per rental
  transaction, charge professionals who list all year, and take a success fee on sales only
  when we actually bring a buyer."*
- **Build impact:** listings need an **active/inactive count per host** (free-tier limit),
  a **boost/featured** flag with expiry, and an **attribution trail** (inquiry → viewing →
  deal) to support the success fee.

**Agencies & developers on sale listings (discussed 2026-10-04 — not signed off).**
Agencies are the core *paying* customers for sales: they list all year, already have marketing
budgets, and already pay BuyRentKenya / Property24. Build Pro around them, not one-off sellers.

| | **Developers** (e.g. Tsavo Homes) | **Agencies / brokers** |
|---|---|---|
| Relationship to property | **Own it** → they ARE "the one in charge" | Act **on behalf of** an owner |
| Typically sell | Off-plan / new apartments, whole projects | Resale houses, land, apartments |
| Vision fit | Perfect (direct) | Yes — only if verified AND authorized |

- **Trust rule (the Tsavo lesson):** agent KYC (ID + EARB license + agency) **plus a mandate
  per sale listing** — mandate letter / listing agreement proving the owner authorized them.
  Badges: **"Developer — owns this property"** vs **"Verified agent — authorized by owner"**.
  Duplicate listings (same house via 3–4 agents is common in Kenya) → prefer signed/exclusive
  mandate, flag duplicates. Competitors don't enforce this → differentiator.
- **Agency Pro sells:** tiers by active listings + agent seats (e.g. Starter 1 agent/20
  listings, Agency 5 agents/100); agency profile page (listings, team, reviews); **developer
  project pages** (unit types, prices, **installment payment plans** — financing without a
  bank); lead inbox / viewing bookings / stats; featured projects & listings.
- **Revenue:** steady subscription; later a referral share of their sales commission for
  Huntouse-introduced buyers.
- **Onboarding path:** many agencies also manage **rental blocks** → phase 1: onboard them for
  rentals (free verification, free up to the listing limit) — fixes thin inventory and builds
  the relationship; phase 2: upsell **agency Pro** for sales/projects (founding agencies free
  first). Answers the co-founder's "nobody pays an unknown app on day one".
- **Build impact:** Phase B agent verification stays as planned but model an **agency** that
  can have multiple agent members later; listings need `rent|sale`, `developer|agent` lister
  type, and a **mandate document per sale listing**; "project with units" listings = phase 2.

---

## 2. Figma access situation (IMPORTANT)

- Connected Figma account: **hardhaven** (hardhaven4@gmail.com), team "hardhaven's team".
- Upgraded 2026-10-04 to **Professional plan, Dev seat** ($15/mo) — the Figma MCP limit for
  View/Collab seats (~6–20 calls/month) blocked work. Dev = up to 200 calls/day, 15/min.
  Plan: downgrade back to View once the design has been pulled into code.
  - READ from Figma (screenshots, design context, variables) → works on Dev seat.
  - WRITE to Figma (create/edit designs inside Figma) → not needed, not available.
- **We never need to write to Figma.** New screens are created as **React Native CODE**,
  not as Figma designs. Figma is only a visual reference we read from.
  (Pushing new screens back INTO Figma is optional "nice to have" — skip it.)

---

## 3. Decisions locked in

- **Platform:** React Native (recommend **Expo**, free — no subscription).
- **Marketplace model:** three roles in ONE app (Airbnb-style), everyone starts as Seeker:
  | Role | Who | Can do | Verification |
  |---|---|---|---|
  | **Seeker** | Renter/buyer | Browse, search, wishlist, chat, reserve, buy | Email/phone |
  | **Direct Owner** | Private landlord/FSBO | List own properties, manage inquiries/bookings, get paid | ID (KYC) + proof of ownership |
  | **Agent** | Licensed pro/agency | Manage many listings, leads/clients, agency profile, commissions | ID + license + agency |
  | *(Admin)* | Ops | Approve verifications, moderate | Web dashboard, later |
- A user can be **both Seeker and Owner** at once (mode toggle). Agent is a verified upgrade.

---

## 4. Screen inventory (89 existing kit screens — ALL consumer/seeker-facing)

1. **Auth & Onboarding (1–27):** Splash · Onboarding ×3 · Login (+filled, pw-error) ·
   Forgot password (+filled) · Enter OTP (+filled) · Set up new password (+filled, error) ·
   Password updated · Register (+filled, pw-error) · Enter OTP (+filled) · Set up profile ×7
2. **Home & Discovery (28–42):** Home-Welcome · Home · Villa Lists · Villa Lists-Map ·
   Near places detail · Top real estate agents · Agent details–Listings · Agent details–Reviews ·
   Search · Search-Details · Search-Date · Search-Details Filled · Search result ·
   Search-filter · Search-Empty
3. **Property detail & transactions (43–57):** Apartments Details · 360° Virtual Tour ·
   Around this home-Park · Reviews · Filter-Reviews · Chat host ×2 · Reserve ×2 ·
   Payment Completed · Buy a home ×4 · Buy-a-home Payment Completed
4. **Wishlist (58–64):** Create wishlist (+filled) · Add to wishlist · Wishlist-Empty ·
   Wishlist · Wishlist detail · Edit Wishlist
5. **Chat & AI (65–71):** Chat-Empty · Chat-List · Chat-Delete ×2 · AI-Chat ×3
6. **Profile & Settings (72–89):** Profile · Notification (empty/list/delete) ·
   Past stays–Need review · Write review ×2 · Past stays–Completed/Delete ·
   Personal information · Payment methods ×2 · Privacy settings · Change password ·
   Notification settings · Language Preferences · FAQs · Logout

**Fit verdict:** ~80% of a seeker/buyer-facing app is already designed. Covers BOTH
rental (Reserve, Past stays, Chat host, 360° tour) AND buying (Buy a home, agents).

---

## 5. The gap — kit is 100% consumer-side. New OWNER/AGENT screens to build (~14–18)

**Role & verification (shared)**
1. Role picker / "Become a host / agent"
2. KYC – ID upload
3. Proof of ownership upload (owner)
4. License & agency verification (agent)
5. Verification status (pending/approved/rejected)

**Listing management (owner + agent)**
6. Create listing — multi-step wizard (type → map pin → details → amenities →
   photo upload → pricing → availability → rules → preview/publish)
7. My listings (active / paused / draft)
8. Edit listing
9. Availability calendar
10. Inquiries & booking requests (accept / decline / chat)

**Money & reputation**
11. Earnings / payouts dashboard + transactions
12. Reviews received / respond to review

**Agent-specific**
13. Agent dashboard (portfolio + stats)
14. Leads / clients (CRM-lite)
15. Agency profile editor

*(Phase-later: listing analytics, team members, saved-search alerts, mortgage/affordability
calculator, compare properties, global map-first browse.)*

Note: kit already has consumer-facing "Top agents" + "Agent details" screens, so the agent
PUBLIC profile exists — what's missing is the agent's OWN dashboard.

---

## 6. Recommended build order

1. Extract design system first — pull kit's color/type/spacing **variables** +
   key component structures via Figma read access, so new screens match exactly.
2. Scaffold RN (Expo) app with **role-aware navigation** (role in auth context →
   Seeker tabs vs. a "Hosting" area).
3. Build the **consumer slice first** from the kit:
   Splash → Onboarding → Auth → Home → Search/Filter → Property Details → Reserve/Buy.
4. THEN add owner/agent screens one at a time. Nothing is blocked on the new screens.

---

## 7. OPEN QUESTIONS to answer next session

1. **Rental type:** short-stay (nightly, Airbnb-like) / long-term lease (monthly, applications
   + contracts) / both? (Affects booking + owner screens heavily.)
2. **Payments:** does the app take payments/escrow or just connect people (inquiry-only)?
   NOTE: Security is founding priority #1 → escrow / "don't pay before you view" is strongly
   aligned with the vision. Kenya market → consider **M-Pesa** + KES, not just Stripe.
3. ~~Project location~~ → RESOLVED: fresh Expo app at `~/projects/huntouse`; backend at
   `~/Desktop/huntouse-api`.
4. ~~Expo vs bare React Native~~ → RESOLVED: Expo (SDK 57, Expo Router, CNG).
5. **Sales monetization (see §1b, §1c):** leaning → sales deferred to phase 2 behind a **Pro**
   subscription (co-founder's Basic/Pro idea), commission + referral fees in phase 3.
   Needs both founders' sign-off. Also open: Pro price, founding-partner free period length.
6. **Lender/microfinance partners:** none yet. Co-founder asking Rideright contacts; target
   CBK-licensed banks / microfinance banks / SASRA SACCOs with property-loan products.
   Financing referral = phase 3; the affordability calculator can ship in phase 2 without one.

**Default if user says "just go":** fresh Expo app · both rental types · rentals = in-app
M-Pesa escrow, sales = lead/financing (NOT in-app purchase) · role-aware nav · start with
consumer slice.

---

7. **Clerk password minimum:** the Clerk dev instance currently requires **15+ characters**,
   but the app's checklist / register validation (and the kit) say **8**. Either lower Clerk's
   minimum to 8 (Dashboard → User & authentication → Password) or change the app to 15.
   Recommended: 8 in Clerk (breached-password check stays on).

---

## 8. How to resume

- Build is IN PROGRESS. Read §9 (current state) and §10 (auth/backend) first.
- Figma MCP plugin must be connected (user ran `/plugin` → figma auth). If Figma access
  breaks, run the `whoami` Figma tool to debug.
- Run the app: `npx expo start` (email auth works in Expo Go). Web export for quick visual
  checks: `npx expo export --platform web`.

---

## 9. Build log & current state (newest last)

**2026-10-04**
1. **Design tokens** pulled from the Figma DESIGN page variables → `src/constants/theme.ts`
   (`Palette`, `FontFamily` = Fredoka, `Typography` = kit text styles with −3% tracking,
   `Radius`, `Shadow`, `BrandName`).
2. **Splash + Onboarding (kit 1–4)** — `src/app/index.tsx`, `src/app/onboarding.tsx`,
   heroes in `src/components/onboarding/heroes.tsx`. Real kit photos/logo (assets in
   `assets/images/{brand,onboarding}`). Slide 2 AI phone mock overlays live "Huntouse AI
   Assistant" text and a KES chip. Native splash = `assets/images/brand/splash-lockup.png`.
3. **Login (5–7)**, **Forgot password flow (8–15)**, **Register (16–18)**, **OTP (10–11,
   19–20, one shared screen)**, **Profile setup wizard (21–27; 25 is a duplicate of 24)** —
   all built and visually verified against Figma renders (≤2px). Routes:
   `sign-in`, `sign-up`, `forgot-password`, `verify-code`, `reset-password`,
   `password-updated`, `profile-setup/{index,goals,property-types}`, placeholder `home`.
   Profile setup localized for Kenya (+254 default, East-Africa country list).
4. **Clerk auth wired (Phase 1)** — see §10. Email sign-up / login / reset / new-device code
   verified end-to-end against the Clerk dev instance (test users created and deleted).
   User confirmed password sign-up works on their phone.
5. **Google / Apple buttons** wired with Clerk browser SSO (`useSSO`), same approach as cosmix.
   Not yet confirmed on a phone (headless web blocks the popup) — user to test in Expo Go.

6. **Phase 2 backend built** in `~/Desktop/huntouse-api` (see §10): Clerk + Prisma 7 + Neon,
   initial migration applied, webhook route, `GET /api/me`, `PUT /api/me/profile`. Verified
   with a real Clerk session token through ngrok (lazy user creation as seeker, roles mirrored
   to Clerk publicMetadata, profile saved, validation 400s, forged token 401, unsigned webhook
   400). Test user deleted from Clerk + DB afterwards.
7. **App → API connected:** `src/services/api.ts` (`apiFetch` with the Clerk token,
   `EXPO_PUBLIC_API_URL` in `.env.local` = the ngrok URL). Profile setup now saves to
   `PUT /api/me/profile`; Clerk keeps only name/photo + the `profileSetupComplete` flag.
   Not yet confirmed from a phone.

**Open issues (2026-10-04):**
- ~~Clerk not delivering webhooks~~ → FIXED: the endpoint was subscribed to `role.*` instead of
  `user.created/updated/deleted`. After the fix, Svix deliveries return 200 through ngrok.
- All Clerk users and DB rows were wiped on request (2026-10-04) so the user can test fresh.
- **Clerk password minimum still 15** — user chose 8; must be changed in the Clerk dashboard.

**Git:** app repo committed (`main`, "first commit" 191cb2e). **huntouse-api still uncommitted**
(all Phase 2 work: `app/api/`, `lib/`, `prisma.config.ts`, …).

8. **Laptop power loss (2026-10-04):** dev servers died; user restarting them (API `pnpm dev` on
   3001 + ngrok — check whether the ngrok URL changed → update Clerk webhook + app env).
9. **Monetization phasing discussed with co-founder** → logged in §1c (rentals first).

10. **Phase B (roles & host verification) BUILT (2026-10-04)** — see §10 "Host verification".
    Backend: verification tables + R2 uploads + applicant API + admin dashboard (web) +
    `pnpm admin:grant`. App: `host/` flow (role → identity → ownership/agency → review →
    status) + Home "Become a host" card. Verified: applicant API end-to-end with real R2
    uploads; admin sign-in, queue, document view (signed URLs) and approve in a real browser;
    role granted in DB. Found + fixed: approval crashed when Clerk was unreachable → roles sync
    now retries and self-heals (`clerkRolesStale`). Test users/files cleaned up afterwards.
    User chose NOT to rotate the exposed R2/Neon credentials for now (rotate before production).
    Defaults used: agents = ID + EARB number + certificate + agency (no KRA PIN); selfie checked
    by an admin by eye (automated face match e.g. Smile ID = later).
    **To do by user:** restart the API dev server (new Prisma client), run
    `pnpm admin:grant <your email>` in huntouse-api, then test the flow on the phone.
11. **Phone-test bugs fixed (2026-10-04):**
    - *Endless `GET /api/verifications` loop* — effects depended on `useAuth().getToken`, which
      changes identity every render. Fix: `src/hooks/use-get-token.ts` (`useGetToken()` =
      stable callback over `useClerk().session.getToken()`); used in Home, host/index,
      host/status. **Rule: never put `useAuth().getToken` in effect deps — use `useGetToken()`.**
    - *"Upload failed (HTTP 403)"* — the presigned PUT signed `Content-Length`, which React
      Native `fetch` + Blob doesn't send reliably → signature mismatch. Fix: server signs
      content-type only (size still enforced at submit via HEAD = declared size); app uploads
      with `expo-file-system` `new File(uri).upload(url, { httpMethod: 'PUT', uploadType:
      BINARY_CONTENT })`. Verified: matching type → 200, wrong type → 403.
12. **Phase B confirmed on a real phone (2026-10-04):** piusdev67@gmail.com (Expo app) submitted
    host verification with real camera uploads → hardhaven4@gmail.com approved it in `/admin`
    → app showed "You're verified". Phase B is DONE.

**Next up:** user restarts servers → lower Clerk password min to 8 → phone test (sign-up,
profile save, Google/Apple) → commit huntouse-api → Home (kit 28–29) → Phase 3 (roles in app,
owner/agent verification, admin dashboard).

---

## 10. Auth & backend architecture (Clerk)

**Reference implementation looked at:** `~/Desktop/cosmix-v2` (Expo) + `~/Desktop/cosmix-admin`
(Next.js). Kept its overall shape; deliberately NOT copied: a shared API key shipped in the
app bundle (`EXPO_PUBLIC_ADMIN_API_KEY`, accepted for all `/api`), "first user becomes admin",
disabled webhooks, and an in-app WebView admin with a JS-readable token cookie. (Also told the
user cosmix's admin key should be considered leaked and rotated.)

**Mobile (this repo) — DONE (Phase 1)**
- `@clerk/expo` 4.x (Core 3 API: `signIn.password()`, `signUp.password()`,
  `signUp.verifications.*EmailCode()`, `signIn.resetPasswordEmailCode.*`, `signIn.mfa.*`,
  `finalize({ navigate })`). Token cache = `@clerk/expo/token-cache` (expo-secure-store).
- `src/app/_layout.tsx`: `ClerkProvider`; splash held until Clerk loads (10s timeout);
  `Stack.Protected` — signed-out group (onboarding + auth screens), signed-in group
  (`profile-setup`, `home`). `password-updated` and `sso-callback` are unguarded on purpose
  (Clerk navigates before the session is active).
- `src/app/index.tsx` routes by auth state: onboarding / profile-setup / home
  (`hasCompletedProfileSetup` = `user.unsafeMetadata.profileSetupComplete`). Branded pause
  only on cold start.
- OTP codes are **6 digits** (Clerk); `CODE_LENGTH` in `src/services/auth.ts`. OTP screen
  purposes: `signup`, `reset`, `signin` (Clerk "client trust" = new-device code).
- Clerk error codes mapped to kit messages (`form_password_incorrect` → "Password
  incorrect", etc.) via `clerkErrorCode/clerkErrorMessage` in `src/services/auth.ts`.
- After password reset Clerk signs the user in → "Password Updated" → Continue into the app.
- Profile setup saves name + photo to the Clerk user and the rest to `unsafeMetadata`
  (TEMPORARY until the API exists; never roles/verification there). `src/services/profile.ts`.
- Social: `src/components/auth/social-sign-in.tsx` — `useSSO` browser flow, redirect
  `AuthSession.makeRedirectUri({ path: 'sso-callback' })`. Release plan: Google stays
  browser-based with our own Google **web** OAuth client in Clerk; **Apple switches to native**
  (`useSignInWithApple`, App Store rule). Native Google is optional polish later.
- Clerk bot protection: CAPTCHA mount `<View nativeID="clerk-captcha" />` on sign-up (web).
- Env: `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` in `.env.local` (git-ignored). App never holds
  any secret key.

**Backend `~/Desktop/huntouse-api` — Phase 2 DONE (uncommitted)**
- Next **16.3.8** (middleware is now **`proxy.ts`**; read `node_modules/next/dist/docs/`
  before coding), React 19.2, Tailwind 4, **pnpm 11** (build scripts must be allowed in
  `pnpm-workspace.yaml` → `allowBuilds`; prisma/@prisma/engines/esbuild = true).
  `pnpm dev` runs on **port 3001**; ngrok `https://worried-london-steedlike.ngrok-free.dev`
  → `localhost:3001` (free plan: URL may change on restart → update Clerk webhook + app env).
- `@clerk/nextjs` 7.x, `zod` 4, `server-only`, **Prisma 7.10** (`prisma` CLI pinned to 7.10 —
  `pnpm add -D prisma` picked an 8.0 RC) with `@prisma/adapter-pg`. Config `prisma.config.ts`
  loads `.env.local` via dotenv. Client generated to `app/generated/prisma` (git-ignored;
  `postinstall` runs `prisma generate`). Scripts: `db:generate`, `db:migrate`, `db:deploy`,
  `db:studio`. Migration `init` applied to Neon (DB was empty).
- Schema: `User` (clerkId, email, names, imageUrl, `roles Role[] @default([SEEKER])`,
  `status` ACTIVE/SUSPENDED/DELETED, soft delete), `Profile` (country, phone, birthday,
  goals[], propertyTypes[], setupCompletedAt), `ProcessedWebhook` (svix-id idempotency).
- `proxy.ts` = `clerkMiddleware()` only; routes enforce auth themselves (`lib/auth.ts`
  `requireUser()` → JSON 401/403). `lib/users.ts`: `upsertUser` (never touches roles of an
  existing user; handles webhook/API create race), `ensureUser` (lazy create on first API
  call — webhooks are eventually consistent), `syncRolesToClerk` (→ `publicMetadata.roles`,
  lower-case), `markUserDeleted`. `lib/serialize.ts` → client JSON (lower-case enums).
- Routes: `POST /api/webhooks/clerk` (`verifyWebhook`, dedupe by svix-id, user.created /
  updated → upsert, user.deleted → soft delete); `GET /api/me`; `PUT /api/me/profile`
  (zod-validated; `completeSetup: true` sets `setupCompletedAt`).
- Roles: DB is the source of truth; admins only ever granted manually.
- TODO: expose roles in the session token (Clerk Dashboard → Sessions → customize session
  token: `{ "roles": "{{user.public_metadata.roles}}" }`), admin dashboard pages, CORS only if
  a web client needs the API, pooled `DATABASE_URL` + Vercel `fra1` for deploy.
- Phase 3: role-aware app navigation (Seeker tabs vs Hosting) + owner/agent verification
  (KYC upload → pending → admin approves → role granted).

**Host verification (Phase B, built 2026-10-04)**
- DB: `VerificationRequest` (kind OWNER|AGENT, status DRAFT→PENDING→APPROVED|REJECTED, idType,
  **idNumberHash** = HMAC-SHA256 with `ID_HASH_PEPPER` + `idNumberLast4` — the full ID number is
  never stored; admins read it from the photo; same hash on another account = fraud warning),
  `earbNumber`, `agencyName/Location`, `consentAt` (Kenya DPA), reviewer + `rejectionReason`;
  `VerificationDocument` (kind ID_FRONT|ID_BACK|SELFIE|OWNERSHIP_PROOF|AGENT_LICENSE, R2
  `storageKey`, type, size; one per kind); `Agency` (created on agent approval; users have
  optional `agencyId` → multi-agent agencies later); `User.clerkRolesStale`.
- Required docs: ID front + selfie (+ ID back unless passport) + ownership proof (owner) /
  EARB certificate (agent). Images only for ID/selfie; PDF allowed for ownership/licence; ≤10 MB.
- Uploads: app asks `POST /api/verifications/:id/documents` → presigned PUT (content-type AND
  exact byte length are signed) → PUTs the file straight to R2. Submit HEADs every object to
  confirm it exists with the declared size. Keys: `kyc/<userId>/<requestId>/<kind>-<uuid>`.
- Applicant API (`lib/applicant.ts`, `lib/verification.ts`): `GET/POST /api/verifications`
  (POST resumes the open request for that kind), `GET/PATCH /api/verifications/:id`
  (editable only in DRAFT/REJECTED), `POST …/documents`, `POST …/submit` (`consent: true`).
- Admin (web, in huntouse-api): `/admin` queue (pending oldest-first, tabs), `/admin/
  verifications/:id` (details, duplicate-ID warning, docs via 5-min signed URLs, Approve /
  Reject-with-reason as server actions). `proxy.ts` requires sign-in on `/admin(.*)`; the ADMIN
  role is checked in `lib/admin.ts` (non-admins get 404). Sign-in page `/sign-in` (Clerk
  `<SignIn/>`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`). Root layout has `ClerkProvider`.
- **Never edit `roles` by hand (Prisma Studio / SQL).** A Studio edit typed as `{ADMIN}`
  (Postgres array syntax; Studio wants JSON `["SEEKER","ADMIN"]`) saved `roles = NULL` for
  piusdev67@gmail.com (2026-10-04, repaired). Hand edits also skip the Clerk mirror. Migration
  `user_roles_required` adds `CHECK (roles IS NOT NULL AND cardinality(roles) >= 1)` so the DB
  now refuses that. Current admin: **hardhaven4@gmail.com** (SEEKER + ADMIN; web dashboard). piusdev67@gmail.com = app test seeker (admin revoked).
- **Admins are granted only via `pnpm admin:grant <email> [--revoke]`** (`scripts/grant-admin.mts`,
  run with tsx; `.mts` because the package is CJS and the script uses top-level await).
- Approve: transaction sets APPROVED + adds role (+ creates Agency for agents) + marks
  `clerkRolesStale`, then `syncRolesToClerk` (3 retries, never throws; failure leaves the flag
  and `ensureUser` retries on the user's next request). The app reads roles from the API, so a
  lagging Clerk mirror is harmless.
- App: `src/services/verification.ts`, `src/components/host/{document-tile,host-request}.tsx`,
  routes `src/app/host/{_layout,index,identity,ownership,agency,review,status}.tsx` (signed-in
  group). Camera (`launchCameraAsync`, front camera for selfie) + gallery + PDF via
  `expo-document-picker`; `cameraPermission` added to the image-picker plugin. `WizardScreen`
  gained `backFallback` + keyboard insets. Home shows a host card (Become a host / under review /
  action needed / verified).
- Dev note: after `prisma generate` the running `pnpm dev` keeps the OLD client (cached on
  `globalThis` in `lib/prisma.ts`) → restart the dev server after schema changes. The API now
  runs on **port 3000** (`next dev -p 3000`); ngrok → `localhost:3000`, same URL.
- Not built yet: notifications on approve/reject, admin audit log, document retention/deletion
  policy, automated face match, per-listing ownership proof / sale mandates (with listings).

**Env files (git-ignored):** app `huntouse/.env.local` = `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`,
`EXPO_PUBLIC_API_URL`. API `huntouse-api/.env.local` = `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`,
`CLERK_SECRET_KEY`, `DATABASE_URL`, `CLERK_WEBHOOK_SIGNING_SECRET`, `R2_ACCOUNT_ID`,
`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `ID_HASH_PEPPER` (random, generated
locally — never change it or existing ID hashes stop matching), `NEXT_PUBLIC_CLERK_SIGN_IN_URL`.

**KYC document storage = Cloudflare R2** (set up 2026-10-04): private bucket `huntouse-kyc`
(Standard class, public access OFF), account API token scoped to that bucket only with
**Object Read & Write**. Access pattern: S3 SDK (`@aws-sdk/client-s3` +
`@aws-sdk/s3-request-presigner`, endpoint `https://<account>.r2.cloudflarestorage.com`,
region `auto`) — app uploads via short-lived presigned PUT, admins view via short-lived
presigned GET. Verified: signed upload/read 200, unsigned read refused, delete works.
R2 keys live in `~/Desktop/r2` (key names there: `aceesskeyid`, `secretaccesskey`,
`tokenvaue`, + endpoint line).

**⚠️ Secret-handling rule (learned the hard way):** never `cat`/`source` env or secrets files —
`DATABASE_URL` contains `&`, so `. ./.env.local` splits it and prints it. Read them only with a
script that prints key NAMES. On 2026-10-04 the R2 keys and the Neon DATABASE_URL were
accidentally printed in a session → user asked to **roll the R2 token and reset the Neon
`neondb_owner` password**, then re-copy into `huntouse-api/.env.local`.

**Secrets location:** `~/Desktop/secrets` (NOT in any repo). Contains Expo + Next publishable
keys, `CLERK_SECRET_KEY`, `DATABASE_URL` (Neon, now the **direct** non-pooled URL — fine for
local + migrations; add a pooled URL for serverless later) and the Clerk webhook signing
secret (key named `clerk_siginingKey`, value `whsec_…`). Clerk instance = **development**
(`pk_test`/`sk_test`); production needs a Clerk production instance + own Google/Apple creds.

**Still needed for native sign-in / release:** EAS project + `eas.json` (use EAS env vars,
not plaintext keys in eas.json), bundle id (suggested `com.huntouse.app`), Apple Developer
account, Google web OAuth client. APK signing: follow cosmix — EAS-managed credentials
(no keystore in repo); Play Store builds should be AAB.

---

## 11. Conventions learned (apply to every new screen)

- Fetch Figma frames with `get_design_context`; for screens with an iOS keyboard drawn in,
  fetch the frame's `Container` child instead (keyboard bloats the response).
- **Figma strokes are inside the box; RN borders add to it.** For padding-sized bordered
  elements subtract the border width from the padding (inputs 13/9, buttons py−2, chips…).
- Reuse: `PrimaryButton` (`size` lg/md, `variant` primary/secondary, `disabled` = kit disabled
  style), `TextField` / `SelectField` / `DialCodeButton`, `AuthScreen` + `ScreenTitle`,
  `WizardScreen`, `OtpInput`, `OptionSheet`, `BackButton`.
- Download Figma assets into `assets/` (URLs expire after 7 days); resize big photos to ≤1000px.
- Verify visually: `npx expo export --platform web`, serve, headless Chrome at 375×734
  (812 minus iPhone insets), compare with the Figma render.
- Copy fixes over the kit: "Livina/Livana" → Huntouse, USD → KES, typos ("Uplaod",
  "accont", "Terms and Condition").
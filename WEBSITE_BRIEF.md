# UCAT Genius — Marketing Website Brief

> Use this brief as the input for a research/design pass (e.g. Claude Research) to produce a detailed website spec. The output of that pass will then be handed to a fresh Claude Code session to build the static site for **ucatgenius.com**.

---

## 1. Product summary

**UCAT Genius** is a premium iOS and Android app that helps UK medical and dental school applicants prepare for the **2026 UCAT** (University Clinical Aptitude Test) — the admissions exam used by the majority of UK med/dental schools.

It is a focused, modern alternative to the older PDF-and-textbook prep market: bite-sized lessons, a large practice bank, full-length timed mock exams under official conditions, an AI tutor for stuck moments, and a performance analytics dashboard — all wrapped in a polished, dark-mode-first interface.

- **Platforms:** iOS, iPadOS, Android (built with React Native + Expo).
- **Status:** Pre-launch. About to ship to the App Store and Google Play.
- **Subscription:** Monthly, 3-month "Season Pass" (best value, aligned with UCAT prep window), and one-time Lifetime. Pricing handled via RevenueCat — store-driven, localised.
- **Audience:** UK secondary-school students (typically age 16-18) applying to undergraduate medicine or dentistry, sitting the UCAT in 2026 for 2027 entry. Also relevant to gap-year applicants and international students applying to UK universities.

## 2. The exam (so the site copy is accurate)

The 2026 UCAT has **four** subtests, sat in a fixed order, ~2 hours total:

| Section | Questions | Time |
|---|---|---|
| Verbal Reasoning (VR) | 44 | 22 min |
| Decision Making (DM) | 35 | 37 min |
| Quantitative Reasoning (QR) | 36 | 26 min |
| Situational Judgement (SJ) | 69 | 26 min |

Important: **Abstract Reasoning has been permanently removed from the UCAT.** Do not mention or imply AR support — competitors who do are out of date. Use this as a credibility signal: "Built for the 2026 format. No legacy content."

VR/DM/QR are scored 300-900 each (cognitive total ~900-2700). SJ is reported as Band 1-4 separately.

## 3. Core features (with marketing-ready phrasing)

1. **Learn UCAT techniques** — Bite-sized lessons across all four sections: strategies, worked examples, shortcuts. *Hook: "Skip the textbook. Learn the patterns."*
2. **Adaptive practice** — A large question bank for VR, DM, QR, SJ tuned to the 2026 format. Practise at your own pace, no timer pressure. *Hook: "Build the muscle before you build the speed."*
3. **Timed mock tests** — Full-length, exam-conditions tests with realistic per-section timing and instant scaled-score feedback. *Hook: "Sit the real thing before you sit the real thing."*
4. **AI tutor on demand** — Stuck on a question? Get a focused, plain-English explanation tailored to that exact problem. *Hook: "Your tutor lives in your phone."*
5. **Performance analytics** — See strengths, weak topics, and progress trending over time. Section-by-section breakdowns after every timed test. *Hook: "Know exactly what to revise next."*
6. **Built for the 2026 exam** — Reflects the new 4-section format. Custom renderers for DM venn diagrams, QR charts/graphs, SJ scenario flows. *Hook: "No outdated AR practice. No recycled 2023 papers."*

## 4. Differentiators / why pick UCAT Genius

- **Mobile-native, not a repurposed website.** Designed thumb-first for studying on the bus, between lessons, in bed.
- **Dark, premium UI.** Doesn't look like a school worksheet. Feels closer to a Linear/Notion/Apple aesthetic — students love it, parents recognise the quality.
- **2026-format content from day one.** No archived AR questions, no "ignore this section" notes.
- **Honest scoring.** Timed tests use real UCAT scaled-score conversion, not made-up percentages.
- **AI tutor inside the app.** Most competitors are static PDFs and worked-example videos. UCAT Genius answers the question *you* are stuck on.
- **One-time pricing option.** Lifetime tier — pay once, prep until you're done. Rare in this category.

## 5. Visual identity

The site **must match the app's visual language** so a student installing the app feels they've landed in the same product.

### Colour palette (dark theme — primary)

```
Background gradient:   #08131F → #07192E → #02050C
Surface (cards):       #081426
Surface raised:        #0D1A31
Surface soft:          #12213B
Border:                rgba(116, 154, 209, 0.24)
Border strong:         rgba(62, 139, 255, 0.58)

Text primary:          #F4F8FF
Text secondary:        #B8C6DA
Text muted:            #7188A6

Brand blue (primary):  #3D8BFF
Cyan (secondary):      #22D3EE
Teal:                  #28D8D4
Mint (success):        #5EF2C1
Purple (AI/highlight): #8B5CF6
Amber (accent):        #FF9F43
Red (alert):           #FB4C7A
```

### Typography

- Sans-serif system stack (Inter, SF Pro, or similar) — clean, modern, slightly tech-forward.
- Tight tracking on large headings, generous line height on body.
- Numerals tabular where stats are shown.

### UI motifs from the app to mirror on the web

- **Linear gradients** behind hero sections and cards (blue → deeper blue → near-black).
- **Glass / soft-glow surfaces** with subtle 1px borders in `rgba(62, 139, 255, 0.4-0.6)`.
- **Iconography:** outline style, 1.6-2.0px stroke, brand-blue or section-coloured. Section colours: VR=blue, DM=purple, QR=teal/mint, SJ=amber.
- **Soft shadow glow** under primary CTAs (blue glow, ~30% opacity).
- **Rounded corners:** 16-24px on cards, 12-14px on buttons.

### Tone of voice

- Confident, calm, slightly aspirational. Treats students as capable adults.
- Short sentences. Plain English. No jargon, no hype.
- Avoid: exclamation marks, "blast your score!", emojis in body copy, fake testimonials.
- OK: precise claims about the exam format, neutral statements about what the app does.

## 6. Pages / sections needed

Single-page marketing site (long scroll), with anchor nav. Plus a privacy policy and terms link to existing Notion pages.

Sections, in order:

1. **Sticky nav** — small logo (left), anchor links: Features · Sections · Pricing · FAQ · *Get the app* button (right, primary CTA).
2. **Hero** — Headline + subhead + dual CTA (App Store + Google Play badges, side by side). Background: dark gradient with subtle medical/grid pattern. Small badge: "Built for the 2026 UCAT."
3. **Phone mockup strip** — 2-3 device frames showing real screens (home, a DM venn question, the analytics dashboard). I'll provide screenshots later.
4. **The 5 core features** (see section 3) — alternating two-column layout, each with an icon, headline, body, and a small visual.
5. **The four UCAT sections we cover** — VR, DM, QR, SJ. Card per section with the 2026 question count + time + a one-line "what we do for it". Reinforces "built for 2026, no AR".
6. **AI tutor highlight** — separate, larger callout with purple/amber accents. Show a mock conversation: a question, a tutor explanation. This is a key differentiator.
7. **Pricing** — three tiers (Monthly / Season Pass 3mo / Lifetime). Mark Season Pass as "Best Value". Real prices come from the App Store at runtime; on the marketing site, show "from £X / month" placeholders that I can fill in. Add a small "Cancel anytime" / "One-time payment" reassurance row.
8. **FAQ** — 6-8 questions: When is the 2026 UCAT? Does the app cover SJ? Is there a free trial? What devices? How does the AI tutor work? Refund policy? Is AR included? (No.) Will my progress sync across devices?
9. **Footer** — Logo, copyright, links: Privacy Policy, Terms of Service, Support email (use the same email already used in-app: support contact via the in-app SupportScreen — confirm the address before publishing). Small "Made for UK med applicants" line.

Do **not** include: testimonials (no real users yet — never fake them), team page, blog (for v1), pricing currency switcher (App Store handles that).

## 7. Headline candidates (for the research pass to refine)

- "The UCAT prep app, built for 2026."
- "Pass the UCAT. On your phone."
- "Smarter UCAT prep. Built for the 2026 exam."
- "Everything you need for the 2026 UCAT — in your pocket."

Subhead candidates:

- "Lessons, practice, full mock exams, and an AI tutor — all in one app, designed for the new 4-section UCAT."
- "Bite-sized lessons. Realistic mock exams. An AI tutor when you're stuck. Built for the 2026 format."

## 8. Technical requirements for the build

- **Stack:** Plain static HTML + CSS + a small amount of vanilla JS. No framework needed. (Optional: Astro if the spec calls for components — Cloudflare Pages handles both.)
- **No build step preferred** so deployment is `git push` → live.
- **Performance:** Lighthouse 95+ on mobile. Inline critical CSS, lazy-load images, use `loading="lazy"` on screenshots.
- **Responsive:** Mobile-first. Hero must look killer on a 390px viewport since the audience studies on their phone.
- **Accessibility:** WCAG AA contrast on the dark theme. Keyboard nav. `prefers-reduced-motion` respected.
- **SEO:** Meta description, Open Graph image (use the app icon over a dark-blue gradient), title "UCAT Genius — UCAT 2026 Prep App", schema.org `MobileApplication` JSON-LD with rating left blank until reviews exist.
- **Analytics:** Add **Cloudflare Web Analytics** (privacy-friendly, no cookie banner needed). Skip GA.
- **Forms:** None for v1. (No newsletter capture yet — not enough to send.)
- **Assets needed from me:** App icon SVG/PNG, 3-4 screenshots, App Store + Play Store badge SVGs, App Store + Play Store URLs once approved.

## 9. Out of scope for v1

- Login / user dashboard
- Blog or content marketing
- Affiliate / referral system
- Multi-language (UK English only)
- A/B testing infra
- Email capture / newsletter

## 10. Constraints to respect

- **Never invent statistics.** Don't write "10,000 happy students" — there are none yet.
- **Never imply AR is in the exam or in the app.**
- **Never quote App Store prices in the page text** — they're rendered live in the app via RevenueCat and vary by region. Use generic phrasing like "from £X / month" or just "Monthly · 3 months · Lifetime" and let the App Store page show real prices.
- **Privacy policy lives at a Notion URL** (already public). Link out, don't rebuild.
- The site goes live **before** the app does — so the App Store / Play Store CTAs may need to be a "Notify me when it launches" mailto/Tally form for the first few weeks, then swapped for store badges. Account for this in the design.

---

## How to use this brief

1. Paste the whole document into Claude.ai (Research mode if available, otherwise normal chat with web search on).
2. Ask: *"Based on this brief, design the ideal single-page marketing website for ucatgenius.com. Output a detailed spec covering: section-by-section copy, layout, component structure, exact CTAs, microcopy, FAQ answers, and any motion/interaction notes. Write copy that is finished and ready to ship — don't leave [PLACEHOLDER] tags. Also flag anything in this brief you'd push back on."*
3. Take the spec output and start a new Claude Code session in a fresh `ucatgenius-web/` folder. Paste the spec and ask Claude Code to scaffold the site.
4. Push the result to GitHub, connect to Cloudflare Pages, point `ucatgenius.com` DNS at it.

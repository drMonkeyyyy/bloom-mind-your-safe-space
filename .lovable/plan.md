
# Bloom Mind — Landing Page Plan

A single-page, mobile-first landing in Bahasa Indonesia for Bloom Mind (AI emotional wellness companion). Premium SaaS quality, warm and calming, Gen Z friendly.

## Design System (src/styles.css)

- **Palette (oklch tokens)**
  - `--background` Warm Cream `#FAF8F4`
  - `--primary` Sage Green `#8AAE9F`
  - `--accent` Peach `#E2A58D`
  - `--foreground` deep warm charcoal, muted warm grays for body
  - Supporting: sage-soft, peach-soft, cream-deep for layered surfaces
  - Gradients: `--gradient-hero` (cream → sage soft), `--gradient-sage`, `--gradient-warm-cta`
  - Shadows: `--shadow-soft` (warm, low-spread), `--shadow-float` (for cards/mockups)
- **Typography** — loaded via `<link>` in `__root.tsx`
  - Headings: Playfair Display (400/600/700) — elegant, emotional
  - Body: Inter (400/500/600)
  - Large readable sizes, generous line-height
- **Radius**: 1rem base, 1.5–2rem for cards/mockups (rounded, soft)
- **Animations** (tw-animate-css already present): fade-in-up on scroll (IntersectionObserver hook), gentle float keyframe for decorative blobs, soft hover scale on cards

## File Structure

```
src/
  routes/
    __root.tsx           // add Google Fonts <link>, update meta
    index.tsx            // compose all sections, SEO head
  components/
    landing/
      Navbar.tsx
      Hero.tsx
      PainPoints.tsx        // "Pernah merasa seperti ini?"
      Features.tsx          // 6 feature cards
      HowItWorks.tsx        // 3-step timeline
      Companions.tsx        // 7 companion cards + custom upload
      EmotionalEating.tsx   // Emotion → Trigger → Pattern → Insight flow
      GrowthDashboard.tsx   // analytics mockup
      EmergencyMode.tsx     // calming illustration + 4 tools
      Testimonials.tsx      // 3 cards
      Pricing.tsx           // single premium card
      FinalCTA.tsx          // sage gradient
      Footer.tsx
      mockups/
        PhoneChatMockup.tsx        // SVG/JSX phone w/ chat bubbles + mood tracker
        DashboardMockup.tsx        // SVG charts (mood trend, streak, etc.)
        AvatarCustomMockup.tsx     // companion picker screen
        EatingFlowMockup.tsx       // 4-step horizontal flow
      decor/
        FloatingBlob.tsx           // animated soft shapes
        SoftIllustration.tsx       // inline SVG illustrations per section
  hooks/
    use-reveal-on-scroll.ts        // IntersectionObserver → adds fade-in-up class
  assets/
    (generated illustrations as needed — hero scene, emergency calm scene)
```

## Section-by-Section

1. **Navbar** — small, transparent → solid on scroll, logo (sage leaf + "Bloom Mind"), links (Fitur, Cara Kerja, Harga), "Mulai Gratis" peach button.
2. **Hero** — left column: Playfair H1, subheadline, two CTAs (peach primary, ghost secondary), trust badge row with check icons. Right column: phone mockup (chat bubbles in Bahasa + mini mood tracker card overlapping), floating sage/peach blobs animating gently.
3. **Pain Points** — 6 rounded cards in 2×3 (1-col mobile) with emoji, soft hover lift, sage closing line centered.
4. **Features** — 6 cards (3×2 desktop), each with custom inline SVG icon in sage/peach circle, title (Playfair), description (Inter), subtle hover gradient border.
5. **How It Works** — vertical timeline on mobile / horizontal on desktop, 3 numbered steps with soft illustrations and connecting dotted path.
6. **Companions** — horizontal scroll/grid of 7 emoji-avatar cards with role names; below: highlight panel for "Custom Companion" with avatar customization mockup (photo upload UI mock).
7. **Emotional Eating** — 4-step flow (Emotion → Trigger → Eating Pattern → Insight) as connected pill cards with arrow icons; copy with the "Tidak semua rasa lapar..." line as a pull-quote.
8. **Growth Dashboard** — large mockup card with inline SVG charts: mood trend line, stress score ring, energy bars, streak counter, top triggers list, weekly summary.
9. **Emergency Mode** — split layout: large calming illustration (breathing circle animation) + 4 tool chips (Breathing, Grounding, Self-Calming, Quick Support).
10. **Testimonials** — 3 cards, avatar initials, quote in Playfair italic, name + role, soft sage background band.
11. **Pricing** — single centered premium card with peach gradient border, feature checklist, CTA, small witty line below.
12. **Final CTA** — full-bleed sage gradient section, Playfair headline, sub, large peach CTA, floating decorative shapes.
13. **Footer** — logo, 4 menu links, tagline "Your Safe Place To Grow", copyright.

## Interactions & Micro-details

- `useRevealOnScroll` adds `animate-fade-in` to elements on intersection.
- Float keyframe (8–12s ease-in-out infinite) on hero blobs and decorative shapes.
- Cards: `transition-all duration-300 hover:-translate-y-1 hover:shadow-float`.
- Buttons: peach primary with subtle inner glow on hover; sage outline secondary.
- Breathing circle in Emergency Mode uses CSS scale animation.

## SEO & Meta (index.tsx head)

- Title: "Bloom Mind — Pendamping AI untuk Tumbuh & Memahami Diri"
- Meta description (BI, <160 chars)
- OG title/description/type=website, og:url, twitter:card=summary_large_image
- Single H1 in Hero; semantic `<section>` with aria-labels; alt text on all illustrations.
- JSON-LD: SoftwareApplication schema (name, description, offers Rp49.000/bulan, inLanguage id-ID).

## Technical Notes

- Fonts loaded via `<link rel="stylesheet">` in `__root.tsx` head (preconnect to fonts.gstatic.com). No URL `@import` in styles.css.
- All colors via semantic tokens — no hardcoded hex in components.
- All mockups are pure JSX/SVG (no external images required) so it ships fast and stays crisp; optionally generate 1–2 hero/emergency illustrations with imagegen if needed for warmth.
- Mobile-first Tailwind: base styles for mobile, `md:` and `lg:` upgrades.
- Accessibility: focus-visible rings on interactive elements, color contrast checked, prefers-reduced-motion disables float/breath animations.

## Out of Scope (this pass)

- No backend, auth, payments, or working chat — landing page only.
- "Mulai Gratis" CTAs are visual buttons (no signup flow yet).

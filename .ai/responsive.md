# skill.md
# Mobile-First Responsive UI/UX Standards

## ROLE

You are a Senior UI/UX Designer, Senior Frontend Engineer, Mobile UX Specialist, and Design System Architect.

Your responsibility is NOT only to make the UI look beautiful.

Your responsibility is to produce interfaces that are:

- Mobile-first
- Responsive
- Accessible
- Fast
- Production-ready
- Following modern UX best practices
- Consistent across the entire application

Never generate desktop-first layouts.

Always think mobile first.

---

# PRIMARY PRINCIPLES

Every page must satisfy these goals:

✅ Excellent usability

✅ One-hand usage

✅ Comfortable thumb reach

✅ Responsive on every device

✅ Clean hierarchy

✅ Consistent spacing

✅ Fast loading

✅ Accessible

---

# MOBILE FIRST

Design order:

1. Mobile
2. Tablet
3. Small Laptop
4. Desktop
5. Ultrawide

Never start from desktop.

---

# RESPONSIVE BREAKPOINTS

Use these breakpoints.

xs:
320px

sm:
375px

md:
390px

lg:
414px

tablet:
768px

laptop:
1024px

desktop:
1280px

wide:
1536px

No horizontal scrolling is allowed.

---

# LAYOUT RULES

Maximum content width:

Desktop:
1280px

Large forms:
720px

Reading content:
680px

Dashboard cards:
Responsive grid

Never stretch components edge-to-edge unnecessarily.

---

# SPACING SYSTEM

Use an 8pt spacing system.

Allowed spacing:

4

8

12

16

20

24

32

40

48

64

80

96

Avoid random spacing values.

---

# TOUCH TARGETS

Every clickable element must be:

Minimum

44x44 px

Preferred

48x48 px

Never smaller.

---

# TYPOGRAPHY

Use fluid typography.

Example

Heading

32
28
24
20

Body

16

Small

14

Caption

12

Line height:

1.4–1.6

Never use text smaller than 12px.

---

# SAFE AREA

Support:

iPhone Notch

Dynamic Island

Android Cutout

Bottom Home Indicator

Respect safe-area-inset.

---

# MOBILE NAVIGATION

Preferred:

Bottom Navigation

Floating CTA

Sticky Action Button

Sticky Save Button

Avoid desktop navigation patterns.

---

# FORMS

Every form must have:

Large inputs

Clear labels

Helpful placeholders

Inline validation

Error state

Loading state

Success state

Keyboard optimization

Next field navigation

Proper input type

---

# BUTTONS

Buttons must include

Default

Hover

Pressed

Focused

Loading

Disabled

Success

Danger

Never use tiny buttons.

---

# CARDS

Cards should have

Consistent padding

Rounded corners

Subtle elevation

Good hierarchy

Comfortable spacing

No clutter

---

# RESPONSIVE IMAGES

Images must

Scale automatically

Never overflow

Use object-fit

Maintain aspect ratio

Support retina

Lazy load if appropriate

---

# RESPONSIVE TABLES

Never force desktop tables.

Instead:

Card layout

Horizontal scroll only if absolutely necessary

Collapsible rows

---

# GRID

Use responsive grid.

Examples

1 column

↓

2 columns

↓

3 columns

↓

4 columns

Automatically adapt.

---

# ACCESSIBILITY

Must satisfy WCAG AA.

Include

Keyboard navigation

Visible focus

Screen reader labels

ARIA

Color contrast

Reduced motion

Dark mode support

---

# PERFORMANCE

Prefer

CSS Grid

Flexbox

GPU animation

Lazy loading

Image optimization

Component reuse

Code splitting

Avoid unnecessary rerenders.

---

# ANIMATION

Animation should be subtle.

Duration

150–300ms

Ease

ease-out

No excessive animation.

Respect prefers-reduced-motion.

---

# LOADING

Every screen must include

Skeleton

Loading state

Empty state

Offline state

Error state

Retry state

---

# DESIGN CONSISTENCY

All pages must use

Same spacing

Same radius

Same shadows

Same typography

Same icon size

Same color tokens

No inconsistent UI.

---

# RESPONSIVE VALIDATION

Before considering a page complete, validate:

□ 320px

□ 360px

□ 375px

□ 390px

□ 414px

□ 768px

□ 1024px

□ 1280px

If any layout breaks,
fix it before continuing.

---

# MOBILE QA CHECKLIST

Every screen must pass:

□ No horizontal scrolling

□ No clipped text

□ No overlapping elements

□ No hidden buttons

□ No inaccessible controls

□ No tiny touch targets

□ Proper keyboard behavior

□ Correct safe area

□ Correct scrolling

□ Responsive images

□ Responsive cards

□ Responsive forms

□ Responsive dialogs

□ Responsive navigation

□ Correct loading state

□ Correct empty state

□ Correct error state

---

# FINAL SELF REVIEW

Before finishing ANY task, perform an internal review.

Validate:

Visual hierarchy

Responsive layout

Accessibility

Spacing consistency

Interaction consistency

Performance

Animation

Best UX practices

Production readiness

If any issue exists,

continue improving until all checks pass.

Never deliver unfinished UI.

---

# QUALITY STANDARD

The final UI should feel comparable to products from:

- Apple
- Linear
- Notion
- Airbnb
- Stripe
- Revolut
- Duolingo
- Headspace

Prioritize clarity over decoration.

Every design decision must improve usability.
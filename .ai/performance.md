# PERFORMANCE.md
# Performance Engineering Constitution

## PURPOSE

Performance is a core feature, not an optional enhancement.

Every screen, interaction, API request, and animation must be optimized for speed, responsiveness, efficiency, and scalability.

Never sacrifice user experience for unnecessary visual effects.

Assume users may have:

- Slow mobile devices
- Limited RAM
- Poor network connections
- High latency
- Battery constraints

Optimize for the worst reasonable conditions first.

---

# ROLE

You are simultaneously acting as:

- Senior Performance Engineer
- Senior Frontend Engineer
- Senior Backend Engineer
- Senior Database Engineer
- Senior Mobile UX Engineer
- Senior DevOps Engineer
- Core Web Vitals Specialist

Your responsibility is not only to build working software.

Your responsibility is to build software that remains fast under real-world conditions and production-scale usage.

---

# PERFORMANCE PRINCIPLES

Always follow:

- Mobile First
- Performance by Default
- Progressive Enhancement
- Lazy Everything
- Reuse Before Rebuild
- Optimize Before Expanding
- Minimize Network Requests
- Cache Aggressively Where Safe
- Measure Before Optimizing

---

# FRONTEND PERFORMANCE

Always

- Lazy load pages
- Lazy load images
- Lazy load heavy components
- Code split routes
- Tree shake unused code
- Remove dead code
- Minimize bundle size
- Reuse components
- Memoize expensive computations where appropriate
- Prevent unnecessary re-renders

Never

- Import entire libraries when only a small portion is needed
- Render hidden heavy components
- Load unnecessary assets on startup
- Block rendering with non-critical resources

---

# IMAGE OPTIMIZATION

Always

- Compress images
- Use responsive image sizes
- Preserve aspect ratio
- Enable lazy loading
- Prefer modern image formats when supported
- Prevent layout shift

Never

- Load oversized images
- Stretch images
- Load full-resolution assets unnecessarily

---

# FONT OPTIMIZATION

Limit the number of font families.

Limit font weights.

Use efficient font loading.

Prevent layout shifts caused by font swapping.

---

# CSS PERFORMANCE

Prefer

- CSS Grid
- Flexbox
- Utility classes
- Shared design tokens

Avoid

- Deep selector nesting
- Duplicate styles
- Unused CSS
- Excessive animations

---

# JAVASCRIPT PERFORMANCE

Minimize

- Main thread blocking
- Large synchronous tasks
- Expensive loops
- Frequent DOM manipulation

Split heavy work into smaller tasks.

Avoid unnecessary timers.

Debounce rapid user input where appropriate.

Throttle expensive event listeners.

---

# REACT PERFORMANCE

Always

- Split components logically
- Avoid unnecessary state updates
- Keep state as local as possible
- Memoize only when beneficial
- Clean up effects
- Prevent infinite rendering loops

Never

- Overuse global state
- Trigger cascading renders
- Store derived data unnecessarily

---

# API PERFORMANCE

Every API should

- Return only required fields
- Support pagination where appropriate
- Validate input efficiently
- Minimize payload size
- Compress responses if available
- Avoid duplicate requests

Never

- Over-fetch data
- Under-fetch repeatedly
- Return unnecessary nested objects

---

# DATABASE PERFORMANCE

Always

- Use indexes appropriately
- Optimize queries
- Select only necessary columns
- Limit returned records
- Prevent N+1 query problems
- Use transactions only when needed

Never

- Execute unnecessary joins
- Fetch entire tables
- Perform repeated identical queries
- Ignore query performance

---

# CACHING

Cache whenever safe.

Examples

- Static assets
- Configuration
- Public resources
- Frequently requested data

Invalidate caches correctly.

Never serve stale sensitive information.

---

# NETWORK PERFORMANCE

Reduce

- Number of requests
- Payload size
- Duplicate API calls

Batch requests when appropriate.

Avoid waterfall loading patterns.

---

# MOBILE PERFORMANCE

Optimize for

- Low memory devices
- Slow CPUs
- Battery efficiency
- One-handed interaction
- Limited bandwidth

Avoid excessive animations or background processing.

---

# ANIMATION PERFORMANCE

Prefer animations using

- transform
- opacity

Avoid animating

- width
- height
- margin
- top
- left

Keep animation durations between 150ms and 300ms unless a different duration improves usability.

Respect user preferences for reduced motion.

---

# SCROLL PERFORMANCE

Ensure smooth scrolling.

Avoid layout thrashing.

Avoid expensive calculations during scroll events.

Virtualize large lists when necessary.

---

# MEMORY MANAGEMENT

Prevent

- Memory leaks
- Detached DOM nodes
- Unused event listeners
- Stale timers
- Unreleased resources

Always clean up subscriptions and listeners.

---

# LOADING EXPERIENCE

Every screen must include

- Loading state
- Skeleton UI where appropriate
- Empty state
- Error state
- Retry option

Never leave users without feedback.

---

# CORE WEB VITALS TARGETS

Target

Largest Contentful Paint (LCP)

Less than 2.5 seconds

Interaction to Next Paint (INP)

Less than 200 milliseconds

Cumulative Layout Shift (CLS)

Less than 0.1

Time to First Byte (TTFB)

Less than 800 milliseconds

First Contentful Paint (FCP)

Less than 1.8 seconds

---

# ACCESSIBILITY PERFORMANCE

Performance improvements must never reduce accessibility.

Maintain

- Keyboard navigation
- Screen reader support
- Focus indicators
- Color contrast

---

# PERFORMANCE TESTING

Before completing any feature, verify

- Cold start performance
- Warm cache performance
- Slow network performance
- Mobile device performance
- Tablet performance
- Desktop performance

Test using

- Slow 3G
- Fast 3G
- 4G
- Wi-Fi

---

# PERFORMANCE AUDIT

Review

- Bundle size
- Route size
- Image sizes
- Font loading
- JavaScript execution
- CSS size
- API latency
- Database query time
- Rendering performance

Identify bottlenecks and optimize them before completion.

---

# SELF OPTIMIZATION

After implementing every feature

perform an internal performance review.

Ask

- Can this render fewer components?
- Can fewer network requests be made?
- Can the bundle be smaller?
- Can memory usage be reduced?
- Can startup time improve?
- Can scrolling become smoother?
- Can battery usage decrease?

Apply improvements before marking the feature complete.

---

# DEFINITION OF DONE

A feature is NOT complete until

✓ Mobile performance verified

✓ Desktop performance verified

✓ Bundle optimized

✓ Images optimized

✓ Fonts optimized

✓ Lazy loading applied where appropriate

✓ No unnecessary re-renders

✓ Efficient API usage

✓ Database queries reviewed

✓ Loading states implemented

✓ Core Web Vitals targets met

✓ No major memory leaks detected

✓ Smooth scrolling

✓ Production-ready

If any performance issue remains unresolved, continue optimizing before considering the task complete.
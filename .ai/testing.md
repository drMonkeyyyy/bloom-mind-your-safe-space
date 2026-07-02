# TESTING.md

## PURPOSE

Every feature must be tested before completion.

Never assume a feature works because it looks correct.

A feature is complete only after functional, responsive, accessibility, security, performance, and edge-case testing pass.

---

## ROLE

You are a Senior QA Engineer, Test Automation Engineer, Product Tester, Accessibility Tester, and Regression Tester.

---

## REQUIRED TEST TYPES

Test every feature for:

- Happy path
- Empty state
- Loading state
- Error state
- Offline state
- Invalid input
- Edge cases
- Mobile responsiveness
- Tablet responsiveness
- Desktop responsiveness
- Accessibility
- Security
- Performance
- Regression

---

## RESPONSIVE TESTING

Test these widths:

- 320px
- 360px
- 375px
- 390px
- 414px
- 768px
- 1024px
- 1280px
- 1536px

Pass criteria:

- No horizontal scroll
- No clipped text
- No overlapping elements
- Buttons remain clickable
- Forms remain usable
- Navigation remains accessible
- Dialogs fit screen
- Keyboard does not block important actions

---

## FORM TESTING

Every form must test:

- Empty submission
- Invalid email
- Weak password
- Long input
- Special characters
- Duplicate submission
- Slow network
- Server error
- Success response

---

## AUTH TESTING

Test:

- Register
- Login
- Logout
- Forgot password
- Reset password
- Invalid credentials
- Expired session
- Unauthorized access
- Role-based access
- Admin-only route protection

---

## API TESTING

Every API must test:

- Valid request
- Invalid request
- Missing token
- Expired token
- Wrong user
- Wrong role
- Rate limit
- Large payload
- Malformed payload

---

## ACCESSIBILITY TESTING

Check:

- Keyboard navigation
- Visible focus state
- Screen reader labels
- Color contrast
- Semantic HTML
- Touch target size
- Reduced motion support

---

## REGRESSION TESTING

After every change, verify that existing features still work.

Never fix one feature by breaking another.

---

## EDGE CASE TESTING

Always test:

- Empty data
- Very long text
- Many records
- Slow internet
- Failed API
- Expired auth
- Duplicate clicks
- Back button behavior
- Refresh behavior
- Mobile keyboard behavior

---

## FINAL DEFINITION OF DONE

A feature is NOT complete until:

✓ Functional test passed  
✓ Responsive test passed  
✓ Accessibility test passed  
✓ Security test passed  
✓ Performance test passed  
✓ Edge cases tested  
✓ Regression checked  
✓ No console errors  
✓ No broken UI  
✓ No broken routes  
✓ Production-ready  

If any test fails, fix it before marking the task complete.
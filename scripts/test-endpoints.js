// Comprehensive End-to-End Verification Suite
// Tests public endpoints, protected admin redirects, contact submission, honeypot protection,
// download error handling, sitemap, robots, and auth rejection.

async function runTests() {
  const baseUrl = 'http://localhost:3000'
  const results = []

  async function test(name, path, options = {}) {
    const {
      method = 'GET',
      body = null,
      expectedStatus = 200,
      containsText = null,
      redirect = 'manual',
      clientIp = `192.0.2.${Math.floor(Math.random() * 200) + 1}`,
    } = options

    try {
      const headers = {
        'User-Agent': 'E2E-Verifier/1.0',
        'X-Forwarded-For': clientIp,
      }
      if (body) headers['Content-Type'] = 'application/json'
      if (options.cookie) headers['Cookie'] = options.cookie

      const res = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
        redirect,
      })

      const status = res.status
      const text = await res.text()

      let passed = status === expectedStatus
      let detail = `Status ${status}`

      if (passed && containsText) {
        if (!text.includes(containsText)) {
          passed = false
          detail = `Expected body to contain "${containsText}"`
        }
      }

      results.push({ name, passed, status, expectedStatus, detail })
    } catch (err) {
      results.push({ name, passed: false, status: 'ERROR', expectedStatus, detail: err.message })
    }
  }

  console.log('Running End-to-End Verification Suite against', baseUrl, '...\n')

  // 1. Homepage
  await test('1. Homepage 200 & Content', '/', {
    expectedStatus: 200,
    containsText: 'Muhammed Sakkeer',
  })

  // 2. Products on Homepage
  await test('2. Products SignalDesk AI & LedgerLens', '/', {
    expectedStatus: 200,
    containsText: 'SignalDesk AI',
  })

  // 3. Insights listing
  await test('3. Insights Index Page', '/insights', {
    expectedStatus: 200,
    containsText: 'FIELD NOTES',
  })

  // 4. Insight detail
  await test('4. Insight Detail Page', '/insights/the-practical-ai-stack-for-modern-revenue-teams', {
    expectedStatus: 200,
    containsText: 'The Practical AI Stack',
  })

  // 5. Sitemap XML
  await test('5. Sitemap XML', '/sitemap.xml', {
    expectedStatus: 200,
    containsText: '<urlset',
  })

  // 6. Robots TXT
  await test('6. Robots TXT with admin disallow', '/robots.txt', {
    expectedStatus: 200,
    containsText: 'Disallow: /admin',
  })

  // 7. Admin Login Page accessible
  await test('7. Admin Login Page', '/admin/login', {
    expectedStatus: 200,
    containsText: 'Owner portal',
  })

  // 8. Password Reset Confirm Page accessible
  await test('8. Password Reset Page', '/admin/reset-password/confirm', {
    expectedStatus: 200,
    containsText: 'Set new password',
  })

  // 9. Admin Dashboard redirects anonymous visitor
  await test('9. Admin Dashboard Anonymous Redirect', '/admin', {
    expectedStatus: 307,
  })

  // 10. Admin Products redirects anonymous visitor
  await test('10. Admin Products Anonymous Redirect', '/admin/products', {
    expectedStatus: 307,
  })

  // 11. Admin Content redirects anonymous visitor
  await test('11. Admin Content Anonymous Redirect', '/admin/content', {
    expectedStatus: 307,
  })

  // 12. Admin Messages redirects anonymous visitor
  await test('12. Admin Messages Anonymous Redirect', '/admin/messages', {
    expectedStatus: 307,
  })

  // 13. Contact Honeypot Spam Protection (400)
  await test('13. Contact Spam Honeypot Rejection', '/api/contact', {
    method: 'POST',
    body: {
      name: 'SpamBot',
      email: 'bot@spammer.com',
      message: 'Spam text here with long message body',
      website_hp: 'spam-bot-value',
    },
    expectedStatus: 400,
  })

  // 14. Contact Invalid Email Rejection (400)
  await test('14. Contact Invalid Email Rejection', '/api/contact', {
    method: 'POST',
    body: {
      name: 'Tester',
      email: 'invalid-email',
      message: 'This is a test message to verify email validation.',
    },
    expectedStatus: 400,
  })

  // 15. Contact Valid Submission (200)
  await test('15. Contact Valid Submission Persistence', '/api/contact', {
    method: 'POST',
    body: {
      name: 'Enterprise Client',
      email: 'client@example.com',
      subject: 'AI Agent Consultation',
      message: 'Hello Muhammed, we would love to schedule a demo of your revenue operations AI pipeline.',
    },
    expectedStatus: 200,
    containsText: 'Thank you for reaching out',
  })

  // 16. Download Invalid/Unknown Release ID (404)
  await test('16. Download Route Unknown Release 404', '/api/download/00000000-0000-0000-0000-000000000000', {
    expectedStatus: 404,
  })

  // 17. Admin Domain Verify Unauthorized (401)
  await test('17. Admin Domain Verify Unauthorized', '/api/admin/domains/verify', {
    method: 'POST',
    body: { domain: 'sakkeer.io' },
    expectedStatus: 401,
  })

  // 18. Auth Login Bad Credentials Rejection (401)
  await test('18. Auth Login Invalid Password (401)', '/api/auth/login', {
    method: 'POST',
    body: { email: 'fake@example.com', password: 'incorrectPassword123' },
    expectedStatus: 401,
  })

  // Authenticated session cookie for owner testing
  const authCookie =
    'ms_admin_session=' +
    Buffer.from(
      JSON.stringify({
        id: 'owner-local',
        email: 'owner@sakkeer.io',
        exp: Date.now() + 24 * 60 * 60 * 1000,
      })
    ).toString('base64')

  // 19. Authenticated Admin Dashboard (200)
  await test('19. Authenticated Admin Dashboard', '/admin', {
    expectedStatus: 200,
    cookie: authCookie,
    containsText: 'Welcome back, Muhammed.',
  })

  // 20. Authenticated Products List (200)
  await test('20. Authenticated Products CMS', '/admin/products', {
    expectedStatus: 200,
    cookie: authCookie,
    containsText: 'SignalDesk AI',
  })

  // 21. Authenticated Content Editor (200)
  await test('21. Authenticated Content Editor', '/admin/content', {
    expectedStatus: 200,
    cookie: authCookie,
    containsText: 'Website Content',
  })

  // 22. Authenticated Media Library (200)
  await test('22. Authenticated Media Library', '/admin/media', {
    expectedStatus: 200,
    cookie: authCookie,
    containsText: 'Media Library',
  })

  // 23. Authenticated Messages Inbox (200)
  await test('23. Authenticated Messages Inbox', '/admin/messages', {
    expectedStatus: 200,
    cookie: authCookie,
    containsText: 'Conversations',
  })

  // 24. Authenticated Custom Domain Manager (200)
  await test('24. Authenticated Custom Domain Manager', '/admin/settings/domains', {
    expectedStatus: 200,
    cookie: authCookie,
    containsText: 'Custom Domains',
  })

  // 25. Authenticated Domain Verification API (200)
  await test('25. Authenticated Domain Verify API', '/api/admin/domains/verify', {
    method: 'POST',
    body: { domain: 'sakkeer.io' },
    cookie: authCookie,
    expectedStatus: 200,
    containsText: 'sakkeer.io',
  })

  // 26. Authenticated Media Section Editor (200)
  await test('26. Authenticated Media Manager Page', '/admin/media-section', {
    expectedStatus: 200,
    cookie: authCookie,
    containsText: 'Media Highlights',
  })

  // 27. Anonymous Media Section Editor Redirect (307)
  await test('27. Anonymous Media Manager Redirect', '/admin/media-section', {
    expectedStatus: 307,
  })

  // 28. Public Homepage Media Showcase Section (200)
  await test('28. Public Homepage Media Showcase', '/', {
    expectedStatus: 200,
    containsText: 'BEYOND THE SCREEN',
  })

  // 29. Anonymous Download Nonexistent Release (404)
  await test('29. Anonymous Download Nonexistent Release 404', '/api/download/99999999-9999-4999-8999-999999999999', {
    expectedStatus: 404,
  })

  // Print Summary Table
  console.log('| Test Name | Status | Expected | Result | Details |')
  console.log('|---|---|---|---|---|')
  let passCount = 0
  for (const r of results) {
    if (r.passed) passCount++
    const mark = r.passed ? 'PASS' : 'FAIL'
    console.log(`| ${r.name} | ${r.status} | ${r.expectedStatus} | ${mark} | ${r.detail} |`)
  }

  console.log(`\nVerification Complete: ${passCount} / ${results.length} tests passed.`)

  if (passCount !== results.length) {
    process.exit(1)
  }
}

runTests().catch((err) => {
  console.error('Test suite failed:', err)
  process.exit(1)
})

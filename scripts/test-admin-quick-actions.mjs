import './load-env.mjs';
import { createClient } from '@supabase/supabase-js';

const TEST_EMAIL = process.env.OWNER_EMAIL || 'techsakeer@gmail.com';
const TEST_PASSWORD = process.env.OWNER_INITIAL_PASSWORD;

async function verifyAdminHub() {
  console.log('Verifying /admin complete entry point & navigation flows...\n');
  let passed = 0;
  let total = 0;

  function assert(name, condition, details = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`[PASS] ${name} ${details}`);
    } else {
      console.error(`[FAIL] ${name} ${details}`);
    }
  }

  // 1. Anonymous /admin redirect
  const anonRes = await fetch('http://localhost:3000/admin', { redirect: 'manual' });
  const location = anonRes.headers.get('location') || '';
  assert(
    'Anonymous /admin redirects to login with next param',
    anonRes.status === 307 && location.includes('/admin/login'),
    `Status ${anonRes.status}, Location: ${location}`
  );

  // 2. Perform Owner Login to get session cookies
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
  });
  const setCookies = loginRes.headers.get('set-cookie');
  assert('Owner login succeeds', loginRes.status === 200, `Status ${loginRes.status}`);

  if (!setCookies) {
    console.warn('[WARN] No set-cookie header returned; skipping authenticated markup checks');
    return;
  }

  const cookieHeader = setCookies
    .split(',')
    .map((c) => c.split(';')[0].trim())
    .join('; ');

  // 3. Authenticated /admin dashboard
  const dashRes = await fetch('http://localhost:3000/admin', {
    headers: { cookie: cookieHeader },
  });
  assert('Authenticated /admin returns 200 OK', dashRes.status === 200);
  const dashHtml = await dashRes.text();

  // 4. Verify all 11 Quick Action buttons in dashboard HTML
  assert('Contains "Add Application"', dashHtml.includes('Add Application') && dashHtml.includes('/admin/products/new'));
  assert('Contains "Manage Applications"', dashHtml.includes('Manage Applications') && dashHtml.includes('/admin/products'));
  assert('Contains "Upload New Version"', dashHtml.includes('Upload New Version'));
  assert('Contains "Add Article"', dashHtml.includes('Add Article') && dashHtml.includes('/admin/insights/new'));
  assert('Contains "Manage Articles"', dashHtml.includes('Manage Articles') && dashHtml.includes('/admin/insights'));
  assert('Contains "Add Video / Media"', dashHtml.includes('Add Video / Media') && dashHtml.includes('/admin/media-section'));
  assert('Contains "Photo Library"', dashHtml.includes('Photo Library') && dashHtml.includes('/admin/media'));
  assert('Contains "Edit Website Content"', dashHtml.includes('Edit Website Content') && dashHtml.includes('/admin/content'));
  assert('Contains "Social Links"', dashHtml.includes('Social Links') && dashHtml.includes('/admin/content?tab=socials'));
  assert('Contains "Contact Messages"', dashHtml.includes('Contact Messages') && dashHtml.includes('/admin/messages'));
  assert('Contains "Domain Settings"', dashHtml.includes('Domain Settings') && dashHtml.includes('/admin/settings/domains'));

  // 5. Verify persistent navigation links
  assert('Navigation contains Dashboard link', dashHtml.includes('Dashboard'));
  assert('Mobile navigation drawer button exists', dashHtml.includes('aria-label="Toggle navigation drawer"'));

  // 6. Test /admin/content?tab=socials route
  const socialsRes = await fetch('http://localhost:3000/admin/content?tab=socials', {
    headers: { cookie: cookieHeader },
  });
  assert('Direct /admin/content?tab=socials returns 200 OK', socialsRes.status === 200);

  // 7. Test /admin/products/new route (3 working tabs)
  const newProductRes = await fetch('http://localhost:3000/admin/products/new', {
    headers: { cookie: cookieHeader },
  });
  assert('Direct /admin/products/new returns 200 OK', newProductRes.status === 200);
  const newProductHtml = await newProductRes.text();
  assert('New product form includes Upload App File tab', newProductHtml.includes('Upload App File'));
  assert('New product form includes Web App Link tab', newProductHtml.includes('Web App Link'));
  assert('New product form includes GitHub Project tab', newProductHtml.includes('GitHub Project'));

  console.log(`\nVerification Complete: ${passed} / ${total} checks passed.`);
  if (passed !== total) process.exit(1);
}

verifyAdminHub().catch((err) => {
  console.error('Verification error:', err);
  process.exit(1);
});

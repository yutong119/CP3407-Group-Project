/* eslint-disable no-console */
const { randomUUID } = require('crypto');

const DEFAULT_CANDIDATES = [
  process.env.BASE_URL,
  'http://localhost:5001',
  'http://localhost:5000'
].filter(Boolean);

const TEST_TIMEOUT_MS = Number(process.env.TEST_TIMEOUT_MS || 15000);

function endpoint(baseUrl, path) {
  return `${baseUrl}${path}`;
}

function withTimeout(ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { controller, timer };
}

async function requestJson(baseUrl, path, options = {}) {
  const { controller, timer } = withTimeout(TEST_TIMEOUT_MS);
  try {
    const response = await fetch(endpoint(baseUrl, path), {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });

    const raw = await response.text();
    let body;
    try {
      body = raw ? JSON.parse(raw) : {};
    } catch {
      body = { raw };
    }

    return { response, body };
  } finally {
    clearTimeout(timer);
  }
}

function logPass(name, details = '') {
  console.log(`PASS ${name}${details ? ` - ${details}` : ''}`);
}

function logFail(name, details = '') {
  console.error(`FAIL ${name}${details ? ` - ${details}` : ''}`);
}

async function findBaseUrl() {
  for (const candidate of DEFAULT_CANDIDATES) {
    try {
      const { response, body } = await requestJson(candidate, '/api/health', { method: 'GET' });
      if (response.ok && (body.status === 'OK' || body.success !== false)) {
        return candidate;
      }
    } catch {
      // Try next candidate.
    }
  }

  throw new Error(
    `Could not reach backend health endpoint. Tried: ${DEFAULT_CANDIDATES.join(', ')}`
  );
}

async function run() {
  const failures = [];
  const criticalFailures = [];

  const record = (name, ok, details, isCritical = true) => {
    if (ok) {
      logPass(name, details);
      return;
    }

    logFail(name, details);
    failures.push(name);
    if (isCritical) {
      criticalFailures.push(name);
    }
  };

  let baseUrl;
  try {
    baseUrl = await findBaseUrl();
    logPass('Backend base URL discovery', baseUrl);
  } catch (error) {
    logFail('Backend base URL discovery', error.message);
    process.exit(1);
  }

  const suffix = `${Date.now()}-${randomUUID().slice(0, 8)}`;
  const email = `teacher.demo.${suffix}@example.com`;
  const password = 'TeacherDemo123!';
  const fullName = 'Teacher Demo Account';

  let token = '';
  let userId;
  let caseId;
  let checklistId;
  let originalChecklistState;
  let chosenCategoryId;

  // 1) backend health
  try {
    const { response, body } = await requestJson(baseUrl, '/api/health', { method: 'GET' });
    record('backend health', response.ok && body.status === 'OK', `status=${response.status}`);
  } catch (error) {
    record('backend health', false, error.message);
  }

  // 2) categories
  try {
    const { response, body } = await requestJson(baseUrl, '/api/categories', { method: 'GET' });
    const categories = body.categories || [];
    chosenCategoryId = categories[0]?.category_id;
    record(
      'categories',
      response.ok && Array.isArray(categories) && categories.length > 0,
      `count=${categories.length}`
    );
  } catch (error) {
    record('categories', false, error.message);
  }

  // 3) register/login
  try {
    const registerRes = await requestJson(baseUrl, '/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
        preferred_language: 'English'
      })
    });

    const registerOk = registerRes.response.status === 201 && registerRes.body.success === true;
    userId = registerRes.body.user_id;
    record('register', registerOk, `status=${registerRes.response.status}`);

    const loginRes = await requestJson(baseUrl, '/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    token = loginRes.body.token;
    const loginOk = loginRes.response.ok && !!token;
    record('login', loginOk, `status=${loginRes.response.status}`);
  } catch (error) {
    record('register/login', false, error.message);
  }

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  // 4) protected route authorization
  try {
    const { response } = await requestJson(baseUrl, '/api/users/profile', { method: 'GET' });
    record('protected route authorization', response.status === 401, `status=${response.status}`);
  } catch (error) {
    record('protected route authorization', false, error.message);
  }

  // 5) profile
  try {
    const { response, body } = await requestJson(baseUrl, '/api/users/profile', {
      method: 'GET',
      headers: authHeaders
    });

    const ok = response.ok && body.user?.email === email;
    record('profile', ok, `status=${response.status}`);
  } catch (error) {
    record('profile', false, error.message);
  }

  // 6) analyze (multilingual input)
  let analyzePayload = null;
  try {
    const { response, body } = await requestJson(baseUrl, '/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        description: '我的包在学校图书馆被偷了，里面有钱包和护照。',
        location: 'University Library',
        preferredLanguage: 'zh-CN'
      })
    });

    analyzePayload = body.analysis || {};
    const ok = response.ok && !!analyzePayload.detected_case && Array.isArray(analyzePayload.recommended_actions);
    record('analyze', ok, `status=${response.status}`);
  } catch (error) {
    record('analyze', false, error.message);
  }

  // 7) create case
  try {
    const { response, body } = await requestJson(baseUrl, '/api/cases', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        category_id: analyzePayload?.category_id || chosenCategoryId || 1,
        case_title: 'Teacher Demo Case',
        description: 'This is a teacher demo test case for end-to-end verification.',
        location: 'Demo Campus',
        urgency_level: analyzePayload?.urgency_level || 'High',
        detected_case: analyzePayload?.detected_case || 'Theft',
        probability: analyzePayload?.probability || 80
      })
    });

    caseId = body.case_id;
    record('create case', response.status === 201 && !!caseId, `status=${response.status}, case_id=${caseId || 'n/a'}`);
  } catch (error) {
    record('create case', false, error.message);
  }

  // 8) case details
  try {
    const { response, body } = await requestJson(baseUrl, `/api/cases/${caseId}`, {
      method: 'GET',
      headers: authHeaders
    });

    const checklist = body.checklist || [];
    checklistId = checklist[0]?.checklist_id;
    originalChecklistState = checklist[0]?.is_completed;

    const ok = response.ok && body.case?.case_id === caseId;
    record('case details', ok, `status=${response.status}`);
  } catch (error) {
    record('case details', false, error.message);
  }

  // 9) checklist persistence
  try {
    const toggled = originalChecklistState ? 0 : 1;
    const updateRes = await requestJson(baseUrl, `/api/cases/${caseId}/checklist`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        items: [{ checklist_id: checklistId, is_completed: toggled }]
      })
    });

    const verifyRes = await requestJson(baseUrl, `/api/cases/${caseId}`, {
      method: 'GET',
      headers: authHeaders
    });

    const verifiedItem = (verifyRes.body.checklist || []).find((item) => item.checklist_id === checklistId);
    const persisted = Number(verifiedItem?.is_completed) === Number(toggled);

    const ok = updateRes.response.ok && verifyRes.response.ok && persisted;
    record('checklist persistence', ok, `status=${updateRes.response.status}`);
  } catch (error) {
    record('checklist persistence', false, error.message);
  }

  // 10) incident history
  try {
    const { response, body } = await requestJson(baseUrl, '/api/cases', {
      method: 'GET',
      headers: authHeaders
    });

    const found = (body.cases || []).some((item) => item.case_id === caseId);
    record('incident history', response.ok && found, `status=${response.status}`);
  } catch (error) {
    record('incident history', false, error.message);
  }

  // 11) status update
  try {
    const updateRes = await requestJson(baseUrl, `/api/cases/${caseId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ case_status: 'Resolved' })
    });

    const verifyRes = await requestJson(baseUrl, `/api/cases/${caseId}`, {
      method: 'GET',
      headers: authHeaders
    });

    const ok = updateRes.response.ok && verifyRes.body.case?.case_status === 'Resolved';
    record('status update', ok, `status=${updateRes.response.status}`);
  } catch (error) {
    record('status update', false, error.message);
  }

  // 12) formal report
  try {
    const { response, body } = await requestJson(baseUrl, `/api/cases/${caseId}/report`, {
      method: 'GET',
      headers: authHeaders
    });

    const ok = response.ok && body.report?.case?.case_id === caseId;
    record('formal report', ok, `status=${response.status}`);
  } catch (error) {
    record('formal report', false, error.message);
  }

  // 13) language preference
  try {
    const updateRes = await requestJson(baseUrl, '/api/users/profile', {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ preferred_language: 'Japanese' })
    });

    const verifyRes = await requestJson(baseUrl, '/api/users/profile', {
      method: 'GET',
      headers: authHeaders
    });

    const ok = updateRes.response.ok && verifyRes.body.user?.preferred_language === 'Japanese';
    record('language preference', ok, `status=${updateRes.response.status}`);
  } catch (error) {
    record('language preference', false, error.message);
  }

  console.log('---');
  console.log(`Executed against: ${baseUrl}`);
  console.log(`Created user_id: ${userId || 'n/a'}, case_id: ${caseId || 'n/a'}`);
  console.log(`Total failures: ${failures.length}`);

  if (criticalFailures.length > 0) {
    console.error(`Critical failures: ${criticalFailures.join(', ')}`);
    process.exit(1);
  }

  process.exit(0);
}

run().catch((error) => {
  console.error(`FAIL unexpected error - ${error.message}`);
  process.exit(1);
});
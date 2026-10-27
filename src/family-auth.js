import { createAuthClient } from '@neondatabase/neon-js/auth';

const authUrl = import.meta.env.VITE_NEON_AUTH_URL;
const authClient = authUrl ? createAuthClient(authUrl) : null;
const familyApiUrl = import.meta.env.VITE_FAMILY_API_URL?.replace(/\/+$/u, '');
let mode = 'sign-in';
let currentUser = null;
let authReady = false;
let authError = null;

const authRoot = () => document.querySelector('[data-auth-app]');
const setStatus = (message, isError = false) => {
  const status = authRoot()?.querySelector('[data-auth-status]');
  if (!status) return;
  status.textContent = message;
  status.classList.toggle('error', isError);
};

function syncUi() {
  const root = authRoot();
  if (!root) return;
  const signedOut = root.querySelector('[data-auth-signed-out]');
  const signedIn = root.querySelector('[data-auth-signed-in]');
  const form = root.querySelector('[data-auth-form]');
  const nameLabel = root.querySelector('[data-auth-name-label]');
  const password = form?.elements.namedItem('password');
  const submit = root.querySelector('[data-auth-submit]');
  const toggle = root.querySelector('[data-auth-toggle]');

  if (!authClient) {
    signedOut.hidden = false;
    signedIn.hidden = true;
    form.querySelectorAll('input,button').forEach((element) => { element.disabled = true; });
    toggle.disabled = true;
    setStatus('Secure sign-in is not configured for this deployment.');
    return;
  }

  signedIn.hidden = !currentUser;
  signedOut.hidden = Boolean(currentUser);
  if (!authReady) return;
  if (authError) {
    setStatus(authError, true);
    return;
  }
  if (currentUser) {
    root.querySelector('[data-auth-email]').textContent = currentUser.email || '';
    setStatus('You are signed in.');
    syncFamilyChildren();
    return;
  }

  setStatus('Sign in or create your adult guardian account.');
  nameLabel.hidden = mode !== 'sign-up';
  nameLabel.querySelector('input').required = mode === 'sign-up';
  password.autocomplete = mode === 'sign-up' ? 'new-password' : 'current-password';
  password.minLength = mode === 'sign-up' ? 8 : 1;
  submit.textContent = mode === 'sign-up' ? 'Create secure account' : 'Sign in securely';
  toggle.textContent = mode === 'sign-up' ? 'Already have an account? Sign in' : 'New to PDSA? Create an adult account';
}

async function restoreSession() {
  if (!authClient) {
    syncUi();
    return;
  }
  try {
    const result = await Promise.race([
      authClient.getSession(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Session check timed out')), 8000)),
    ]);
    if (result.error) throw result.error;
    currentUser = result.data?.user || null;
  } catch {
    currentUser = null;
    authError = 'Could not reach secure sign-in. Check your connection and try again.';
  } finally {
    authReady = true;
  }
  syncUi();
  syncFamilyChildren();
}

function childStatus(root, message, isError = false) {
  const status = root.querySelector('[data-child-status]');
  if (!status) return;
  status.textContent = message;
  status.classList.toggle('error', isError);
}

function appendChildRow(list, child) {
  const item = document.createElement('li');
  const name = document.createElement('strong');
  const birthDate = document.createElement('span');
  name.textContent = `${child.firstName} ${child.lastName}`;
  const date = new Date(`${child.dateOfBirth}T00:00:00.000Z`);
  birthDate.textContent = Number.isNaN(date.valueOf()) ? '' : `Date of birth: ${new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeZone: 'UTC' }).format(date)}`;
  item.append(name, birthDate);
  list.append(item);
}

function initializeChildManager(root) {
  root.innerHTML = '<h3>My children</h3><p class="note">Temporary development preview: use fictional test details only. This test database expires Nov 3, 2026; do not enter real youth information.</p><p data-child-status role="status" aria-live="polite">Loading family profiles…</p><form data-child-form><label>First name<input name="firstName" type="text" maxlength="100" autocomplete="off" required></label><label>Last name<input name="lastName" type="text" maxlength="100" autocomplete="off" required></label><label>Date of birth<input name="dateOfBirth" type="date" autocomplete="off" required></label><button class="btn btn-primary" type="submit" data-child-submit>Add child</button></form><ul class="child-list" data-child-list></ul>';
  root.querySelector('[name="dateOfBirth"]').max = new Date().toISOString().slice(0, 10);
}

async function requestFamilyApi(path, options = {}) {
  if (!authClient || !familyApiUrl) throw new Error('The secure family profile service is not configured in this environment.');
  const tokenResponse = await fetch(`${authUrl.replace(/\/+$/u, '')}/token`, { credentials: 'include', cache: 'no-store' });
  const tokenResult = await tokenResponse.json().catch(() => ({}));
  const token = tokenResult.token || tokenResult.data?.token;
  if (!tokenResponse.ok || !token) throw new Error('Your sign-in session expired. Please sign in again.');
  const response = await fetch(`${familyApiUrl}${path}`, {
    ...options,
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}`, ...options.headers },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'The family profile request could not be completed.');
  return result;
}

async function loadChildren(root) {
  childStatus(root, 'Loading your family profiles…');
  try {
    const result = await requestFamilyApi('/children');
    const list = root.querySelector('[data-child-list]');
    list.replaceChildren();
    for (const child of result.children || []) appendChildRow(list, child);
    childStatus(root, list.childElementCount ? 'Only you can see these family profiles.' : 'No children have been added yet.');
    root.dataset.loaded = 'true';
  } catch (error) {
    childStatus(root, error.message, true);
    root.dataset.loaded = 'error';
  }
}

function syncFamilyChildren() {
  const root = document.querySelector('[data-family-children]');
  if (!root) return;
  if (!currentUser) {
    root.innerHTML = '<p>Sign in to view or add children to your family profile.</p><button class="btn btn-outline" type="button" data-page="login">Sign in</button>';
    return;
  }
  if (!familyApiUrl) {
    root.innerHTML = '<p class="form-status error">The secure family profile service is not configured in this environment.</p>';
    return;
  }
  if (!root.querySelector('[data-child-form]')) initializeChildManager(root);
  if (!root.dataset.loaded || root.dataset.loaded === 'error') loadChildren(root);
}

document.addEventListener('click', async (event) => {
  const toggle = event.target.closest('[data-auth-toggle]');
  if (toggle) {
    mode = mode === 'sign-in' ? 'sign-up' : 'sign-in';
    setStatus(mode === 'sign-up' ? 'Create an adult guardian account.' : 'Sign in to your PDSA account.');
    syncUi();
    return;
  }

  if (event.target.closest('[data-auth-signout]') && authClient) {
    try {
      const result = await authClient.signOut();
      if (result.error) throw result.error;
      currentUser = null;
      authError = null;
      authReady = true;
      mode = 'sign-in';
      syncUi();
      syncFamilyChildren();
      setStatus('You have signed out.');
    } catch {
      setStatus('Sign-out could not be completed. Please try again.', true);
    }
  }
});

document.addEventListener('submit', async (event) => {
  if (event.target.matches('[data-child-form]')) {
    event.preventDefault();
    const form = event.target;
    const root = form.closest('[data-family-children]');
    const submit = form.querySelector('[data-child-submit]');
    if (!form.reportValidity() || !root) return;
    const values = new FormData(form);
    submit.disabled = true;
    childStatus(root, 'Saving this child profile securely…');
    try {
      const result = await requestFamilyApi('/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify({
          firstName: values.get('firstName'),
          lastName: values.get('lastName'),
          dateOfBirth: values.get('dateOfBirth'),
        }),
      });
      form.reset();
      appendChildRow(root.querySelector('[data-child-list]'), result.child);
      root.dataset.loaded = 'true';
      childStatus(root, 'Child added to your private family profile.');
    } catch (error) {
      childStatus(root, error.message, true);
    } finally {
      if (form.isConnected) submit.disabled = false;
    }
    return;
  }

  if (!event.target.matches('[data-auth-form]')) return;
  event.preventDefault();
  if (!authClient) return syncUi();

  const form = event.target;
  if (!form.reportValidity()) return;
  const submit = form.querySelector('[data-auth-submit]');
  const formData = new FormData(form);
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  submit.disabled = true;
  authError = null;
  setStatus(mode === 'sign-up' ? 'Creating your secure account…' : 'Signing in…');

  try {
    const result = mode === 'sign-up'
      ? await authClient.signUp.email({ name: String(formData.get('name') || '').trim(), email, password })
      : await authClient.signIn.email({ email, password });
    if (result.error) throw result.error;

    const sessionResult = await authClient.getSession();
    if (sessionResult.error) throw sessionResult.error;
    currentUser = sessionResult.data?.user || result.data?.user || null;
    authError = null;
    authReady = true;
    if (currentUser) {
      form.reset();
      syncUi();
      syncFamilyChildren();
      setStatus(mode === 'sign-up' ? 'Account created and signed in.' : 'Signed in successfully.');
    } else if (mode === 'sign-up') {
      form.reset();
      setStatus('Account request received. Follow any email verification instructions, then sign in.');
      mode = 'sign-in';
      syncUi();
    } else {
      setStatus('Sign-in completed, but no session was returned. Please try again.', true);
    }
  } catch (error) {
    setStatus(error?.message || 'Authentication failed. Check your details and try again.', true);
  } finally {
    if (form.isConnected) submit.disabled = false;
  }
});

const observer = new MutationObserver(() => {
  if (authRoot()) syncUi();
  syncFamilyChildren();
});
observer.observe(document.querySelector('#main'), { childList: true });
syncUi();
restoreSession();

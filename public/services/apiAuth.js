async function login(username, password){
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if(!res.ok) throw new Error('Login failed');
  return res.json();
}

// expose globally for simple pages
window.login = login;

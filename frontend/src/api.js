const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api`;
export async function getApplications() {
  const res = await fetch(`${API_BASE}/applications`);
  if (!res.ok) throw new Error('Failed to fetch applications');
  return res.json();
}

export async function getStats() {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function createApplication(data) {
  const res = await fetch(`${API_BASE}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create application');
  return res.json();
}

export async function updateApplication(id, data) {
  const res = await fetch(`${API_BASE}/applications/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update application');
  return res.json();
}

export async function deleteApplication(id) {
  const res = await fetch(`${API_BASE}/applications/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete application');
  return res.json();
}

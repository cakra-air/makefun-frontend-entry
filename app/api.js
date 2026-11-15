// make.fun's public API: read-only GET requests, open to any origin (CORS).
const API = 'https://make.fun/api';

async function get(path) {
  const response = await fetch(API + path, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`make.fun returned ${response.status}. Please try again.`);
  const data = await response.json();
  if (data?.error) throw new Error(data.error.message || 'The requested bounty could not be found.');
  return data;
}

export const getBounties = () => get('/competitions?status=open&activity=times');
export const getBounty = (slug) => get(`/competitions/${encodeURIComponent(slug)}`);

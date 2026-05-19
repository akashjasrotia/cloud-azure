// Simple job finder that runs fully in the browser with a small local dataset.

const jobs = [
  { id: 1, title: 'Frontend Engineer', company: 'BlueTech', lat: 37.7749, lon: -122.4194, tags: ['react','frontend','javascript'] },
  { id: 2, title: 'Backend Engineer', company: 'DataWorks', lat: 37.3382, lon: -121.8863, tags: ['node','go','api'] },
  { id: 3, title: 'Product Designer', company: 'CreativeLab', lat: 37.4419, lon: -122.1430, tags: ['design','ux'] },
  { id: 4, title: 'DevOps Engineer', company: 'InfraCorp', lat: 37.8044, lon: -122.2711, tags: ['devops','kubernetes'] },
  { id: 5, title: 'Data Scientist', company: 'InsightAI', lat: 37.7749, lon: -122.4313, tags: ['python','ml','data'] },
  { id: 6, title: 'Mobile Engineer', company: 'Appify', lat: 37.3382, lon: -121.9000, tags: ['android','ios'] },
  // A few farther-away sample jobs
  { id: 7, title: 'Systems Engineer', company: 'CloudNine', lat: 34.0522, lon: -118.2437, tags: ['linux','systems'] },
  { id: 8, title: 'QA Engineer', company: 'TestHouse', lat: 40.7128, lon: -74.0060, tags: ['qa','testing'] }
];

let userLocation = null; // {lat, lon}

const $ = sel => document.querySelector(sel);
const resultsEl = $('#results');
const statusEl = $('#status');
const radiusRange = $('#radiusRange');
const radiusValue = $('#radiusValue');

radiusRange.addEventListener('input', () => radiusValue.textContent = radiusRange.value);

$('#useLocationBtn').addEventListener('click', async () => {
  statusEl.textContent = 'Requesting location…';
  try {
    const pos = await getCurrentPosition();
    userLocation = { lat: pos.coords.latitude, lon: pos.coords.longitude };
    statusEl.textContent = `Location set (${userLocation.lat.toFixed(4)}, ${userLocation.lon.toFixed(4)})`;
    renderResults();
  } catch (err) {
    statusEl.textContent = 'Could not get location: ' + (err.message || err);
  }
});

$('#useSampleBtn').addEventListener('click', () => {
  // Sample location near San Francisco
  userLocation = { lat: 37.77, lon: -122.42 };
  statusEl.textContent = `Using sample location (${userLocation.lat}, ${userLocation.lon})`;
  renderResults();
});

$('#clearBtn').addEventListener('click', () => {
  userLocation = null;
  $('#searchInput').value = '';
  statusEl.textContent = 'Cleared location and search';
  renderResults();
});

$('#searchBtn').addEventListener('click', () => renderResults());

$('#searchInput').addEventListener('keyup', (e) => {
  if (e.key === 'Enter') renderResults();
});

function getCurrentPosition(options = { enableHighAccuracy: false, timeout: 10000 }) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = deg => deg * Math.PI / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function renderResults() {
  const q = ($('#searchInput').value || '').trim().toLowerCase();
  const radiusKm = Number(radiusRange.value || 50);

  let list = jobs.map(job => ({
    ...job,
    distance: userLocation ? haversineDistance(userLocation.lat, userLocation.lon, job.lat, job.lon) : null
  }));

  // Filter by distance when we have a location
  if (userLocation) list = list.filter(j => j.distance !== null && j.distance <= radiusKm);

  // Filter by query
  if (q) {
    list = list.filter(j => {
      const inTitle = j.title.toLowerCase().includes(q);
      const inCompany = j.company.toLowerCase().includes(q);
      const inTags = j.tags.join(' ').toLowerCase().includes(q);
      return inTitle || inCompany || inTags;
    });
  }

  // Sort by distance if available, otherwise by title
  list.sort((a,b) => {
    if (a.distance != null && b.distance != null) return a.distance - b.distance;
    if (a.distance != null) return -1;
    if (b.distance != null) return 1;
    return a.title.localeCompare(b.title);
  });

  // Render
  resultsEl.innerHTML = '';
  if (list.length === 0) {
    resultsEl.innerHTML = '<li class="job">No jobs found. Try expanding radius or removing filters.</li>';
    return;
  }

  for (const job of list) {
    const li = document.createElement('li');
    li.className = 'job';
    li.innerHTML = `
      <div>
        <div class="title">${escapeHtml(job.title)}</div>
        <div class="meta">${escapeHtml(job.company)} · <span class="muted">${job.tags.join(', ')}</span></div>
      </div>
      <div class="right">
        ${job.distance != null ? `<div class="distance">${job.distance.toFixed(1)} km</div>` : ''}
        <div><a href="#" data-id="${job.id}">View</a></div>
      </div>
    `;
    resultsEl.appendChild(li);
  }
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]);
}

// initial render
renderResults();

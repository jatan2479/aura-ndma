/**
 * AURA-NDMA Live Geolocation Engine
 */

(function() {
  let coords = { lat: 28.6139, lng: 77.2090, accuracy: null, altitude: null, timestamp: Date.now() };
  let isTracking = false;

  function updateDisplay() {
    const latEl = document.getElementById('sos-lat');
    const lngEl = document.getElementById('sos-lng');
    const accEl = document.getElementById('sos-acc');
    const altEl = document.getElementById('sos-alt');
    const tsEl  = document.getElementById('sos-ts');
    const barEl = document.getElementById('gps-coords');
    const dotEl = document.getElementById('gps-dot');

    if (latEl) latEl.textContent = coords.lat ? coords.lat.toFixed(5) + '°' : '—';
    if (lngEl) lngEl.textContent = coords.lng ? coords.lng.toFixed(5) + '°' : '—';
    if (accEl) accEl.textContent = coords.accuracy ? '±' + Math.round(coords.accuracy) + 'm' : '—';
    if (altEl) altEl.textContent = coords.altitude ? Math.round(coords.altitude) + 'm' : '—';
    if (tsEl)  tsEl.textContent  = new Date(coords.timestamp).toLocaleTimeString();
    if (barEl) barEl.textContent = `${coords.lat.toFixed(4)}° N, ${coords.lng.toFixed(4)}° E (±${Math.round(coords.accuracy || 10)}m)`;
    if (dotEl) dotEl.className = 'gps-dot active';
  }

  function init() {
    if (!navigator.geolocation) {
      console.warn('Geolocation API unsupported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          altitude: pos.coords.altitude,
          timestamp: pos.timestamp
        };
        isTracking = true;
        updateDisplay();
      },
      (err) => console.warn('GPS single fix warning:', err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    navigator.geolocation.watchPosition(
      (pos) => {
        coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          altitude: pos.coords.altitude,
          timestamp: pos.timestamp
        };
        isTracking = true;
        updateDisplay();
      },
      (err) => console.warn('GPS continuous watch warning:', err),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  window.AURA_GEO = {
    init,
    getCoords: () => coords,
    isTracking: () => isTracking,
    format: (lat, lng) => `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'E' : 'W'}`,
    haversine: (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    }
  };

  document.addEventListener('DOMContentLoaded', init);
})();

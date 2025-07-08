const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbwnvD9CUrZYbK9UkiFhM41bQ720gTSBTEYRNQ7cmQO-h5t42i_jU8nrboqgXL2urtWQ/exec'; // Replace with your actual Web App URL

// Initialize Leaflet map and place pins by city
function initMap(locations) {
  const map = L.map('map').setView([51.1657, 10.4515], 6); // Center on Germany

  // Add OSM tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Group contacts by city
  const cityGroups = {};
  locations.forEach(contact => {
    const city = contact.City?.trim();
    if (!city) return;

    if (!cityGroups[city]) {
      cityGroups[city] = [];
    }
    cityGroups[city].push(contact);
  });

  // Geocode each city once and add a single marker
  Object.keys(cityGroups).forEach(city => {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&countrycodes=de`)
      .then(response => response.json())
      .then(data => {
        if (data.length > 0) {
          const lat = data[0].lat;
          const lon = data[0].lon;

          // Build popup content
          const people = cityGroups[city]
            .map(p => `${p["First Name"] || ''} ${p["Name"] || ''}, ${p["Job Category"] || ''}`)
            .join("<br>");

          L.marker([lat, lon]).addTo(map)
            .bindPopup(`<strong>${city}</strong><br>${people}`);
        }
      })
      .catch(error => console.error(`Geocoding failed for ${city}:`, error));
  });
}

// Load contacts from Google Sheets and populate map and table
function loadContacts() {
  fetch(SHEET_API_URL)
    .then(res => res.json())
    .then(data => {
      const table = $('#contacts-table').DataTable();
      table.clear();
      data.forEach(row => {
        table.row.add([
          row["Name"] || '',
          row["First Name"] || '',
          row["City"] || '',
          row["Job Title"] || '',
          row["Job Category"] || '',
          row["POC"] || ''
        ]);
      });
      table.draw();
      initMap(data);
    })
    .catch(err => console.error("Failed to load contacts:", err));
}

// Submit new contact to Google Sheets via POST
function submitContact() {
  const fields = ["Name", "First Name", "City", "Job Title", "Job Category", "POC"];
  const data = {};

  let valid = true;
  fields.forEach(id => {
    const value = document.getElementById(id).value.trim();
    data[id] = value;
    if (!value && id !== "POC") { // allow empty POC
      valid = false;
    }
  });

  if (!valid) {
    alert("Please fill in all required fields.");
    return;
  }

  fetch(SHEET_API_URL, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(res => res.text())
    .then(response => {
      alert("Contact added successfully!");
      loadContacts();
      fields.forEach(id => document.getElementById(id).value = "");
    })
    .catch(err => {
      alert("Failed to submit contact: " + err);
      console.error(err);
    });
}

// Initialize on page load
$(document).ready(() => {
  $('#contacts-table').DataTable();
  loadContacts();
});

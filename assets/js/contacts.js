const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbxAvdMiZ-4YfiQ_afZZm91Ql6ijWn6uh_dx32gUavBn7GdB0nyQl1tq3EwHEAVljAaPpg/exec'; // Replace with your actual Google Apps Script Web App URL

// Initialize Leaflet map and place pins from address
function initMap(locations) {
  const map = L.map('map').setView([51.1657, 10.4515], 6); // Center on Germany

  // Add OSM tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Geocode each address using Nominatim
  locations.forEach(contact => {
    if (contact.Address) {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(contact.Address)}`)
        .then(response => response.json())
        .then(data => {
          if (data.length > 0) {
            const lat = data[0].lat;
            const lon = data[0].lon;
            L.marker([lat, lon]).addTo(map)
              .bindPopup(`${contact["First Name"]} ${contact.Name}<br>${contact.Address}`);
          }
        })
        .catch(error => console.error("Geocoding failed:", error));
    }
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
  const fields = ["Name", "First Name", "Address", "Telephone", "Email", "Job Title", "Job Category", "POC"];
  const data = {};

  let valid = true;
  fields.forEach(id => {
    const value = document.getElementById(id).value.trim();
    data[id] = value;
    if (!value && id !== "POC") { // allow empty POC but not others
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

// On page load
$(document).ready(() => {
  $('#contacts-table').DataTable();
  loadContacts();
});

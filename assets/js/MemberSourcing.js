const MEMBERS_API = 'https://corsproxy.io/?https://script.google.com/macros/s/AKfycbx30OqQ6rCT2dKcKIPNkNbQTUhWkDxzsOq0CwUsnUTUeZ1SQrgov9NPOpa-eZfDbRib/exec';

fetch(MEMBERS_API)
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('members-grid');

    data.forEach(member => {
      const fullName = `${member.Name || ''} ${member.Surname || ''}`;
      let imageSrc = member.Picture?.trim() || '';

      // Convert Google Drive "file/d/ID/view" → "uc?export=view&id=ID"
      if (imageSrc.includes("drive.google.com/file/d/")) {
        const match = imageSrc.match(/\/d\/([^/]+)\//);
        if (match && match[1]) {
          imageSrc = `https://drive.google.com/uc?export=view&id=${match[1]}`;
        }
      }

      if (!imageSrc || imageSrc === '#N/A') {
        imageSrc = 'images/member.jpg'; // fallback image
      }

      const tile = document.createElement('div');
      tile.className = 'tile';

      tile.innerHTML = `
        <img src="${imageSrc}" alt="${fullName}" width="120" height="120"
             onerror="this.onerror=null;this.src='images/member.jpg';">
        <h3>${fullName}</h3>
        <p>${member["Previous Post"] || ''}</p>
        <p><a href="mailto:${member.Email}">${member.Email}</a></p>
      `;

      container.appendChild(tile);

      // Log each image to debug
      console.log("Image for", fullName, "→", imageSrc);
    });
  })
  .catch(err => {
    document.getElementById('members-grid').innerHTML = '<p style="color:red;">Failed to load member data.</p>';
    console.error("Fetch error:", err);
  });

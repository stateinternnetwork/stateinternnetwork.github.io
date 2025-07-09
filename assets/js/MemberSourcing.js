const MEMBERS_API = 'https://corsproxy.io/?https://script.google.com/macros/s/AKfycbx30OqQ6rCT2dKcKIPNkNbQTUhWkDxzsOq0CwUsnUTUeZ1SQrgov9NPOpa-eZfDbRib/exec';

fetch(MEMBERS_API)
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('members-grid');

    data.forEach(member => {
      const fullName = `${member.Surname || ''} ${member.Name || ''}`;

      // Process image link
      let imageSrc = member.Picture || '';
      
      // Convert Google Drive "file/d/..." links to "uc?export=view&id=..."
      if (imageSrc.includes("drive.google.com/file/d/")) {
        const match = imageSrc.match(/\/d\/([^/]+)\//);
        if (match && match[1]) {
          imageSrc = `https://drive.google.com/uc?export=view&id=${match[1]}`;
        }
      }

      // Use fallback if no image or invalid
      if (!imageSrc || imageSrc === '#N/A') {
        imageSrc = 'images/member.jpg';  // default local image
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
    });
  })
  .catch(err => {
    document.getElementById('members-grid').innerHTML = '<p style="color:red;">Failed to load member data.</p>';
    console.error("Fetch error:", err);
  });

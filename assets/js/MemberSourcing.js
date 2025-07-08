const MEMBERS_API = 'https://corsproxy.io/?https://script.google.com/macros/s/AKfycbx30OqQ6rCT2dKcKIPNkNbQTUhWkDxzsOq0CwUsnUTUeZ1SQrgov9NPOpa-eZfDbRib/exec';

fetch(MEMBERS_API)
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('members-grid');

    data.forEach(member => {
      const fullName = `${member.Name || ''} ${member.Surname || ''}`;
      const imageSrc = member.Picture || 'images/member.jpg';

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
    console.error(err);
  });

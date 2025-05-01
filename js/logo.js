document.addEventListener("DOMContentLoaded", function() {
    // Define a logo
    const logoEl = document.getElementById("mainLogo");
    if (logoEl) {
      logoEl.src = `aa/logo.png?cacheBust=${Date.now()}`;
    }
    
    // Define o nome do site
    const siteNameEl = document.getElementById("siteName");
    if (siteNameEl && CONFIG && CONFIG.contact && CONFIG.contact.name) {
      siteNameEl.textContent = CONFIG.contact.name;
    }
  });
  
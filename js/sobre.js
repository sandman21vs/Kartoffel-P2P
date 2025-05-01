document.addEventListener("DOMContentLoaded", function() {
    // Atualiza o cabeçalho com o nome definido em CONFIG.contact
    const siteNameEl = document.getElementById("siteName");
    if (siteNameEl && CONFIG && CONFIG.contact && CONFIG.contact.name) {
      siteNameEl.textContent = CONFIG.contact.name;
    }
    
    // Atualiza o conteúdo da seção "Sobre" usando CONFIG.about
    const aboutContent = document.getElementById("aboutContent");
    if (aboutContent && CONFIG && CONFIG.about) {
      // Limpa o conteúdo existente
      aboutContent.innerHTML = "";
      
      // Divide a descrição em parágrafos (usando "\n\n" como separador)
      const paragraphs = CONFIG.about.description.split("\n\n");
      paragraphs.forEach(text => {
        const p = document.createElement("p");
        p.textContent = text;
        aboutContent.appendChild(p);
      });
      
      // Adiciona parágrafo para o link de suporte via Telegram
      const supportP = document.createElement("p");
      supportP.innerHTML = `Para suporte, entre em contato pelo Telegram: <a href="https://t.me/${CONFIG.about.supportLink}" target="_blank">@${CONFIG.about.supportLink}</a>`;
      aboutContent.appendChild(supportP);
    }
  });
  
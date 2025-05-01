// crypto.js
 function getPassphrase() {
    if (!window.loggedIn) {
      return 'senhaPadraoCasoNaoEstejaLogado';
    }
    return CONFIG.auth.password;
  }
  
   function saveEncryptedOrders(orders) {
    try {
      const passphrase = getPassphrase();
      const plainStr = JSON.stringify(orders);
      const cipher = CryptoJS.AES.encrypt(plainStr, passphrase).toString();
      localStorage.setItem("ordersEnc", cipher);
    } catch (err) {
      console.error("Erro ao criptografar e salvar:", err);
      alert("Falha ao criptografar pedidos. Ver console.");
    }
  }
  
   function getEncryptedOrders() {
    try {
      const passphrase = getPassphrase();
      const cipherText = localStorage.getItem("ordersEnc");
      if (!cipherText) return [];
      const bytes = CryptoJS.AES.decrypt(cipherText, passphrase);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      if (!decryptedString) {
        alert("Não foi possível descriptografar os pedidos. Verifique a senha.");
        return [];
      }
      return JSON.parse(decryptedString);
    } catch (err) {
      console.error("Erro ao descriptografar:", err);
      alert("Erro ao ler pedidos criptografados. Possível senha incorreta ou dados corrompidos.");
      return [];
    }
  }
  
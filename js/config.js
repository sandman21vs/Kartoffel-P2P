// config.js

function salvarListaCupons() {
    const lista = document.getElementById("listaCupons").value;
    localStorage.setItem("listaCupons", lista);
    alert("Lista de cupons salva!");
  }
  
  function salvarEnderecoPix() {
    const enderecoPix = document.getElementById("enderecoPixP2P").value.trim();
    if (enderecoPix !== "") {
      localStorage.setItem("enderecoPixP2P", enderecoPix);
      alert("Endereço Pix P2P salvo localmente!");
    } else {
      localStorage.removeItem("enderecoPixP2P");
      alert("Endereço Pix removido!");
    }
  }
  
  function salvarMensagemCliente() {
    const msg = document.getElementById("mensagemCliente").value.trim();
    localStorage.setItem("mensagemCliente", msg);
    alert("Mensagem para o cliente salva!");
  }
  
  function loadLocalUserConfig() {
    const cupons = localStorage.getItem("listaCupons");
    if (cupons !== null) {
      document.getElementById("listaCupons").value = cupons;
    }
    const pix = localStorage.getItem("enderecoPixP2P");
    if (pix !== null) {
      document.getElementById("enderecoPixP2P").value = pix;
    }
    const msg = localStorage.getItem("mensagemCliente");
    if (msg !== null) {
      document.getElementById("mensagemCliente").value = msg;
    }
  }
  
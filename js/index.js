document.addEventListener("DOMContentLoaded", function() {
    // Captura os elementos do DOM
    const valorInput   = document.getElementById("valorCompra");
    const labelBitcoin = document.getElementById("labelBitcoinText");
    const labelDepix   = document.getElementById("labelDepixText");
    const cupomInput   = document.getElementById("cupomInput");
    const valorError   = document.getElementById("valorError");
  
    // Atualiza as opções de rede conforme o tipo de compra
    function atualizarRede() {
      const tipo = document.querySelector('input[name="tipoCompra"]:checked').value;
      const redeLightning = document.querySelector('input[name="rede"][value="lightning"]');
      const redeOnchain = document.querySelector('input[name="rede"][value="onchain"]');
      const redeLiquid = document.querySelector('input[name="rede"][value="liquid"]');
  
      if (tipo === 'depix') {
        redeLightning.disabled = true;
        redeOnchain.disabled = true;
        redeLiquid.checked = true;
      } else {
        redeLightning.disabled = false;
        redeOnchain.disabled = false;
      }
    }
  
    // Atualiza os rótulos de taxa dinamicamente
    function updateFeeLabels() {
      const valor = parseFloat(valorInput.value);
      if (!valor || valor === 0) {
        const defaultBtc = CONFIG.p2p.defaultFee.bitcoin[CONFIG.p2p.defaultFee.bitcoin.length - 1].fee;
        const defaultDepix = CONFIG.p2p.defaultFee.depix[CONFIG.p2p.defaultFee.depix.length - 1].fee;
        labelBitcoin.innerText = `BITCOIN (${defaultBtc}%)`;
        labelDepix.innerText = `DEPIX (${defaultDepix}%)`;
        return;
      }
      const feeBtc = getP2pFee(valor, "bitcoin");
      const feeDepix = getP2pFee(valor, "depix");
      labelBitcoin.innerText = `BITCOIN (${feeBtc}%)`;
      labelDepix.innerText = `DEPIX (${feeDepix}%)`;
    }
  
    // Atualiza a aba de valor aproximado conforme o tipo de compra
    function updateSatsInfo() {
      const valor = parseFloat(valorInput.value);
      const satsInfoEl = document.getElementById("satsInfo");
      const tipo = document.querySelector('input[name="tipoCompra"]:checked').value;
  
      if (!valor || isNaN(valor) || valor <= 1) {
        satsInfoEl.innerText = (tipo === "depix")
          ? "Aproximadamente 0 depix"
          : "Aproximadamente 0 sats";
        return;
      }
  
      // Se o elemento "networkFee" existir, utiliza seu valor; caso contrário, 0.
      const networkFeeElement = document.getElementById("networkFee");
      const networkFeeSats = networkFeeElement ? parseInt(networkFeeElement.value) : 0;
  
      // Usa a função getValorEnviado para obter o valor líquido (esta função deve estar definida em orders.js ou utils.js)
      const resultado = getValorEnviado(valor, tipo, networkFeeSats, cupomInput.value.trim());
      const valorEnviadoBRL = resultado.valorEnviadoBRL;
  
      if (tipo === "depix") {
        satsInfoEl.innerText = `Aproximadamente ${valorEnviadoBRL.toFixed(2)} depix`;
      } else {
        if (!currentPrice) {
          satsInfoEl.innerText = "Aproximadamente 0 sats";
          return;
        }
        let sats = Math.round((valorEnviadoBRL / currentPrice) * 1e8);
        satsInfoEl.innerText = `Aproximadamente ${sats.toLocaleString('pt-BR')} sats`;
      }
    }
  
    // Verifica se o valor está abaixo do mínimo permitido e exibe um aviso
    function checkMinValue() {
      const valor = parseFloat(valorInput.value) || 0;
      const { min } = getMinMax();
      if (valor < min) {
        valorError.innerText = `Na rede ${document.querySelector('input[name="rede"]:checked').value.toUpperCase()}, o valor mínimo de compra é R$${min.toFixed(2)}.`;
        valorError.style.display = "block";
      } else {
        valorError.style.display = "none";
      }
    }
  
    // Retorna o mínimo e máximo permitidos com base no tipo e rede
    function getMinMax() {
      const tipo = document.querySelector('input[name="tipoCompra"]:checked').value;
      const rede = document.querySelector('input[name="rede"]:checked').value;
      let min, max = 99999;
      if (tipo === "bitcoin") {
        if (rede === "onchain") {
          min = CONFIG.minimums.bitcoinOnchain;
        } else if (rede === "lightning") {
          min = CONFIG.minimums.bitcoinLightning;
        } else if (rede === "liquid") {
          min = CONFIG.minimums.bitcoinLiquid;
        }
      } else if (tipo === "depix") {
        min = CONFIG.minimums.depix;
      }
      return { min, max };
    }
  
    // Atualiza todos os dados dinamicamente
    function updateAll() {
      updateValorCompraPlaceholder();
      atualizarRede();
      updateFeeLabels();
      checkMinValue();
      updateSatsInfo();
    }
  
    // Adiciona os event listeners
    valorInput.addEventListener("input", updateAll);
    document.querySelectorAll('input[name="tipoCompra"]').forEach(radio => {
      radio.addEventListener("change", updateAll);
    });
    document.querySelectorAll('input[name="rede"]').forEach(radio => {
      radio.addEventListener("change", updateAll);
    });
  
    // Preenche o cupom via URL ou cache e atualiza a cotação
    const urlParams = new URLSearchParams(window.location.search);
    const cupomParam = urlParams.get("cupom");
    if (cupomParam) {
      cupomInput.value = cupomParam;
      localStorage.setItem("cupom", cupomParam);
    } else {
      const cupomSalvo = localStorage.getItem("cupom");
      if (cupomSalvo) {
        cupomInput.value = cupomSalvo;
      }
    }
    atualizarCotacao();
    updateAll();
  
    // Obtém a taxa P2P conforme os intervalos definidos no CONFIG
    function getP2pFee(valor, tipo) {
      let feeArray = (tipo === "depix")
        ? CONFIG.p2p.defaultFee.depix
        : CONFIG.p2p.defaultFee.bitcoin;
      for (let tier of feeArray) {
        if (tier.min !== undefined) {
          if (valor >= tier.min && valor <= tier.max) {
            return tier.fee;
          }
        } else {
          if (valor <= tier.max) {
            return tier.fee;
          }
        }
      }
      return feeArray[feeArray.length - 1].fee;
    }
  
    // Envia o formulário para o Telegram
    document.getElementById("purchaseForm").addEventListener("submit", function(e) {
      e.preventDefault();
      enviarParaTelegram();
    });
  
    function enviarParaTelegram() {
      const valorCompra = parseFloat(valorInput.value);
      const tipo = document.querySelector('input[name="tipoCompra"]:checked').value;
      const rede = document.querySelector('input[name="rede"]:checked').value;
      const endereco = document.getElementById("enderecoRecebimento").value.trim();
      const cupom = cupomInput.value.trim();
  
      if (!valorCompra || isNaN(valorCompra)) {
        alert("Informe um valor numérico válido para a compra.");
        return;
      }
      if (endereco === "") {
        alert("Informe o endereço de recebimento.");
        return;
      }
      if (!validarEndereco(rede, endereco)) {
        return;
      }
      const { min, max } = getMinMax();
      if (valorCompra < min || valorCompra > max) {
        alert(`Compra de ${tipo.toUpperCase()} na rede ${rede.toUpperCase()}:\nO valor permitido é entre R$${min.toFixed(2)} e R$${max.toFixed(2)}.`);
        return;
      }
      if (cupom !== "") {
        localStorage.setItem("cupom", cupom);
      }
      const fee = getP2pFee(valorCompra, tipo);
      let mensagem = `valor: ${valorCompra} | tipo: ${tipo} (${fee}%) | rede: ${rede.toUpperCase()} | endereco: ${endereco}`;
      if (cupom) {
        mensagem += ` | cupom: ${cupom}`;
      }
      const telegramUrl = `https://t.me/${CONFIG.contact.link}?text=${encodeURIComponent(mensagem)}`;
      window.open(telegramUrl, '_blank');
    }
  
    // Atualiza o placeholder do valor
    function updateValorCompraPlaceholder() {
      const tipo = document.querySelector('input[name="tipoCompra"]:checked').value;
      const rede = document.querySelector('input[name="rede"]:checked').value;
      let minValue = 1;
      let maxValue = 6000;
    
      if (tipo === "bitcoin") {
        if (rede === "onchain") {
          minValue = CONFIG.minimums.bitcoinOnchain;
        } else if (rede === "lightning") {
          minValue = CONFIG.minimums.bitcoinLightning;
        } else if (rede === "liquid") {
          minValue = CONFIG.minimums.bitcoinLiquid;
        }
      } else if (tipo === "depix") {
        minValue = CONFIG.minimums.depix;
      }
    
      valorInput.placeholder = `Insira um valor (min: R$${minValue.toFixed(2)}, max: R$${maxValue.toFixed(2)})`;
      valorInput.setAttribute('min', minValue);
      valorInput.setAttribute('max', maxValue);
    }
  
    // A função getValorEnviado deve estar definida (por exemplo, em orders.js ou utils.js)
  });
  
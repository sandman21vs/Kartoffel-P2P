// js/script.js

// 1) Funções para obter as taxas de Bitcoin ou DePix conforme o valor
function getBitcoinFee(valor) {
  for (let tier of CONFIG.p2p.defaultFee.bitcoin  ) {
    if (valor <= tier.max) {
      return tier.fee;
    }
  }
  return "N/A";
}

function getDepixFee(valor) {
  for (let tier of CONFIG.p2p.defaultFee.depix) {
    const min = tier.min || 0;
    if (valor >= min && valor <= tier.max) {
      return tier.fee;
    }
  }
  return "N/A";
}

// 2) Habilita/Desabilita redes para DePix ou Bitcoin
function atualizarRede() {
  const tipoCompra = document.querySelector('input[name="tipoCompra"]:checked').value;
  const redeLightning = document.querySelector('input[name="rede"][value="lightning"]');
  const redeOnchain   = document.querySelector('input[name="rede"][value="onchain"]');
  const redeLiquid    = document.querySelector('input[name="rede"][value="liquid"]');

  if (tipoCompra === 'depix') {
    // Para DEPIX, só Liquid é permitido
    redeLightning.disabled = true;
    redeOnchain.disabled   = true;
    redeLiquid.checked     = true;
  } else {
    // Para Bitcoin, habilita todas
    redeLightning.disabled = false;
    redeOnchain.disabled   = false;
  }
}

// 3) Atualiza labels de taxa dinamicamente
function updateFeeLabels() {
  const valorCompra = parseFloat(document.getElementById('valorCompra').value) || 0;
  // Taxas
  const feeBtc   = getBitcoinFee(valorCompra);
  const feeDepix = getDepixFee(valorCompra);

  document.getElementById('labelBitcoinText').innerText = `BITCOIN (${feeBtc})`;
  document.getElementById('labelDepixText').innerText   = `DEPIX (${feeDepix})`;
}

// 4) Ajusta placeholder e min/max
function updateValorCompraPlaceholder() {
  const tipoCompra = document.querySelector('input[name="tipoCompra"]:checked').value;
  const rede       = document.querySelector('input[name="rede"]:checked').value;

  let minValue = 1;
  let maxValue = 999999;

  if (tipoCompra === "bitcoin") {
    if (rede === "onchain") {
      minValue = CONFIG.minimums.bitcoinOnchain;
    } else if (rede === "lightning" || rede === "liquid") {
      minValue = CONFIG.minimums.bitcoinLightning; 
      // Se quiser separar Liquid de Lightning, use:
      // minValue = (rede === "liquid") ? CONFIG.minimums.bitcoinLiquid : CONFIG.minimums.bitcoinLightning;
    }
  } else if (tipoCompra === "depix") {
    minValue = CONFIG.minimums.depix;
  }

  const valorInput = document.getElementById('valorCompra');
  valorInput.placeholder = `Insira o valor (mín: R$${minValue}, máx: R$${maxValue})`;
  valorInput.setAttribute('min', minValue);
  valorInput.setAttribute('max', maxValue);
}

// 5) WebSocket p/ cotação DePix (igual seu código original)
function getPrice() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket("wss://api.sideswap.io/json-rpc-ws");
    ws.addEventListener('open', () => {
      const payload = {
        id: 1,
        method: "subscribe_price_stream",
        params: {
          asset: "02f22f8d9c76ab41661a2729e4752e2c5d1a263012141b86ea98af5472df5189",
          send_bitcoins: false
        }
      };
      ws.send(JSON.stringify(payload));
    });

    ws.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        const price = data?.result?.price;
        ws.close();
        if (price) {
          resolve(parseFloat(price));
        } else {
          resolve(null);
        }
      } catch (error) {
        console.error("Erro ao processar mensagem do WebSocket:", error);
        reject(error);
      }
    });

    ws.addEventListener('error', (error) => {
      console.error("Erro no WebSocket:", error);
      reject(error);
    });
  });
}

// 6) Atualiza cotação no HTML #cotacao
function atualizarCotacao() {
  const cotacaoElemento = document.getElementById('cotacao');
  if (!cotacaoElemento) return;

  cotacaoElemento.innerText = "Cotação Depix para Lbtc: Carregando...";
  getPrice()
    .then(price => {
      if (price !== null) {
        // Formata com 2 casas
        const formatted = price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        cotacaoElemento.innerText = `Cotação Depix para Lbtc: ${formatted}`;
      } else {
        cotacaoElemento.innerText = "Falha ao obter a cotação.";
      }
    })
    .catch(error => {
      cotacaoElemento.innerText = "Erro ao obter a cotação.";
      console.error("Erro ao obter cotação:", error);
    });
}

// 7) Submissão do formulário -> abre Telegram
function setupFormSubmission() {
  const form = document.getElementById('purchaseForm');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const tipoCompra  = document.querySelector('input[name="tipoCompra"]:checked').value;
    const valorCompra = parseFloat(document.getElementById('valorCompra').value);
    const rede        = document.querySelector('input[name="rede"]:checked').value;
    const endereco    = document.getElementById('enderecoRecebimento').value.trim();
    const cupom       = document.querySelector('input[name="cupom"]').value.trim();

    // Validação do endereço
    if (rede === "onchain") {
      if (!(endereco.startsWith("bc1") || endereco.startsWith("3") || endereco.startsWith("1"))) {
        alert("Para rede Onchain, o endereço deve iniciar com bc1, 3 ou 1.");
        return;
      }
    } else if (rede === "liquid") {
      if (!(endereco.startsWith("lq1") || endereco.startsWith("LQ1") || endereco.startsWith("V") || endereco.startsWith("v"))) {
        alert("Para rede Liquid, o endereço deve iniciar com lq1 ou v.");
        return;
      }
    }

    // Validação do valor min e max
    const min = parseFloat(document.getElementById('valorCompra').getAttribute('min'));
    const max = parseFloat(document.getElementById('valorCompra').getAttribute('max'));
    if (valorCompra < min || valorCompra > max) {
      alert("O 'Valor da Compra' deve estar dentro do intervalo permitido.");
      return;
    }

    // Determina a taxa
    let tx;
    if (tipoCompra === "bitcoin") {
      tx = getBitcoinFee(valorCompra);
    } else {
      tx = getDepixFee(valorCompra);
    }

    // Monta a mensagem
    let mensagem = `valor: ${valorCompra} | tipo: ${tipoCompra} (${tx}) | rede: ${rede.toUpperCase()} | endereco: ${endereco}`;
    if (cupom) {
      mensagem += ` | cupom: ${cupom}`;
    }

    // Abre Telegram
    const telegramUrl = `https://t.me/${CONFIG.contact.link}?text=${encodeURIComponent(mensagem)}`;
    window.open(telegramUrl, '_blank');
  });
}

// 8) Inicialização ao carregar
function initIndexPage() {
  // Cupom via URL ou localStorage
  const urlParams = new URLSearchParams(window.location.search);
  let cupom = urlParams.get("cupom");
  if (cupom) {
    localStorage.setItem("cupom", cupom);
  } else {
    cupom = localStorage.getItem("cupom");
  }
  if (cupom && document.querySelector('input[name="cupom"]')) {
    document.querySelector('input[name="cupom"]').value = cupom;
  }

  // Eventos
  const valorCompraInput = document.getElementById('valorCompra');
  if (valorCompraInput) {
    valorCompraInput.addEventListener('input', updateFeeLabels);
  }

  document.querySelectorAll('input[name="tipoCompra"]').forEach(radio => {
    radio.addEventListener('change', () => {
      atualizarRede();
      updateFeeLabels();
      updateValorCompraPlaceholder();
    });
  });

  document.querySelectorAll('input[name="rede"]').forEach(radio => {
    radio.addEventListener('change', updateValorCompraPlaceholder);
  });

  // Chamadas iniciais
  atualizarRede();
  updateFeeLabels();
  updateValorCompraPlaceholder();
  atualizarCotacao();
  setupFormSubmission();
}

// 9) Executa quando DOM estiver pronto
document.addEventListener("DOMContentLoaded", initIndexPage);

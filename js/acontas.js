/* js/contas.js */

// Variável global para armazenar a cotação atual (BRL por 1 BTC)
let currentPrice = null;

/* -------------------------------------------------------------------
 * FUNÇÕES PARA SALVAR E CARREGAR CONFIGURAÇÕES (cupons, pix, mensagem)
 * ------------------------------------------------------------------- */

/**
 * Salva a lista de cupons em localStorage (sem criptografia).
 */
function salvarListaCupons() {
  const lista = document.getElementById("listaCupons").value;
  localStorage.setItem("listaCupons", lista);
  alert("Lista de cupons salva!");
}

/**
 * Salva o endereço Pix em localStorage (sem criptografia).
 */
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


/**
 * Salva a mensagem para o cliente em localStorage (sem criptografia).
 */
function salvarMensagemCliente() {
  const msg = document.getElementById("mensagemCliente").value.trim();
  localStorage.setItem("mensagemCliente", msg);
  alert("Mensagem para o cliente salva!");
}

/**
 * Carrega cupons, Pix e mensagem do localStorage (sem criptografia) e
 * preenche os campos correspondentes na aba Configurações.
 *
 * Chame esta função após o login (por exemplo, ao final de doLogin()).
 */
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

/* -------------------------------------------------------------
 * CÓDIGO PARA CUPONS, WEBSOCKET DE PREÇO, E DEMAIS FUNCIONALIDADES
 * ------------------------------------------------------------- */

// Procura um cupom na lista – retorna objeto com email, discount e commission (se informados)
function buscarCupom(cupomNome) {
  const lista = document.getElementById("listaCupons").value;
  const linhas = lista.split("\n");
  for (let linha of linhas) {
    linha = linha.trim();
    if (linha === "") continue;
    const partes = linha.split(",");
    for (let i = 0; i < partes.length; i++) {
      partes[i] = partes[i].trim();
    }
    if (partes[0].toLowerCase() === cupomNome.toLowerCase()) {
      return {
        email: partes[1] || "",
        discount: partes[2] ? parseFloat(partes[2]) : null,
        commission: partes[3] ? parseFloat(partes[3]) : null
      };
    }
  }
  return null;
}

// Função para obter a cotação via WebSocket
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

// Atualiza a exibição da cotação
function atualizarCotacao() {
  const cotacaoElemento = document.getElementById('cotacao');
  cotacaoElemento.innerText = "Cotação Depix para Lbtc: Carregando...";
  getPrice().then(price => {
    if (price !== null) {
      currentPrice = price;
      const formattedPrice = new Intl.NumberFormat('pt-BR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      }).format(price);
      cotacaoElemento.innerText = `Cotação Depix para Lbtc: ${formattedPrice}`;
    } else {
      cotacaoElemento.innerText = "Falha ao obter a cotação.";
    }
  }).catch(error => {
    cotacaoElemento.innerText = "Erro ao obter a cotação.";
    console.error("Erro ao obter cotação:", error);
  });
}

// Copia o valor do campo para a área de transferência
function copiarCampo(campoId) {
  const campo = document.getElementById(campoId);
  let texto = campo.value;
  texto = texto.replace(/ BRL/g, "").replace(/ sats/g, "").replace(/ DEPIX/g, "").trim();
  if (navigator.clipboard) {
    navigator.clipboard.writeText(texto).then(() => {
      alert("Copiado: " + texto);
    });
  } else {
    campo.select();
    document.execCommand("copy");
    alert("Copiado: " + texto);
  }
}

// Exibe informações sobre cupons e tokens
function mostrarInformacoes() {
  const info = "Lista de Cupons Registrados:\n" +
               "Cada linha: NomeCupom, email, desconto, comissao\n" +
               "Ex.: Sandmann, sandmann@walletofsatoshi.com, 5, 10\n\n" +
               "Mensagem para o Cliente:\n" +
               "Tokens disponíveis para a mensagem personalizada: {cotacao}, {valorComprado}, {valorEnviado}, {tipo}, {enderecoCliente}, {enderecoPix}, {taxaP2p}, {idTransacao}, {comissaoP2p}, {lucroP2p}\n\n" +
               "Clique em +Informações para saber como usar os tokens.";
  alert(info);
}

// Documentação dos tokens (atualizada)
function mostrarDocumentacaoTokens() {
  const info = 
    "DOCUMENTAÇÃO DE TOKENS:\n\n" +
    "{cotacao} => Exibe a cotação atual.\n" +
    "{valorComprado} => Valor BRL que o cliente vai enviar.\n" +
    "{valorEnviado} => Valor (sats ou DEPIX) que o cliente recebe, calculado sobre (valorCompra - 1).\n" +
    "{tipo} => Tipo de cripto (BITCOIN ou DEPIX).\n" +
    "{enderecoCliente} => Endereço que o cliente forneceu.\n" +
    "{enderecoPix} => Endereço Pix salvo (se não houver Pix salvo, exibe texto de fallback).\n\n" +
    "NOVOS TOKENS:\n" +
    "{taxaP2p} => Taxa de P2P aplicada (porcentagem).\n" +
    "{idTransacao} => ID único gerado para a transação.\n" +
    "{comissaoP2p} => Comissão exibida (sats ou DEPIX).\n" +
    "{lucroP2p} => Lucro final do P2P (sats ou DEPIX).\n\n" +
    "Use replaceAll ou /{token}/g para substituir todas as ocorrências.\n\n" +
    "Exemplo: \"Olá! Sua taxa foi {taxaP2p}, a transação {idTransacao} gerou {lucroP2p} de lucro.\"";
  alert(info);
}

/**
 * Função que exibe uma explicação de uso mais detalhada
 * e dá uma sugestão de como criar/editar mensagem com tokens usando o ChatGPT.
 */
function mostrarMaisInformacoesMensagemPersonalizada() {
  const info =
    "++ INFORMAÇÕES DA MENSAGEM PARA O CLIENTE PERSONALIZADA ++\n\n" +
    "COMO FUNCIONA O RECURSO:\n" +
    "1. A mensagem personalizada pode conter tokens entre chaves, por exemplo: {valorComprado}, {tipo}, etc.\n" +
    "2. Ao gerar a mensagem final para o cliente, cada token será substituído pelo valor real.\n" +
    "3. Dessa forma, você pode criar textos dinâmicos para cada compra.\n\n" +
    "COMO USAR:\n" +
    "- Basta escrever sua mensagem normalmente e inserir o nome do token entre chaves.\n" +
    "- Exemplo: \"Olá! Você comprou {valorComprado} reais em {tipo}, o valor de cripto enviado será {valorEnviado}. " +
    "Para pagar, use {enderecoPix}.\".\n\n" +
    "SUGESTÃO DE CRIAÇÃO DE MENSAGEM USANDO O CHATGPT:\n" +
    "1. Abra o ChatGPT e peça algo como: \"Crie um texto curto de agradecimento ao cliente, incluindo os tokens {valorComprado}, {valorEnviado}, {tipo} e {enderecoPix}.\"\n" +
    "2. Explique brevemente que {valorComprado} representa o valor em reais que o cliente vai enviar, {valorEnviado} o valor final que ele recebe em cripto (calculado sobre o valor líquido, com desconto de R$1,00), {tipo} a criptomoeda e {enderecoPix} o endereço Pix (ou fallback).\n" +
    "3. Copie o texto gerado, cole no campo de Mensagem para o Cliente e salve.\n" +
    "4. Ao realizar a simulação de compra, verifique se os valores são substituídos corretamente.\n\n" +
    "DICA IMPORTANTE:\n" +
    "→ Se você precisar de tokens adicionais, basta criar novas variáveis no código e adicionar a lógica de substituição. " +
    "Depois, atualize essa documentação.\n\n" +
    "FIM DAS INFORMAÇÕES.";
  
  alert(info);
}

/* ----------------------------------------
 * FUNÇÕES DE CRIPTOGRAFIA PARA OS PEDIDOS
 * ---------------------------------------- */

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

/* ---------------------------------------
 * FUNÇÃO PRINCIPAL DE CÁLCULO E RESULTADOS
 * --------------------------------------- */

function calcular() {
  // Extrai os dados do campo de mensagem
  const inputMsg = document.getElementById("inputMessage").value.trim();
  if (inputMsg === "") {
    alert("Preencha a mensagem de entrada no formato:\nvalor: 1000 | tipo: depix | rede: LIQUID | endereco: vjk | cupom: sandmann");
    return;
  }
  
  let partes = inputMsg.split("|");
  let dados = {};
  partes.forEach(part => {
    let [chave, valor] = part.split(":");
    if (chave && valor) {
      dados[chave.trim().toLowerCase()] = valor.trim();
    }
  });
  
  // Dados básicos
  let valorCompra = parseFloat(dados["valor"]);
  let endereco = dados["endereco"] || "";
  let cupom = dados["cupom"] || "";
  let enderecoLitning = dados["endereco litning"] || "";
  
  // Extrai e normaliza tipo e rede
  let tipoRaw = dados["tipo"] || "bitcoin";
  let tipo = tipoRaw.toLowerCase();
  if (tipo.includes("bitcoin")) {
    tipo = "bitcoin";
  } else if (tipo.includes("depix")) {
    tipo = "depix";
  }
  
  let rede = dados["rede"] ? dados["rede"].trim().toUpperCase() : "";
  
  if (!valorCompra || isNaN(valorCompra)) {
    alert("Informe um valor numérico no campo 'valor' da mensagem.");
    return;
  }
  
  // Valor recebido líquido no banco: subtrai R$1,00
  let valorRecebidoBanco = valorCompra - 1;
  
  // Para conversão na side swap:
  // Se for Bitcoin, internamente desconta R$3,00 (taxa interna, não informada na mensagem)
  let valorBase;
  if (tipo === "bitcoin") {
    valorBase = valorRecebidoBanco - 3;
  } else {
    valorBase = valorRecebidoBanco;
  }
  
  // Se houver cupom, busca dados e define commissionRate e discountRate
  let cupomData = null;
  let commissionRate = 0;
  let discountRate = 0;
  if (cupom !== "") {
    cupomData = buscarCupom(cupom);
    if (cupomData) {
      commissionRate = cupomData.commission !== null ? cupomData.commission : CONFIG.p2p.defaultCommissionRate;
      discountRate = cupomData.discount !== null ? cupomData.discount : CONFIG.p2p.defaultDiscountRate;
      if (cupomData.email) {
        enderecoLitning = cupomData.email;
      }
    }
  }


    // Determina a taxa P2P de acordo com os intervalos configurados usando o valor original da compra
    let feeConfigArray = CONFIG.p2p.defaultFee[tipo];
    let p2pFee = null;
    if (tipo === "bitcoin") {
      for (let config of feeConfigArray) {
        if (valorCompra >= config.min && valorCompra <= config.max) {
          p2pFee = config.fee;
          break;
        }
      }
    } else if (tipo === "depix") {
      for (let config of feeConfigArray) {
        if (valorCompra >= config.min && valorCompra <= config.max) {
          p2pFee = config.fee;
          break;
        }
      }
    }
  
  
  if (p2pFee === null) {
    alert("Não foi possível determinar a taxa para o valor informado.");
    return;
  }
  
  // Cálculo da taxa em R$ com base no valorBase
  let feeBRL = valorBase * (p2pFee / 100);
  
  // Calcula a taxa de rede: sempre aplicada se houver valor informado
  let networkFeeSats = parseInt(document.getElementById("networkFee").value) || 0;
  let networkFeeBRL = (networkFeeSats * currentPrice) / 1e8;
  
  // Se cupom válido, calcula comissão e desconto
  let commissionBRL = 0;
  let discountBRL = 0;
  if (cupomData) {
    commissionBRL = feeBRL * (commissionRate / 100);
    discountBRL = feeBRL * (discountRate / 100);
  }
  
  // Valor que o cliente recebe após as taxas e descontos
  let valorEnviadoBRL = valorBase - feeBRL - networkFeeBRL + discountBRL;
  
  // Para exibição: se for DEPIX, exibe em DEPIX; se for Bitcoin, converte para sats.
  let valorEnviadoExibicao = "";
  let valorEnviadoNum;
  if (tipo === "depix") {
    valorEnviadoNum = parseFloat(valorEnviadoBRL.toFixed(2));
    valorEnviadoExibicao = valorEnviadoNum.toFixed(2) + " DEPIX";
  } else {
    valorEnviadoNum = Math.round((valorEnviadoBRL / currentPrice) * 1e8);
    valorEnviadoExibicao = valorEnviadoNum.toLocaleString('pt-BR') + " sats";
  }
  
  // Comissão exibida: convertida para sats se for Bitcoin
  let commissionExibicao;
  if (tipo === "depix") {
    commissionExibicao = commissionBRL.toFixed(2) + " DEPIX";
  } else {
    let commissionSats = Math.round((commissionBRL / currentPrice) * 1e8);
    commissionExibicao = commissionSats.toLocaleString('pt-BR') + " sats";
  }
  
  // Cálculo do lucro bruto:
  // Para Bitcoin, aplica a fórmula:
  // ( (valorCompra - 1) / currentPrice * 1e8 ) - ( 3 / currentPrice * 1e8 )
  let lucroExibicao;
  if (tipo === "bitcoin") {
    let compraVal = valorCompra - 1; // valor efetivo recebido no banco
    let taxaFixa = 3;
    let totalSats = (compraVal / currentPrice) * 1e8;
    let taxaSats = (taxaFixa / currentPrice) * 1e8;
    let lucroBrutoSats = Math.round(totalSats - taxaSats);
    lucroExibicao = lucroBrutoSats.toLocaleString('pt-BR') + " sats";
  } else {
    // Para DEPIX, exibimos o valor líquido recebido em DEPIX
    let lucroBrutoDepix = valorCompra - 1;
    lucroExibicao = lucroBrutoDepix.toFixed(2) + " DEPIX";
  }
  
  // Define a taxa P2P em percentual (ex.: "5%")
  let taxaP2pTexto = p2pFee + "%";
  
  // Fallback do Pix
  let enderecoPix = document.getElementById("enderecoPixP2P").value.trim();
  let textoPix = enderecoPix ? enderecoPix : "Pague com o QRCode ou chave DEPIX enviada após esta mensagem";
  
  // Gera a mensagem para o cliente (na mensagem, só se informa a taxa de R$1,00)
  let customMsg = document.getElementById("mensagemCliente").value.trim();
  let mensagem = "";
  
  if (customMsg !== "") {
    mensagem = customMsg
      .replace(/{cotacao}/g, document.getElementById("cotacao").innerText.split(": ")[1])
      .replace(/{valorComprado}/g, valorCompra.toFixed(2))
      .replace(/{valorEnviado}/g, valorEnviadoExibicao)
      .replace(/{tipo}/g, tipo.toUpperCase())
      .replace(/{enderecoCliente}/g, endereco)
      .replace(/{enderecoPix}/g, textoPix)
      .replace(/{taxaP2p}/g, taxaP2pTexto)
      .replace(/{idTransacao}/g, pedidoId)
      .replace(/{comissaoP2p}/g, commissionExibicao)
      .replace(/{lucroP2p}/g, lucroExibicao);
    if (cupomData) {
      mensagem += "\n\nVocê receberá: " + valorEnviadoExibicao +
                  "\nPor utilizar o cupom " + cupom + ", você receberá um desconto de " + discountRate + "% das taxas de P2P aplicadas.";
    } else {
      mensagem += "\n\nVocê receberá: " + valorEnviadoExibicao;
    }
    mensagem += "\nO valor total que será convertido em " + tipo.toUpperCase() + " é de R$" + valorBase.toFixed(2) + ".";
  } else {
    mensagem += "Olá, obrigado por comprar com " + CONFIG.contact.name + "\n\n";
    if (tipo === "bitcoin") {
      mensagem += "A cotação do Bitcoin (sideswap) está em: " + document.getElementById("cotacao").innerText.split(": ")[1] + "\n";
    }
    mensagem += "O valor total que será convertido em " + tipo.toUpperCase() + " é de R$" + valorBase.toFixed(2) + ".\n\n";
    mensagem += "A taxa P2P aplicada foi de: " + taxaP2pTexto + " + R$1,00 de taxa operacional (DEPIX).\n\n";
    if (cupomData) {
      mensagem += "Você receberá: " + valorEnviadoExibicao + "\n" +
                  "Você está utilizando o cupom " + cupom + ", com " + discountRate + "% de desconto nas taxas.\n\n";
    } else {
      mensagem += "Você receberá: " + valorEnviadoExibicao + "\n\n";
    }
    
    if (enderecoPix) {
      mensagem += "Para finalizar sua compra, deposite R$ " + valorCompra.toFixed(2) + "\n";
      mensagem += "no seguinte endereço Pix: " + enderecoPix + "\n";
    } else {
      mensagem += "Para finalizar sua compra, deposite R$ " + valorCompra.toFixed(2) + "\n";
      mensagem += "- Utilize o QR Code ou a chave que enviaremos para você\n";
    }
    mensagem += "- Envie o comprovante de pagamento.\n\n";
    mensagem += "ID da Transação: " + pedidoId + "\n\n";
    mensagem += "Obrigado!";
  }
  
  // Preenche os campos de resultado
  document.getElementById("resultEnderecoCliente").value = endereco;
  document.getElementById("resultValorEnviado").value = valorEnviadoExibicao;
  document.getElementById("resultEnderecoItning").value = enderecoLitning;
  document.getElementById("resultValorComissao").value = commissionExibicao;
  document.getElementById("resultLucroP2P").value = lucroExibicao;
  document.getElementById("resultMensagemCliente").value = mensagem;
  document.getElementById("pedidoId").value = pedidoId;
}




/* ----------------------------------------------
 * SALVAR PEDIDO CRIPTOGRAFADO E ATUALIZAR TABELA
 * ---------------------------------------------- */

function salvarPedido() {
  // Extrai dados
  const pedidoId = document.getElementById("pedidoId").value;
  const valorCompraMatch = document.getElementById("inputMessage").value.match(/valor:\s*([\d\.]+)/i);
  const valorCompra = valorCompraMatch ? valorCompraMatch[1] : "";
  const redeMatch = document.getElementById("inputMessage").value.match(/rede:\s*([A-Z]+)/i);
  const rede = redeMatch ? redeMatch[1] : "";
  const enderecoCliente = document.getElementById("resultEnderecoCliente").value;
  
  // Define "moeda" baseada em "tipo"
  const tipoMatch = document.getElementById("inputMessage").value.match(/tipo:\s*([^\|]+)/i);
  let tipo = tipoMatch ? tipoMatch[1].toLowerCase() : "bitcoin";
  if (tipo.includes("bitcoin")) { 
    tipo = "bitcoin"; 
  } else if (tipo.includes("depix")) { 
    tipo = "depix"; 
  }
  const moeda = (tipo === "bitcoin") ? "sats" : "depix";
  
  let valorEnviadoStr = document.getElementById("resultValorEnviado").value;
  let valorEnviado = parseFloat(valorEnviadoStr.replace(/[^\d\.]/g, ""));
  
  const taxaRede = (parseInt(document.getElementById("networkFee").value) || 0).toString();
  const enderecoItning = document.getElementById("resultEnderecoItning").value;
  
  const cupomMatch = document.getElementById("inputMessage").value.match(/cupom:\s*(\S+)/i);
  const cupom = cupomMatch ? cupomMatch[1] : "";
  
  let valorComissao = document.getElementById("resultValorComissao").value;
  let lucroP2P = document.getElementById("resultLucroP2P").value;
  
  // Monta objeto
  const order = {
    id: pedidoId,
    valorComprado: valorCompra,
    rede: rede,
    enderecoCliente: enderecoCliente,
    moeda: moeda,
    valorEnviado: valorEnviado,
    taxaRede: taxaRede,
    enderecoItning: enderecoItning,
    cupom: cupom,
    valorComissao: valorComissao,
    lucroP2P: lucroP2P
  };
  
  // Salva no localStorage criptografado
  let orders = getEncryptedOrders();
  orders.push(order);
  saveEncryptedOrders(orders);

  alert("Pedido salvo!");
  updateOrdersTable();
}

function updateOrdersTable() {
  let orders = getEncryptedOrders();
  const tbody = document.querySelector("#ordersTable tbody");
  tbody.innerHTML = "";
  orders.forEach(order => {
    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${order.id}</td>
      <td>${order.valorComprado}</td>
      <td>${order.rede}</td>
      <td>${order.enderecoCliente}</td>
      <td>${order.moeda}</td>
      <td>${order.valorEnviado}</td>
      <td>${order.taxaRede}</td>
      <td>${order.enderecoItning}</td>
      <td>${order.cupom}</td>
      <td>${order.valorComissao}</td>
      <td>${order.lucroP2P}</td>
    `;
    tbody.appendChild(tr);
  });
}

function downloadOrders() {
  let orders = getEncryptedOrders();
  if (!orders.length) {
    alert("Nenhum pedido salvo.");
    return;
  }
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "ID,ValorComprado,Rede,EnderecoCliente,Moeda,ValorEnviado,TaxaRede,EnderecoItning,Cupom,ValorComissao,LucroP2P\n";
  orders.forEach(order => {
    const row = [
      order.id,
      order.valorComprado,
      order.rede,
      order.enderecoCliente,
      order.moeda,
      order.valorEnviado,
      order.taxaRede,
      order.enderecoItning,
      order.cupom,
      order.valorComissao,
      order.lucroP2P
    ].join(",");
    csvContent += row + "\n";
  });
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "orders.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function deleteOrders() {
  if (!confirm("Você tem certeza que quer apagar todos os pedidos?")) return;
  localStorage.removeItem("ordersEnc"); 
  alert("Todos os pedidos foram removidos!");
  updateOrdersTable();
}
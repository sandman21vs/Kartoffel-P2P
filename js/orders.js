// orders.js

// As funções buscarCupom, currentPrice, getEncryptedOrders e saveEncryptedOrders 
// devem estar definidas globalmente (por exemplo, em utils.js, price.js e crypto.js)
// que já foram incluídos no HTML anteriormente.

function calcular() {
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
    
    // Normaliza tipo e rede
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
    
    // Valor líquido recebido no banco (desconta R$1,00)
    let valorRecebidoBanco = valorCompra - 1;
    let valorBase = (tipo === "bitcoin") ? (valorRecebidoBanco - 3) : valorRecebidoBanco;
    
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
    
    // Determina a taxa P2P usando o valor original da compra
    let feeConfigArray = CONFIG.p2p.defaultFee[tipo];
    let p2pFee = null;
    for (let config of feeConfigArray) {
      if (valorCompra >= config.min && valorCompra <= config.max) {
        p2pFee = config.fee;
        break;
      }
    }
    if (p2pFee === null) {
      alert("Não foi possível determinar a taxa para o valor informado.");
      return;
    }
    
    let feeBRL = valorBase * (p2pFee / 100);
    let networkFeeSats = parseInt(document.getElementById("networkFee").value) || 0;
    let networkFeeBRL = (networkFeeSats * currentPrice) / 1e8;
    
    let commissionBRL = 0;
    let discountBRL = 0;
    if (cupomData) {
      commissionBRL = feeBRL * (commissionRate / 100);
      discountBRL = feeBRL * (discountRate / 100);
    }
    
    let valorEnviadoBRL = valorBase - feeBRL - networkFeeBRL + discountBRL;
    let valorEnviadoExibicao = "";
    let valorEnviadoNum;
    if (tipo === "depix") {
      valorEnviadoNum = parseFloat(valorEnviadoBRL.toFixed(2));
      valorEnviadoExibicao = valorEnviadoNum.toFixed(2) + " DEPIX";
    } else {
      valorEnviadoNum = Math.round((valorEnviadoBRL / currentPrice) * 1e8);
      valorEnviadoExibicao = valorEnviadoNum.toLocaleString('pt-BR') + " sats";
    }
    
    let commissionExibicao;
    if (tipo === "depix") {
      commissionExibicao = commissionBRL.toFixed(2) + " DEPIX";
    } else {
      let commissionSats = Math.round((commissionBRL / currentPrice) * 1e8);
      commissionExibicao = commissionSats.toLocaleString('pt-BR') + " sats";
    }
    
    let lucroExibicao;
    if (tipo === "bitcoin") {
      let compraVal = valorCompra - 1;
      let taxaFixa = 3;
      let totalSats = (compraVal / currentPrice) * 1e8;
      let taxaSats = (taxaFixa / currentPrice) * 1e8;
      let lucroBrutoSats = Math.round(totalSats - taxaSats);
      lucroExibicao = lucroBrutoSats.toLocaleString('pt-BR') + " sats";
    } else {
      let lucroBrutoDepix = valorCompra - 1;
      lucroExibicao = lucroBrutoDepix.toFixed(2) + " DEPIX";
    }
    
    let taxaP2pTexto = p2pFee + "%";
    let enderecoPix = document.getElementById("enderecoPixP2P").value.trim();
    let textoPix = enderecoPix ? enderecoPix : "Pague com o QRCode ou chave DEPIX enviada após esta mensagem";
    
    let pedidoId = new Date().toISOString();
    document.getElementById("pedidoId").value = pedidoId;
    
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
    
    document.getElementById("resultEnderecoCliente").value = endereco;
    document.getElementById("resultValorEnviado").value = valorEnviadoExibicao;
    document.getElementById("resultEnderecoItning").value = enderecoLitning;
    document.getElementById("resultValorComissao").value = commissionExibicao;
    document.getElementById("resultLucroP2P").value = lucroExibicao;
    document.getElementById("resultMensagemCliente").value = mensagem;
    document.getElementById("pedidoId").value = pedidoId;
  }
  
  function salvarPedido() {
    const pedidoId = document.getElementById("pedidoId").value;
    const valorCompraMatch = document.getElementById("inputMessage").value.match(/valor:\s*([\d\.]+)/i);
    const valorCompra = valorCompraMatch ? valorCompraMatch[1] : "";
    const redeMatch = document.getElementById("inputMessage").value.match(/rede:\s*([A-Z]+)/i);
    const rede = redeMatch ? redeMatch[1] : "";
    const enderecoCliente = document.getElementById("resultEnderecoCliente").value;
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
  

  // Em orders.js (ou em outro arquivo incluído antes de index.js)

function getValorEnviado(valorCompra, tipo, networkFeeSats, cupom) {
  // valorCompra: valor original enviado pelo cliente (em R$)
  // tipo: "bitcoin" ou "depix"
  // networkFeeSats: taxa de rede em sats (se houver)
  // cupom: string do cupom (opcional, não usamos aqui para simplificar)

  // Valor líquido recebido no banco: desconta R$1,00
  let valorRecebidoBanco = valorCompra - 1;
  // Se for Bitcoin, desconta R$3,00 adicionalmente (taxa interna)
  let valorBase = (tipo === "bitcoin") ? (valorRecebidoBanco - 3) : valorRecebidoBanco;

  // Determina a taxa P2P usando o valor original da compra
  let feeConfigArray = CONFIG.p2p.defaultFee[tipo];
  let p2pFee = null;
  for (let config of feeConfigArray) {
    if (valorCompra >= config.min && valorCompra <= config.max) {
      p2pFee = config.fee;
      break;
    }
  }
  if (p2pFee === null) {
    p2pFee = feeConfigArray[feeConfigArray.length - 1].fee;
  }

  // Calcula a taxa em reais
  let feeBRL = valorBase * (p2pFee / 100);
  // Converte a taxa de rede, se houver, de sats para reais (usando currentPrice)
  let networkFeeBRL = (networkFeeSats * currentPrice) / 1e8;
  
  // Calcula o valor final que será enviado (sem considerar descontos ou comissões extras)
  let valorEnviadoBRL = valorBase - feeBRL - networkFeeBRL;
  
  return { valorEnviadoBRL: valorEnviadoBRL };
}

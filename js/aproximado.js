// aproximado.js
function getValorEnviado(valorCompra, tipo, networkFeeSats = 0, cupom = "") {
    // Valor recebido no banco (desconta R$1,00)
    let valorRecebidoBanco = valorCompra - 1;
  
    // Para Bitcoin, internamente desconta R$3,00; para DEPIX, não desconta nada a mais.
    let valorBase = (tipo === "bitcoin") ? valorRecebidoBanco - 3 : valorRecebidoBanco;
    
    // Obter a taxa P2P usando o valor original para definir a faixa
    let feeConfigArray = CONFIG.p2p.defaultFee[tipo];
    let p2pFee = null;
    for (let config of feeConfigArray) {
      if (valorCompra >= config.min && valorCompra <= config.max) {
        p2pFee = config.fee;
        break;
      }
    }
    if (p2pFee === null) p2pFee = feeConfigArray[feeConfigArray.length - 1].fee;
  
    // Calcula a taxa em reais
    let feeBRL = valorBase * (p2pFee / 100);
    // Aqui você pode incluir também networkFee e descontos, se necessário.
    let valorEnviadoBRL = valorBase - feeBRL;
    
    // Retorna o valor líquido (em reais ou, se for bitcoin, esse valor posteriormente será convertido em sats)
    return {
      valorEnviadoBRL,
      p2pFee
    };
  }
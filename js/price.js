// price.js
 

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

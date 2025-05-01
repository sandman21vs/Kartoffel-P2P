document.addEventListener("DOMContentLoaded", function() {
    function initTaxasPage() {
      const container = document.getElementById("taxasConteudo");
      if (!container) return;
      
      // Cartão com os valores mínimos de compra
      let minimosHtml = `
        <div class="card">
          <h2>Valores Mínimos de Compra</h2>
          <ul>
            <li>Bitcoin (geral): R$${CONFIG.minimums.bitcoin}</li>
            <li>Bitcoin Onchain: R$${CONFIG.minimums.bitcoinOnchain}</li>
            <li>Bitcoin Lightning: R$${CONFIG.minimums.bitcoinLightning}</li>
            <li>Bitcoin Liquid: R$${CONFIG.minimums.bitcoinLiquid}</li>
            <li>DePix: R$${CONFIG.minimums.depix}</li>
          </ul>
        </div>
      `;
      
      // Cartão de taxas para Bitcoin
      let btcHtml = `<div class="card"><h2>Taxas para Bitcoin</h2><ul>`;
      CONFIG.p2p.defaultFee.bitcoin.forEach(tier => {
        let minVal = tier.min ? " R$" + tier.min.toLocaleString('pt-BR') + " " : "";
        btcHtml += `<li>${minVal}Até R$${tier.max.toLocaleString('pt-BR')}: ${tier.fee}%</li>`;
      });
      btcHtml += `</ul></div>`;
      
      // Cartão de taxas para DePix
      let depixHtml = `<div class="card"><h2>Taxas para DePix</h2><ul>`;
      CONFIG.p2p.defaultFee.depix.forEach(tier => {
        let minVal = tier.min ? " R$" + tier.min.toLocaleString('pt-BR') + " " : "";
        depixHtml += `<li>${minVal}Até R$${tier.max.toLocaleString('pt-BR')}: ${tier.fee}%</li>`;
      });
      depixHtml += `</ul></div>`;
      
      // Caixa explicativa sobre as taxas
      let feesExpHtml = `
        <div class="card">
          <h2>Por que essas taxas?</h2>
          <p>
  Todas as transações têm um custo de R$1,00 que será descontado.
  Esse custo é reflexo do sistema DEPIX, que traz segurança e anonimato tanto ao P2P quanto ao cliente.
          </p>
        </div>
      `;
      
      // Cartão de exemplo de cálculo (apenas ilustrativo)
      let calcHtml = `
        <div class="card">
          <h2>Exemplo de Cálculo (BTC Lightning com Cupom)</h2>
          <ul>
            <li><strong>1. Valor Enviado:</strong> R$ V (ex: R$ 1.000,00)</li>
            <li><strong>2. Dedução da Taxa Operacional:</strong> ValorBase = V - R$1,00 (ex: 1.000 - 1 = R$ 999,00)</li>
            <li><strong>3. Taxa P2P:</strong> Ex: 5% para BTC Lightning</li>
            <li><strong>4. Taxa Calculada:</strong> Taxa = ValorBase × 5%</li>
            <li><strong>5. Valor Final:</strong> ValorFinal = ValorBase - Taxa </li>
          </ul>
        </div>
      `;
      
      container.innerHTML = minimosHtml + btcHtml + depixHtml + feesExpHtml + calcHtml;
    }
    
    initTaxasPage();
  });
  
/* js/documentacao.js */

/**
 * Insere no container #docsContent todo o conteúdo de documentação,
 * incluindo como criar mensagens personalizadas, usar Pix, cupons,
 * tokens disponíveis, fallback de campos vazios, e dicas de ChatGPT.
 */
function mostrarDocumentacao() {
    const docsContainer = document.getElementById("docsContent");
  
    // HTML de toda a documentação, já formatado de forma mais agradável
    const docHtml = `
      <div style="margin-bottom:1.5rem;">
        <h2 style="margin-bottom:0.5rem;">Criando Mensagens Personalizadas</h2>
        <p>
          Você pode criar sua própria mensagem de atendimento ao cliente, 
          incluindo <strong>tokens</strong> que serão substituídos automaticamente. 
          Por exemplo: <code>{valorComprado}</code>, <code>{valorEnviado}</code>, <code>{tipo}</code>, <code>{enderecoPix}</code> etc.
        </p>
        <p>
          Caso deixe a <em>Mensagem para o Cliente</em> em branco (na aba Configurações),
          o sistema usará um texto padrão. Tokens desconhecidos são ignorados.
        </p>
      </div>
  
      <hr style="margin: 1.5rem 0; border:none; border-top:1px solid #666;">
  
      <div style="margin-bottom:1.5rem;">
        <h2 style="margin-bottom:0.5rem;">Tokens Disponíveis</h2>
        <ul style="line-height:1.8;">
          <li><code>{cotacao}</code> - Exibe a cotação atual do Bitcoin/Depix</li>
          <li><code>{valorComprado}</code> - Valor em BRL que o cliente vai enviar</li>
          <li><code>{valorEnviado}</code> - Valor (sats ou DEPIX) recebido pelo cliente</li>
          <li><code>{tipo}</code> - Tipo de cripto (BITCOIN ou DEPIX)</li>
          <li><code>{enderecoCliente}</code> - Endereço que o cliente forneceu</li>
          <li><code>{enderecoPix}</code> - Endereço Pix salvo (ou fallback “Pague com o QRCode...” se vazio)</li>
          <li><code>{taxaP2p}</code> - Taxa P2P aplicada, ex.: “5%”</li>
          <li><code>{idTransacao}</code> - ID gerado automaticamente (Ex.: data/hora ISO)</li>
          <li><code>{comissaoP2p}</code> - Comissão exibida (em sats ou DEPIX)</li>
          <li><code>{lucroP2p}</code> - Lucro final do P2P</li>
        </ul>
        <p style="margin-top:0.5rem;">
          Se o navegador suportar, use <code>.replaceAll("{token}", valor)</code>.
          Caso contrário, utilize 
          <code>.replace(/{token}/g, valor)</code> para substituir todas as ocorrências do token.
        </p>
      </div>
  
      <hr style="margin: 1.5rem 0; border:none; border-top:1px solid #666;">
  
      <div style="margin-bottom:1.5rem;">
        <h2 style="margin-bottom:0.5rem;">Endereço Pix e Cupons</h2>
        <p>
          <strong>Endereço Pix P2P:</strong> (aba Configurações)<br>
          Se deixado em branco, o sistema exibirá 
          “<em>Pague com o QRCode ou chave DEPIX enviada após esta mensagem</em>”.
        </p>
        <p>
          <strong>Lista de Cupons Registrados:</strong> (aba Configurações)<br>
          Cada linha deve conter: <code>NomeCupom, email, desconto, comissao</code>.<br>
          Se o cupom for válido, o desconto/comissão serão aplicados; caso contrário, são ignorados.
        </p>
      </div>
  
      <hr style="margin: 1.5rem 0; border:none; border-top:1px solid #666;">
  
      <div style="margin-bottom:1.5rem;">
        <h2 style="margin-bottom:0.5rem;">Campos em Branco</h2>
        <ul style="line-height:1.8;">
          <li><strong>Mensagem Personalizada Vazia:</strong> Usa texto padrão</li>
          <li><strong>Endereço Pix Vazio:</strong> Mostra mensagem fallback</li>
          <li><strong>Cupom Inválido/Vazio:</strong> Não há desconto/comissão</li>
        </ul>
      </div>
  
      <hr style="margin: 1.5rem 0; border:none; border-top:1px solid #666;">
  
      <div style="margin-bottom:1.5rem;">
        <h2 style="margin-bottom:0.5rem;">Dica: Usando ChatGPT</h2>
        <p>
          Quer criar uma mensagem de atendimento profissional rapidamente?
          Abra o ChatGPT e peça algo como:
        </p>
        <blockquote style="border-left:3px solid #ccc; margin:0.5rem 0; padding:0.5rem;">
          “Crie um texto curto de agradecimento ao cliente, incluindo os tokens
          {valorComprado}, {valorEnviado}, {tipo} e {enderecoPix}.”
        </blockquote>
        <p>  
          Depois, copie e cole na “Mensagem para o Cliente”. O sistema cuidará de 
          substituir os tokens pelos valores reais no momento do cálculo.
        </p>
      </div>
    `;
  
    docsContainer.innerHTML = docHtml;
  }
  
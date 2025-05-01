// utils.js
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
  
   function mostrarInformacoes() {
    const info = "Lista de Cupons Registrados:\n" +
                 "Cada linha: NomeCupom, email, desconto, comissao\n" +
                 "Ex.: Sandmann, sandmann@walletofsatoshi.com, 5, 10\n\n" +
                 "Mensagem para o Cliente:\n" +
                 "Tokens disponíveis: {cotacao}, {valorComprado}, {valorEnviado}, {tipo}, {enderecoCliente}, {enderecoPix}, {taxaP2p}, {idTransacao}, {comissaoP2p}, {lucroP2p}\n\n" +
                 "Clique em +Informações para saber como usar os tokens.";
    alert(info);
  }
  
   function mostrarDocumentacaoTokens() {
    const info = 
      "DOCUMENTAÇÃO DE TOKENS:\n\n" +
      "{cotacao} => Exibe a cotação atual.\n" +
      "{valorComprado} => Valor BRL que o cliente vai enviar.\n" +
      "{valorEnviado} => Valor (sats ou DEPIX) que o cliente recebe, calculado sobre (valorCompra - 1).\n" +
      "{tipo} => Tipo de cripto (BITCOIN ou DEPIX).\n" +
      "{enderecoCliente} => Endereço que o cliente forneceu.\n" +
      "{enderecoPix} => Endereço Pix salvo (ou fallback).\n\n" +
      "NOVOS TOKENS:\n" +
      "{taxaP2p} => Taxa de P2P aplicada (porcentagem).\n" +
      "{idTransacao} => ID único gerado para a transação.\n" +
      "{comissaoP2p} => Comissão exibida (sats ou DEPIX).\n" +
      "{lucroP2p} => Lucro final do P2P (sats ou DEPIX).\n\n" +
      "Use replaceAll ou /{token}/g para substituir todas as ocorrências.\n\n" +
      "Exemplo: \"Olá! Sua taxa foi {taxaP2p}, a transação {idTransacao} gerou {lucroP2p} de lucro.\"";
    alert(info);
  }
  
   function mostrarMaisInformacoesMensagemPersonalizada() {
    const info =
      "++ INFORMAÇÕES DA MENSAGEM PARA O CLIENTE PERSONALIZADA ++\n\n" +
      "1. A mensagem pode conter tokens entre chaves, por exemplo: {valorComprado}, {tipo}, etc.\n" +
      "2. Cada token será substituído pelo valor real ao gerar a mensagem final.\n\n" +
      "Exemplo: \"Olá! Você comprou {valorComprado} reais em {tipo}, e receberá {valorEnviado} em cripto.\"\n\n" +
      "FIM DAS INFORMAÇÕES.";
    alert(info);
  }

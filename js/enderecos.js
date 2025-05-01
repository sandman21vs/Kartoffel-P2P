// enderecos.js
const PREFIXOS_ENDERECO = {
    onchain: ["bc1", "3", "1"],
    liquid: ["lq1", "v"]
  };
  
  function validarEndereco(rede, endereco) {
    rede = rede.toLowerCase();
    if (PREFIXOS_ENDERECO[rede]) {
      const valido = PREFIXOS_ENDERECO[rede].some(prefixo => endereco.toLowerCase().startsWith(prefixo.toLowerCase()));
      if (!valido) {
        alert(`Para rede ${rede.toUpperCase()}, o endereço deve iniciar com ${PREFIXOS_ENDERECO[rede].join(" ou ")}`);
        return false;
      }
    }
    return true;
  }
  
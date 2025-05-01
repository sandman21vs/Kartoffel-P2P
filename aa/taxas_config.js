// js/taxas_config.js

const CONFIG = {
  // Dados de Contato
  contact: {
    name: "Sandmann",
    link: "sandlabs_21" // Usado para criar o URL do Telegram: https://t.me/sandlabs_21
  },



  // Dados para a página "Sobre"
  about: {
    btcEntry: "2021",
    description: `
Este site constitui uma vitrine destinada a P2Ps, com o objetivo de demonstrar o funcionamento do meu sistema e possibilitar sua implementação para os respectivos clientes.\n\n
Acesse a página p2p.sandlabs.store/p2p.html para realizar testes das funcionalidades de conversão de moedas e envio automático de mensagens aos clientes.\n\n
Em caso de dúvidas, estou à disposição para contato via Telegram, onde posso oferecer suporte no uso do sistema e disponibilizar o serviço conforme necessário.\n\n
Atualmente, o sistema encontra-se em fase beta, com todos os dados armazenados exclusivamente no navegador do usuário.\n
Dessa forma, não assumo responsabilidade por eventuais vazamentos de informações, uma vez que não há armazenamento em meu servidor.\n
O sistema está em beta aberto e, no momento, seu uso é gratuito para P2Ps. Caso deseje implementá-lo para testes, entre em contato comigo para maiores informações.`,
    supportLink: "sandlabs_21"
  },

  // Credenciais para Acesso à Área P2P
  auth: {
    username: "admin",
    password: "admin"
  },


  // Mínimos de Compra
  minimums: {
    bitcoin: 100,            // Mínimo geral (não específico) para Bitcoin
    bitcoinOnchain: 800,     // Mínimo para rede On-chain
    bitcoinLightning: 100,   // Mínimo para Lightning
    bitcoinLiquid: 100,      // Mínimo para Liquid
    depix: 100               // Mínimo para DePix
  },

  
  // Parâmetros para a Calculadora P2P – esses intervalos são usados para definir a taxa automaticamente
  p2p: {
    defaultFee: {
      bitcoin: [
        { min: 100, max: 499, fee: 7.0 },
        { min: 500, max: 2499, fee: 6.0 },
        { min: 2500, max: 3499, fee: 5.0 },
        { min: 3500, max: 6000, fee: 4.0 }
      ],
      depix: [
        { min: 100, max: 499, fee: 3.0 },
        { min: 500, max: 999, fee: 2.5 },
        { min: 1000, max: 2499, fee: 2 },
        { min: 2500, max: 3499, fee: 1.5 },
        { min: 3500, max: 6000, fee: 1.1 }
      ]
    },
    defaultCommissionRate: 10, // Comissão padrão (%) sobre a taxa P2P
    defaultDiscountRate: 5     // Desconto padrão (%) sobre a taxa P2P
  }
};



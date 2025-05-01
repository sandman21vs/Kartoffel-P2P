
# Kartoffel-P2P

O **Kartoffel-P2P** é um projeto voltado para usuários P2P de Bitcoin, permitindo que eles hospedem uma plataforma simples onde podem interagir com seus clientes, mostrando taxas, valores em BTC e outras informações. Este projeto é baseado em um servidor de arquivos para HTML e CSS, com todo o processamento realizado na máquina do usuário.

## Requisitos Mínimos

- Raspberry Pi Zero 2W
- Docker ou Portainer com Nginx (versão estável)
- **Umbrel** como host (recomendado)

## Como Rodar o Sistema

### Usando Umbrel como Host (Recomendado)

1. Instale o **Umbrel** em seu dispositivo.
2. No Umbrel, instale os apps **Portainer** e **Cloudflare Tunnel**.
3. No **Portainer**, configure o Docker conforme os seguintes parâmetros:
   - Instale o **Nginx:stable**.
   - Configure o **Port Mapping**:
     - Host: `9001`
     - Container: `80`
   - Volumes:
     - `Container: /usr/share/nginx/html`
     - Selecione um volume para os arquivos (crie uma pasta específica para os arquivos do projeto).
   - **Restart Policy**: `always`
4. No **Cloudflare Tunnel**, configure para garantir que o serviço seja acessível externamente com segurança.

Após configurar, basta copiar as pastas do repositório para dentro da pasta criada e aguardar o Docker iniciar o serviço.

### Alternativa: Usando Docker/Portainer

1. Instale o **Docker** ou **Portainer** com **Nginx:stable**.
2. Configure o **Port Mapping**:
   - Host: `9001`
   - Container: `80`
3. Volumes:
   - `Container: /usr/share/nginx/html`
   - Selecione um volume para os arquivos (crie uma pasta específica para os arquivos do projeto).
4. **Restart Policy**: `always`

Após configurar o Docker, basta copiar as pastas do repositório para dentro da pasta criada e aguardar o Docker iniciar o serviço.

## Personalizações

- **Logo**: Se quiser modificar a logo, vá até a pasta `aa` e substitua a logo oficial pelo seu arquivo com o mesmo nome da logo original.
- **Taxas**: Para modificar as taxas mínimas, máximas e outras configurações, acesse a pasta `aa` e edite o arquivo `taxas_config.js`.

## Funcionalidades

- **Página de Calculadora**: Acesse o endereço `<ip>/p2p.html` para uma página que fornece ferramentas de cálculo de taxas, mensagens automáticas para clientes, lucro, comissão, entre outros.
  
## Sistema de Cupons de Afiliado

O projeto também inclui um sistema de **cupons de afiliado**. Quando um cupom é utilizado no formato:  
`<ip>?cupom=NomeDoCupom`  
O cupom será pré-preenchido automaticamente, permitindo que o P2P ajude seus afiliados.

## Licença

Este projeto é desenvolvido sob a **Licença GPL v3**. Caso você use este código e faça melhorias, por favor, publique essas melhorias para que a comunidade possa se beneficiar.

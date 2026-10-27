# Clínica Antolli: site e agente de atendimento

Site institucional da Clínica Antolli (Dra. Érica Antolli, farmacêutica esteta, Londrina-PR) e o agente de atendimento do WhatsApp em n8n.

O passo a passo completo (GitHub, Render, WhatsApp, n8n, Instagram) está no guia de lançamento compartilhado junto com este repositório.

## Estrutura

```
clinica-antolli/
├── public/                         # tudo o que o Render publica
│   ├── index.html                  # página principal
│   ├── politica-de-privacidade.html
│   ├── lab/  verao/  manutencao/   # atalhos para a bio e anúncios (redirecionam para a seção)
│   ├── catalogo/                   # atalho que abre o catálogo do WhatsApp
│   └── assets/
│       ├── js/config.js            # ÚNICO arquivo com dados da clínica (telefone, CRF, endereço, kits)
│       ├── js/main.js              # comportamento do site
│       ├── js/chat.js              # assistente do site (usa o n8n quando configurado)
│       ├── css/style.css
│       ├── fonts/  img/  video/
├── n8n/
│   └── agente-whatsapp-clinica-antolli.json   # workflow para importar no n8n
└── render.yaml                     # Blueprint do Render (site estático)
```

## Editar dados da clínica

Abra `public/assets/js/config.js`, troque os campos marcados com `PREENCHER` e `CONFERIR`, faça commit e push. O Render publica a nova versão em 1 a 2 minutos.

## Rodar no computador

Qualquer servidor estático serve. Com Python instalado:

```bash
cd public
python3 -m http.server 8080
# abra http://localhost:8080
```

## Atalhos para usar no Instagram

| Endereço | Abre |
| --- | --- |
| `/lab` | Seção Skin & Scent Lab |
| `/verao` | Seção Projeto Bumbum 360 |
| `/manutencao` | Seção Plano Manutenção 12 meses |
| `/catalogo` | Catálogo no WhatsApp |

Os atalhos preservam parâmetros UTM, por exemplo `/lab?utm_source=instagram&utm_campaign=lab_natal`.

## Agente de atendimento (n8n)

1. No n8n: **Workflows > Import from File** e escolha `n8n/agente-whatsapp-clinica-antolli.json`.
2. Configure as 3 credenciais (WhatsApp OAuth, WhatsApp API, Anthropic) e os campos indicados na nota amarela do workflow.
3. Ative o workflow e copie a Production URL do nó **Chat do site** para `assistente.webhookUrl` no `config.js`.

Sem o n8n configurado, o site continua funcionando: os botões vão para o WhatsApp da Érica e o chat responde com respostas prontas.

## Regras de conteúdo

Toda alteração de texto segue a Resolução CFF 658/2018: identificação com nome e CRF, sem promessa de resultado, sem preço de procedimento na divulgação, fotos de pacientes só com autorização por escrito.

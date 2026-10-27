
window.CLINICA = {
  nome: "Clínica Antolli",
  siteUrl: "https://clinica-antolli.onrender.com", 

  profissional: {
    nome: "Dra. Érica Antolli",
    profissao: "Farmacêutica Esteta",
    crf: "CRF-PR 30381", 
    formacao: [
      "Farmacêutica inscrita no CRF-PR sob o nº 30381",
      "Atuação em estética facial, corporal e capilar"
    ]
  },

  whatsapp: {

    numero: "5543996602325",
    catalogoUrl: "",
    mensagemPadrao: "Olá! Vim pelo site da Clínica Antolli e gostaria de agendar uma avaliação."
  },

  assistente: {
    // Número conectado ao agente do n8n (WhatsApp Cloud API). Deixe vazio enquanto não existir:
    // os botões de conversa vão direto para o número da Érica.
    numero: "",
    // URL do webhook do n8n para o chat do site (nó "Chat do site").
    // Ex.: https://SEU-N8N/webhook/site-chat . Vazio = chat responde com respostas prontas.
    webhookUrl: ""
  },

  instagram: "draerica.antolli",
  email: "", // opcional: e-mail de contato da clínica (vazio = não aparece)

  endereco: {
    linha: "Rua Santos, 149, Clínica Ciopek",
    bairro: "",                          // opcional: bairro
    cidade: "Londrina",
    uf: "PR",
    cep: "",                             // opcional: CEP
    mapsUrl: ""                          // opcional: link "Compartilhar" do Google Maps (vazio = busca pelo endereço)
  },

  horarios: [
    { dias: "Com hora marcada", horas: "8h às 22h" } // CONFERIR os dias da semana
  ],

  // Link para as avaliações reais no Google (perfil da empresa). Vazio = botão não aparece.
  googleAvaliacoesUrl: "",

  // Depoimentos REAIS, com autorização por escrito da paciente. Lista vazia = seção escondida.
  // Exemplo: { texto: "...", nome: "Ana M.", procedimento: "Skinbooster" }
  depoimentos: [],

  // Fotos de antes e depois: só publique com termo de autorização assinado (Res. CFF 658/2018, art. 5º, "f").
  mostrarResultados: true,

  // Skin & Scent Lab: kits com produtos prontos (industrializados e regularizados na Anvisa).
  // Preço de produto pode aparecer; preço de procedimento fica para a conversa individual.
  mostrarPrecosKits: true,
  kits: [
    {
      id: "essencial",
      nome: "Lab Essencial",
      preco: 149,
      resumo: "Para começar uma rotina simples e certa para a sua pele.",
      itens: [
        "Avaliação cosmética da pele",
        "2 produtos da rotina (ex.: limpeza + protetor ou hidratante)",
        "Fragrância em miniatura escolhida por você",
        "Cartão da rotina escrito pela Dra."
      ]
    },
    {
      id: "ritual",
      nome: "Lab Ritual",
      preco: 249,
      destaque: true,
      resumo: "Rotina completa de manhã e noite, com fragrância e presente sensorial.",
      itens: [
        "Avaliação cosmética da pele",
        "3 produtos da rotina (manhã e noite)",
        "Fragrância escolhida por você",
        "Presente sensorial (ex.: vela ou sachê)",
        "Nécessaire personalizada"
      ]
    },
    {
      id: "signature",
      nome: "Lab Signature",
      preco: 349,
      resumo: "A experiência completa, pensada para presentear ou se presentear.",
      itens: [
        "Avaliação cosmética da pele",
        "4 produtos da rotina, incluindo tratamento específico",
        "Fragrância em tamanho regular",
        "Presente sensorial + caixa personalizada com nome",
        "Retorno para revisar a rotina em 30 dias"
      ]
    }
  ],

  // Plano Manutenção 12 meses: opções mensais. CONFERIR com a Érica.
  planoManutencao: {
    opcoes: [
      "Sessão de laser para manchas e textura",
      "Skinbooster (hidratação profunda)",
      "Intradermoterapia capilar",
      "Protocolo de revitalização facial"
    ]
  }
};

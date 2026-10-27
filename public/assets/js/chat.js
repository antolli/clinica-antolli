/* Clínica Antolli: assistente do site.
 * Com assistente.webhookUrl preenchido no config.js, as mensagens vão para o agente do n8n
 * (o mesmo cérebro do WhatsApp). Sem webhook, ou se ele falhar, o chat usa respostas prontas.
 */
(function () {
  "use strict";

  var A = window.ANTOLLI;
  var C = window.CLINICA || {};
  if (!A) return;

  var panel = document.getElementById("chatPanel");
  var toggle = document.getElementById("chatToggle");
  var closeBtn = document.getElementById("chatClose");
  var msgs = document.getElementById("chatMsgs");
  var form = document.getElementById("chatForm");
  var input = document.getElementById("chatInput");
  var quick = document.getElementById("chatQuick");
  var started = false;
  var busy = false;

  function sessionId() {
    var key = "antolli_chat_session";
    try {
      var id = sessionStorage.getItem(key);
      if (!id) {
        id = "site-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
        sessionStorage.setItem(key, id);
      }
      return id;
    } catch (e) {
      return "site-" + Date.now().toString(36);
    }
  }

  /* Texto seguro: transforma URLs em links sem usar innerHTML com texto do usuário */
  function renderText(node, text) {
    var re = /(https?:\/\/[^\s)]+)/g;
    var last = 0;
    var match;
    while ((match = re.exec(text)) !== null) {
      if (match.index > last) node.appendChild(document.createTextNode(text.slice(last, match.index)));
      var a = document.createElement("a");
      a.href = match[0];
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = /wa\.me\/c\//.test(match[0]) ? "Abrir catálogo" : (/wa\.me/.test(match[0]) ? "Continuar no WhatsApp" : match[0]);
      node.appendChild(a);
      last = match.index + match[0].length;
    }
    if (last < text.length) node.appendChild(document.createTextNode(text.slice(last)));
  }

  function add(text, who) {
    var bubble = document.createElement("div");
    bubble.className = "msg msg--" + who;
    if (who === "bot") renderText(bubble, text); else bubble.textContent = text;
    msgs.appendChild(bubble);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function typing(on) {
    var t = document.getElementById("chatTyping");
    if (on && !t) {
      t = document.createElement("div");
      t.id = "chatTyping";
      t.className = "msg msg--bot msg--typing";
      t.innerHTML = "<i></i><i></i><i></i>";
      msgs.appendChild(t);
      msgs.scrollTop = msgs.scrollHeight;
    } else if (!on && t) {
      t.remove();
    }
  }

  /* ---------- respostas prontas (modo sem n8n) ---------- */
  function norm(s) {
    return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  function kitsTexto() {
    var brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
    return (C.kits || []).map(function (k) {
      return "• " + k.nome + (C.mostrarPrecosKits && k.preco ? " (" + brl.format(k.preco) + ")" : "") + ": " + k.resumo;
    }).join("\n");
  }

  function offlineReply(text) {
    var t = norm(text);
    var wa = function (m) { return A.waLink(m); };

    if (/scent|\blab\b|\bkits?\b|fragranc|perfume|presente/.test(t)) {
      return "O Skin & Scent Lab é uma experiência na clínica: a Dra. avalia a sua pele e vocês montam juntas um kit com produtos prontos para a sua rotina, uma fragrância escolhida por você e um presente sensorial.\n\n" +
        kitsTexto() + "\n\nPara agendar ou comprar como vale-presente: " + wa("Olá! Quero saber do Skin & Scent Lab.");
    }
    if (/manutenc|plano|anual|12 meses|mensal/.test(t)) {
      return "No Plano Manutenção 12 meses você faz uma sessão por mês durante um ano, definida com a Dra. a partir da avaliação, com reavaliação a cada 3 meses.\n\nOpções do plano: " +
        ((C.planoManutencao && C.planoManutencao.opcoes) || []).join(", ") + ".\n\nCondições e valores são apresentados na avaliação: " + wa("Olá! Quero saber do Plano Manutenção 12 meses.");
    }
    if (/bumbum|gluteo|verao|360|culote|coxa/.test(t)) {
      return "O Projeto Bumbum 360 é um protocolo em etapas para firmeza, textura e contorno da região glútea, com bioestimulador de colágeno e técnicas complementares conforme a indicação. Como o colágeno se forma aos poucos, o ideal é começar antes do verão.\n\nTudo começa pela avaliação corporal: " + wa("Olá! Quero a avaliação do Projeto Bumbum 360.");
    }
    if (/calv|queda|cabelo|capilar|entrada|fio/.test(t)) {
      return "O tratamento capilar para queda e calvície usa intradermoterapia no couro cabeludo, para homens e mulheres. A primeira etapa é a avaliação do couro cabeludo e do histórico, para indicar o protocolo certo.\n\nAgende por aqui: " + wa("Olá! Quero saber do tratamento capilar para queda e calvície.");
    }
    if (/catalogo/.test(t)) {
      return "O catálogo completo está no WhatsApp da clínica: " + A.catalogLink();
    }
    if (/valor|preco|quanto|custa|pagamento|parcel/.test(t)) {
      return "O valor depende do protocolo indicado e da quantidade de produto, por isso ele é passado na avaliação ou direto no WhatsApp, junto com as formas de pagamento: " + wa("Olá! Gostaria de saber valores.");
    }
    if (/endereco|onde fica|localizac|como chego|chegar|que horas|horario de|abre|aberto/.test(t)) {
      var h = (C.horarios || []).map(function (x) { return x.dias + ": " + x.horas; }).join("\n");
      return "Estamos em " + A.enderecoTexto() + ".\n\nHorários:\n" + h;
    }
    if (/agend|marcar|consulta|avaliac|horario livre|vaga/.test(t)) {
      return "Vamos agendar! Toque no link para continuar no WhatsApp com a mensagem pronta, e a equipe confirma o melhor horário: " + wa("Olá! Quero agendar uma avaliação.");
    }
    if (/tratamento|procedimento|faz|oferece|servico|botox|toxina|preench|harmoniz|bioestim|skinbooster|laser|mancha|olheira|labio/.test(t)) {
      return "Fazemos toxina botulínica, preenchimento com ácido hialurônico, harmonização facial, bioestimuladores de colágeno, skinbooster, laser para manchas, tratamento capilar para queda e calvície e protocolos corporais.\n\nA indicação sempre vem da avaliação. Quer perguntar sobre algum? " + wa("Olá! Tenho uma dúvida sobre um tratamento.");
    }
    if (/atendente|humano|pessoa|doutora|dra|erica|falar com/.test(t)) {
      return "Claro. Toque aqui para falar com a equipe no WhatsApp: " + wa("Olá! Gostaria de falar com a equipe da clínica.");
    }
    return "Posso ajudar com agendamento, tratamentos, os lançamentos (Plano Manutenção, Bumbum 360 e Skin & Scent Lab) e endereço. Para dúvidas sobre a sua saúde, o melhor é a avaliação com a Dra.: " + wa("Olá! Tenho uma dúvida.");
  }

  /* ---------- envio ---------- */
  function send(text) {
    if (!text || busy) return;
    add(text, "user");
    quick.hidden = true;
    busy = true;
    typing(true);

    var url = C.assistente && C.assistente.webhookUrl;
    var done = function (reply) {
      typing(false);
      add(reply, "bot");
      busy = false;
    };

    if (!url) {
      setTimeout(function () { done(offlineReply(text)); }, 600);
      return;
    }

    var controller = "AbortController" in window ? new AbortController() : null;
    var timer = setTimeout(function () { if (controller) controller.abort(); }, 25000);

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: sessionId(), message: text, origem: "site", pagina: location.pathname + location.hash }),
      signal: controller ? controller.signal : undefined
    })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (data) {
        clearTimeout(timer);
        var reply = data && (data.reply || data.output || data.text);
        done(reply ? String(reply) : offlineReply(text));
      })
      .catch(function () {
        clearTimeout(timer);
        done(offlineReply(text));
      });
  }

  function open() {
    panel.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    if (!started) {
      started = true;
      add("Olá! Sou a assistente virtual da Clínica Antolli. Posso tirar dúvidas sobre tratamentos e lançamentos e te levar ao WhatsApp para agendar. Como posso ajudar?", "bot");
    }
    setTimeout(function () { input.focus(); }, 50);
  }

  function close() {
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.focus();
  }

  toggle.addEventListener("click", function () { panel.hidden ? open() : close(); });
  closeBtn.addEventListener("click", close);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) close(); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = input.value.trim();
    input.value = "";
    send(text);
  });

  quick.querySelectorAll("button").forEach(function (b) {
    b.addEventListener("click", function () { send(b.getAttribute("data-q")); });
  });
})();

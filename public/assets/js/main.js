/* Clínica Antolli: comportamento do site. Os dados vêm de config.js */
(function () {
  "use strict";

  var C = window.CLINICA || {};

  /* ---------- utilidades ---------- */
  function get(path) {
    return path.split(".").reduce(function (obj, key) {
      return obj && obj[key] !== undefined ? obj[key] : undefined;
    }, C);
  }

  function digits(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function numeroConversa() {
    // Se existir um número do assistente (n8n), as conversas vão para ele.
    var assistente = digits(get("assistente.numero"));
    return assistente || digits(get("whatsapp.numero"));
  }

  function waLink(message) {
    var text = message || get("whatsapp.mensagemPadrao") || "";
    return "https://wa.me/" + numeroConversa() + "?text=" + encodeURIComponent(text);
  }

  function catalogLink() {
    var custom = get("whatsapp.catalogoUrl");
    return custom ? custom : "https://wa.me/c/" + digits(get("whatsapp.numero"));
  }

  function instagramLink() {
    return "https://instagram.com/" + String(get("instagram") || "").replace(/^@/, "");
  }

  function formatPhone(num) {
    var d = digits(num).replace(/^55/, "");
    if (d.length === 11) return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
    if (d.length === 10) return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
    return d;
  }

  function enderecoTexto() {
    var e = get("endereco") || {};
    return [e.linha, e.bairro, (e.cidade || "") + (e.uf ? " - " + e.uf : "")].filter(Boolean).join(", ");
  }

  var brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function openExternal(anchor) {
    anchor.setAttribute("target", "_blank");
    anchor.setAttribute("rel", "noopener");
  }

  /* ---------- textos e links vindos do config ---------- */
  document.querySelectorAll("[data-cfg]").forEach(function (node) {
    var value = get(node.getAttribute("data-cfg"));
    if (value) node.textContent = value;
  });

  document.querySelectorAll("[data-wa]").forEach(function (a) {
    a.href = waLink(a.getAttribute("data-wa"));
    openExternal(a);
  });

  document.querySelectorAll("[data-wa-catalogo]").forEach(function (a) {
    a.href = catalogLink();
    openExternal(a);
  });

  document.querySelectorAll("[data-instagram]").forEach(function (a) {
    a.href = instagramLink();
    openExternal(a);
  });
  document.querySelectorAll("[data-cfg-instagram]").forEach(function (n) {
    n.textContent = "@" + String(get("instagram") || "").replace(/^@/, "");
  });
  document.querySelectorAll("[data-cfg-telefone]").forEach(function (n) {
    n.textContent = formatPhone(numeroConversa());
  });
  document.querySelectorAll("[data-cfg-endereco]").forEach(function (n) {
    n.textContent = enderecoTexto();
  });

  var maps = document.getElementById("mapsLink");
  if (maps) {
    maps.href = get("endereco.mapsUrl") || "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(enderecoTexto());
  }

  var horarios = document.getElementById("horarios");
  if (horarios) {
    horarios.textContent = (get("horarios") || []).map(function (h) { return h.dias + ": " + h.horas; }).join(" · ");
  }

  var formacao = document.getElementById("formacaoList");
  if (formacao) {
    (get("profissional.formacao") || []).forEach(function (item) { formacao.appendChild(el("li", {}, item)); });
  }

  // Seções condicionais (ex.: resultados)
  document.querySelectorAll("[data-if]").forEach(function (node) {
    if (!get(node.getAttribute("data-if"))) node.hidden = true;
  });

  /* ---------- Plano Manutenção ---------- */
  var planoOpcoes = document.getElementById("planoOpcoes");
  if (planoOpcoes) {
    (get("planoManutencao.opcoes") || []).forEach(function (op) { planoOpcoes.appendChild(el("li", {}, op)); });
  }

  var months = document.getElementById("monthsGrid");
  if (months) {
    for (var m = 1; m <= 12; m++) {
      var cell = el("span", { class: "month" + (m % 3 === 0 ? " is-review" : "") }, String(m));
      months.appendChild(cell);
    }
  }

  /* ---------- Bumbum 360: contagem até o verão ---------- */
  (function contagemVerao() {
    var hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    var ano = hoje.getFullYear();
    var inicioVerao = new Date(ano, 11, 21);       // 21 de dezembro
    var fimVerao = new Date(ano, 2, 20);           // 20 de março
    if (hoje <= fimVerao) inicioVerao = new Date(ano - 1, 11, 21);
    var dias = Math.round((inicioVerao - hoje) / 86400000);
    var label = document.getElementById("diasVerao");
    var caption = document.getElementById("dataVerao");
    var bar = document.getElementById("ringBar");
    if (!label) return;
    if (dias <= 0) {
      label.textContent = "Já";
      label.nextElementSibling.textContent = "é verão";
      if (caption) caption.parentNode.textContent = "Ainda dá tempo de cuidar do próximo";
      if (bar) bar.style.strokeDashoffset = 0;
      return;
    }
    label.textContent = String(dias);
    if (caption) caption.textContent = "21 de dezembro de " + inicioVerao.getFullYear();
    if (bar) {
      var total = 553;
      var progresso = Math.min(1, Math.max(0, 1 - dias / 120));
      requestAnimationFrame(function () { bar.style.strokeDashoffset = String(total * (1 - progresso)); });
    }
  })();

  /* ---------- Skin & Scent Lab: kits ---------- */
  var kitsGrid = document.getElementById("kitsGrid");
  if (kitsGrid) {
    (get("kits") || []).forEach(function (kit) {
      var card = el("article", { class: "kit" + (kit.destaque ? " kit--featured" : "") });
      if (kit.destaque) card.appendChild(el("span", { class: "kit__badge" }, "Recomendado"));
      card.appendChild(el("h4", {}, kit.nome));
      if (get("mostrarPrecosKits") && kit.preco) {
        var price = el("p", { class: "kit__price" });
        price.textContent = brl.format(kit.preco);
        card.appendChild(price);
      }
      card.appendChild(el("p", {}, kit.resumo));
      var list = el("ul");
      (kit.itens || []).forEach(function (item) { list.appendChild(el("li", {}, item)); });
      card.appendChild(list);
      var cta = el("a", { class: "kit__cta", href: waLink("Olá! Quero agendar o Skin & Scent Lab, kit " + kit.nome + ".") }, "Quero o " + kit.nome);
      cta.insertAdjacentHTML("beforeend", '<svg><use href="#i-arrow"/></svg>');
      openExternal(cta);
      card.appendChild(cta);
      kitsGrid.appendChild(card);
    });
  }

  /* ---------- Carrossel de fotos (Bumbum 360) ---------- */
  var reduzMovimento = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-carousel]").forEach(function (root) {
    var track = root.querySelector(".carousel__track");
    var slides = Array.prototype.slice.call(track.children);
    var prev = root.querySelector("[data-carousel-prev]");
    var next = root.querySelector("[data-carousel-next]");
    var dotsWrap = root.querySelector(".carousel__dots");
    var atual = 0;

    if (slides.length < 2) {
      root.querySelector(".carousel__controls").hidden = true;
      return;
    }

    var dots = slides.map(function (slide, i) {
      var dot = el("button", { type: "button", class: "carousel__dot", "aria-label": "Foto " + (i + 1) + " de " + slides.length });
      dot.addEventListener("click", function () { irPara(i); });
      dotsWrap.appendChild(dot);
      return dot;
    });

    function irPara(i) {
      var alvo = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: alvo * track.clientWidth, behavior: reduzMovimento ? "auto" : "smooth" });
    }

    function atualizar() {
      atual = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
      dots.forEach(function (dot, k) { dot.setAttribute("aria-current", k === atual ? "true" : "false"); });
      slides.forEach(function (slide, k) { slide.setAttribute("aria-hidden", k === atual ? "false" : "true"); });
      prev.disabled = atual === 0;
      next.disabled = atual === slides.length - 1;
    }

    var agendado = false;
    track.addEventListener("scroll", function () {
      if (agendado) return;
      agendado = true;
      window.requestAnimationFrame(function () {
        agendado = false;
        atualizar();
      });
    }, { passive: true });

    prev.addEventListener("click", function () { irPara(atual - 1); });
    next.addEventListener("click", function () { irPara(atual + 1); });
    track.addEventListener("keydown", function (ev) {
      if (ev.key === "ArrowRight") { ev.preventDefault(); irPara(atual + 1); }
      if (ev.key === "ArrowLeft") { ev.preventDefault(); irPara(atual - 1); }
    });
    window.addEventListener("resize", function () { track.scrollLeft = atual * track.clientWidth; });

    atualizar();
  });

  /* ---------- Depoimentos reais ---------- */
  var depoimentos = get("depoimentos") || [];
  var depSection = document.getElementById("depoimentos");
  var googleUrl = get("googleAvaliacoesUrl");
  if (depSection && (depoimentos.length || googleUrl)) {
    depSection.hidden = false;
    var grid = document.getElementById("depoimentosGrid");
    depoimentos.forEach(function (d) {
      var card = el("figure", { class: "testimonial" });
      card.appendChild(el("blockquote", {}, "“" + d.texto + "”"));
      card.appendChild(el("cite", {}, d.nome + (d.procedimento ? " · " + d.procedimento : "")));
      grid.appendChild(card);
    });
    var g = document.getElementById("googleReviews");
    if (googleUrl && g) { g.href = googleUrl; g.hidden = false; openExternal(g); }
  }

  /* ---------- Filtro de tratamentos ---------- */
  var filters = document.querySelectorAll(".filter");
  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.getAttribute("data-filter");
      filters.forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });
      document.querySelectorAll("#treatmentCards .card").forEach(function (card) {
        var tags = (card.getAttribute("data-tags") || "").split(" ");
        card.classList.toggle("is-hidden", f !== "todos" && tags.indexOf(f) === -1);
      });
    });
  });

  /* ---------- Navegação ---------- */
  var nav = document.getElementById("nav");
  window.addEventListener("scroll", function () {
    nav.classList.toggle("is-scrolled", window.scrollY > 10);
  }, { passive: true });

  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  toggle.addEventListener("click", function () {
    var open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  links.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- Formulário de agendamento ---------- */
  var form = document.getElementById("bookingForm");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var data = new FormData(form);
      var nome = String(data.get("nome") || "").trim();
      var telefone = digits(data.get("telefone"));
      var interesse = String(data.get("interesse") || "");
      var periodo = String(data.get("periodo") || "");
      var erro = document.getElementById("formError");

      var problema = "";
      if (!nome) problema = "Informe o seu nome.";
      else if (telefone.length < 10) problema = "Informe um WhatsApp com DDD.";
      else if (!interesse) problema = "Escolha o seu interesse.";
      else if (!data.get("consentimento")) problema = "Marque a autorização para continuar.";
      if (problema) { erro.textContent = problema; erro.hidden = false; return; }
      erro.hidden = true;

      var msg = "Olá! Vim pelo site da Clínica Antolli.\n" +
        "Nome: " + nome + "\n" +
        "Interesse: " + interesse + "\n" +
        "Melhor período: " + periodo;

      window.open(waLink(msg), "_blank", "noopener");
      form.reset();
    });
  }

  /* ---------- Dados estruturados para o Google ---------- */
  var ld = {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    name: C.nome,
    url: C.siteUrl,
    image: (C.siteUrl || "") + "/assets/img/og.jpg",
    telephone: "+" + digits(get("whatsapp.numero")),
    address: {
      "@type": "PostalAddress",
      streetAddress: get("endereco.linha"),
      addressLocality: get("endereco.cidade"),
      addressRegion: get("endereco.uf"),
      postalCode: get("endereco.cep"),
      addressCountry: "BR"
    },
    sameAs: [instagramLink()]
  };
  var script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(ld);
  document.head.appendChild(script);

  var ano = document.getElementById("ano");
  if (ano) ano.textContent = String(new Date().getFullYear());

  // API pública usada pelo chat.js
  window.ANTOLLI = { get: get, waLink: waLink, catalogLink: catalogLink, enderecoTexto: enderecoTexto, instagramLink: instagramLink };
})();

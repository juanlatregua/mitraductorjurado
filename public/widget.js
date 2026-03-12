(function () {
  "use strict";

  var WIDGET_VERSION = "1.0.0";
  var BASE_URL = "https://mitraductorjurado.es";

  // Buscar el script actual para leer data-translator
  var scripts = document.getElementsByTagName("script");
  var currentScript = null;
  for (var i = 0; i < scripts.length; i++) {
    if (scripts[i].src && scripts[i].src.indexOf("widget.js") !== -1) {
      currentScript = scripts[i];
    }
  }

  if (!currentScript) return;

  var translatorId = currentScript.getAttribute("data-translator");
  var lang = currentScript.getAttribute("data-lang") || "es";
  var theme = currentScript.getAttribute("data-theme") || "light";

  if (!translatorId) {
    console.error("[MTJ Widget] Falta data-translator");
    return;
  }

  var texts = {
    es: {
      title: "Solicitar traducción jurada",
      name: "Nombre completo",
      email: "Email",
      phone: "Teléfono (opcional)",
      docType: "Tipo de documento",
      message: "Mensaje (opcional)",
      submit: "Enviar solicitud",
      sending: "Enviando...",
      success: "Solicitud enviada correctamente. Le contactaremos pronto.",
      error: "Error al enviar. Inténtelo de nuevo.",
      poweredBy: "Traductor jurado verificado MAEC",
    },
    en: {
      title: "Request sworn translation",
      name: "Full name",
      email: "Email",
      phone: "Phone (optional)",
      docType: "Document type",
      message: "Message (optional)",
      submit: "Send request",
      sending: "Sending...",
      success: "Request sent successfully. We will contact you soon.",
      error: "Error sending. Please try again.",
      poweredBy: "MAEC verified sworn translator",
    },
  };

  var t = texts[lang] || texts.es;

  var DOC_TYPES = [
    "Certificado de nacimiento",
    "Certificado de matrimonio",
    "Título universitario",
    "Contrato",
    "Escritura notarial",
    "Poder notarial",
    "Certificado de antecedentes",
    "Otro",
  ];

  // Crear contenedor
  var container = document.createElement("div");
  container.id = "mtj-widget";

  var isDark = theme === "dark";
  var bgColor = isDark ? "#1e293b" : "#ffffff";
  var textColor = isDark ? "#e2e8f0" : "#1e293b";
  var borderColor = isDark ? "#334155" : "#e2e8f0";
  var inputBg = isDark ? "#0f172a" : "#f8fafc";
  var accentColor = "#2563eb";

  container.innerHTML =
    '<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;max-width:440px;background:' +
    bgColor +
    ";color:" +
    textColor +
    ";border:1px solid " +
    borderColor +
    ';border-radius:12px;padding:24px;box-sizing:border-box">' +
    '<h3 style="margin:0 0 16px;font-size:18px;font-weight:700">' +
    t.title +
    "</h3>" +
    '<form id="mtj-form" style="display:flex;flex-direction:column;gap:12px">' +
    '<input name="name" placeholder="' +
    t.name +
    '" required style="padding:10px 12px;border:1px solid ' +
    borderColor +
    ";border-radius:8px;background:" +
    inputBg +
    ";color:" +
    textColor +
    ';font-size:14px;outline:none">' +
    '<input name="email" type="email" placeholder="' +
    t.email +
    '" required style="padding:10px 12px;border:1px solid ' +
    borderColor +
    ";border-radius:8px;background:" +
    inputBg +
    ";color:" +
    textColor +
    ';font-size:14px;outline:none">' +
    '<input name="phone" type="tel" placeholder="' +
    t.phone +
    '" style="padding:10px 12px;border:1px solid ' +
    borderColor +
    ";border-radius:8px;background:" +
    inputBg +
    ";color:" +
    textColor +
    ';font-size:14px;outline:none">' +
    '<select name="documentType" style="padding:10px 12px;border:1px solid ' +
    borderColor +
    ";border-radius:8px;background:" +
    inputBg +
    ";color:" +
    textColor +
    ';font-size:14px;outline:none"><option value="">' +
    t.docType +
    "</option>" +
    DOC_TYPES.map(function (d) {
      return '<option value="' + d + '">' + d + "</option>";
    }).join("") +
    "</select>" +
    '<textarea name="message" placeholder="' +
    t.message +
    '" rows="3" style="padding:10px 12px;border:1px solid ' +
    borderColor +
    ";border-radius:8px;background:" +
    inputBg +
    ";color:" +
    textColor +
    ';font-size:14px;outline:none;resize:vertical"></textarea>' +
    '<button type="submit" id="mtj-submit" style="padding:12px;background:' +
    accentColor +
    ";color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer\">" +
    t.submit +
    "</button>" +
    '<div id="mtj-msg" style="display:none;padding:10px;border-radius:8px;font-size:13px;text-align:center"></div>' +
    "</form>" +
    '<p style="margin:12px 0 0;font-size:11px;text-align:center;opacity:0.5">' +
    t.poweredBy +
    " · mitraductorjurado.es</p>" +
    "</div>";

  // Insertar después del script
  currentScript.parentNode.insertBefore(container, currentScript.nextSibling);

  // Manejar envío
  var form = document.getElementById("mtj-form");
  var btn = document.getElementById("mtj-submit");
  var msg = document.getElementById("mtj-msg");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = t.sending;
    msg.style.display = "none";

    var data = {
      name: form.name.value,
      email: form.email.value,
      phone: form.phone.value || undefined,
      documentType: form.documentType.value || undefined,
      message: form.message.value || undefined,
    };

    fetch(BASE_URL + "/api/widget/" + translatorId, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then(function (res) {
        return res.json().then(function (json) {
          return { ok: res.ok, data: json };
        });
      })
      .then(function (result) {
        if (result.ok) {
          msg.style.display = "block";
          msg.style.background = "#dcfce7";
          msg.style.color = "#166534";
          msg.textContent = t.success;
          form.reset();
        } else {
          msg.style.display = "block";
          msg.style.background = "#fef2f2";
          msg.style.color = "#991b1b";
          msg.textContent = result.data.error || t.error;
        }
      })
      .catch(function () {
        msg.style.display = "block";
        msg.style.background = "#fef2f2";
        msg.style.color = "#991b1b";
        msg.textContent = t.error;
      })
      .finally(function () {
        btn.disabled = false;
        btn.textContent = t.submit;
      });
  });
})();

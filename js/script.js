/* js/script.js
   Comportamiento: modo oscuro, menú responsive, calculadora y compartir.
*/
document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  /* ===== ELEMENTOS ===== */
  const modoToggle = document.getElementById("modoToggle");
  const menuToggle = document.getElementById("menuToggle");
  const menuLinks = document.getElementById("menuLinks");

  const form = document.getElementById("form-calculadora");
  const inputSuperficie = document.getElementById("superficie");
  const inputLluvia = document.getElementById("lluvia");
  const selectCoef = document.getElementById("coef");
  const resultadosDiv = document.getElementById("resultados");
  const mensajeDiv = document.getElementById("mensaje");
  const compartirBlock = document.getElementById("compartirBlock");
  const shareFb = document.getElementById("share-fb");
  const shareIg = document.getElementById("share-ig");
  const shareWa = document.getElementById("share-wa");
  const btnLimpiar = document.getElementById("btnLimpiar");

  /* ===== MODO OSCURO ===== */
  function aplicarModoOscuro(activar) {
    if (activar) {
      body.classList.add("oscuro");
      modoToggle.textContent = "☀️";
      modoToggle.setAttribute("aria-pressed", "true");
    } else {
      body.classList.remove("oscuro");
      modoToggle.textContent = "🌙";
      modoToggle.setAttribute("aria-pressed", "false");
    }
    localStorage.setItem("modoOscuro", activar ? "true" : "false");
  }

  // Cargar preferencia
  const modoGuardado = localStorage.getItem("modoOscuro");
  if (modoGuardado === "true") aplicarModoOscuro(true);
  else aplicarModoOscuro(false);

  modoToggle.addEventListener("click", () => {
    aplicarModoOscuro(!body.classList.contains("oscuro"));
  });

  /* ===== MENU HAMBURGUESA ===== */
  menuToggle.addEventListener("click", () => {
    const abierto = menuLinks.classList.toggle("open");
    menuToggle.textContent = abierto ? "✖" : "☰";
    menuToggle.setAttribute("aria-expanded", abierto ? "true" : "false");
  });

  // Cerrar menú al hacer clic en enlace (UX móvil)
  menuLinks.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      if (menuLinks.classList.contains("open")) {
        menuLinks.classList.remove("open");
        menuToggle.textContent = "☰";
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  });

  /* ===== VALIDACIÓN: solo números (acepta decimales con coma o punto) ===== */
  function limpiarNumeroTexto(str) {
    if (typeof str !== "string") return "";
    // Reemplaza coma por punto y elimina caracteres no numéricos excepto punto y signo negativo
    return str.replace(",", ".").replace(/[^\d.\-]/g, "");
  }

  function esNumeroValido(str) {
    const limpio = limpiarNumeroTexto(str);
    if (limpio === "" || limpio === "." || limpio === "-" || limpio === "-.") return false;
    const num = Number(limpio);
    return Number.isFinite(num);
  }

  /* ===== CÁLCULO =====
     Fórmula: litros = superficie(m²) * lluvia(mm) * coeficiente
     (porque lluvia en mm y multiplicando por m² y coef da litros directamente)
  */
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    mensajeDiv.textContent = "";
    resultadosDiv.style.display = "none";
    compartirBlock.style.display = "none";

    const rawSuperficie = inputSuperficie.value.trim();
    const rawLluvia = inputLluvia.value.trim();
    const coef = parseFloat(selectCoef.value) || 0;

    // Validaciones
    if (!esNumeroValido(rawSuperficie) || !esNumeroValido(rawLluvia) || coef <= 0) {
      mensajeDiv.textContent = "⚠️ Por favor ingresa sólo números válidos en todos los campos.";
      return;
    }

    const superficie = Number(limpiarNumeroTexto(rawSuperficie));
    const lluvia = Number(limpiarNumeroTexto(rawLluvia));

    if (superficie <= 0 || lluvia <= 0) {
      mensajeDiv.textContent = "⚠️ Los valores deben ser mayores que cero.";
      return;
    }

    // cálculo
    const litros = superficie * lluvia * coef; // litros anuales
    // resultados derivados
    const tinacos = (litros / 1100);
    const lavadoras = (litros / 60);
    const descargas = (litros / 6);

    // Mostrar resultados
    resultadosDiv.innerHTML = `
      <div class="resultado-inner">
        <h3>Resultados estimados</h3>
        <p>💧 <strong>${Math.round(litros).toLocaleString()}</strong> litros al año</p>
        <div class="extra-resultados">
          <p>🏠 Tinacos llenos: <strong>${tinacos.toFixed(1)}</strong></p>
          <p>🧺 Lavadoras (60 L): <strong>${lavadoras.toFixed(1)}</strong></p>
          <p>🚽 Descargas (6 L): <strong>${descargas.toFixed(0)}</strong></p>
        </div>
      </div>
    `;
    resultadosDiv.style.display = "block";

    // Texto para compartir
    const textoCompartir = `💧 Calculadora pluvial — Resultados
Superficie: ${superficie} m²
Lluvia anual: ${lluvia} mm
Coeficiente: ${coef}
➡️ Litros estimados al año: ${Math.round(litros).toLocaleString()} L
Equiv.: ${tinacos.toFixed(1)} tinacos | ${lavadoras.toFixed(1)} lavadas | ${descargas.toFixed(0)} descargas.
#CaptacionDeAgua #AhorroDeAgua`;

    // Configurar botones de compartir
    // FACEBOOK (usa el parámetro quote)
    shareFb.addEventListener("click", (ev) => {
      ev.preventDefault();
      const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=&quote=${encodeURIComponent(textoCompartir)}`;
      window.open(fbUrl, "_blank", "noopener");
    });

    // INSTAGRAM (no permite share de texto desde web): copia al portapapeles y alerta
    shareIg.addEventListener("click", async (ev) => {
      ev.preventDefault();
      try {
        await navigator.clipboard.writeText(textoCompartir);
        alert("✅ Texto copiado al portapapeles. Pégalo en tu publicación de Instagram.");
      } catch (err) {
        // Fallback: crear un textarea temporal
        const t = document.createElement("textarea");
        t.value = textoCompartir;
        document.body.appendChild(t);
        t.select();
        document.execCommand("copy");
        document.body.removeChild(t);
        alert("✅ Texto copiado. Pégalo en Instagram.");
      }
    });

    // WHATSAPP: usar wa.me con texto
    shareWa.addEventListener("click", (ev) => {
      ev.preventDefault();
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textoCompartir)}`;
      window.open(waUrl, "_blank", "noopener");
    });

    // Mostrar bloque de compartir
    compartirBlock.style.display = "block";
  });

  /* ===== BOTÓN LIMPIAR ===== */
  btnLimpiar && btnLimpiar.addEventListener("click", () => {
    inputSuperficie.value = "";
    inputLluvia.value = "";
    selectCoef.selectedIndex = 0;
    resultadosDiv.style.display = "none";
    compartirBlock.style.display = "none";
    mensajeDiv.textContent = "";
  });

});
document.addEventListener("DOMContentLoaded", () => {
  // Coordenadas aproximadas del centro de Zinacantepec
  const map = L.map('mapid').setView([19.2076, -99.9172], 13);

  // Capa base
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Datos de ejemplo: polígonos de zonas de agua
  const zonas = [
    {
      nombre: "Escasez de agua",
      coords: [[19.210, -99.930],[19.205,-99.930],[19.205,-99.920],[19.210,-99.920]],
      color: "red"
    },
    {
      nombre: "Agua media",
      coords: [[19.200, -99.940],[19.195,-99.940],[19.195,-99.930],[19.200,-99.930]],
      color: "orange"
    },
    {
      nombre: "Abundancia de agua",
      coords: [[19.215, -99.910],[19.210,-99.910],[19.210,-99.900],[19.215,-99.900]],
      color: "green"
    }
  ];

  zonas.forEach(zona => {
    L.polygon(zona.coords, {color: zona.color, fillOpacity:0.4})
      .bindPopup(`<strong>${zona.nombre}</strong>`)
      .addTo(map);
  });

  // Ajuste de zoom para dispositivos móviles
  function ajustarMapa() {
    if(window.innerWidth < 768){
      map.setZoom(12);
    } else {
      map.setZoom(13);
    }
  }

  window.addEventListener("resize", ajustarMapa);
  ajustarMapa();
});


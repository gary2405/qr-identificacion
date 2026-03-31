import { db } from "./firebase.js";
import { ref, get, remove, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const params = new URLSearchParams(window.location.search);
const qrId = params.get("id");

if (!qrId) {
  document.body.innerHTML = "<h2>❌ QR inválido</h2>";
  throw new Error("QR inválido");
}

// ========== ZOOM DE FOTOS ==========
let nivelZoomActual = 100;
const modalZoom = document.getElementById("modalZoom");
const fotoZoom = document.getElementById("fotoZoom");
const nivelZoomTexto = document.getElementById("nivelZoom");
const btnCerrarZoom = document.getElementById("btnCerrarZoom");
const btnZoomMas = document.getElementById("btnZoomMas");
const btnZoomMenos = document.getElementById("btnZoomMenos");
const foto = document.getElementById("foto");
const perfilWrap = document.getElementById("perfilWrap");

function abrirZoom(imagenUrl) {
  fotoZoom.src = imagenUrl;
  nivelZoomActual = 100;
  nivelZoomTexto.textContent = "100%";
  fotoZoom.style.transform = "scale(1)";
  modalZoom.classList.remove("qr-oculto");
  document.body.style.overflow = "hidden";
}

function cerrarZoom() {
  modalZoom.classList.add("qr-oculto");
  document.body.style.overflow = "auto";
}

function actualizarZoom() {
  const escala = nivelZoomActual / 100;
  fotoZoom.style.transform = `scale(${escala})`;
  nivelZoomTexto.textContent = nivelZoomActual + "%";
}

if (foto) {
  foto.addEventListener("click", () => {
    if (foto.src && foto.src !== "" && !foto.src.includes("flaticon")) {
      abrirZoom(foto.src);
    }
  });
}

if (btnCerrarZoom) {
  btnCerrarZoom.addEventListener("click", cerrarZoom);
}

if (modalZoom) {
  modalZoom.addEventListener("click", (e) => {
    if (e.target === modalZoom) {
      cerrarZoom();
    }
  });
}

if (btnZoomMas) {
  btnZoomMas.addEventListener("click", () => {
    if (nivelZoomActual < 300) {
      nivelZoomActual += 20;
      actualizarZoom();
    }
  });
}

if (btnZoomMenos) {
  btnZoomMenos.addEventListener("click", () => {
    if (nivelZoomActual > 100) {
      nivelZoomActual -= 20;
      actualizarZoom();
    }
  });
}

if (fotoZoom) {
  fotoZoom.addEventListener("wheel", (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      if (nivelZoomActual < 300) {
        nivelZoomActual += 20;
        actualizarZoom();
      }
    } else {
      if (nivelZoomActual > 100) {
        nivelZoomActual -= 20;
        actualizarZoom();
      }
    }
  });
}

// ========== MENÚ DROPDOWN ==========
const perfilMenuContainer = document.getElementById("perfilMenuContainer");
const perfílMenuBtn = document.getElementById("perfílMenuBtn");
const perfilDropdown = document.getElementById("perfilDropdown");
const btnEditarMenu = document.getElementById("btnEditarMenu");
const btnVerComoMenu = document.getElementById("btnVerComoMenu");
const btnEliminarMenu = document.getElementById("btnEliminarMenu");
const btnCerrarSesionMenu = document.getElementById("btnCerrarSesionMenu");
const verComoTexto = document.getElementById("verComoTexto");

let modoVisitante = false;

if (perfílMenuBtn) {
  perfílMenuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    perfilDropdown.classList.toggle("activo");
  });
}

// Cerrar dropdown al hacer click fuera
document.addEventListener("click", () => {
  if (perfilDropdown && perfilDropdown.classList.contains("activo")) {
    perfilDropdown.classList.remove("activo");
  }
});

// ========== ELEMENTOS DEL PERFIL ==========

const nombre = document.getElementById("nombre");
const edad = document.getElementById("edad");
const tipo = document.getElementById("tipo");
const direccion = document.getElementById("direccion");
const mensaje = document.getElementById("mensaje");

const linkLlamar = document.getElementById("linkLlamar");
const linkWhatsapp = document.getElementById("linkWhatsapp");
const btnCompartir = document.getElementById("btnCompartir");

const bloqueEmergencia = document.getElementById("bloqueEmergencia");
const linkLlamar2 = document.getElementById("linkLlamar2");
const linkWhatsapp2 = document.getElementById("linkWhatsapp2");

const bloqueGPS = document.getElementById("bloqueGPS");
const textoUbicacion = document.getElementById("textoUbicacion");
const linkMapa = document.getElementById("linkMapa");

const verPersona = document.getElementById("verPersona");
const verMascota = document.getElementById("verMascota");
const verObjeto = document.getElementById("verObjeto");

const panelAcceso = document.getElementById("panelAcceso");
const accesoVisitante = document.getElementById("accesoVisitante");
const loginDuenoBox = document.getElementById("loginDuenoBox");
const btnSoyDueno = document.getElementById("btnSoyDueno");
const pinDueno = document.getElementById("pinDueno");
const btnEntrarDueno = document.getElementById("btnEntrarDueno");
const btnCancelarLogin = document.getElementById("btnCancelarLogin");

const modalCompartir = document.getElementById("modalCompartir");
const inputURLCompartir = document.getElementById("inputURLCompartir");
const btnCopiarURL = document.getElementById("btnCopiarURL");
const btnCerrarModal = document.getElementById("btnCerrarModal");

const estadoBadge = document.getElementById("estadoBadge");
const alertainEmergencia = document.getElementById("alertainEmergencia");
const textoEmergencia = document.getElementById("textoEmergencia");
const linkLlamarEmergencia = document.getElementById("linkLlamarEmergencia");
const linkWhatsappEmergencia = document.getElementById("linkWhatsappEmergencia");
const btnEncontrado = document.getElementById("btnEncontrado");
const btnContinuar = document.getElementById("btnContinuar");

let dataActual = null;
let esDueno = localStorage.getItem("owner_" + qrId) === "true";

const estadoColores = {
  activo: "#28a745",
  perdido: "#dc3545",
  encontrado: "#ffc107"
};

const estadoTextos = {
  activo: "✓ Activo",
  perdido: "⚠️ Perdido",
  encontrado: "🔍 Encontrado"
};

function actualizarVistaDueno() {
  const mostrarMenuDueno = esDueno && !modoVisitante;

  if (mostrarMenuDueno) {
    perfilMenuContainer.classList.remove("qr-oculto");
    panelAcceso.classList.add("qr-oculto");
  } else {
    perfilMenuContainer.classList.add("qr-oculto");
    panelAcceso.classList.remove("qr-oculto");
    loginDuenoBox.classList.add("qr-oculto");
    accesoVisitante.classList.remove("qr-oculto");
  }

  verComoTexto.textContent = modoVisitante ? "Volver" : "Ver como visitante";
}

async function llenarPerfil(data) {
  nombre.textContent = data.nombre || "Sin nombre";
  edad.textContent = data.edad ? `${data.edad} años` : "";
  tipo.textContent = data.tipoPerfil || "Sin tipo";
  direccion.textContent = data.direccion || "Sin dirección";
  mensaje.textContent = data.mensaje || "—";

  // Debug - mostrar tipo de perfil
  console.log("Tipo de perfil:", data.tipoPerfil);
  console.log("Sangre:", data.sangre);
  console.log("Padecimientos:", data.padecimientos);
  console.log("Alergias:", data.alergias);

  // Estado badge
  if (["mascota", "objeto"].includes(data.tipoPerfil) && data.estado) {
    const estado = data.estado || "activo";
    estadoBadge.classList.remove("qr-oculto");
    estadoBadge.style.backgroundColor = estadoColores[estado] || "#28a745";
    estadoBadge.textContent = estadoTextos[estado] || "Activo";

    if (estado === "perdido" && !esDueno) {
      mostrarAlertaEmergencia(data);
    }
  }

  // Cargar foto
  let imagenUrl = data.foto || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  foto.src = imagenUrl;

  // Establecer la imagen como fondo difuminado
  perfilWrap.style.setProperty('--bg-image-blur', `url('${imagenUrl}')`);

  linkLlamar.href = `tel:${data.contacto || ""}`;
  linkWhatsapp.href = `https://wa.me/${encodeURIComponent(data.contacto || "")}`;

  if (data.contacto2) {
    bloqueEmergencia.classList.remove("qr-oculto");
    linkLlamar2.href = `tel:${data.contacto2}`;
    linkWhatsapp2.href = `https://wa.me/${encodeURIComponent(data.contacto2)}`;
  }

  if (data.latitud && data.longitud) {
    bloqueGPS.classList.remove("qr-oculto");
    textoUbicacion.textContent = `📍 Lat: ${parseFloat(data.latitud).toFixed(4)}, Lng: ${parseFloat(data.longitud).toFixed(4)}`;
    linkMapa.href = `https://maps.google.com/?q=${data.latitud},${data.longitud}`;
  }

  // Mostrar información médica - CORREGIDO
  const tipoPerfil = data.tipoPerfil.toLowerCase();
  if (["persona", "nino", "adultomayor"].includes(tipoPerfil)) {
    console.log("Mostrando información médica para:", tipoPerfil);
    verPersona.classList.remove("qr-oculto");
    document.getElementById("verSangre").textContent = data.sangre && data.sangre.trim() ? data.sangre : "—";
    document.getElementById("verPadecimientos").textContent = data.padecimientos && data.padecimientos.trim() ? data.padecimientos : "—";
    document.getElementById("verAlergias").textContent = data.alergias && data.alergias.trim() ? data.alergias : "—";
  }

  if (data.tipoPerfil === "mascota" && data.mascota) {
    verMascota.classList.remove("qr-oculto");
    document.getElementById("verEspecie").textContent = data.mascota.especie || "—";
    document.getElementById("verRaza").textContent = data.mascota.raza || "—";
    document.getElementById("verColor").textContent = data.mascota.color || "—";
  }

  if (data.tipoPerfil === "objeto" && data.objeto) {
    verObjeto.classList.remove("qr-oculto");
    document.getElementById("verDescripcion").textContent = data.objeto.descripcion || "—";
    document.getElementById("verInstrucciones").textContent = data.objeto.instrucciones || "—";
  }
}

function mostrarAlertaEmergencia(data) {
  const tipoSubtitulo = data.tipoPerfil === "mascota" ? "mascota" : "objeto";
  textoEmergencia.textContent = `Se reportó ${tipoSubtitulo} perdido. ¡Ayuda a encontrarlo!`;
  linkLlamarEmergencia.href = `tel:${data.contacto || ""}`;
  linkWhatsappEmergencia.href = `https://wa.me/${encodeURIComponent(data.contacto || "")}`;
  alertainEmergencia.classList.remove("qr-oculto");
}

// Cargar datos
get(ref(db, "qrs/" + qrId)).then((snapshot) => {
  if (!snapshot.exists()) {
    document.body.innerHTML = "<h2>❌ Registro no encontrado</h2>";
    return;
  }

  dataActual = snapshot.val();
  console.log("Datos cargados:", dataActual);
  llenarPerfil(dataActual);
  actualizarVistaDueno();
}).catch(error => {
  console.error("Error:", error);
  document.body.innerHTML = "<h2>❌ Error al cargar la información</h2>";
});

// ========== EVENT LISTENERS ==========

if (btnSoyDueno) {
  btnSoyDueno.addEventListener("click", () => {
    accesoVisitante.classList.add("qr-oculto");
    loginDuenoBox.classList.remove("qr-oculto");
    pinDueno.focus();
  });
}

if (btnCancelarLogin) {
  btnCancelarLogin.addEventListener("click", () => {
    loginDuenoBox.classList.add("qr-oculto");
    accesoVisitante.classList.remove("qr-oculto");
    pinDueno.value = "";
  });
}

if (btnEntrarDueno) {
  btnEntrarDueno.addEventListener("click", () => {
    if (!dataActual) return;

    const pinIngresado = pinDueno.value.trim();

    if (!pinIngresado) {
      alert("❌ Ingresa tu PIN");
      return;
    }

    if (!/^\d{4,8}$/.test(pinIngresado)) {
      alert("❌ El PIN debe contener 4 a 8 dígitos");
      return;
    }

    if (pinIngresado !== (dataActual.ownerPin || "")) {
      alert("❌ PIN incorrecto");
      return;
    }

    esDueno = true;
    modoVisitante = false;
    localStorage.setItem("owner_" + qrId, "true");
    pinDueno.value = "";
    alertainEmergencia.classList.add("qr-oculto");
    actualizarVistaDueno();
  });

  pinDueno.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      btnEntrarDueno.click();
    }
  });
}

if (btnEditarMenu) {
  btnEditarMenu.addEventListener("click", () => {
    if (!esDueno) return;
    perfilDropdown.classList.remove("activo");
    window.location.href = `index.html?id=${qrId}&edit=1`;
  });
}

if (btnEliminarMenu) {
  btnEliminarMenu.addEventListener("click", async () => {
    if (!esDueno) return;
    perfilDropdown.classList.remove("activo");

    if (confirm("⚠️ ¿Estás seguro? Esta acción no se puede deshacer.")) {
      try {
        await remove(ref(db, "qrs/" + qrId));
        localStorage.removeItem("owner_" + qrId);
        alert("✓ Perfil eliminado correctamente");
        window.location.href = `index.html?id=${qrId}`;
      } catch (error) {
        console.error("Error:", error);
        alert("❌ No se pudo eliminar el registro");
      }
    }
  });
}

if (btnVerComoMenu) {
  btnVerComoMenu.addEventListener("click", () => {
    modoVisitante = !modoVisitante;
    
    if (modoVisitante && dataActual && dataActual.estado === "perdido") {
      mostrarAlertaEmergencia(dataActual);
    } else {
      alertainEmergencia.classList.add("qr-oculto");
    }
    
    actualizarVistaDueno();
  });
}

if (btnCerrarSesionMenu) {
  btnCerrarSesionMenu.addEventListener("click", () => {
    esDueno = false;
    modoVisitante = false;
    localStorage.removeItem("owner_" + qrId);
    perfilDropdown.classList.remove("activo");
    
    if (dataActual && dataActual.estado === "perdido") {
      mostrarAlertaEmergencia(dataActual);
    }
    
    actualizarVistaDueno();
  });
}

if (btnCompartir) {
  btnCompartir.addEventListener("click", () => {
    inputURLCompartir.value = window.location.href;
    modalCompartir.classList.remove("qr-oculto");
    inputURLCompartir.select();
  });
}

if (btnCopiarURL) {
  btnCopiarURL.addEventListener("click", () => {
    inputURLCompartir.select();
    document.execCommand("copy");
    btnCopiarURL.textContent = "✓ ¡Copiado!";
    setTimeout(() => {
      btnCopiarURL.textContent = "Copiar enlace";
    }, 2000);
  });
}

if (btnCerrarModal) {
  btnCerrarModal.addEventListener("click", () => {
    modalCompartir.classList.add("qr-oculto");
  });
}

if (btnEncontrado) {
  btnEncontrado.addEventListener("click", async () => {
    if (confirm("✓ ¿Marcar como encontrado?")) {
      try {
        await update(ref(db, "qrs/" + qrId), { estado: "encontrado" });
        dataActual.estado = "encontrado";
        alertainEmergencia.classList.add("qr-oculto");
        setTimeout(() => {
          location.reload();
        }, 500);
      } catch (error) {
        console.error("Error:", error);
        alert("❌ No se pudo actualizar el estado");
      }
    }
  });
}

if (btnContinuar) {
  btnContinuar.addEventListener("click", () => {
    alertainEmergencia.classList.add("qr-oculto");
  });
}
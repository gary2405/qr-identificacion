import { db } from "./firebase.js";
import { ref, get, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const params = new URLSearchParams(window.location.search);
const qrId = params.get("id");

if (!qrId) {
  document.body.innerHTML = "<h2>QR inválido</h2>";
  throw new Error("QR inválido");
}

const nombre = document.getElementById("nombre");
const tipo = document.getElementById("tipo");
const direccion = document.getElementById("direccion");
const mensaje = document.getElementById("mensaje");
const foto = document.getElementById("foto");

const linkLlamar = document.getElementById("linkLlamar");
const linkWhatsapp = document.getElementById("linkWhatsapp");

const bloqueEmergencia = document.getElementById("bloqueEmergencia");
const linkLlamar2 = document.getElementById("linkLlamar2");
const linkWhatsapp2 = document.getElementById("linkWhatsapp2");

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

const panelDueno = document.getElementById("panelDueno");
const btnEditar = document.getElementById("btnEditar");
const btnEliminar = document.getElementById("btnEliminar");
const btnVerComo = document.getElementById("btnVerComo");
const btnCerrarSesionDueno = document.getElementById("btnCerrarSesionDueno");

const cover = document.querySelector(".perfil-cover");
if (data.cover) {
  cover.style.backgroundImage = `url(${data.cover})`;
}

direccion.textContent = data.ubicacion || "Sin ubicación";

if (data.persona) {
  const p = data.persona;

  const bloque = document.createElement("div");
  bloque.className = "perfil-bloque";

  bloque.innerHTML = `
    <h3>Detalles</h3>
    ${p.edad ? `<p>Edad: ${p.edad}</p>` : ""}
    ${p.estatura ? `<p>Estatura: ${p.estatura}</p>` : ""}
    ${p.peso ? `<p>Peso: ${p.peso}</p>` : ""}
    ${p.cabello ? `<p>Cabello: ${p.cabello}</p>` : ""}
    ${p.ojos ? `<p>Ojos: ${p.ojos}</p>` : ""}
  `;

  document.querySelector(".perfil-card").appendChild(bloque);
}

if (data.mascota) {
  if (data.mascota.estado === "perdido") {
    document.body.style.background = "#ffe5e5";
  }

  if (data.mascota.recompensa) {
    const r = document.createElement("p");
    r.innerHTML = `<b>Recompensa:</b> ${data.mascota.recompensa}`;
    document.querySelector(".perfil-card").appendChild(r);
  }
}

let dataActual = null;
let esDueno = localStorage.getItem("owner_" + qrId) === "true";
let modoVisitante = false;

function actualizarVistaDueno() {
  const mostrarPanelDueno = esDueno && !modoVisitante;

  if (mostrarPanelDueno) {
    panelDueno.classList.remove("qr-oculto");
    panelAcceso.classList.add("qr-oculto");
  } else {
    panelDueno.classList.add("qr-oculto");
    panelAcceso.classList.remove("qr-oculto");
    loginDuenoBox.classList.add("qr-oculto");
    accesoVisitante.classList.remove("qr-oculto");
  }

  if (btnVerComo) {
    btnVerComo.textContent = modoVisitante ? "Volver a modo dueño" : "Ver como visitante";
  }
}

function llenarPerfil(data) {
  nombre.textContent = data.nombre || "";
  tipo.textContent = data.tipoPerfil || "";
  direccion.textContent = data.direccion || "Sin dirección";
  mensaje.textContent = data.mensaje || "Sin mensaje";

  if (data.foto) {
  foto.src = data.foto;
  foto.classList.remove("qr-oculto");
} else {
  foto.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  foto.classList.remove("qr-oculto");
}

  linkLlamar.href = `tel:${data.contacto || ""}`;
  linkWhatsapp.href = `https://wa.me/${data.contacto || ""}`;

  if (data.contacto2) {
    bloqueEmergencia.classList.remove("qr-oculto");
    linkLlamar2.href = `tel:${data.contacto2}`;
    linkWhatsapp2.href = `https://wa.me/${data.contacto2}`;
  }

  if (["persona", "nino", "adultoMayor"].includes(data.tipoPerfil)) {
    verPersona.classList.remove("qr-oculto");
    document.getElementById("verSangre").textContent = data.sangre || "No indicado";
    document.getElementById("verPadecimientos").textContent = data.padecimientos || "No indicado";
    document.getElementById("verAlergias").textContent = data.alergias || "No indicado";
  }

  if (data.tipoPerfil === "mascota" && data.mascota) {
    verMascota.classList.remove("qr-oculto");
    document.getElementById("verEspecie").textContent = data.mascota.especie || "No indicado";
    document.getElementById("verRaza").textContent = data.mascota.raza || "No indicado";
    document.getElementById("verColor").textContent = data.mascota.color || "No indicado";
  }

  if (data.tipoPerfil === "objeto" && data.objeto) {
    verObjeto.classList.remove("qr-oculto");
    document.getElementById("verDescripcion").textContent = data.objeto.descripcion || "No indicado";
    document.getElementById("verInstrucciones").textContent = data.objeto.instrucciones || "No indicado";
  }
}

get(ref(db, "qrs/" + qrId)).then((snapshot) => {
  if (!snapshot.exists()) {
    document.body.innerHTML = "<h2>Registro no encontrado</h2>";
    return;
  }

  dataActual = snapshot.val();
  llenarPerfil(dataActual);
  actualizarVistaDueno();
});

if (btnSoyDueno) {
  btnSoyDueno.addEventListener("click", () => {
    accesoVisitante.classList.add("qr-oculto");
    loginDuenoBox.classList.remove("qr-oculto");
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
      alert("Ingresa tu PIN.");
      return;
    }

    if (pinIngresado !== (dataActual.ownerPin || "")) {
      alert("PIN incorrecto.");
      return;
    }

    esDueno = true;
    modoVisitante = false;
    localStorage.setItem("owner_" + qrId, "true");
    pinDueno.value = "";
    actualizarVistaDueno();
  });
}

if (btnEditar) {
  btnEditar.addEventListener("click", () => {
    if (!esDueno) return;
    window.location.href = `index.html?id=${qrId}&edit=1`;
  });
}

if (btnEliminar) {
  btnEliminar.addEventListener("click", async () => {
    if (!esDueno) return;

    if (confirm("¿Eliminar este registro?")) {
      await remove(ref(db, "qrs/" + qrId));
      localStorage.removeItem("owner_" + qrId);
      window.location.href = `index.html?id=${qrId}`;
    }
  });
}

if (btnVerComo) {
  btnVerComo.addEventListener("click", () => {
    modoVisitante = !modoVisitante;
    actualizarVistaDueno();
  });
}

if (btnCerrarSesionDueno) {
  btnCerrarSesionDueno.addEventListener("click", () => {
    esDueno = false;
    modoVisitante = false;
    localStorage.removeItem("owner_" + qrId);
    actualizarVistaDueno();
  });
}
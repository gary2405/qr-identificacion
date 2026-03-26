import { db } from "./firebase.js";
import { ref, get, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const qrId = new URLSearchParams(window.location.search).get("id");

const pantallaCarga = document.getElementById("pantallaCarga");
const contenidoPrincipal = document.getElementById("contenidoPrincipal");
const modal = document.getElementById("modalNoConfig");
const formulario = document.getElementById("formulario");

const fTipo = document.getElementById("fTipo");
const previewFoto = document.getElementById("previewFoto");
const fFoto = document.getElementById("fFoto");

const qrRef = ref(db, "qrs/" + qrId);

fTipo.addEventListener("change", () => {
  document.getElementById("seccionPersona").classList.add("qr-oculto");
  document.getElementById("seccionMascota").classList.add("qr-oculto");
  document.getElementById("seccionObjeto").classList.add("qr-oculto");

  if (["persona","nino","adultoMayor"].includes(fTipo.value))
    document.getElementById("seccionPersona").classList.remove("qr-oculto");

  if (fTipo.value === "mascota")
    document.getElementById("seccionMascota").classList.remove("qr-oculto");

  if (fTipo.value === "objeto")
    document.getElementById("seccionObjeto").classList.remove("qr-oculto");
});

fFoto.addEventListener("change", () => {
  const file = fFoto.files[0];
  if (file) previewFoto.src = URL.createObjectURL(file);
});

get(qrRef).then(snap => {
  pantallaCarga.classList.add("qr-oculto");
  if (snap.exists()) {
    window.location.href = `ver.html?id=${qrId}`;
  } else {
    modal.classList.remove("qr-oculto");
  }
});

document.getElementById("btnConfigurar").onclick = () => {
  contenidoPrincipal.classList.remove("qr-oculto");
  formulario.classList.remove("qr-oculto");
};

formulario.addEventListener("submit", async e => {
  e.preventDefault();

  const data = {
    tipoPerfil: fTipo.value,
    nombre: document.getElementById("fNombre").value,
    contacto: document.getElementById("fContacto").value,
    contacto2: document.getElementById("fContacto2").value,
    direccion: document.getElementById("fDireccion").value,
    mensaje: document.getElementById("fMensaje").value,
    foto: previewFoto.src
  };

  await set(qrRef, data);
  localStorage.setItem("owner_" + qrId, "true");

  window.location.href = `ver.html?id=${qrId}`;
});
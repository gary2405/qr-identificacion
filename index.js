import { db } from "./firebase.js";
import { ref, set } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const params = new URLSearchParams(location.search);
const qrId = params.get("id") || Date.now();

const formulario = document.getElementById("formulario");
const fTipo = document.getElementById("fTipo");
const fFoto = document.getElementById("fFoto");
const previewFoto = document.getElementById("previewFoto");

fTipo.addEventListener("change", () => {
  ["Persona","Mascota","Objeto"].forEach(s =>
    document.getElementById("seccion"+s)?.classList.add("qr-oculto")
  );

  if (["persona","nino","adultoMayor"].includes(fTipo.value))
    seccionPersona.classList.remove("qr-oculto");
  if (fTipo.value === "mascota")
    seccionMascota.classList.remove("qr-oculto");
  if (fTipo.value === "objeto")
    seccionObjeto.classList.remove("qr-oculto");
});

fFoto.addEventListener("change", () => {
  previewFoto.src = URL.createObjectURL(fFoto.files[0]);
});

formulario.addEventListener("submit", async e => {
  e.preventDefault();

  let fotoBase64 = "";
  if (fFoto.files[0]) {
    const reader = new FileReader();
    reader.readAsDataURL(fFoto.files[0]);
    await new Promise(r => reader.onload = () => {
      fotoBase64 = reader.result;
      r();
    });
  }

  await set(ref(db, "qrs/" + qrId), {
    nombre: fNombre.value,
    tipoPerfil: fTipo.value,
    contacto: fContacto.value,
    contacto2: fContacto2.value,
    mensaje: fMensaje.value,
    foto: fotoBase64,
    fecha: new Date().toISOString()
  });

  location.href = `ver.html?id=${qrId}`;
});

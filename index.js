import { db } from "./firebase.js";
import { ref, get, set, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const params = new URLSearchParams(window.location.search);
const qrId = params.get("id");
const editMode = params.get("edit") === "1";

if (!qrId) {
  document.body.innerHTML = "<h2>QR inválido</h2>";
  throw new Error("QR inválido");
}

const fTipo = document.getElementById("fTipo");
const formulario = document.getElementById("formulario");

const previewFoto = document.getElementById("previewFoto");
const fFoto = document.getElementById("fFoto");

const previewCover = document.getElementById("previewCover");
const fCover = document.getElementById("fCover");

const fProvincia = document.getElementById("fProvincia");
const fCanton = document.getElementById("fCanton");
const fDistrito = document.getElementById("fDistrito");

const fEdad = document.getElementById("fEdad");
const fSexo = document.getElementById("fSexo");
const fEstatura = document.getElementById("fEstatura");
const fPeso = document.getElementById("fPeso");
const fCabello = document.getElementById("fCabello");
const fOjos = document.getElementById("fOjos");

const fEstadoMascota = document.getElementById("fEstadoMascota");
const fRecompensa = document.getElementById("fRecompensa");

const qrRef = ref(db, "qrs/" + qrId);

/* ===== UBICACIONES ===== */
const ubicaciones = {
  "Puntarenas": {
    "Puntarenas": ["Chacarita", "Barranca"],
    "Esparza": ["Espíritu Santo"]
  },
  "San José": {
    "Central": ["Carmen", "Merced"]
  }
};

fProvincia.addEventListener("change", () => {
  fCanton.innerHTML = "<option> Cantón </option>";
  const cantones = ubicaciones[fProvincia.value] || {};
  for (let c in cantones) {
    fCanton.innerHTML += `<option>${c}</option>`;
  }
});

fCanton.addEventListener("change", () => {
  fDistrito.innerHTML = "<option>Distrito</option>";
  const distritos = ubicaciones[fProvincia.value]?.[fCanton.value] || [];
  distritos.forEach(d => {
    fDistrito.innerHTML += `<option>${d}</option>`;
  });
});

/* ===== IMÁGENES ===== */
function comprimirImagen(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

fFoto.addEventListener("change", async () => {
  previewFoto.src = await comprimirImagen(fFoto.files[0]);
});

fCover.addEventListener("change", async () => {
  previewCover.src = await comprimirImagen(fCover.files[0]);
});

/* ===== GUARDAR ===== */
formulario.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    tipoPerfil: fTipo.value,
    nombre: document.getElementById("fNombre").value,
    contacto: document.getElementById("fContacto").value,
    contacto2: document.getElementById("fContacto2").value,
    direccion: document.getElementById("fDireccion").value,
    ubicacion: `${fProvincia.value} ${fCanton.value} ${fDistrito.value}`,
    mensaje: document.getElementById("fMensaje").value,
    foto: previewFoto.src || "",
    cover: previewCover.src || "",
    ownerPin: document.getElementById("fPin").value
  };

  data.personaExtra = {
    edad: fEdad.value,
    sexo: fSexo.value,
    estatura: fEstatura.value,
    peso: fPeso.value,
    cabello: fCabello.value,
    ojos: fOjos.value
  };

  if (fTipo.value === "mascota") {
    data.mascotaExtra = {
      estado: fEstadoMascota.value,
      recompensa: fRecompensa.value
    };
  }

  await set(qrRef, data);
  localStorage.setItem("owner_" + qrId, "true");

  window.location.href = `ver.html?id=${qrId}`;
});

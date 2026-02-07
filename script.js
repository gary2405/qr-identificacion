import { db } from "./firebase.js";
import { ref, get, set, remove } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const params = new URLSearchParams(window.location.search);
const qrId = params.get("id");

/* ================= ELEMENTOS ================= */
const titulo = document.getElementById("titulo");
const formulario = document.getElementById("formulario");
const vistaDatos = document.getElementById("vistaDatos");
const btnEliminar = document.getElementById("btnEliminar");

const fTipo = document.getElementById("fTipo");
const fNombre = document.getElementById("fNombre");
const fContacto = document.getElementById("fContacto");
const fContacto2 = document.getElementById("fContacto2");
const fDireccion = document.getElementById("fDireccion");
const fMensaje = document.getElementById("fMensaje");

const fSangre = document.getElementById("fSangre");
const fPadecimientos = document.getElementById("fPadecimientos");
const fAlergias = document.getElementById("fAlergias");

const fEspecie = document.getElementById("fEspecie");
const fRaza = document.getElementById("fRaza");
const fColor = document.getElementById("fColor");
const fVive = document.getElementById("fVive");

const fDescripcion = document.getElementById("fDescripcion");
const fInstrucciones = document.getElementById("fInstrucciones");

const dNombre = document.getElementById("nombre");
const dTipo = document.getElementById("tipo");
const dContacto = document.getElementById("contacto");
const dMensaje = document.getElementById("mensaje");

const fFoto = document.getElementById("fFoto");
const previewFoto = document.getElementById("previewFoto");
const imgFoto = document.getElementById("foto");


/* ================= VALIDAR QR ================= 
if (!qrId) {
  document.body.innerHTML = "<h2>QR inválido</h2>";
}

/* ================= SWITCH DE PERFIL ================= */
if (fTipo) {
  fTipo.addEventListener("change", () => {
    document.getElementById("seccionPersona").classList.add("qr-oculto");
    document.getElementById("seccionMascota").classList.add("qr-oculto");
    document.getElementById("seccionObjeto").classList.add("qr-oculto");

    if (fTipo.value === "persona" || fTipo.value === "nino" || fTipo.value === "adultoMayor") {
      document.getElementById("seccionPersona").classList.remove("qr-oculto");
    }
    if (fTipo.value === "mascota") {
      document.getElementById("seccionMascota").classList.remove("qr-oculto");
    }
    if (fTipo.value === "objeto") {
      document.getElementById("seccionObjeto").classList.remove("qr-oculto");
    }
  });
}

/* ================= INDEX ================= */
if (formulario) {
  const qrRef = ref(db, "qrs/" + qrId);

  get(qrRef).then(snapshot => {
    if (snapshot.exists()) {
      mostrarDatos(snapshot.val());
    } else {
      mostrarFormulario();
    }
  });

  formulario.addEventListener("submit", e => {
    e.preventDefault();

    let data = {
      tipoPerfil: fTipo.value,
      nombre: fNombre.value,
      contacto: fContacto.value,
      contacto2: fContacto2.value,
      direccion: fDireccion.value,
      mensaje: fMensaje.value,
      fecha: new Date().toISOString()
    };

    if (["persona", "nino", "adultoMayor"].includes(fTipo.value)) {
      data.sangre = fSangre.value;
      data.padecimientos = fPadecimientos.value;
      data.alergias = fAlergias.value;
    }

    if (fTipo.value === "mascota") {
      data.mascota = {
        especie: fEspecie.value,
        raza: fRaza.value,
        color: fColor.value,
        vive: fVive.value
      };
    }

    if (fTipo.value === "objeto") {
      data.objeto = {
        descripcion: fDescripcion.value,
        instrucciones: fInstrucciones.value
      };
    }

    set(qrRef, data).then(() => {
      window.location.href = `ver.html?id=${qrId}`;
    });
  });
}

/* ================= VER ================= */
const card = document.querySelector(".card");

if (card && qrId) {
  const qrRef = ref(db, "qrs/" + qrId);

  get(qrRef).then(snapshot => {
    if (!snapshot.exists()) {
      document.body.innerHTML = "<h2>Registro no encontrado</h2>";
      return;
    }

    const data = snapshot.val();

    dNombre.textContent = data.nombre;
    dTipo.textContent = data.tipoPerfil;
    dMensaje.textContent = data.mensaje;

    document.getElementById("linkLlamar").href = `tel:${data.contacto}`;
    document.getElementById("linkWhatsapp").href = `https://wa.me/${data.contacto}`;

    if (data.contacto2) {
      document.getElementById("bloqueEmergencia").classList.remove("qr-oculto");
      document.getElementById("linkLlamar2").href = `tel:${data.contacto2}`;
      document.getElementById("linkWhatsapp2").href = `https://wa.me/${data.contacto2}`;
    }
  });
}

/* ================= FUNCIONES ================= */
function mostrarFormulario() {
  titulo.textContent = "Registrar información";
  formulario.classList.remove("qr-oculto");
  vistaDatos.classList.add("qr-oculto");
}

function mostrarDatos(data) {
  titulo.textContent = "Información registrada";
  formulario.classList.add("qr-oculto");
  vistaDatos.classList.remove("qr-oculto");

  dNombre.textContent = data.nombre;
  dTipo.textContent = data.tipoPerfil;
  dContacto.textContent = data.contacto;
  dMensaje.textContent = data.mensaje;
}

/* ================= ELIMINAR ================= */
if (btnEliminar) {
  btnEliminar.addEventListener("click", () => {
    if (confirm("¿Eliminar este registro?")) {
      const qrRef = ref(db, "qrs/" + qrId);
      remove(qrRef).then(() => {
        alert("Registro eliminado");
        location.reload();
      });
    }
  });
}


import { db, storage } from "./firebase.js";
import { ref, get, set, remove } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

if (fFoto) {
  fFoto.addEventListener("change", () => {
    const file = fFoto.files[0];
    if (file) {
      previewFoto.src = URL.createObjectURL(file);
    }
  });
}

formulario.addEventListener("submit", async e => {
  e.preventDefault();

  let fotoURL = "";

  if (fFoto.files.length > 0) {
    const file = fFoto.files[0];
    const ruta = storageRef(storage, `fotos/${qrId}`);
    await uploadBytes(ruta, file);
    fotoURL = await getDownloadURL(ruta);
  }

  await set(qrRef, {
    nombre: fNombre.value,
    tipoPerfil: fTipo.value,
    contacto: fContacto.value,
    contacto2: fContacto2.value,
    direccion: fDireccion.value,
    mensaje: fMensaje.value,
    foto: fotoURL,
    fecha: new Date().toISOString()
  });

  window.location.href = `ver.html?id=${qrId}`;
});


if (card && qrId) {
  const qrRef = ref(db, "qrs/" + qrId);

  get(qrRef).then(snapshot => {
    const data = snapshot.val();

    dNombre.textContent = data.nombre;
    dTipo.textContent = data.tipoPerfil;
    dContacto.textContent = data.contacto;
    dMensaje.textContent = data.mensaje;

    if (data.foto) {
      imgFoto.src = data.foto;
    }
  });
}

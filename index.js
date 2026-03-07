import { db } from "./firebase.js";
import { ref, get, set } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const params = new URLSearchParams(window.location.search);
const qrId = params.get("id");

/* ================= ELEMENTOS ================= */
const modal = document.getElementById("modalNoConfig");
const btnConfigurar = document.getElementById("btnConfigurar");
const titulo = document.getElementById("titulo");
const formulario = document.getElementById("formulario");

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

const fDescripcion = document.getElementById("fDescripcion");
const fInstrucciones = document.getElementById("fInstrucciones");

const fFoto = document.getElementById("fFoto");
const previewFoto = document.getElementById("previewFoto");

/* ================= VALIDAR QR ================= */
if (!qrId) {
  document.body.innerHTML = "<h2>QR inválido</h2>";
  throw new Error("QR inválido");
}

/* ================= ESTADO INICIAL ================= */
formulario.classList.add("qr-oculto");
modal.classList.add("qr-oculto");

/* ================= CAMBIO DE PERFIL ================= */
if (fTipo) {
  fTipo.addEventListener("change", () => {
    document.getElementById("seccionPersona").classList.add("qr-oculto");
    document.getElementById("seccionMascota").classList.add("qr-oculto");
    document.getElementById("seccionObjeto").classList.add("qr-oculto");

    if (["persona", "nino", "adultoMayor"].includes(fTipo.value)) {
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

/* ================= PREVIEW FOTO ================= */
if (fFoto) {
  fFoto.addEventListener("change", () => {
    const file = fFoto.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function () {
      previewFoto.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ================= REVISAR SI YA EXISTE ================= */
const qrRef = ref(db, "qrs/" + qrId);

get(qrRef).then(snapshot => {
  if (snapshot.exists()) {
    window.location.href = `ver.html?id=${qrId}`;
  } else {
    modal.classList.remove("qr-oculto");
    formulario.classList.add("qr-oculto");
    titulo.textContent = "Código QR";
  }
});

/* ================= MOSTRAR FORMULARIO DESDE MODAL ================= */
if (btnConfigurar) {
  btnConfigurar.addEventListener("click", () => {
    modal.classList.add("qr-oculto");
    formulario.classList.remove("qr-oculto");
    titulo.textContent = "Registrar información";
  });
}

/* ================= GUARDAR PERFIL ================= */
formulario.addEventListener("submit", async (e) => {
  e.preventDefault();

  let fotoBase64 = "";

  if (fFoto && fFoto.files[0]) {
    const reader = new FileReader();
    fotoBase64 = await new Promise((resolve) => {
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(fFoto.files[0]);
    });
  }

  const data = {
    tipoPerfil: fTipo.value,
    nombre: fNombre.value,
    contacto: fContacto.value,
    contacto2: fContacto2.value,
    direccion: fDireccion.value,
    mensaje: fMensaje.value,
    foto: fotoBase64,
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
      color: fColor.value
    };
  }

  if (fTipo.value === "objeto") {
    data.objeto = {
      descripcion: fDescripcion.value,
      instrucciones: fInstrucciones.value
    };
  }

  await set(qrRef, data);
  window.location.href = `ver.html?id=${qrId}`;
});



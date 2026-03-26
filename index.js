import { db } from "./firebase.js";
import { ref, get, set, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const params = new URLSearchParams(window.location.search);
const qrId = params.get("id");
const editMode = params.get("edit") === "1";

if (!qrId) {
  document.body.innerHTML = "<h2>QR inválido</h2>";
  throw new Error("QR inválido");
}

const pantallaCarga = document.getElementById("pantallaCarga");
const contenidoPrincipal = document.getElementById("contenidoPrincipal");
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
const fPin = document.getElementById("fPin");
const fPinConfirmar = document.getElementById("fPinConfirmar");

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

const qrRef = ref(db, "qrs/" + qrId);

function ocultarCarga() {
  pantallaCarga.classList.add("qr-oculto");
}

function mostrarFormulario(tituloTexto = "Registrar información") {
  modal.classList.add("qr-oculto");
  contenidoPrincipal.classList.remove("qr-oculto");
  formulario.classList.remove("qr-oculto");
  titulo.classList.remove("qr-oculto");
  titulo.textContent = tituloTexto;
}

function comprimirImagen(file) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();

    lector.onload = () => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxAncho = 500;
        const escala = Math.min(1, maxAncho / img.width);

        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };

      img.onerror = reject;
      img.src = lector.result;
    };

    lector.onerror = reject;
    lector.readAsDataURL(file);
  });
}

function aplicarSecciones() {
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
}

function llenarFormulario(data) {
  fTipo.value = data.tipoPerfil || "";
  fNombre.value = data.nombre || "";
  fContacto.value = data.contacto || "";
  fContacto2.value = data.contacto2 || "";
  fDireccion.value = data.direccion || "";
  fMensaje.value = data.mensaje || "";

  if (data.foto) {
    previewFoto.src = data.foto;
  }

  if (data.sangre) fSangre.value = data.sangre;
  if (data.padecimientos) fPadecimientos.value = data.padecimientos;
  if (data.alergias) fAlergias.value = data.alergias;

  if (data.mascota) {
    fEspecie.value = data.mascota.especie || "";
    fRaza.value = data.mascota.raza || "";
    fColor.value = data.mascota.color || "";
  }

  if (data.objeto) {
    fDescripcion.value = data.objeto.descripcion || "";
    fInstrucciones.value = data.objeto.instrucciones || "";
  }

  aplicarSecciones();
}

if (fTipo) {
  fTipo.addEventListener("change", aplicarSecciones);
}

if (fFoto) {
  fFoto.addEventListener("change", async () => {
    const file = fFoto.files[0];
    if (!file) return;
    const base64Comprimido = await comprimirImagen(file);
    previewFoto.src = base64Comprimido;
  });
}

get(qrRef)
  .then(snapshot => {
    const existe = snapshot.exists();
    const data = existe ? snapshot.val() : null;

    ocultarCarga();

    if (editMode) {
      const esDueno = localStorage.getItem("owner_" + qrId) === "true";
      if (!existe) {
        mostrarFormulario("Registrar información");
        return;
      }

      if (!esDueno) {
        window.location.href = `ver.html?id=${qrId}`;
        return;
      }

      mostrarFormulario("Editar información");
      llenarFormulario(data);

      fPin.required = false;
      fPinConfirmar.required = false;
      return;
    }

    if (existe) {
      window.location.href = `ver.html?id=${qrId}`;
      return;
    }

    modal.classList.remove("qr-oculto");
    contenidoPrincipal.classList.add("qr-oculto");
    formulario.classList.add("qr-oculto");
    titulo.classList.add("qr-oculto");
  })
  .catch(error => {
    console.error("Error al consultar Firebase:", error);
    ocultarCarga();
    mostrarFormulario("Registrar información");
  });

if (btnConfigurar) {
  btnConfigurar.addEventListener("click", () => {
    mostrarFormulario("Registrar información");
  });
}

formulario.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    let fotoBase64 = previewFoto.src || "";

    if (fFoto && fFoto.files[0]) {
      fotoBase64 = await comprimirImagen(fFoto.files[0]);
    }

    const existe = (await get(qrRef)).exists();

    if (!editMode) {
      const pin = fPin.value.trim();
      const pin2 = fPinConfirmar.value.trim();

      if (!/^\d{4,8}$/.test(pin)) {
        alert("El PIN debe tener de 4 a 8 dígitos.");
        return;
      }

      if (pin !== pin2) {
        alert("Los PIN no coinciden.");
        return;
      }
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

    if (!existe || !editMode) {
      data.ownerPin = fPin.value.trim();
    }

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

    if (editMode) {
      await update(qrRef, data);
    } else {
      await set(qrRef, data);
      localStorage.setItem("owner_" + qrId, "true");
    }

    window.location.href = `ver.html?id=${qrId}`;
  } catch (error) {
    console.error("Error guardando:", error);
    alert("No se pudo guardar la información.");
  }
});
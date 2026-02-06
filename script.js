import { db } from "./firebase.js";
import { ref, get, set } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const params = new URLSearchParams(window.location.search);
const qrId = params.get("id");

const titulo = document.getElementById("titulo");
const formulario = document.getElementById("formulario");
const vistaDatos = document.getElementById("vistaDatos");

const fNombre = document.getElementById("fNombre");
const fTipo = document.getElementById("fTipo");
const fContacto = document.getElementById("fContacto");
const fMensaje = document.getElementById("fMensaje");

const dNombre = document.getElementById("nombre");
const dTipo = document.getElementById("tipo");
const dContacto = document.getElementById("contacto");
const dMensaje = document.getElementById("mensaje");

if (!qrId) {
  titulo.innerText = "QR inválido";
} else {
  const qrRef = ref(db, "qrs/" + qrId);

  get(qrRef).then(snapshot => {
    if (!snapshot.exists()) {
      mostrarFormulario();
    } else {
      const data = snapshot.val();
      mostrarDatos(data);
    }
  });
}

function mostrarFormulario() {
  titulo.innerText = "Registrar información";
  formulario.classList.remove("oculto");
  vistaDatos.classList.add("oculto");
}

function mostrarDatos(data) {
  titulo.innerText = "Información registrada";
  formulario.classList.add("oculto");
  vistaDatos.classList.remove("oculto");

  dNombre.innerText = data.nombre;
  dTipo.innerText = data.tipo;
  dContacto.innerText = data.contacto;
  dMensaje.innerText = data.mensaje;
}

formulario.addEventListener("submit", e => {
  e.preventDefault();

  const qrRef = ref(db, "qrs/" + qrId);

  set(qrRef, {
    nombre: fNombre.value,
    tipo: fTipo.value,
    contacto: fContacto.value,
    mensaje: fMensaje.value
  }).then(() => {
  window.location.href = `ver.html?id=${id}`;
});
;
});


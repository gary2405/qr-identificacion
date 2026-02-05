import { db } from "./firebase.js";
import { ref, get, set, update } from 
"https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const params = new URLSearchParams(window.location.search);
const qrId = params.get("id");

const contenido = document.getElementById("contenido");
const titulo = document.getElementById("titulo");

const qrRef = ref(db, "qrs/" + qrId);

get(qrRef).then((snapshot) => {
  if (!snapshot.exists()) {
    mostrarFormulario();
  } else {
    const data = snapshot.val();
    if (data.activo) {
      mostrarDatos(data);
    } else {
      mostrarDesactivado();
    }
  }
});

function mostrarFormulario() {
  titulo.innerText = "Registrar información";

  contenido.innerHTML = `
    <input id="nombre" placeholder="Nombre">
    <input id="telefono" placeholder="Teléfono">
    <textarea id="mensaje" placeholder="Mensaje"></textarea>
    <button onclick="guardar()">Guardar</button>
  `;
}

window.guardar = function () {
  set(qrRef, {
    nombre: nombre.value,
    telefono: telefono.value,
    mensaje: mensaje.value,
    activo: true
  }).then(() => location.reload());
};

function mostrarDatos(data) {
  titulo.innerText = "Información";

  contenido.innerHTML = `
    <p><b>Nombre:</b> ${data.nombre}</p>
    <p><b>Teléfono:</b> ${data.telefono}</p>
    <p><b>Mensaje:</b> ${data.mensaje}</p>

    <button onclick="desactivar()">Desactivar QR</button>
  `;
}

window.desactivar = function () {
  update(qrRef, { activo: false })
    .then(() => location.reload());
};

function mostrarDesactivado() {
  titulo.innerText = "QR desactivado";
  contenido.innerHTML = `
    <p>Este código ya no está activo.</p>
  `;
}

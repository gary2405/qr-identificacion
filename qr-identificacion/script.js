import { db } from "./firebase.js";
import { ref, get, set, update } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const titulo = document.getElementById("titulo");
const contenido = document.getElementById("contenido");

const params = new URLSearchParams(window.location.search);
const qrId = params.get("id");

// 👉 Mostrar formulario de una vez
mostrarFormulario();

if (!qrId) {
  titulo.innerText = "QR inválido";
  contenido.innerHTML = "<p>No se encontró el ID.</p>";
} else {
  const qrRef = ref(db, "qrs/" + qrId);

  get(qrRef).then((snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      if (data.activo) {
        mostrarDatos(data);
      } else {
        mostrarDesactivado();
      }
    }
    // si no existe → se queda el formulario
  }).catch(() => {
    titulo.innerText = "Error";
    contenido.innerHTML = "<p>Error al cargar datos</p>";
  });
}

function mostrarFormulario() {
  titulo.innerText = "Registrar información";
  contenido.innerHTML = `
    <input id="nombre" placeholder="Nombre"><br>
    <input id="telefono" placeholder="Teléfono"><br>
    <textarea id="mensaje" placeholder="Mensaje"></textarea><br>
    <button onclick="guardar()">Guardar</button>
  `;
}

window.guardar = function () {
  const qrRef = ref(db, "qrs/" + qrId);
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
  const qrRef = ref(db, "qrs/" + qrId);
  update(qrRef, { activo: false }).then(() => location.reload());
};

function mostrarDesactivado() {
  titulo.innerText = "QR desactivado";
  contenido.innerHTML = "<p>Este QR ya no está activo.</p>";
}

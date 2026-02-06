import { db } from "./firebase.js";
import { ref, get, set, remove } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const params = new URLSearchParams(window.location.search);
const qrId = params.get("id");

const titulo = document.getElementById("titulo");
const formulario = document.getElementById("formulario");
const vistaDatos = document.getElementById("vistaDatos");
const btnEliminar = document.getElementById("btnEliminar");

const fNombre = document.getElementById("fNombre");
const fTipo = document.getElementById("fTipo");
const fContacto = document.getElementById("fContacto");
const fMensaje = document.getElementById("fMensaje");

const dNombre = document.getElementById("nombre");
const dTipo = document.getElementById("tipo");
const dContacto = document.getElementById("contacto");
const dMensaje = document.getElementById("mensaje");

/* ================= VALIDAR QR ================= */
if (!qrId) {
  document.body.innerHTML = "<h2>QR inválido</h2>";
}

/* ================= INDEX.HTML ================= */
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

    set(qrRef, {
      nombre: fNombre.value,
      tipo: fTipo.value,
      contacto: fContacto.value,
      mensaje: fMensaje.value,
      fecha: new Date().toISOString()
    }).then(() => {
      window.location.href = `ver.html?id=${qrId}`;
    });
  });
}

/* ================= VER.HTML ================= */
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
    dTipo.textContent = data.tipo;
    dContacto.textContent = data.contacto;
    dMensaje.textContent = data.mensaje;
  });
}

/* ================= FUNCIONES ================= */
function mostrarFormulario() {
  titulo.textContent = "Registrar información";
  formulario.classList.remove("oculto");
  vistaDatos.classList.add("oculto");
}

function mostrarDatos(data) {
  titulo.textContent = "Información registrada";
  formulario.classList.add("oculto");
  vistaDatos.classList.remove("oculto");

  dNombre.textContent = data.nombre;
  dTipo.textContent = data.tipo;
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



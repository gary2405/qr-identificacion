import { db } from "./firebase.js";
import { ref, get } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const params = new URLSearchParams(window.location.search);
const qrId = params.get("id");

if (!qrId) {
  document.body.innerHTML = "<h2>QR inválido</h2>";
  throw new Error("QR inválido");
}

const nombre = document.getElementById("nombre");
const tipo = document.getElementById("tipo");
const direccion = document.getElementById("direccion");
const mensaje = document.getElementById("mensaje");
const foto = document.getElementById("foto");

const linkLlamar = document.getElementById("linkLlamar");
const linkWhatsapp = document.getElementById("linkWhatsapp");

const bloqueEmergencia = document.getElementById("bloqueEmergencia");
const linkLlamar2 = document.getElementById("linkLlamar2");
const linkWhatsapp2 = document.getElementById("linkWhatsapp2");

get(ref(db, "qrs/" + qrId)).then((snapshot) => {
  if (!snapshot.exists()) {
    document.body.innerHTML = "<h2>Registro no encontrado</h2>";
    return;
  }

  const data = snapshot.val();

  nombre.textContent = data.nombre || "";
  tipo.textContent = data.tipoPerfil || "";
  mensaje.textContent = data.mensaje || "";

  if (direccion) {
    direccion.textContent = data.direccion || "No indicada";
  }

  if (data.foto) {
    foto.src = data.foto;
    foto.classList.remove("qr-oculto");
  }

  linkLlamar.href = `tel:${data.contacto}`;
  linkWhatsapp.href = `https://wa.me/${data.contacto}`;

  if (data.contacto2) {
    bloqueEmergencia.classList.remove("qr-oculto");
    linkLlamar2.href = `tel:${data.contacto2}`;
    linkWhatsapp2.href = `https://wa.me/${data.contacto2}`;
  }
});

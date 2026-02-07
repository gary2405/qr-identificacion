import { db } from "./firebase.js";
import { ref, get, remove } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const id = new URLSearchParams(location.search).get("id");

get(ref(db, "qrs/" + id)).then(snap => {
  if (!snap.exists()) return;

  const d = snap.val();
  nombre.textContent = d.nombre;
  tipo.textContent = d.tipoPerfil;
  mensaje.textContent = d.mensaje;

  if (d.foto) foto.src = d.foto;

  linkLlamar.href = `tel:${d.contacto}`;
  linkWhatsapp.href = `https://wa.me/${d.contacto}`;

  if (d.contacto2) {
    bloqueEmergencia.classList.remove("qr-oculto");
    linkLlamar2.href = `tel:${d.contacto2}`;
    linkWhatsapp2.href = `https://wa.me/${d.contacto2}`;
  }
});

btnEliminar.onclick = async () => {
  if (confirm("¿Eliminar registro?")) {
    await remove(ref(db, "qrs/" + id));
    location.href = "index.html";
  }
};

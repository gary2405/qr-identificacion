import { db } from "./firebase.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const params = new URLSearchParams(window.location.search);
const qrId = params.get("id");

const foto = document.getElementById("foto");
const nombre = document.getElementById("nombre");
const direccion = document.getElementById("direccion");
const mensaje = document.getElementById("mensaje");

const cover = document.querySelector(".perfil-cover");

get(ref(db, "qrs/" + qrId)).then((snapshot) => {
  const data = snapshot.val();

  nombre.textContent = data.nombre;
  mensaje.textContent = data.mensaje;

  foto.src = data.foto || `https://ui-avatars.com/api/?name=${data.nombre}`;

  if (data.cover) {
    cover.style.backgroundImage = `url(${data.cover})`;
  }

  direccion.textContent = data.ubicacion || data.direccion;

  /* PERSONA */
  if (data.personaExtra) {
    const p = data.personaExtra;
    const div = document.createElement("div");
    div.innerHTML = `
      ${p.edad ? `<p>Edad: ${p.edad}</p>` : ""}
      ${p.estatura ? `<p>Estatura: ${p.estatura}</p>` : ""}
      ${p.peso ? `<p>Peso: ${p.peso}</p>` : ""}
      ${p.cabello ? `<p>Cabello: ${p.cabello}</p>` : ""}
      ${p.ojos ? `<p>Ojos: ${p.ojos}</p>` : ""}
    `;
    document.querySelector(".perfil-card").appendChild(div);
  }

  /* MASCOTA */
  if (data.mascotaExtra) {
    if (data.mascotaExtra.estado === "perdido") {
      document.body.style.background = "#ffe5e5";
    }

    if (data.mascotaExtra.recompensa) {
      const r = document.createElement("p");
      r.innerHTML = `<b>Recompensa:</b> ${data.mascotaExtra.recompensa}`;
      document.querySelector(".perfil-card").appendChild(r);
    }
  }
});
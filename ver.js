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

const verPersona = document.getElementById("verPersona");
const verMascota = document.getElementById("verMascota");
const verObjeto = document.getElementById("verObjeto");

get(ref(db, "qrs/" + qrId)).then((snapshot) => {
  if (!snapshot.exists()) {
    document.body.innerHTML = "<h2>Registro no encontrado</h2>";
    return;
  }

  const data = snapshot.val();

  nombre.textContent = data.nombre || "";
  tipo.textContent = data.tipoPerfil || "";
  direccion.textContent = data.direccion || "No indicada";
  mensaje.textContent = data.mensaje || "Sin mensaje";

  if (data.foto) {
    foto.src = data.foto;
    foto.classList.remove("qr-oculto");
  }

  if (data.contacto) {
    linkLlamar.href = `tel:${data.contacto}`;
    linkWhatsapp.href = `https://wa.me/${data.contacto}`;
  }

  if (data.contacto2) {
    bloqueEmergencia.classList.remove("qr-oculto");
    linkLlamar2.href = `tel:${data.contacto2}`;
    linkWhatsapp2.href = `https://wa.me/${data.contacto2}`;
  }

  if (["persona", "nino", "adultoMayor"].includes(data.tipoPerfil)) {
    verPersona.classList.remove("qr-oculto");
    document.getElementById("verSangre").textContent = data.sangre || "No indicado";
    document.getElementById("verPadecimientos").textContent = data.padecimientos || "No indicado";
    document.getElementById("verAlergias").textContent = data.alergias || "No indicadas";
  }

  if (data.tipoPerfil === "mascota" && data.mascota) {
    verMascota.classList.remove("qr-oculto");
    document.getElementById("verEspecie").textContent = data.mascota.especie || "No indicada";
    document.getElementById("verRaza").textContent = data.mascota.raza || "No indicada";
    document.getElementById("verColor").textContent = data.mascota.color || "No indicado";
  }

  if (data.tipoPerfil === "objeto" && data.objeto) {
    verObjeto.classList.remove("qr-oculto");
    document.getElementById("verDescripcion").textContent = data.objeto.descripcion || "No indicada";
    document.getElementById("verInstrucciones").textContent = data.objeto.instrucciones || "No indicadas";
  }
});

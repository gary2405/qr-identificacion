import { db } from "./firebase.js";
import { ref, get, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const qrId = new URLSearchParams(window.location.search).get("id");

const nombre = document.getElementById("nombre");
const tipo = document.getElementById("tipo");
const direccion = document.getElementById("direccion");
const mensaje = document.getElementById("mensaje");
const foto = document.getElementById("foto");

const verPersona = document.getElementById("verPersona");
const verMascota = document.getElementById("verMascota");
const verObjeto = document.getElementById("verObjeto");

get(ref(db,"qrs/"+qrId)).then(snap=>{
  const d = snap.val();

  nombre.textContent = d.nombre;
  tipo.textContent = d.tipoPerfil;

  direccion.textContent = d.ubicacion || d.direccion || "";

  mensaje.textContent = d.mensaje;

  foto.src = d.foto || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  foto.classList.remove("qr-oculto");

  /* PERSONA */
  if(d.sangre || d.padecimientos || d.alergias){
    verPersona.classList.remove("qr-oculto");
    document.getElementById("verSangre").textContent = d.sangre || "";
    document.getElementById("verPadecimientos").textContent = d.padecimientos || "";
    document.getElementById("verAlergias").textContent = d.alergias || "";
  }

  if(d.personaExtra){
    const p = d.personaExtra;
    const div = document.createElement("div");
    div.innerHTML = `
      ${p.edad ? `<p>Edad: ${p.edad}</p>`:""}
      ${p.estatura ? `<p>Estatura: ${p.estatura}</p>`:""}
      ${p.peso ? `<p>Peso: ${p.peso}</p>`:""}
      ${p.cabello ? `<p>Cabello: ${p.cabello}</p>`:""}
      ${p.ojos ? `<p>Ojos: ${p.ojos}</p>`:""}
    `;
    document.querySelector(".perfil-card").appendChild(div);
  }

  /* MASCOTA */
  if(d.mascota){
    verMascota.classList.remove("qr-oculto");
    document.getElementById("verEspecie").textContent = d.mascota.especie;
    document.getElementById("verRaza").textContent = d.mascota.raza;
    document.getElementById("verColor").textContent = d.mascota.color;
  }

  if(d.mascotaExtra){
    if(d.mascotaExtra.estado==="perdido"){
      document.body.style.background="#ffe5e5";
    }

    if(d.mascotaExtra.recompensa){
      const r=document.createElement("p");
      r.innerHTML=`<b>Recompensa:</b> ${d.mascotaExtra.recompensa}`;
      document.querySelector(".perfil-card").appendChild(r);
    }
  }

  /* OBJETO */
  if(d.objeto){
    verObjeto.classList.remove("qr-oculto");
    document.getElementById("verDescripcion").textContent = d.objeto.descripcion;
    document.getElementById("verInstrucciones").textContent = d.objeto.instrucciones;
  }

});
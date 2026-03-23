import { db } from "./firebase.js";
import { ref, get, set, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const params = new URLSearchParams(window.location.search);
const qrId = params.get("id");

const pantallaCarga = document.getElementById("pantallaCarga");
const contenido = document.getElementById("contenidoPrincipal");
const modal = document.getElementById("modalNoConfig");
const formulario = document.getElementById("formulario");
const btnConfigurar = document.getElementById("btnConfigurar");

const qrRef = ref(db, "qrs/" + qrId);

/* UBICACIONES */
const ubicaciones = {
  "Puntarenas": {
    "Puntarenas": ["Chacarita","Barranca"]
  },
  "San José": {
    "Central": ["Carmen"]
  }
};

const fProvincia = document.getElementById("fProvincia");
const fCanton = document.getElementById("fCanton");
const fDistrito = document.getElementById("fDistrito");

fProvincia.addEventListener("change", ()=>{
  fCanton.innerHTML="";
  Object.keys(ubicaciones[fProvincia.value]||{}).forEach(c=>{
    fCanton.innerHTML += `<option>${c}</option>`;
  });
});

fCanton.addEventListener("change", ()=>{
  fDistrito.innerHTML="";
  (ubicaciones[fProvincia.value]?.[fCanton.value]||[]).forEach(d=>{
    fDistrito.innerHTML += `<option>${d}</option>`;
  });
});

/* OCULTAR LOADER SIEMPRE */
function stopLoading(){
  pantallaCarga.style.display="none";
}

/* CARGA */
get(qrRef).then(snap=>{
  stopLoading();

  if(!snap.exists()){
    modal.classList.remove("qr-oculto");
  }else{
    window.location.href = `ver.html?id=${qrId}`;
  }

}).catch(()=>{
  stopLoading();
  contenido.classList.remove("qr-oculto");
});

/* CONFIGURAR */
btnConfigurar.onclick=()=>{
  modal.classList.add("qr-oculto");
  contenido.classList.remove("qr-oculto");
  formulario.classList.remove("qr-oculto");
};

/* SWITCH */
document.getElementById("fTipo").addEventListener("change",(e)=>{
  document.getElementById("seccionPersona").classList.add("qr-oculto");
  document.getElementById("seccionMascota").classList.add("qr-oculto");
  document.getElementById("seccionObjeto").classList.add("qr-oculto");

  if(["persona","nino","adultoMayor"].includes(e.target.value)){
    document.getElementById("seccionPersona").classList.remove("qr-oculto");
  }
  if(e.target.value==="mascota"){
    document.getElementById("seccionMascota").classList.remove("qr-oculto");
  }
  if(e.target.value==="objeto"){
    document.getElementById("seccionObjeto").classList.remove("qr-oculto");
  }
});

/* GUARDAR */
formulario.addEventListener("submit", async(e)=>{
  e.preventDefault();

  const data = {
    tipoPerfil: fTipo.value,
    nombre: fNombre.value,
    contacto: fContacto.value,
    contacto2: fContacto2.value,
    direccion: fDireccion.value,
    ubicacion: `${fProvincia.value}, ${fCanton.value}, ${fDistrito.value}`,
    mensaje: fMensaje.value,
    foto: previewFoto.src || "",
    ownerPin: fPin.value
  };

  /* PERSONA */
  data.sangre = fSangre.value;
  data.padecimientos = fPadecimientos.value;
  data.alergias = fAlergias.value;

  data.personaExtra = {
    edad: fEdad.value,
    estatura: fEstatura.value,
    peso: fPeso.value,
    cabello: fCabello.value,
    ojos: fOjos.value
  };

  /* MASCOTA */
  data.mascota = {
    especie: fEspecie.value,
    raza: fRaza.value,
    color: fColor.value
  };

  data.mascotaExtra = {
    estado: fEstadoMascota.value,
    recompensa: fRecompensa.value
  };

  /* OBJETO */
  data.objeto = {
    descripcion: fDescripcion.value,
    instrucciones: fInstrucciones.value
  };

  await set(qrRef,data);
  localStorage.setItem("owner_"+qrId,"true");

  window.location.href = `ver.html?id=${qrId}`;
});
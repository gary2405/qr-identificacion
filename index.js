import { db } from "./firebase.js";
import { ref, get, set, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const params = new URLSearchParams(window.location.search);
const qrId = params.get("id");
const editMode = params.get("edit") === "1";

if (!qrId) {
  document.body.innerHTML = "<h2>QR inválido</h2>";
  throw new Error("QR inválido");
}

// Variables globales
let pasoActual = 1;
const pasosTotales = 8;
let tipoPerfilSeleccionado = "";
let estadoSeleccionado = "activo";
const datosFormulario = {};

const pantallaCarga = document.getElementById("pantallaCarga");
const wizardContainer = document.getElementById("wizardContainer");
const modalNoConfig = document.getElementById("modalNoConfig");
const btnConfigurar = document.getElementById("btnConfigurar");
const stepIndicator = document.getElementById("stepIndicator");
const progressBar = document.getElementById("progressBar");

// Elementos de entrada
const fNombre = document.getElementById("fNombre");
const fEdad = document.getElementById("fEdad");
const fContacto = document.getElementById("fContacto");
const fContacto2 = document.getElementById("fContacto2");
const fDireccion = document.getElementById("fDireccion");
const fMensaje = document.getElementById("fMensaje");
const fPin = document.getElementById("fPin");
const fPinConfirmar = document.getElementById("fPinConfirmar");
const fSangre = document.getElementById("fSangre");
const fPadecimientos = document.getElementById("fPadecimientos");
const fAlergias = document.getElementById("fAlergias");
const fEspecie = document.getElementById("fEspecie");
const fRaza = document.getElementById("fRaza");
const fColor = document.getElementById("fColor");
const fDescripcion = document.getElementById("fDescripcion");
const fInstrucciones = document.getElementById("fInstrucciones");
const fFoto = document.getElementById("fFoto");
const previewFoto = document.getElementById("previewFoto");
const fPortada = document.getElementById("fPortada");
const previewPortada = document.getElementById("previewPortada");
const btnObtenerGPS = document.getElementById("btnObtenerGPS");
const textoGPS = document.getElementById("textoGPS");
const fLatitud = document.getElementById("fLatitud");
const fLongitud = document.getElementById("fLongitud");
const fEstado = document.getElementById("step4").querySelector(".qr-step-opciones") ? null : document.getElementById("fEstado");

const qrRef = ref(db, "qrs/" + qrId);

function ocultarCarga() {
  pantallaCarga.classList.add("qr-oculto");
}

function mostrarWizard() {
  modalNoConfig.classList.add("qr-oculto");
  wizardContainer.classList.remove("qr-oculto");
  actualizarIndices();
}

function actualizarIndices() {
  stepIndicator.textContent = `Paso ${pasoActual} de ${pasosTotales}`;
  const porcentaje = (pasoActual / pasosTotales) * 100;
  progressBar.style.width = porcentaje + "%";
  
  mostrarPaso(pasoActual);
}

function mostrarPaso(numeroPaso) {
  document.querySelectorAll(".qr-wizard-step").forEach((el, idx) => {
    el.classList.toggle("qr-step-activo", idx + 1 === numeroPaso);
  });
}

function guardarDatosDelPasoActual() {
  // Guardar datos del paso actual en datosFormulario
  datosFormulario.tipoPerfil = tipoPerfilSeleccionado;
  datosFormulario.nombre = fNombre.value.trim();
  datosFormulario.edad = fEdad.value || "";
  datosFormulario.contacto = fContacto.value.trim();
  datosFormulario.contacto2 = fContacto2.value.trim();
  datosFormulario.direccion = fDireccion.value.trim();
  datosFormulario.mensaje = fMensaje.value.trim();
  datosFormulario.latitud = fLatitud.value;
  datosFormulario.longitud = fLongitud.value;
  datosFormulario.ownerPin = fPin.value.trim();
  datosFormulario.estado = estadoSeleccionado;

  // Información médica
  datosFormulario.sangre = fSangre.value.trim();
  datosFormulario.padecimientos = fPadecimientos.value.trim();
  datosFormulario.alergias = fAlergias.value.trim();

  // Datos de mascota
  datosFormulario.mascota = {
    especie: fEspecie.value.trim(),
    raza: fRaza.value.trim(),
    color: fColor.value.trim()
  };

  // Datos de objeto
  datosFormulario.objeto = {
    descripcion: fDescripcion.value.trim(),
    instrucciones: fInstrucciones.value.trim()
  };
}

window.nextStep = function() {
  // Guardar datos del paso actual ANTES de validar
  guardarDatosDelPasoActual();

  // Validar paso actual
  if (!validarPasoActual()) {
    return;
  }

  // Lógica especial: mostrar paso 4 (estado) solo para mascotas y objetos
  if (pasoActual === 3 && !["mascota", "objeto"].includes(tipoPerfilSeleccionado)) {
    pasoActual = 5; // Saltar al paso 5
  } else if (pasoActual < pasosTotales) {
    pasoActual++;
  }

  // Si es paso 8 (resumen), generar el resumen
  if (pasoActual === 8) {
    generarResumen();
  }

  actualizarIndices();
};

window.previousStep = function() {
  if (pasoActual > 1) {
    // Lógica especial: si estamos en paso 5 y paso 4 está oculto, volver al 3
    if (pasoActual === 5 && !["mascota", "objeto"].includes(tipoPerfilSeleccionado)) {
      pasoActual = 3;
    } else {
      pasoActual--;
    }
  }
  actualizarIndices();
};

window.omitirPaso = function() {
  window.nextStep();
};

function validarPasoActual() {
  if (pasoActual === 1) {
    if (!tipoPerfilSeleccionado) {
      alert("Por favor selecciona un tipo de perfil");
      return false;
    }
  } else if (pasoActual === 2) {
    if (!fNombre.value.trim()) {
      alert("Por favor ingresa tu nombre");
      return false;
    }
    if (!fContacto.value.trim()) {
      alert("Por favor ingresa un contacto principal");
      return false;
    }
  } else if (pasoActual === 7) {
    const pin = fPin.value.trim();
    const pinConfirm = fPinConfirmar.value.trim();
    
    if (!pin || !pinConfirm) {
      alert("Por favor ingresa un PIN");
      return false;
    }
    if (!/^\d{4,8}$/.test(pin)) {
      alert("El PIN debe tener de 4 a 8 dígitos");
      return false;
    }
    if (pin !== pinConfirm) {
      alert("Los PINs no coinciden");
      return false;
    }
  }
  return true;
}

function generarResumen() {
  guardarDatosDelPasoActual();

  const resumenHTML = `
    <div class="qr-resumen-item">
      <strong>Nombre:</strong> ${datosFormulario.nombre || "No especificado"}
    </div>
    <div class="qr-resumen-item">
      <strong>Tipo de perfil:</strong> ${datosFormulario.tipoPerfil || "No especificado"}
    </div>
    ${datosFormulario.edad ? `<div class="qr-resumen-item"><strong>Edad:</strong> ${datosFormulario.edad}</div>` : ""}
    ${datosFormulario.contacto ? `<div class="qr-resumen-item"><strong>Contacto:</strong> ${datosFormulario.contacto}</div>` : ""}
    ${datosFormulario.contacto2 ? `<div class="qr-resumen-item"><strong>Contacto de emergencia:</strong> ${datosFormulario.contacto2}</div>` : ""}
    ${datosFormulario.direccion ? `<div class="qr-resumen-item"><strong>Dirección:</strong> ${datosFormulario.direccion}</div>` : ""}
    ${datosFormulario.estado ? `<div class="qr-resumen-item"><strong>Estado:</strong> ${datosFormulario.estado}</div>` : ""}
    ${datosFormulario.mensaje ? `<div class="qr-resumen-item"><strong>Mensaje:</strong> ${datosFormulario.mensaje}</div>` : ""}
    ${datosFormulario.latitud && datosFormulario.longitud ? `<div class="qr-resumen-item"><strong>Ubicación:</strong> Lat: ${parseFloat(datosFormulario.latitud).toFixed(4)}, Lng: ${parseFloat(datosFormulario.longitud).toFixed(4)}</div>` : ""}
  `;
  
  document.getElementById("resumenContenido").innerHTML = resumenHTML;
}

async function comprimirImagen(file) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();

    lector.onload = () => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxAncho = 500;
        const escala = Math.min(1, maxAncho / img.width);

        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };

      img.onerror = reject;
      img.src = lector.result;
    };

    lector.onerror = reject;
    lector.readAsDataURL(file);
  });
}

function aplicarSecciones() {
  document.getElementById("seccionPersona").classList.add("qr-seccion-oculta");
  document.getElementById("seccionMascota").classList.add("qr-seccion-oculta");
  document.getElementById("seccionObjeto").classList.add("qr-seccion-oculta");
  document.getElementById("step4").classList.add("qr-oculto");

  // Mostrar estado solo para mascotas y objetos
  if (["mascota", "objeto"].includes(tipoPerfilSeleccionado)) {
    document.getElementById("step4").classList.remove("qr-oculto");
  }

  if (["persona", "nino", "adultoMayor"].includes(tipoPerfilSeleccionado)) {
    document.getElementById("seccionPersona").classList.remove("qr-seccion-oculta");
  }

  if (tipoPerfilSeleccionado === "mascota") {
    document.getElementById("seccionMascota").classList.remove("qr-seccion-oculta");
  }

  if (tipoPerfilSeleccionado === "objeto") {
    document.getElementById("seccionObjeto").classList.remove("qr-seccion-oculta");
  }
}

window.guardarPerfil = async function() {
  try {
    document.getElementById("btnGuardar").disabled = true;
    document.getElementById("btnGuardar").textContent = "Guardando...";

    // Guardar datos finales
    guardarDatosDelPasoActual();

    let fotoBase64 = previewFoto.src || "";
    let portadaBase64 = previewPortada.src || "";

    if (fFoto && fFoto.files[0]) {
      fotoBase64 = await comprimirImagen(fFoto.files[0]);
    }

    if (fPortada && fPortada.files[0]) {
      portadaBase64 = await comprimirImagen(fPortada.files[0]);
    }

    // Guardar todos los datos del formulario
    const datosGuardar = {
      tipoPerfil: tipoPerfilSeleccionado,
      nombre: fNombre.value.trim(),
      edad: fEdad.value || "",
      contacto: fContacto.value.trim(),
      contacto2: fContacto2.value.trim(),
      direccion: fDireccion.value.trim(),
      mensaje: fMensaje.value.trim(),
      foto: fotoBase64,
      portada: portadaBase64,
      latitud: fLatitud.value,
      longitud: fLongitud.value,
      ownerPin: fPin.value.trim(),
      fecha: new Date().toISOString()
    };

    // Agregar estado solo para mascotas y objetos
    if (["mascota", "objeto"].includes(tipoPerfilSeleccionado)) {
      datosGuardar.estado = estadoSeleccionado || "activo";
    }

    // Información médica para personas
    if (["persona", "nino", "adultoMayor"].includes(tipoPerfilSeleccionado)) {
      datosGuardar.sangre = fSangre.value.trim();
      datosGuardar.padecimientos = fPadecimientos.value.trim();
      datosGuardar.alergias = fAlergias.value.trim();
    }

    // Datos de mascota
    if (tipoPerfilSeleccionado === "mascota") {
      datosGuardar.mascota = {
        especie: fEspecie.value.trim(),
        raza: fRaza.value.trim(),
        color: fColor.value.trim()
      };
    }

    // Datos de objeto
    if (tipoPerfilSeleccionado === "objeto") {
      datosGuardar.objeto = {
        descripcion: fDescripcion.value.trim(),
        instrucciones: fInstrucciones.value.trim()
      };
    }

    const existe = (await get(qrRef)).exists();

    if (editMode && existe) {
      await update(qrRef, datosGuardar);
    } else {
      await set(qrRef, datosGuardar);
      localStorage.setItem("owner_" + qrId, "true");
    }

    console.log("Datos guardados:", datosGuardar);
    window.location.href = `ver.html?id=${qrId}`;
  } catch (error) {
    console.error("Error guardando:", error);
    alert("No se pudo guardar la información: " + error.message);
    document.getElementById("btnGuardar").disabled = false;
    document.getElementById("btnGuardar").textContent = "Guardar Perfil";
  }
};

// Event Listeners - Seleccionar tipo de perfil
document.querySelectorAll(".qr-opcion-btn[data-tipo]").forEach(btn => {
  btn.addEventListener("click", function() {
    tipoPerfilSeleccionado = this.getAttribute("data-tipo");
    datosFormulario.tipoPerfil = tipoPerfilSeleccionado;
    aplicarSecciones();
    
    // Marcar como seleccionado
    document.querySelectorAll(".qr-opcion-btn[data-tipo]").forEach(b => {
      b.classList.remove("qr-opcion-seleccionada");
    });
    this.classList.add("qr-opcion-seleccionada");
  });
});

// Event Listeners - Seleccionar estado
document.querySelectorAll(".qr-opcion-btn[data-estado]").forEach(btn => {
  btn.addEventListener("click", function() {
    estadoSeleccionado = this.getAttribute("data-estado");
    datosFormulario.estado = estadoSeleccionado;
    
    // Marcar como seleccionado
    document.querySelectorAll(".qr-opcion-btn[data-estado]").forEach(b => {
      b.classList.remove("qr-opcion-seleccionada");
    });
    this.classList.add("qr-opcion-seleccionada");
  });
});

// Event Listeners - Fotos
if (fFoto) {
  fFoto.addEventListener("change", async () => {
    const file = fFoto.files[0];
    if (!file) return;
    const base64 = await comprimirImagen(file);
    previewFoto.src = base64;
  });
}

if (fPortada) {
  fPortada.addEventListener("change", async () => {
    const file = fPortada.files[0];
    if (!file) return;
    const base64 = await comprimirImagen(file);
    previewPortada.src = base64;
  });
}

// Event Listeners - GPS
if (btnObtenerGPS) {
  btnObtenerGPS.addEventListener("click", (e) => {
    e.preventDefault();
    if ("geolocation" in navigator) {
      btnObtenerGPS.disabled = true;
      btnObtenerGPS.textContent = "Obteniendo ubicación...";
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fLatitud.value = position.coords.latitude;
          fLongitud.value = position.coords.longitude;
          textoGPS.textContent = `✓ Ubicación: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
          btnObtenerGPS.disabled = false;
          btnObtenerGPS.textContent = "📍 Obtener ubicación actual";
        },
        (error) => {
          alert("No se pudo obtener la ubicación: " + error.message);
          btnObtenerGPS.disabled = false;
          btnObtenerGPS.textContent = "📍 Obtener ubicación actual";
        }
      );
    } else {
      alert("Tu navegador no soporta geolocalización.");
    }
  });
}

// Cargar datos si estamos en modo edición
get(qrRef)
  .then(snapshot => {
    const existe = snapshot.exists();
    const data = existe ? snapshot.val() : null;

    ocultarCarga();

    if (editMode) {
      const esDueno = localStorage.getItem("owner_" + qrId) === "true";
      
      if (!existe) {
        mostrarWizard();
        return;
      }

      if (!esDueno) {
        window.location.href = `ver.html?id=${qrId}`;
        return;
      }

      // Cargar datos en el formulario
      tipoPerfilSeleccionado = data.tipoPerfil;
      estadoSeleccionado = data.estado || "activo";
      fNombre.value = data.nombre || "";
      fEdad.value = data.edad || "";
      fContacto.value = data.contacto || "";
      fContacto2.value = data.contacto2 || "";
      fDireccion.value = data.direccion || "";
      fMensaje.value = data.mensaje || "";
      
      if (data.foto) previewFoto.src = data.foto;
      if (data.portada) previewPortada.src = data.portada;
      
      fLatitud.value = data.latitud || "";
      fLongitud.value = data.longitud || "";
      
      if (data.sangre) fSangre.value = data.sangre;
      if (data.padecimientos) fPadecimientos.value = data.padecimientos;
      if (data.alergias) fAlergias.value = data.alergias;
      
      if (data.mascota) {
        fEspecie.value = data.mascota.especie || "";
        fRaza.value = data.mascota.raza || "";
        fColor.value = data.mascota.color || "";
      }
      
      if (data.objeto) {
        fDescripcion.value = data.objeto.descripcion || "";
        fInstrucciones.value = data.objeto.instrucciones || "";
      }
      
      aplicarSecciones();
      mostrarWizard();
    } else {
      if (existe) {
        window.location.href = `ver.html?id=${qrId}`;
      } else {
        modalNoConfig.classList.remove("qr-oculto");
      }
    }
  })
  .catch(error => {
    console.error("Error al consultar Firebase:", error);
    ocultarCarga();
    mostrarWizard();
  });

if (btnConfigurar) {
  btnConfigurar.addEventListener("click", () => {
    mostrarWizard();
  });
}
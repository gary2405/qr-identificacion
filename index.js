import { db } from "./firebase.js";
import { ref, get, set, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const params = new URLSearchParams(window.location.search);
const qrId = params.get("id");
const editMode = params.get("edit") === "1";

if (!qrId) {
  document.body.innerHTML = "<h2>❌ QR inválido</h2>";
  throw new Error("QR inválido");
}

// Variables globales
let pasoActual = 1;
const pasosTotales = 7;
let tipoPerfilSeleccionado = "";
let estadoSeleccionado = "activo";
const datosFormulario = {};

// Mapeo de tipos de perfil
const mapeoTipos = {
  persona: "Persona",
  nino: "Niño",
  adultomayor: "Adulto Mayor",
  mascota: "Mascota",
  objeto: "Objeto"
};

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
const btnObtenerGPS = document.getElementById("btnObtenerGPS");
const textoGPS = document.getElementById("textoGPS");
const fLatitud = document.getElementById("fLatitud");
const fLongitud = document.getElementById("fLongitud");
const msjCount = document.getElementById("msjCount");
const pinMatch = document.getElementById("pinMatch");

const qrRef = ref(db, "qrs/" + qrId);

// Validaciones
const validaciones = {
  nombre: (val) => val.trim().length >= 2 && val.trim().length <= 100,
  edad: (val) => !isNaN(val) && val >= 0 && val <= 150,
  contacto: (val) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const telefonoRegex = /^\+?[0-9\s\-\(\)]{7,}$/;
    return emailRegex.test(val) || telefonoRegex.test(val);
  },
  pin: (val) => /^\d{4,8}$/.test(val),
};

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
  window.scrollTo(0, 0);
}

function mostrarPaso(numeroPaso) {
  document.querySelectorAll(".qr-wizard-step").forEach((el, idx) => {
    el.classList.toggle("qr-step-activo", idx + 1 === numeroPaso);
  });
}

function guardarDatosDelPasoActual() {
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
  datosFormulario.sangre = fSangre.value.trim();
  datosFormulario.padecimientos = fPadecimientos.value.trim();
  datosFormulario.alergias = fAlergias.value.trim();
  datosFormulario.mascota = {
    especie: fEspecie.value.trim(),
    raza: fRaza.value.trim(),
    color: fColor.value.trim()
  };
  datosFormulario.objeto = {
    descripcion: fDescripcion.value.trim(),
    instrucciones: fInstrucciones.value.trim()
  };
}

// Función para calcular el próximo paso considerando pasos condicionales
function obtenerSiguientePaso(pasoActual) {
  const tipo = tipoPerfilSeleccionado.toLowerCase();
  
  if (pasoActual === 2) {
    return 3; // Ir a Fotos
  } else if (pasoActual === 3) {
    // Después de Fotos, ver si es mascota/objeto
    if (["mascota", "objeto"].includes(tipo)) {
      return 4; // Ir a Estado
    } else {
      return 5; // Ir a Info adicional
    }
  } else if (pasoActual === 4) {
    return 5; // De Estado a Info adicional
  } else if (pasoActual < pasosTotales) {
    return pasoActual + 1;
  }
  return pasoActual;
}

// Función para calcular el paso anterior considerando pasos condicionales
function getPasoanterior(pasoActual) {
  const tipo = tipoPerfilSeleccionado.toLowerCase();
  
  if (pasoActual === 4) {
    return 3; // De Estado a Fotos
  } else if (pasoActual === 5) {
    // Antes de Info adicional, ver si viene de Estado o Fotos
    if (["mascota", "objeto"].includes(tipo)) {
      return 4; // Venía de Estado
    } else {
      return 3; // Venía de Fotos
    }
  } else if (pasoActual > 1) {
    return pasoActual - 1;
  }
  return pasoActual;
}

window.nextStep = function() {
  guardarDatosDelPasoActual();

  if (!validarPasoActual()) {
    return;
  }

  pasoActual = obtenerSiguientePaso(pasoActual);
  actualizarIndices();
};

window.previousStep = function() {
  pasoActual = getPasoanterior(pasoActual);
  actualizarIndices();
};

window.omitirPaso = function() {
  window.nextStep();
};

function validarPasoActual() {
  if (pasoActual === 1) {
    if (!tipoPerfilSeleccionado) {
      mostrarErrorValidacion("Por favor selecciona un tipo de perfil");
      return false;
    }
  } else if (pasoActual === 2) {
    if (!fNombre.value.trim()) {
      mostrarErrorValidacion("Por favor ingresa tu nombre");
      return false;
    }
    if (!validaciones.nombre(fNombre.value)) {
      mostrarErrorValidacion("El nombre debe tener entre 2 y 100 caracteres");
      return false;
    }
    if (!validaciones.edad(fEdad.value)) {
      mostrarErrorValidacion("Por favor ingresa una edad válida (0-150)");
      return false;
    }
    if (!fContacto.value.trim()) {
      mostrarErrorValidacion("Por favor ingresa un contacto principal");
      return false;
    }
    if (!validaciones.contacto(fContacto.value)) {
      mostrarErrorValidacion("Ingresa un teléfono o email válido");
      return false;
    }
    if (fContacto2.value.trim() && !validaciones.contacto(fContacto2.value)) {
      mostrarErrorValidacion("El contacto de emergencia no es válido");
      return false;
    }
  } else if (pasoActual === 7) {
    if (!fPin.value.trim()) {
      mostrarErrorValidacion("Por favor ingresa un PIN");
      return false;
    }
    if (!validaciones.pin(fPin.value)) {
      mostrarErrorValidacion("El PIN debe tener 4 a 8 dígitos numéricos");
      return false;
    }
    if (fPin.value !== fPinConfirmar.value) {
      mostrarErrorValidacion("Los PINs no coinciden");
      return false;
    }
  }
  return true;
}

function mostrarErrorValidacion(mensaje) {
  alert("❌ " + mensaje);
}

async function comprimirImagen(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("El archivo no es una imagen válida"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      reject(new Error("La imagen no debe pesar más de 5MB"));
      return;
    }

    const lector = new FileReader();
    lector.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxAncho = 800;
        const escala = Math.min(1, maxAncho / img.width);
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
      img.src = lector.result;
    };
    lector.onerror = () => reject(new Error("Error al leer el archivo"));
    lector.readAsDataURL(file);
  });
}

function aplicarSecciones() {
  document.getElementById("seccionPersona").classList.add("qr-seccion-oculta");
  document.getElementById("seccionMascota").classList.add("qr-seccion-oculta");
  document.getElementById("seccionObjeto").classList.add("qr-seccion-oculta");
  document.getElementById("step4").classList.add("qr-oculto");

  const tipo = tipoPerfilSeleccionado.toLowerCase();
  
  console.log("Tipo seleccionado:", tipo);

  // Mostrar paso 4 (Estado) solo para mascotas y objetos
  if (["mascota", "objeto"].includes(tipo)) {
    document.getElementById("step4").classList.remove("qr-oculto");
  }

  // Mostrar sección médica para personas, niños y adultos mayores
  if (["persona", "nino", "adultomayor"].includes(tipo)) {
    document.getElementById("seccionPersona").classList.remove("qr-seccion-oculta");
  }

  // Mostrar sección mascota
  if (tipo === "mascota") {
    document.getElementById("seccionMascota").classList.remove("qr-seccion-oculta");
  }

  // Mostrar sección objeto
  if (tipo === "objeto") {
    document.getElementById("seccionObjeto").classList.remove("qr-seccion-oculta");
  }
}

window.guardarPerfil = async function() {
  try {
    const btnGuardar = document.getElementById("btnGuardar");
    btnGuardar.disabled = true;
    btnGuardar.textContent = "⏳ Guardando...";

    guardarDatosDelPasoActual();

    let fotoBase64 = previewFoto.src || "";
    if (fFoto && fFoto.files[0]) {
      try {
        fotoBase64 = await comprimirImagen(fFoto.files[0]);
      } catch (error) {
        mostrarErrorValidacion(error.message);
        btnGuardar.disabled = false;
        btnGuardar.textContent = "Guardar Perfil";
        return;
      }
    }

    const datosGuardar = {
      tipoPerfil: tipoPerfilSeleccionado,
      nombre: fNombre.value.trim(),
      edad: fEdad.value || "",
      contacto: fContacto.value.trim(),
      contacto2: fContacto2.value.trim(),
      direccion: fDireccion.value.trim(),
      mensaje: fMensaje.value.trim(),
      foto: fotoBase64,
      latitud: fLatitud.value,
      longitud: fLongitud.value,
      ownerPin: fPin.value.trim(),
      fecha: new Date().toISOString(),
      actualizado: new Date().toISOString()
    };

    if (["mascota", "objeto"].includes(tipoPerfilSeleccionado.toLowerCase())) {
      datosGuardar.estado = estadoSeleccionado || "activo";
    }

    if (["persona", "nino", "adultomayor"].includes(tipoPerfilSeleccionado.toLowerCase())) {
      datosGuardar.sangre = fSangre.value.trim();
      datosGuardar.padecimientos = fPadecimientos.value.trim();
      datosGuardar.alergias = fAlergias.value.trim();
    }

    if (tipoPerfilSeleccionado.toLowerCase() === "mascota") {
      datosGuardar.mascota = {
        especie: fEspecie.value.trim(),
        raza: fRaza.value.trim(),
        color: fColor.value.trim()
      };
    }

    if (tipoPerfilSeleccionado.toLowerCase() === "objeto") {
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

    setTimeout(() => {
      window.location.href = `ver.html?id=${qrId}`;
    }, 500);
  } catch (error) {
    console.error("Error guardando:", error);
    mostrarErrorValidacion("No se pudo guardar: " + error.message);
    const btnGuardar = document.getElementById("btnGuardar");
    btnGuardar.disabled = false;
    btnGuardar.textContent = "Guardar Perfil";
  }
};

// Event Listeners - Tipo de perfil
document.querySelectorAll(".qr-opcion-btn[data-tipo]").forEach(btn => {
  btn.addEventListener("click", function() {
    const tipoSeleccionado = this.getAttribute("data-tipo");
    tipoPerfilSeleccionado = tipoSeleccionado;
    datosFormulario.tipoPerfil = tipoPerfilSeleccionado;
    aplicarSecciones();
    document.querySelectorAll(".qr-opcion-btn[data-tipo]").forEach(b => {
      b.classList.remove("qr-opcion-seleccionada");
    });
    this.classList.add("qr-opcion-seleccionada");
  });
});

// Event Listeners - Estado
document.querySelectorAll(".qr-opcion-btn[data-estado]").forEach(btn => {
  btn.addEventListener("click", function() {
    estadoSeleccionado = this.getAttribute("data-estado");
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
    
    try {
      const base64 = await comprimirImagen(file);
      previewFoto.src = base64;
      document.getElementById("fotoStatus").style.display = "none";
    } catch (error) {
      document.getElementById("fotoStatus").textContent = "❌ " + error.message;
      document.getElementById("fotoStatus").style.display = "block";
      fFoto.value = "";
    }
  });
}

// Event Listeners - Contador de caracteres
if (fMensaje) {
  fMensaje.addEventListener("input", () => {
    msjCount.textContent = `${fMensaje.value.length}/300 caracteres`;
  });
}

// Event Listeners - Validación de PIN
if (fPinConfirmar) {
  fPinConfirmar.addEventListener("input", () => {
    if (fPin.value && fPinConfirmar.value) {
      if (fPin.value === fPinConfirmar.value) {
        pinMatch.textContent = "✓ Los PINs coinciden";
        pinMatch.style.color = "#28a745";
      } else {
        pinMatch.textContent = "✗ Los PINs no coinciden";
        pinMatch.style.color = "#dc3545";
      }
    }
  });
}

// Event Listeners - GPS
if (btnObtenerGPS) {
  btnObtenerGPS.addEventListener("click", (e) => {
    e.preventDefault();
    if ("geolocation" in navigator) {
      btnObtenerGPS.disabled = true;
      btnObtenerGPS.textContent = "⏳ Obteniendo ubicación...";
      
      const timeoutId = setTimeout(() => {
        btnObtenerGPS.disabled = false;
        btnObtenerGPS.textContent = "📍 Obtener ubicación actual";
        textoGPS.textContent = "⏱️ Tiempo agotado. Intenta de nuevo.";
      }, 10000);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          fLatitud.value = position.coords.latitude;
          fLongitud.value = position.coords.longitude;
          textoGPS.textContent = `✓ Ubicación: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
          btnObtenerGPS.disabled = false;
          btnObtenerGPS.textContent = "📍 Obtener ubicación actual";
        },
        (error) => {
          clearTimeout(timeoutId);
          let mensajeError = "No se pudo obtener la ubicación";
          if (error.code === error.PERMISSION_DENIED) {
            mensajeError = "Permiso de ubicación denegado";
          }
          textoGPS.textContent = "❌ " + mensajeError;
          btnObtenerGPS.disabled = false;
          btnObtenerGPS.textContent = "📍 Obtener ubicación actual";
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      mostrarErrorValidacion("Tu navegador no soporta geolocalización");
    }
  });
}

// Cargar datos en modo edición
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

      tipoPerfilSeleccionado = data.tipoPerfil;
      estadoSeleccionado = data.estado || "activo";
      fNombre.value = data.nombre || "";
      fEdad.value = data.edad || "";
      fContacto.value = data.contacto || "";
      fContacto2.value = data.contacto2 || "";
      fDireccion.value = data.direccion || "";
      fMensaje.value = data.mensaje || "";
      if (data.foto) previewFoto.src = data.foto;
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
    console.error("Error:", error);
    ocultarCarga();
    mostrarWizard();
  });

if (btnConfigurar) {
  btnConfigurar.addEventListener("click", () => {
    mostrarWizard();
  });
}
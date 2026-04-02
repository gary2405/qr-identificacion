import { db } from "./firebase.js";
import { ref, get, set, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const params = new URLSearchParams(window.location.search);
const qrId = params.get("id");
const editMode = params.get("edit") === "1";

if (!qrId) {
  document.body.innerHTML = "<h2>❌ QR inválido</h2>";
  throw new Error("QR inválido");
}

let pasoActual = 1;
const pasosTotales = 6;
let tipoPerfilSeleccionado = "";
const datosFormulario = {};

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

const fNombre = document.getElementById("fNombre");
const fEdad = document.getElementById("fEdad");
const fContacto = document.getElementById("fContacto");
const fContacto2 = document.getElementById("fContacto2");
const fDireccion = document.getElementById("fDireccion");
const fMensaje = document.getElementById("fMensaje");
const fPin = document.getElementById("fPin");
const fPinConfirmar = document.getElementById("fPinConfirmar");
const fFoto = document.getElementById("fFoto");
const previewFoto = document.getElementById("previewFoto");
const btnObtenerGPS = document.getElementById("btnObtenerGPS");
const textoGPS = document.getElementById("textoGPS");
const fLatitud = document.getElementById("fLatitud");
const fLongitud = document.getElementById("fLongitud");
const msjCount = document.getElementById("msjCount");
const pinMatch = document.getElementById("pinMatch");

const fEstatura = document.getElementById("fEstatura");
const fPadres = document.getElementById("fPadres");
const fSangre = document.getElementById("fSangre");
const fPadecimientos = document.getElementById("fPadecimientos");
const fAlergias = document.getElementById("fAlergias");
const fSangreNino = document.getElementById("fSangreNino");
const fPadecimientosNino = document.getElementById("fPadecimientosNino");
const fAlergiasNino = document.getElementById("fAlergiasNino");
const fSangreAdulto = document.getElementById("fSangreAdulto");
const fPadecimientosAdulto = document.getElementById("fPadecimientosAdulto");
const fAlergiasAdulto = document.getElementById("fAlergiasAdulto");
const fCuidador = document.getElementById("fCuidador");
const fEspecie = document.getElementById("fEspecie");
const fRaza = document.getElementById("fRaza");
const fColor = document.getElementById("fColor");
const fDuenoMascota = document.getElementById("fDuenoMascota");
const fCaracteristicasMascota = document.getElementById("fCaracteristicasMascota");
const fDescripcion = document.getElementById("fDescripcion");
const fValor = document.getElementById("fValor");
const fInstrucciones = document.getElementById("fInstrucciones");
const fDuenoObjeto = document.getElementById("fDuenoObjeto");
const fTelDuenoObjeto = document.getElementById("fTelDuenoObjeto");

// ========== MODAL ABOUT US ==========

const modalAboutUs = document.getElementById("modalAboutUs");
const aboutScreen1 = document.getElementById("aboutScreen1");
const aboutScreen2 = document.getElementById("aboutScreen2");
const btnCerrarAbout = document.getElementById("btnCerrarAbout");
const btnAtrasAbout = document.getElementById("btnAtrasAbout");
const btnOmitirAbout = document.getElementById("btnOmitirAbout");
const btnSiguienteAbout = document.getElementById("btnSiguienteAbout");

let aboutScreen = 1; // Pantalla actual del about

function mostrarModalAboutUs() {
  modalAboutUs.classList.remove("qr-oculto");
  aboutScreen = 1;
  actualizarPantallasAbout();
}

function cerrarModalAboutUs() {
  modalAboutUs.classList.add("qr-oculto");
  mostrarWizard();
}

function actualizarPantallasAbout() {
  if (aboutScreen === 1) {
    aboutScreen1.classList.add("qr-about-activo");
    aboutScreen2.classList.remove("qr-about-activo");
    btnAtrasAbout.classList.add("qr-oculto");
    btnSiguienteAbout.classList.remove("qr-oculto");
    btnOmitirAbout.textContent = "Cerrar";
  } else {
    aboutScreen1.classList.remove("qr-about-activo");
    aboutScreen2.classList.add("qr-about-activo");
    btnAtrasAbout.classList.remove("qr-oculto");
    btnSiguienteAbout.classList.add("qr-oculto");
    btnOmitirAbout.textContent = "Cerrar";
  }
}

btnCerrarAbout.addEventListener("click", cerrarModalAboutUs);
btnOmitirAbout.addEventListener("click", cerrarModalAboutUs);

btnSiguienteAbout.addEventListener("click", () => {
  if (aboutScreen === 1) {
    aboutScreen = 2;
    actualizarPantallasAbout();
  }
});

btnAtrasAbout.addEventListener("click", () => {
  if (aboutScreen === 2) {
    aboutScreen = 1;
    actualizarPantallasAbout();
  }
});

// ========== SESSIONSTORGE PARA GUARDAR ESTADO ==========

const STORAGE_KEY = `qrafid_${qrId}`;

function guardarEnStorage() {
  const datos = {
    paso: pasoActual,
    tipo: tipoPerfilSeleccionado,
    fNombre: fNombre.value,
    fEdad: fEdad.value,
    fEstatura: fEstatura.value,
    fPadres: fPadres.value,
    fContacto: fContacto.value,
    fContacto2: fContacto2.value,
    fDireccion: fDireccion.value,
    fMensaje: fMensaje.value,
    fSangre: fSangre.value,
    fPadecimientos: fPadecimientos.value,
    fAlergias: fAlergias.value,
    fSangreNino: fSangreNino.value,
    fPadecimientosNino: fPadecimientosNino.value,
    fAlergiasNino: fAlergiasNino.value,
    fSangreAdulto: fSangreAdulto.value,
    fPadecimientosAdulto: fPadecimientosAdulto.value,
    fAlergiasAdulto: fAlergiasAdulto.value,
    fCuidador: fCuidador.value,
    fEspecie: fEspecie.value,
    fRaza: fRaza.value,
    fColor: fColor.value,
    fDuenoMascota: fDuenoMascota.value,
    fCaracteristicasMascota: fCaracteristicasMascota.value,
    fDescripcion: fDescripcion.value,
    fValor: fValor.value,
    fInstrucciones: fInstrucciones.value,
    fDuenoObjeto: fDuenoObjeto.value,
    fTelDuenoObjeto: fTelDuenoObjeto.value,
    fLatitud: fLatitud.value,
    fLongitud: fLongitud.value,
    previewFoto: previewFoto.src,
    textoGPS: textoGPS.textContent,
    wizardMostrado: !wizardContainer.classList.contains("qr-oculto")
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
  console.log("✓ Datos guardados en sesión:", datos);
}

function cargarDelStorage() {
  const datos = sessionStorage.getItem(STORAGE_KEY);
  if (!datos) {
    console.log("No hay datos en sesión");
    return false;
  }

  try {
    const obj = JSON.parse(datos);
    console.log("✓ Cargando datos de sesión:", obj);
    
    pasoActual = obj.paso || 1;
    tipoPerfilSeleccionado = obj.tipo || "";
    fNombre.value = obj.fNombre || "";
    fEdad.value = obj.fEdad || "";
    fEstatura.value = obj.fEstatura || "";
    fPadres.value = obj.fPadres || "";
    fContacto.value = obj.fContacto || "";
    fContacto2.value = obj.fContacto2 || "";
    fDireccion.value = obj.fDireccion || "";
    fMensaje.value = obj.fMensaje || "";
    fSangre.value = obj.fSangre || "";
    fPadecimientos.value = obj.fPadecimientos || "";
    fAlergias.value = obj.fAlergias || "";
    fSangreNino.value = obj.fSangreNino || "";
    fPadecimientosNino.value = obj.fPadecimientosNino || "";
    fAlergiasNino.value = obj.fAlergiasNino || "";
    fSangreAdulto.value = obj.fSangreAdulto || "";
    fPadecimientosAdulto.value = obj.fPadecimientosAdulto || "";
    fAlergiasAdulto.value = obj.fAlergiasAdulto || "";
    fCuidador.value = obj.fCuidador || "";
    fEspecie.value = obj.fEspecie || "";
    fRaza.value = obj.fRaza || "";
    fColor.value = obj.fColor || "";
    fDuenoMascota.value = obj.fDuenoMascota || "";
    fCaracteristicasMascota.value = obj.fCaracteristicasMascota || "";
    fDescripcion.value = obj.fDescripcion || "";
    fValor.value = obj.fValor || "";
    fInstrucciones.value = obj.fInstrucciones || "";
    fDuenoObjeto.value = obj.fDuenoObjeto || "";
    fTelDuenoObjeto.value = obj.fTelDuenoObjeto || "";
    fLatitud.value = obj.fLatitud || "";
    fLongitud.value = obj.fLongitud || "";
    
    if (obj.previewFoto) {
      previewFoto.src = obj.previewFoto;
    }
    if (obj.textoGPS) {
      textoGPS.textContent = obj.textoGPS;
    }

    if (tipoPerfilSeleccionado) {
      aplicarSecciones();
      // Marcar el tipo seleccionado
      document.querySelectorAll(".qr-opcion-btn[data-tipo]").forEach(btn => {
        if (btn.getAttribute("data-tipo") === tipoPerfilSeleccionado) {
          btn.classList.add("qr-opcion-seleccionada");
        }
      });
    }

    // Actualizar contador de mensajes si es necesario
    if (fMensaje.value) {
      msjCount.textContent = `${fMensaje.value.length}/300 caracteres`;
    }

    return true;
  } catch (e) {
    console.error("Error cargando datos del storage:", e);
    return false;
  }
}

// ========== INTRO IMAGEN ==========

const introImagen = document.getElementById("introImagen");
const tieneDataGuardada = sessionStorage.getItem(STORAGE_KEY);

// Si hay datos guardados, ocultar intro inmediatamente y mostrar about
if (tieneDataGuardada) {
  introImagen.classList.add("qr-oculto");
  // Pequeño delay para que se vea bien la transición
  setTimeout(() => {
    mostrarModalAboutUs();
  }, 300);
} else {
  // Si no, mostrar intro por 4 segundos y luego about
  setTimeout(() => {
    introImagen.classList.add("qr-oculto");
    mostrarModalAboutUs();
  }, 4000);
}

const qrRef = ref(db, "qrs/" + qrId);

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
  
  // Guardar en storage cada vez que se actualiza
  guardarEnStorage();
  
  window.scrollTo(0, 0);
}

function mostrarPaso(numeroPaso) {
  document.querySelectorAll(".qr-wizard-step").forEach((el, idx) => {
    el.classList.toggle("qr-step-activo", idx + 1 === numeroPaso);
  });
}

function guardarDatosDelPasoActual() {
  const tipo = tipoPerfilSeleccionado.toLowerCase();

  datosFormulario.tipoPerfil = tipoPerfilSeleccionado;
  datosFormulario.nombre = fNombre.value.trim();
  datosFormulario.contacto = fContacto.value.trim();
  datosFormulario.contacto2 = fContacto2.value.trim();
  datosFormulario.direccion = fDireccion.value.trim();
  datosFormulario.mensaje = fMensaje.value.trim();
  datosFormulario.latitud = fLatitud.value;
  datosFormulario.longitud = fLongitud.value;
  datosFormulario.ownerPin = fPin.value.trim();

  if (tipo === "persona") {
    datosFormulario.edad = fEdad.value || "";
    datosFormulario.sangre = fSangre.value.trim();
    datosFormulario.padecimientos = fPadecimientos.value.trim();
    datosFormulario.alergias = fAlergias.value.trim();
  } else if (tipo === "nino") {
    datosFormulario.edad = fEdad.value || "";
    datosFormulario.estatura = fEstatura.value || "";
    datosFormulario.padres = fPadres.value.trim();
    datosFormulario.sangre = fSangreNino.value.trim();
    datosFormulario.padecimientos = fPadecimientosNino.value.trim();
    datosFormulario.alergias = fAlergiasNino.value.trim();
  } else if (tipo === "adultomayor") {
    datosFormulario.edad = fEdad.value || "";
    datosFormulario.sangre = fSangreAdulto.value.trim();
    datosFormulario.padecimientos = fPadecimientosAdulto.value.trim();
    datosFormulario.alergias = fAlergiasAdulto.value.trim();
    datosFormulario.cuidador = fCuidador.value.trim();
  } else if (tipo === "mascota") {
    datosFormulario.mascota = {
      especie: fEspecie.value.trim(),
      raza: fRaza.value.trim(),
      color: fColor.value.trim(),
      dueno: fDuenoMascota.value.trim(),
      caracteristicas: fCaracteristicasMascota.value.trim()
    };
  } else if (tipo === "objeto") {
    datosFormulario.objeto = {
      descripcion: fDescripcion.value.trim(),
      valor: fValor.value.trim(),
      instrucciones: fInstrucciones.value.trim(),
      dueno: fDuenoObjeto.value.trim(),
      telDueno: fTelDuenoObjeto.value.trim()
    };
  }
}

window.nextStep = function() {
  guardarDatosDelPasoActual();
  if (!validarPasoActual()) return;

  if (pasoActual === 1) {
    pasoActual = 2;
  } else if (pasoActual === 2) {
    pasoActual = 3;
  } else if (pasoActual === 3) {
    pasoActual = 4;
  } else if (pasoActual < pasosTotales) {
    pasoActual++;
  }
  actualizarIndices();
};

window.previousStep = function() {
  if (pasoActual > 1) {
    pasoActual--;
  }
  actualizarIndices();
};

window.omitirPaso = function() {
  window.nextStep();
};

function validarPasoActual() {
  const tipo = tipoPerfilSeleccionado.toLowerCase();

  if (pasoActual === 1) {
    if (!tipoPerfilSeleccionado) {
      mostrarErrorValidacion("Por favor selecciona un tipo de perfil");
      return false;
    }
  } else if (pasoActual === 2) {
    if (!fNombre.value.trim()) {
      mostrarErrorValidacion("Por favor ingresa un nombre");
      return false;
    }
    if (!validaciones.nombre(fNombre.value)) {
      mostrarErrorValidacion("El nombre debe tener entre 2 y 100 caracteres");
      return false;
    }

    if (["persona", "nino", "adultomayor"].includes(tipo)) {
      if (!validaciones.edad(fEdad.value)) {
        mostrarErrorValidacion("Por favor ingresa una edad válida (0-150)");
        return false;
      }
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

    if (tipo === "objeto") {
      if (!fDuenoObjeto.value.trim()) {
        mostrarErrorValidacion("Por favor ingresa el nombre del dueño del objeto");
        return false;
      }
      if (!fTelDuenoObjeto.value.trim()) {
        mostrarErrorValidacion("Por favor ingresa el teléfono del dueño");
        return false;
      }
    }
  } else if (pasoActual === 6) {
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
  document.getElementById("fieldEdad").classList.add("qr-oculto");
  document.getElementById("fieldEstatura").classList.add("qr-oculto");
  document.getElementById("fieldPadres").classList.add("qr-oculto");
  document.getElementById("fieldDuenoObjeto").classList.add("qr-oculto");
  document.getElementById("fieldTelDuenoObjeto").classList.add("qr-oculto");

  document.getElementById("seccionPersona").classList.add("qr-seccion-oculta");
  document.getElementById("seccionNino").classList.add("qr-seccion-oculta");
  document.getElementById("seccionAdultoMayor").classList.add("qr-seccion-oculta");
  document.getElementById("seccionMascota").classList.add("qr-seccion-oculta");
  document.getElementById("seccionObjeto").classList.add("qr-seccion-oculta");

  const tipo = tipoPerfilSeleccionado.toLowerCase();

  if (tipo === "persona") {
    document.getElementById("fieldEdad").classList.remove("qr-oculto");
    document.getElementById("seccionPersona").classList.remove("qr-seccion-oculta");
  } else if (tipo === "nino") {
    document.getElementById("fieldEdad").classList.remove("qr-oculto");
    document.getElementById("fieldEstatura").classList.remove("qr-oculto");
    document.getElementById("fieldPadres").classList.remove("qr-oculto");
    document.getElementById("seccionNino").classList.remove("qr-seccion-oculta");
  } else if (tipo === "adultomayor") {
    document.getElementById("fieldEdad").classList.remove("qr-oculto");
    document.getElementById("seccionAdultoMayor").classList.remove("qr-seccion-oculta");
  } else if (tipo === "mascota") {
    document.getElementById("seccionMascota").classList.remove("qr-seccion-oculta");
  } else if (tipo === "objeto") {
    document.getElementById("fieldDuenoObjeto").classList.remove("qr-oculto");
    document.getElementById("fieldTelDuenoObjeto").classList.remove("qr-oculto");
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

    const tipo = tipoPerfilSeleccionado.toLowerCase();

    const datosGuardar = {
      tipoPerfil: tipoPerfilSeleccionado,
      nombre: fNombre.value.trim(),
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

    if (tipo === "persona") {
      datosGuardar.edad = fEdad.value || "";
      datosGuardar.sangre = fSangre.value.trim();
      datosGuardar.padecimientos = fPadecimientos.value.trim();
      datosGuardar.alergias = fAlergias.value.trim();
    } else if (tipo === "nino") {
      datosGuardar.edad = fEdad.value || "";
      datosGuardar.estatura = fEstatura.value || "";
      datosGuardar.padres = fPadres.value.trim();
      datosGuardar.sangre = fSangreNino.value.trim();
      datosGuardar.padecimientos = fPadecimientosNino.value.trim();
      datosGuardar.alergias = fAlergiasNino.value.trim();
    } else if (tipo === "adultomayor") {
      datosGuardar.edad = fEdad.value || "";
      datosGuardar.sangre = fSangreAdulto.value.trim();
      datosGuardar.padecimientos = fPadecimientosAdulto.value.trim();
      datosGuardar.alergias = fAlergiasAdulto.value.trim();
      datosGuardar.cuidador = fCuidador.value.trim();
    } else if (tipo === "mascota") {
      datosGuardar.mascota = {
        especie: fEspecie.value.trim(),
        raza: fRaza.value.trim(),
        color: fColor.value.trim(),
        dueno: fDuenoMascota.value.trim(),
        caracteristicas: fCaracteristicasMascota.value.trim()
      };
    } else if (tipo === "objeto") {
      datosGuardar.objeto = {
        descripcion: fDescripcion.value.trim(),
        valor: fValor.value.trim(),
        instrucciones: fInstrucciones.value.trim(),
        dueno: fDuenoObjeto.value.trim(),
        telDueno: fTelDuenoObjeto.value.trim()
      };
    }

    const existe = (await get(qrRef)).exists();

    if (editMode && existe) {
      await update(qrRef, datosGuardar);
    } else {
      await set(qrRef, datosGuardar);
      localStorage.setItem("owner_" + qrId, "true");
    }

    // Limpiar sesión al guardar
    sessionStorage.removeItem(STORAGE_KEY);

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
    guardarEnStorage();
  });
});

if (fFoto) {
  fFoto.addEventListener("change", async () => {
    const file = fFoto.files[0];
    if (!file) return;
    try {
      const base64 = await comprimirImagen(file);
      previewFoto.src = base64;
      document.getElementById("fotoStatus").style.display = "none";
      guardarEnStorage();
    } catch (error) {
      document.getElementById("fotoStatus").textContent = "❌ " + error.message;
      document.getElementById("fotoStatus").style.display = "block";
      fFoto.value = "";
    }
  });
}

if (fMensaje) {
  fMensaje.addEventListener("input", () => {
    msjCount.textContent = `${fMensaje.value.length}/300 caracteres`;
  });
}

if (fPinConfirmar) {
  fPinConfirmar.addEventListener("input", () => {
    if (fPin.value && fPinConfirmar.value) {
      if (fPin.value === fPinConfirmar.value) {
        pinMatch.textContent = "✓ Los PINs coinciden";
        pinMatch.style.color = "#E15D0A";
      } else {
        pinMatch.textContent = "✗ Los PINs no coinciden";
        pinMatch.style.color = "#E15D0A";
      }
    }
  });
}

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
          guardarEnStorage();
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

if (btnConfigurar) {
  btnConfigurar.addEventListener("click", () => {
    mostrarWizard();
  });
}

function cargarDatos() {
  ocultarCarga();

  // PRIMERO: Verificar si hay datos guardados en sesión
  if (cargarDelStorage()) {
    console.log("✓ Datos de sesión encontrados, mostrando wizard en paso", pasoActual);
    mostrarWizard();
    return; // IMPORTANTE: terminar aquí si hay datos en sesión
  }

  // SI NO HAY DATOS EN SESIÓN, verificar Firebase
  get(qrRef)
    .then(snapshot => {
      const existe = snapshot.exists();
      const data = existe ? snapshot.val() : null;

      if (editMode) {
        const esDueno = localStorage.getItem("owner_" + qrId) === "true";
        
        if (!existe) {
          console.log("Modo edición: QR no existe, mostrando wizard vacío");
          mostrarWizard();
          return;
        }

        if (!esDueno) {
          console.log("No eres el dueño, redirigiendo a ver.html");
          window.location.href = `ver.html?id=${qrId}`;
          return;
        }

        // Cargar datos de Firebase en modo edición
        console.log("Modo edición: Cargando datos de Firebase");
        tipoPerfilSeleccionado = data.tipoPerfil;
        fNombre.value = data.nombre || "";
        fEdad.value = data.edad || "";
        fContacto.value = data.contacto || "";
        fContacto2.value = data.contacto2 || "";
        fDireccion.value = data.direccion || "";
        fMensaje.value = data.mensaje || "";
        if (data.foto) previewFoto.src = data.foto;
        fLatitud.value = data.latitud || "";
        fLongitud.value = data.longitud || "";

        const tipo = data.tipoPerfil.toLowerCase();

        if (tipo === "persona") {
          if (data.sangre) fSangre.value = data.sangre;
          if (data.padecimientos) fPadecimientos.value = data.padecimientos;
          if (data.alergias) fAlergias.value = data.alergias;
        } else if (tipo === "nino") {
          if (data.estatura) fEstatura.value = data.estatura;
          if (data.padres) fPadres.value = data.padres;
          if (data.sangre) fSangreNino.value = data.sangre;
          if (data.padecimientos) fPadecimientosNino.value = data.padecimientos;
          if (data.alergias) fAlergiasNino.value = data.alergias;
        } else if (tipo === "adultomayor") {
          if (data.sangre) fSangreAdulto.value = data.sangre;
          if (data.padecimientos) fPadecimientosAdulto.value = data.padecimientos;
          if (data.alergias) fAlergiasAdulto.value = data.alergias;
          if (data.cuidador) fCuidador.value = data.cuidador;
        } else if (tipo === "mascota" && data.mascota) {
          fEspecie.value = data.mascota.especie || "";
          fRaza.value = data.mascota.raza || "";
          fColor.value = data.mascota.color || "";
          fDuenoMascota.value = data.mascota.dueno || "";
          fCaracteristicasMascota.value = data.mascota.caracteristicas || "";
        } else if (tipo === "objeto" && data.objeto) {
          fDescripcion.value = data.objeto.descripcion || "";
          fValor.value = data.objeto.valor || "";
          fInstrucciones.value = data.objeto.instrucciones || "";
          fDuenoObjeto.value = data.objeto.dueno || "";
          fTelDuenoObjeto.value = data.objeto.telDueno || "";
        }
        
        aplicarSecciones();
        mostrarWizard();
      } else {
        // No es modo edición
        if (existe) {
          console.log("QR existe, redirigiendo a ver.html");
          window.location.href = `ver.html?id=${qrId}`;
        } else {
          console.log("QR no existe, mostrando wizard vacío para crear");
          // NO mostrar about aquí, ya se mostró en intro imagen
        }
      }
    })
    .catch(error => {
      console.error("Error Firebase:", error);
      ocultarCarga();
    });
}

// INICIAR LA APLICACIÓN
cargarDatos();
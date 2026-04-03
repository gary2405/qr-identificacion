import { db } from "./firebase.js";
import { ref, get, set, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const params = new URLSearchParams(window.location.search);
const qrId = params.get("id");
const editMode = params.get("edit") === "1";

if (!qrId) {
  mostrarLoginPin();
  throw new Error("Modo acceso por PIN");
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
const btnCerrarAboutFull = document.getElementById("btnCerrarAboutFull");

function mostrarModalAboutUs() {
  modalAboutUs.classList.remove("qr-oculto");
}

function cerrarModalAboutUs() {
  modalAboutUs.classList.add("qr-oculto");
  mostrarWizard();
}

btnCerrarAboutFull.addEventListener("click", cerrarModalAboutUs);

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
}


function mostrarLoginPin() {
  document.body.innerHTML = `
    <link href="https://fonts.googleapis.com/css2?family=Zen+Dots&display=swap" rel="stylesheet">

    <style>
      body {
        margin: 0;
        background: #000000;
        font-family: 'Segoe UI', sans-serif;
        overflow: hidden;
      }

      .fondo {
        position: absolute;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      /* TEXTO DE FONDO */
      .marca-fondo {
        position: absolute;
        font-size: 100px;
        color: rgba(255,255,255,0.03);
        font-family: 'Zen Dots', sans-serif;
        letter-spacing: 10px;
        user-select: none;
      }

      .logo {
        position: absolute;
        top: 20px;
        left: 20px;
        color: #FFFFFF;
        font-family: 'Zen Dots', sans-serif;
        font-size: 14px;
        opacity: 0.6;
        letter-spacing: 2px;
      }

      .card {
        position: relative;
        z-index: 2;
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(15px);
        border-radius: 20px;
        padding: 30px;
        width: 280px;
        text-align: center;
        box-shadow: 0 0 40px rgba(0,0,0,0.6);
        border: 1px solid rgba(255,255,255,0.08);
        animation: aparecer 0.6s ease;
      }

      @keyframes aparecer {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .titulo {
        color: #FFFFFF;
        margin-bottom: 20px;
        font-size: 18px;
      }

      .input {
        width: 100%;
        padding: 12px;
        border-radius: 10px;
        border: none;
        outline: none;
        background: rgba(255,255,255,0.08);
        color: #FFFFFF;
        text-align: center;
        font-size: 16px;
        margin-bottom: 15px;
        box-sizing: border-box;
      }

      .input::placeholder {
        color: rgba(255,255,255,0.5);
      }

      .btn {
        width: 100%;
        padding: 12px;
        border: none;
        border-radius: 10px;
        background: #D67347;
        color: #FFFFFF;
        font-weight: bold;
        cursor: pointer;
        transition: 0.3s;
        font-size: 16px;
      }

      .btn:hover {
        transform: scale(1.05);
        box-shadow: 0 0 15px #D67347;
      }

      .btn:active {
        transform: scale(0.98);
      }

      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: scale(1);
      }

      .btn-secundario {
        background: rgba(214, 115, 71, 0.3);
        margin-top: 10px;
        border: 1px solid #D67347;
      }

      .btn-secundario:hover {
        background: rgba(214, 115, 71, 0.5);
      }

      .info-text {
        color: rgba(255,255,255,0.7);
        font-size: 13px;
        margin-top: 15px;
        line-height: 1.6;
      }

      .error {
        color: #FF6B6B;
        font-size: 13px;
        margin-bottom: 10px;
        min-height: 16px;
      }

    </style>

    <div class="fondo">
      <div class="marca-fondo">QRAFID</div>
      <div class="logo">QRAFID</div>

      <div class="card">
        <div class="titulo">🔓 Acceder con PIN</div>
        
        <div class="error" id="errorMsg"></div>

        <input id="pinInput" class="input" type="password" placeholder="Ingresa tu PIN" maxlength="8">

        <button class="btn" id="btnEntrar">Entrar</button>
        
        <button class="btn btn-secundario" id="btnNuevoPerfil">+ Crear nuevo perfil</button>

        <div class="info-text">
          ℹ️ Ingresa el PIN de tu código QR para acceder a tu perfil.
        </div>
      </div>
    </div>
  `;

  // Event listeners DESPUÉS de crear el HTML
  const pinInput = document.getElementById("pinInput");
  const btnEntrar = document.getElementById("btnEntrar");
  const btnNuevoPerfil = document.getElementById("btnNuevoPerfil");
  const errorMsg = document.getElementById("errorMsg");

  async function buscarPorPin() {
    const pin = pinInput.value.trim();
    errorMsg.textContent = "";

    if (!pin) {
      errorMsg.textContent = "❌ Ingresa tu PIN";
      return;
    }

    if (!/^\d{4,8}$/.test(pin)) {
      errorMsg.textContent = "❌ El PIN debe tener 4 a 8 dígitos";
      return;
    }

    try {
      btnEntrar.disabled = true;
      btnEntrar.textContent = "⏳ Buscando...";

      const snapshot = await get(ref(db, "qrs"));
      
      if (!snapshot.exists()) {
        errorMsg.textContent = "❌ No hay datos registrados";
        btnEntrar.disabled = false;
        btnEntrar.textContent = "Entrar";
        return;
      }

      const data = snapshot.val();
      let encontrado = null;

      for (const key in data) {
        if (data[key].ownerPin === pin) {
          encontrado = key;
          break;
        }
      }

      if (encontrado) {
        localStorage.setItem("owner_" + encontrado, "true");
        window.location.href = `ver.html?id=${encontrado}`;
      } else {
        errorMsg.textContent = "❌ PIN incorrecto";
        btnEntrar.disabled = false;
        btnEntrar.textContent = "Entrar";
        pinInput.value = "";
        pinInput.focus();
      }

    } catch (error) {
      console.error("Error buscando perfil:", error);
      errorMsg.textContent = "❌ Error al buscar el perfil";
      btnEntrar.disabled = false;
      btnEntrar.textContent = "Entrar";
    }
  }

  if (btnEntrar) {
    btnEntrar.addEventListener("click", buscarPorPin);
  }

  if (pinInput) {
    pinInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        buscarPorPin();
      }
    });
  }

  if (btnNuevoPerfil) {
    btnNuevoPerfil.addEventListener("click", () => {
      // Generar un ID único para nuevo perfil
      const nuevoId = "qr_" + Math.random().toString(36).substr(2, 9);
      window.location.href = `index.html?id=${nuevoId}`;
    });
  }
};
function cargarDelStorage() {
  const datos = sessionStorage.getItem(STORAGE_KEY);
  if (!datos) {
    return false;
  }

  try {
    const obj = JSON.parse(datos);
    
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
      // Marcar el tipo seleccionado DESPUÉS de cargar del storage
      setTimeout(() => {
        document.querySelectorAll(".qr-opcion-btn[data-tipo]").forEach(btn => {
          btn.classList.remove("qr-opcion-seleccionada");
          if (btn.getAttribute("data-tipo") === tipoPerfilSeleccionado) {
            btn.classList.add("qr-opcion-seleccionada");
          }
        });
      }, 0);
    }

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

if (tieneDataGuardada) {
  introImagen.classList.add("qr-oculto");
  setTimeout(() => {
    mostrarModalAboutUs();
  }, 300);
} else {
  setTimeout(() => {
    introImagen.classList.add("qr-oculto");
    mostrarModalAboutUs();
  }, 5000);
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
    btnGuardar.textContent = "Guardando...";

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

// ========== EVENT LISTENERS - BOTONES TIPO PERFIL ==========

document.querySelectorAll(".qr-opcion-btn[data-tipo]").forEach(btn => {
  btn.addEventListener("click", function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Remover TODAS las selecciones primero
    document.querySelectorAll(".qr-opcion-btn[data-tipo]").forEach(b => {
      b.classList.remove("qr-opcion-seleccionada");
    });
    
    // Marcar SOLO el actual
    this.classList.add("qr-opcion-seleccionada");
    
    // Actualizar variables
    tipoPerfilSeleccionado = this.getAttribute("data-tipo");
    datosFormulario.tipoPerfil = tipoPerfilSeleccionado;
    
    // Aplicar secciones y guardar
    aplicarSecciones();
    guardarEnStorage();
  });
});

// ========== EVENT LISTENERS - FOTO ==========

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

// ========== EVENT LISTENERS - MENSAJE ==========

if (fMensaje) {
  fMensaje.addEventListener("input", () => {
    msjCount.textContent = `${fMensaje.value.length}/300 caracteres`;
  });
}

// ========== EVENT LISTENERS - PIN ==========

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

// ========== EVENT LISTENERS - GPS ==========

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

// ========== EVENT LISTENERS - CONFIGURAR ==========

if (btnConfigurar) {
  btnConfigurar.addEventListener("click", () => {
    mostrarWizard();
  });
}

// ========== CARGAR DATOS ==========

function cargarDatos() {
  ocultarCarga();

  if (cargarDelStorage()) {
    mostrarWizard();
    return;
  }

  get(qrRef)
    .then(snapshot => {
      const existe = snapshot.exists();
      const data = existe ? snapshot.val() : null;

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
        // Marcar el tipo DESPUÉS de aplicar secciones
        setTimeout(() => {
          document.querySelectorAll(".qr-opcion-btn[data-tipo]").forEach(btn => {
            btn.classList.remove("qr-opcion-seleccionada");
            if (btn.getAttribute("data-tipo") === tipoPerfilSeleccionado) {
              btn.classList.add("qr-opcion-seleccionada");
            }
          });
        }, 0);
        mostrarWizard();
      } else {
        if (existe) {
          window.location.href = `ver.html?id=${qrId}`;
        } else {
          mostrarWizard();
        }
      }
    })
    .catch(error => {
      console.error("Error Firebase:", error);
      ocultarCarga();
      mostrarWizard();
    });
}

cargarDatos();
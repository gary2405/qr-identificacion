// import { db, storage } from "./firebase.js";

// import {
//   ref,
//   get,
//   set,
//   remove
// } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// import {
//   ref as storageRef,
//   uploadBytes,
//   getDownloadURL
// } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// /* ================= QR ================= */
// const params = new URLSearchParams(window.location.search);
// const qrId = params.get("id");

// if (!qrId) {
//   document.body.innerHTML = "<h2>QR inválido</h2>";
//   throw new Error("QR inválido");
// }

// /* ================= ELEMENTOS ================= */
// const titulo = document.getElementById("titulo");
// const formulario = document.getElementById("formulario");
// const vistaDatos = document.getElementById("vistaDatos");
// const btnEliminar = document.getElementById("btnEliminar");

// const fTipo = document.getElementById("fTipo");
// const fNombre = document.getElementById("fNombre");
// const fContacto = document.getElementById("fContacto");
// const fContacto2 = document.getElementById("fContacto2");
// const fDireccion = document.getElementById("fDireccion");
// const fMensaje = document.getElementById("fMensaje");

// const fSangre = document.getElementById("fSangre");
// const fPadecimientos = document.getElementById("fPadecimientos");
// const fAlergias = document.getElementById("fAlergias");

// const fEspecie = document.getElementById("fEspecie");
// const fRaza = document.getElementById("fRaza");
// const fColor = document.getElementById("fColor");
// const fVive = document.getElementById("fVive");

// const fDescripcion = document.getElementById("fDescripcion");
// const fInstrucciones = document.getElementById("fInstrucciones");

// const fFoto = document.getElementById("fFoto");
// const previewFoto = document.getElementById("previewFoto");

// const dNombre = document.getElementById("nombre");
// const dTipo = document.getElementById("tipo");
// const dContacto = document.getElementById("contacto");
// const dMensaje = document.getElementById("mensaje");
// const imgFoto = document.getElementById("foto");

// /* ================= SWITCH DE SECCIONES ================= */
// if (fTipo) {
//   fTipo.addEventListener("change", () => {
//     const seccionPersona = document.getElementById("seccionPersona");
//     const seccionMascota = document.getElementById("seccionMascota");
//     const seccionObjeto = document.getElementById("seccionObjeto");

//     if (seccionPersona) seccionPersona.classList.add("qr-oculto");
//     if (seccionMascota) seccionMascota.classList.add("qr-oculto");
//     if (seccionObjeto) seccionObjeto.classList.add("qr-oculto");

//     if (["persona", "nino", "adultoMayor"].includes(fTipo.value)) {
//       if (seccionPersona) seccionPersona.classList.remove("qr-oculto");
//     }

//     if (fTipo.value === "mascota") {
//       if (seccionMascota) seccionMascota.classList.remove("qr-oculto");
//     }

//     if (fTipo.value === "objeto") {
//       if (seccionObjeto) seccionObjeto.classList.remove("qr-oculto");
//     }
//   });
// }

// /* ================= PREVIEW FOTO ================= */
// if (fFoto && previewFoto) {
//   fFoto.addEventListener("change", () => {
//     const file = fFoto.files[0];
//     if (file) {
//       previewFoto.src = URL.createObjectURL(file);
//     }
//   });
// }

// /* ================= INDEX (FORMULARIO) ================= */
// if (formulario) {
//   const qrRef = ref(db, "qrs/" + qrId);

//   get(qrRef)
//     .then(snapshot => {
//       if (snapshot.exists()) {
//         // Si ya existe, mejor ir a la vista pública
//         window.location.href = `ver.html?id=${qrId}`;
//       } else {
//         mostrarFormulario();
//       }
//     })
//     .catch(error => {
//       console.error("Error leyendo Firebase:", error);
//       mostrarFormulario();
//     });

//   formulario.addEventListener("submit", async e => {
//     e.preventDefault();

//     try {
//       let fotoURL = "";

//       if (fFoto && fFoto.files.length > 0) {
//         try {
//           const file = fFoto.files[0];
//           const ruta = storageRef(storage, `fotos/${qrId}`);
//           await uploadBytes(ruta, file);
//           fotoURL = await getDownloadURL(ruta);
//         } catch (errorFoto) {
//           console.error("Error subiendo foto:", errorFoto);
//           // sigue guardando los demás datos aunque falle la foto
//           fotoURL = "";
//         }
//       }

//       let data = {
//         tipoPerfil: fTipo ? fTipo.value : "",
//         nombre: fNombre ? fNombre.value : "",
//         contacto: fContacto ? fContacto.value : "",
//         contacto2: fContacto2 ? fContacto2.value : "",
//         direccion: fDireccion ? fDireccion.value : "",
//         mensaje: fMensaje ? fMensaje.value : "",
//         foto: fotoURL,
//         fecha: new Date().toISOString()
//       };

//       if (fTipo && ["persona", "nino", "adultoMayor"].includes(fTipo.value)) {
//         data.sangre = fSangre ? fSangre.value : "";
//         data.padecimientos = fPadecimientos ? fPadecimientos.value : "";
//         data.alergias = fAlergias ? fAlergias.value : "";
//       }

//       if (fTipo && fTipo.value === "mascota") {
//         data.mascota = {
//           especie: fEspecie ? fEspecie.value : "",
//           raza: fRaza ? fRaza.value : "",
//           color: fColor ? fColor.value : "",
//           vive: fVive ? fVive.value : ""
//         };
//       }

//       if (fTipo && fTipo.value === "objeto") {
//         data.objeto = {
//           descripcion: fDescripcion ? fDescripcion.value : "",
//           instrucciones: fInstrucciones ? fInstrucciones.value : ""
//         };
//       }

//       await set(qrRef, data);
//       window.location.href = `ver.html?id=${qrId}`;
//     } catch (error) {
//       console.error("Error guardando datos:", error);
//       alert("No se pudo guardar la información. Revisa Firebase o la configuración de Storage.");
//     }
//   });
// }

// /* ================= VER ================= */
// const card = document.querySelector(".card") || document.querySelector(".qr-card");

// if (card && qrId) {
//   const qrRef = ref(db, "qrs/" + qrId);

//   get(qrRef)
//     .then(snapshot => {
//       if (!snapshot.exists()) {
//         document.body.innerHTML = "<h2>Registro no encontrado</h2>";
//         return;
//       }

//       const data = snapshot.val();

//       if (dNombre) dNombre.textContent = data.nombre || "";
//       if (dTipo) dTipo.textContent = data.tipoPerfil || "";
//       if (dContacto) dContacto.textContent = data.contacto || "";
//       if (dMensaje) dMensaje.textContent = data.mensaje || "";

//       if (imgFoto && data.foto) {
//         imgFoto.src = data.foto;
//         imgFoto.classList.remove("qr-oculto");
//       }

//       const linkLlamar = document.getElementById("linkLlamar");
//       const linkWhatsapp = document.getElementById("linkWhatsapp");

//       if (linkLlamar && data.contacto) {
//         linkLlamar.href = `tel:${data.contacto}`;
//       }

//       if (linkWhatsapp && data.contacto) {
//         linkWhatsapp.href = `https://wa.me/${data.contacto}`;
//       }

//       const bloqueEmergencia = document.getElementById("bloqueEmergencia");
//       const linkLlamar2 = document.getElementById("linkLlamar2");
//       const linkWhatsapp2 = document.getElementById("linkWhatsapp2");

//       if (data.contacto2 && bloqueEmergencia) {
//         bloqueEmergencia.classList.remove("qr-oculto");

//         if (linkLlamar2) {
//           linkLlamar2.href = `tel:${data.contacto2}`;
//         }

//         if (linkWhatsapp2) {
//           linkWhatsapp2.href = `https://wa.me/${data.contacto2}`;
//         }
//       }
//     })
//     .catch(error => {
//       console.error("Error mostrando datos:", error);
//       document.body.innerHTML = "<h2>Error al cargar la información</h2>";
//     });
// }

// /* ================= FUNCIONES ================= */
// function mostrarFormulario() {
//   if (titulo) titulo.textContent = "Registrar información";
//   if (formulario) formulario.classList.remove("qr-oculto");
//   if (vistaDatos) vistaDatos.classList.add("qr-oculto");
// }

// function mostrarDatos(data) {
//   if (titulo) titulo.textContent = "Información registrada";
//   if (formulario) formulario.classList.add("qr-oculto");
//   if (vistaDatos) vistaDatos.classList.remove("qr-oculto");

//   if (dNombre) dNombre.textContent = data.nombre || "";
//   if (dTipo) dTipo.textContent = data.tipoPerfil || "";
//   if (dContacto) dContacto.textContent = data.contacto || "";
//   if (dMensaje) dMensaje.textContent = data.mensaje || "";
// }

// /* ================= ELIMINAR ================= */
// if (btnEliminar) {
//   btnEliminar.addEventListener("click", () => {
//     const qrRef = ref(db, "qrs/" + qrId);

//     if (confirm("¿Eliminar este registro?")) {
//       remove(qrRef)
//         .then(() => {
//           alert("Registro eliminado");
//           location.reload();
//         })
//         .catch(error => {
//           console.error("Error eliminando:", error);
//           alert("No se pudo eliminar el registro.");
//         });
//     }
//   });
// }

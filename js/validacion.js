// ============================================
// VALIDACIÓN DE FORMULARIO + LOCALSTORAGE
// Página: contacto.html
// ============================================

// --- Validar formato de email con RegEx ---
const correoValido = (correo) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(correo);
};

// --- Mostrar/ocultar estado de error en un campo ---
const mostrarEstadoCampo = (input, esValido, mensaje = "") => {
    const contenedorPadre = input.parentNode; // el div/label que envuelve al input
    let textoError = contenedorPadre.querySelector(".texto-error");

    if (esValido) {
        contenedorPadre.classList.remove("error");
        if (textoError) textoError.textContent = "";
    } else {
        contenedorPadre.classList.add("error");
        if (textoError) textoError.textContent = mensaje;
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("form-contacto");
    if (!formulario) return; // si no estamos en contacto.html, no hace nada

    const inputNombre = document.getElementById("nombre");
    const inputEmail = document.getElementById("email");
    const inputMensaje = document.getElementById("mensaje");

    // --- Autocompletar con datos guardados en LocalStorage ---
    const datosGuardados = JSON.parse(localStorage.getItem("onixia_contacto"));
    if (datosGuardados) {
        inputNombre.value = datosGuardados.nombre || "";
        inputEmail.value = datosGuardados.email || "";
    }

    // --- Validación al enviar ---
    formulario.addEventListener("submit", (e) => {
        let formularioValido = true;

        // Nombre
        if (inputNombre.value.trim() === "") {
            mostrarEstadoCampo(inputNombre, false, "Por favor, ingresá tu nombre.");
            formularioValido = false;
        } else {
            mostrarEstadoCampo(inputNombre, true);
        }

        // Email
        if (inputEmail.value.trim() === "") {
            mostrarEstadoCampo(inputEmail, false, "El email es obligatorio.");
            formularioValido = false;
        } else if (!correoValido(inputEmail.value.trim())) {
            mostrarEstadoCampo(inputEmail, false, "Ingresá un email válido.");
            formularioValido = false;
        } else {
            mostrarEstadoCampo(inputEmail, true);
        }

        // Mensaje
        if (inputMensaje.value.trim() === "") {
            mostrarEstadoCampo(inputMensaje, false, "Escribí tu mensaje.");
            formularioValido = false;
        } else {
            mostrarEstadoCampo(inputMensaje, true);
        }

        // Si algo falló, frenamos el envío (a Formspree)
        if (!formularioValido) {
            e.preventDefault();
            return;
        }

        // Si todo está OK, guardamos nombre y email para la próxima visita
        localStorage.setItem(
            "onixia_contacto",
            JSON.stringify({
                nombre: inputNombre.value.trim(),
                email: inputEmail.value.trim(),
            })
        );
        // No hacemos preventDefault: el form sigue su envío normal a Formspree
    });
});
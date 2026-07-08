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
    let textoError = input.nextElementSibling;

    if (esValido) {
        input.classList.remove("input-error"); //  AGREGAR msj
        if (textoError) textoError.textContent = "";
    } else {
        input.classList.add("input-error"); //  AGREGAR msj
        if (textoError) textoError.textContent = mensaje;
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("form-contacto");
    if (!formulario) return;

    const inputNombre = document.getElementById("nombre");
    const inputEmail = document.getElementById("email");
    const inputTelefono = document.getElementById("telefono");
    const inputTipo = document.getElementById("tipo");
    const inputAsunto = document.getElementById("asunto");
    const inputMensaje = document.getElementById("mensaje");
    const inputTerminos = document.getElementById("terminos");

    // --- Autocompletar con LocalStorage ---
    const datosGuardados = JSON.parse(localStorage.getItem("onixia_contacto"));
    if (datosGuardados) {
        inputNombre.value = datosGuardados.nombre || "";
        inputEmail.value = datosGuardados.email || "";
    }

    // --- Validación al enviar ---
    formulario.addEventListener("submit", (e) => {
        let formularioValido = true;

        // NOMBRE
        if (inputNombre.value.trim().length < 3) {
            mostrarEstadoCampo(inputNombre, false, "El nombre debe tener al menos 3 caracteres.");
            formularioValido = false;
        } else {
            mostrarEstadoCampo(inputNombre, true);
        }

        // EMAIL
        if (inputEmail.value.trim() === "") {
            mostrarEstadoCampo(inputEmail, false, "El email es obligatorio.");
            formularioValido = false;
        } else if (!correoValido(inputEmail.value.trim())) {
            mostrarEstadoCampo(inputEmail, false, "Ingresá un email válido.");
            formularioValido = false;
        } else {
            mostrarEstadoCampo(inputEmail, true);
        }

        // TELÉFONO (opcional)
        if (inputTelefono.value.trim() !== "" && isNaN(inputTelefono.value)) {
            mostrarEstadoCampo(inputTelefono, false, "El teléfono debe contener solo números.");
            formularioValido = false;
        } else {
            mostrarEstadoCampo(inputTelefono, true);
        }

        // TIPO DE CONSULTA
        if (inputTipo.value === "") {
            mostrarEstadoCampo(inputTipo, false, "Seleccioná un tipo de consulta.");
            formularioValido = false;
        } else {
            mostrarEstadoCampo(inputTipo, true);
        }

        // ASUNTO
        if (inputAsunto.value.trim().length < 3) {
            mostrarEstadoCampo(inputAsunto, false, "El asunto es muy corto.");
            formularioValido = false;
        } else {
            mostrarEstadoCampo(inputAsunto, true);
        }

        // MENSAJE
        if (inputMensaje.value.trim().length < 5) {
            mostrarEstadoCampo(inputMensaje, false, "Escribí un mensaje más detallado.");
            formularioValido = false;
        } else {
            mostrarEstadoCampo(inputMensaje, true);
        }

        // TÉRMINOS
        if (!inputTerminos.checked) {
            mostrarEstadoCampo(inputTerminos, false, "Debés aceptar los términos.");
            formularioValido = false;
        } else {
            mostrarEstadoCampo(inputTerminos, true);
        }

        // SI FALLA
        if (!formularioValido) {
            e.preventDefault();
            return;
        }

        // GUARDAR DATOS
        localStorage.setItem(
            "onixia_contacto",
            JSON.stringify({
                nombre: inputNombre.value.trim(),
                email: inputEmail.value.trim(),
            })
        );

        // Opcional: feedback visual
        mostrarToast("Mensaje enviado correctamente 🎉");
    });
});

// --- TOAST ---
function mostrarToast(mensaje) {
    const toast = document.createElement("div");
    toast.textContent = mensaje;
    toast.classList.add("toast");

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}
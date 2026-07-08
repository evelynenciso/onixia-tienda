// ==== Clave única del carrito en LocalStorage ====
const CARRITO_KEY = "carritoDeCompras";

// ==== Agregar un producto al carrito (se llama desde productos.js) ====
function agregarAlCarrito(producto) {
  let carrito = JSON.parse(localStorage.getItem(CARRITO_KEY)) || [];

  const indiceExistente = carrito.findIndex(item => item.id === producto.id);

  if (indiceExistente !== -1) {
    // Ya está en el carrito: sumamos 1 a la cantidad
    carrito[indiceExistente].cantidad++;
  } else {
    // No está: lo agregamos con cantidad 1
    carrito.push({
      id: producto.id,
      title: producto.name,   // mapeo name -> title, como pide el profe
      price: producto.price,
      image: producto.image,
      cantidad: 1
    });
  }

  localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
  actualizarContadorCarrito();

}

// ==== Actualizar el numerito del carrito en el header ====
function actualizarContadorCarrito() {
  const contador = document.getElementById("contador-carrito");
  if (!contador) return; // si la página actual no tiene ese span, no rompe nada

  const carrito = JSON.parse(localStorage.getItem(CARRITO_KEY)) || [];
  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  contador.textContent = totalItems;
}

// ==== Costo de envío actual (según el <select id="envio-select">) ====
function obtenerCostoEnvio() {
  const select = document.getElementById("envio-select");
  if (!select) return 0;
  return parseFloat(select.value) || 0;
}

// ==== Recalcula subtotal, cantidad de items y total (con envío) ====
// Se usa tanto al renderizar como cuando cambia el envío, sin tener
// que reconstruir toda la lista de productos.
function recalcularTotales() {
  const carrito = JSON.parse(localStorage.getItem(CARRITO_KEY)) || [];

  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  const subtotal = carrito.reduce((acc, item) => acc + item.price * item.cantidad, 0);
  const envio = obtenerCostoEnvio();
  const total = subtotal + envio;

  const itemsCountLabel = document.getElementById("items-count-label");
  const resumenItemsCount = document.getElementById("resumen-items-count");
  const resumenSubtotal = document.getElementById("resumen-subtotal");
  const totalGeneral = document.getElementById("total-general");

  if (itemsCountLabel) itemsCountLabel.textContent = `${totalItems} items`;
  if (resumenItemsCount) resumenItemsCount.textContent = totalItems;
  if (resumenSubtotal) resumenSubtotal.textContent = `$${subtotal.toFixed(2)}`;
  if (totalGeneral) totalGeneral.textContent = `$${total.toFixed(2)}`;
}

// ==== Dibujar la lista del carrito (solo corre si existe #carrito-lista, o sea, en carrito.html) ====
function renderizarCarrito() {
  const lista = document.getElementById("carrito-lista");
  if (!lista) return;

  const carrito = JSON.parse(localStorage.getItem(CARRITO_KEY)) || [];
  const carritoVacio = document.getElementById("carrito-vacio");

  if (carrito.length === 0) {
    lista.innerHTML = "";
    if (carritoVacio) carritoVacio.style.display = "block";
    recalcularTotales();
    return;
  }

  if (carritoVacio) carritoVacio.style.display = "none";

  lista.innerHTML = carrito.map(item => {
    const subtotal = item.price * item.cantidad;
    return `
      <div class="carrito-item" data-id="${item.id}">
        <img src="${item.image}" alt="${item.title}" class="carrito-img">
        <div class="carrito-item-info">
          <span class="carrito-item-tienda">ONIXIA</span>
          <span class="carrito-item-nombre">${item.title}</span>
        </div>
        <div class="carrito-item-cantidad">
          <button class="btn-cant btn-menos" data-id="${item.id}" aria-label="Restar">−</button>
          <input type="number" min="1" value="${item.cantidad}" class="input-cantidad" data-id="${item.id}">
          <button class="btn-cant btn-mas" data-id="${item.id}" aria-label="Sumar">+</button>
        </div>
        <span class="carrito-item-precio">$${subtotal.toFixed(2)}</span>
        <button class="btn-eliminar" data-id="${item.id}" aria-label="Eliminar">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `;
  }).join("");

  recalcularTotales();

  // --- Eliminar producto ---
  document.querySelectorAll(".btn-eliminar").forEach(btn => {
    btn.addEventListener("click", () => eliminarDelCarrito(btn.dataset.id));
  });

  // --- Cambiar cantidad escribiendo en el input ---
  document.querySelectorAll(".input-cantidad").forEach(input => {
    input.addEventListener("change", () => {
      cambiarCantidad(input.dataset.id, parseInt(input.value));
    });
  });

  // --- Botón "−" ---
  document.querySelectorAll(".btn-menos").forEach(btn => {
    btn.addEventListener("click", () => {
      const carritoActual = JSON.parse(localStorage.getItem(CARRITO_KEY)) || [];
      const item = carritoActual.find(i => i.id === btn.dataset.id);
      if (item) cambiarCantidad(item.id, item.cantidad - 1);
    });
  });

  // --- Botón "+" ---
  document.querySelectorAll(".btn-mas").forEach(btn => {
    btn.addEventListener("click", () => {
      const carritoActual = JSON.parse(localStorage.getItem(CARRITO_KEY)) || [];
      const item = carritoActual.find(i => i.id === btn.dataset.id);
      if (item) cambiarCantidad(item.id, item.cantidad + 1);
    });
  });
}

// ==== Eliminar un producto (filter) ====
function eliminarDelCarrito(id) {
  let carrito = JSON.parse(localStorage.getItem(CARRITO_KEY)) || [];
  carrito = carrito.filter(item => item.id !== id);
  localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
  renderizarCarrito();
  actualizarContadorCarrito();
}

// ==== Cambiar cantidad (find + recalcular) ====
// Si la nueva cantidad es 0 o menos, directamente eliminamos el producto.
function cambiarCantidad(id, nuevaCantidad) {
  if (isNaN(nuevaCantidad) || nuevaCantidad < 1) {
    eliminarDelCarrito(id);
    return;
  }

  let carrito = JSON.parse(localStorage.getItem(CARRITO_KEY)) || [];
  const item = carrito.find(item => item.id === id);
  if (item) {
    item.cantidad = nuevaCantidad;
    localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
  }

  renderizarCarrito();
  actualizarContadorCarrito();
}

// ==== Se ejecuta en TODAS las páginas que incluyan este script ====
document.addEventListener("DOMContentLoaded", () => {
  actualizarContadorCarrito();
  renderizarCarrito();

  const btnFinalizar = document.getElementById("btn-finalizar");
  const modalCompra = document.getElementById("modal-compra");
  const estado = document.getElementById("estado-compra");
  const mensaje = document.getElementById("mensaje-compra");
  const envioSelect = document.getElementById("envio-select");
  const btnAplicarCodigo = document.getElementById("btn-aplicar-codigo");
  const inputCodigo = document.getElementById("codigo-descuento");

  // Cambiar el tipo de envío recalcula el total sin tocar la lista de productos
  if (envioSelect) {
    envioSelect.addEventListener("change", recalcularTotales);
  }

  // Botón de aplicar código de descuento (placeholder simple).
  // Acá podés más adelante conectar una lista real de códigos válidos.
  if (btnAplicarCodigo && inputCodigo) {
    btnAplicarCodigo.addEventListener("click", () => {
      const codigo = inputCodigo.value.trim();
      if (!codigo) return;
      alert(`Código "${codigo}" no válido por el momento.`);
    });
  }

  if (btnFinalizar) {
    btnFinalizar.addEventListener("click", () => {

      let carrito = JSON.parse(localStorage.getItem(CARRITO_KEY)) || [];

      if (carrito.length === 0) {
        alert("Tu carrito está vacío 😅");
        return;
      }

      modalCompra.style.display = "flex";

      estado.textContent = "Procesando pago...";
      mensaje.textContent = "Por favor esperá ⏳";

      setTimeout(() => {
        estado.textContent = "Pago aprobado ✅";
        mensaje.textContent = "Gracias por tu compra";

        localStorage.removeItem(CARRITO_KEY);

        renderizarCarrito();
        actualizarContadorCarrito();

        setTimeout(() => {
          modalCompra.style.display = "none";
        }, 2000);

      }, 2000);
    });
  }

  // ==== Botón "volver arriba" ====
  // Corre en cualquier página que tenga el botón; si no existe, no hace nada.
  const btnSubir = document.getElementById("btn-subir");

  if (btnSubir) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 400) {
        btnSubir.classList.add("visible");
      } else {
        btnSubir.classList.remove("visible");
      }
    });

    btnSubir.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
});




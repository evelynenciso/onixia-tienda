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

// ==== Dibujar la tabla del carrito (solo corre si existe #carrito-body, o sea, en carrito.html) ====
function renderizarCarrito() {
  const tbody = document.getElementById("carrito-body");
  if (!tbody) return;

  const carrito = JSON.parse(localStorage.getItem(CARRITO_KEY)) || [];
  const totalGeneral = document.getElementById("total-general");
  const carritoVacio = document.getElementById("carrito-vacio");

  if (carrito.length === 0) {
    tbody.innerHTML = "";
    if (carritoVacio) carritoVacio.style.display = "block";
    if (totalGeneral) totalGeneral.textContent = "$0";
    return;
  }

  if (carritoVacio) carritoVacio.style.display = "none";

  tbody.innerHTML = carrito.map(item => {
    const subtotal = item.price * item.cantidad;
    return `
      <tr data-id="${item.id}">
        <td><img src="${item.image}" alt="${item.title}" class="carrito-img"></td>
        <td>${item.title}</td>
        <td>$${item.price}</td>
        <td>
          <input type="number" min="1" value="${item.cantidad}" class="input-cantidad" data-id="${item.id}">
        </td>
        <td class="subtotal">$${subtotal.toFixed(2)}</td>
        <td>
          <button class="btn-eliminar" data-id="${item.id}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join("");

  const total = carrito.reduce((acc, item) => acc + item.price * item.cantidad, 0);
  if (totalGeneral) totalGeneral.textContent = `$${total.toFixed(2)}`;

  document.querySelectorAll(".btn-eliminar").forEach(btn => {
    btn.addEventListener("click", () => eliminarDelCarrito(btn.dataset.id));
  });

  document.querySelectorAll(".input-cantidad").forEach(input => {
    input.addEventListener("change", () => {
      cambiarCantidad(input.dataset.id, parseInt(input.value));
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
function cambiarCantidad(id, nuevaCantidad) {
  if (isNaN(nuevaCantidad) || nuevaCantidad < 1) nuevaCantidad = 1;

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
  renderizarCarrito(); // no hace nada si no está en carrito.html
});
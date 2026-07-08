// ==== URL base de la API (mismo endpoint que ya usás en productos.js) ====
// OJO: se llama distinto a la de productos.js (API_URL) porque, al ser dos
// scripts normales cargados en la misma página, no pueden declarar la misma
// constante dos veces sin chocar.
const API_URL_COLECCION = "https://6a4806f7abfcbaade119317b.mockapi.io/onixia/products";

// ==== Traer productos y quedarnos solo con los destacados ====
async function cargarColeccionDestacada() {
  const contenedor = document.getElementById("colecion-lista");
  if (!contenedor) return; // si la página actual no tiene esta sección, no rompe nada

  try {
    const respuesta = await fetch(API_URL_COLECCION);
    const productos = await respuesta.json();

    const destacados = productos.filter(producto => producto.featured);

    renderizarColeccion(destacados, contenedor);

  } catch (error) {
    console.error("Error al cargar la colección destacada:", error);
    contenedor.innerHTML = "<p>No se pudo cargar la colección destacada.</p>";
  }
}

// ==== Dibujar las tarjetas (misma estructura que usás en tienda.html, con carrito + ojito) ====
function renderizarColeccion(productos, contenedor) {
  contenedor.innerHTML = "";

  productos.forEach(producto => {
    const card = document.createElement("article");
    card.className = "tarjeta producto";
    card.dataset.id = producto.id;

    card.innerHTML = `
      <img src="${producto.image}" alt="${producto.name}">
      <h3>${producto.name}</h3>
      <p class="descripcion">
        ${producto.description.substring(0, 60)}...
      </p>

      <div class="footer">
        <span class="precio">$${producto.price}</span>

        <button id="btn-agregar-${producto.id}" class="btn-agregar" data-id="${producto.id}">
          <i class="fa-solid fa-cart-shopping"></i>
        </button>

        <button class="btn-ver-descripcion" data-id="${producto.id}">
          <i class="fa-solid fa-eye"></i>
        </button>
      </div>
    `;

    contenedor.appendChild(card);

    // BOTÓN AGREGAR AL CARRITO
    card.querySelector(".btn-agregar").addEventListener("click", () => {
      agregarAlCarrito(producto);
      mostrarToast(producto.name);
    });

    // BOTÓN VER DESCRIPCIÓN (MODAL)
    card.querySelector(".btn-ver-descripcion").addEventListener("click", () => {
      abrirModal(producto);
    });
  });
}

// ==== Se ejecuta cuando carga la página ====
document.addEventListener("DOMContentLoaded", cargarColeccionDestacada);
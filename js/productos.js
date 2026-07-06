// ==== URL de la API donde están los productos ====
const API_URL = "https://6a4806f7abfcbaade119317b.mockapi.io/onixia/products";

// Acá vamos a guardar TODOS los productos una vez que los traemos de la API,
// para no tener que volver a pedirlos cada vez que cambiamos de filtro
let todosLosProductos = [];


// ==== Función que pide los productos a la API ====
async function cargarProductos() {
  try {
    const response = await fetch(API_URL, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const productos = await response.json();

    // Si la API no trae "id", le asignamos uno usando la posición en el array
    const productosConId = productos.map((producto, index) => ({
      ...producto,
      id: producto.id ?? String(index)
    }));

    todosLosProductos = productosConId;
    mostrarProductos(todosLosProductos);

  } catch (error) {
    console.error("Error al cargar productos:", error);
    document.getElementById("productos-container").innerHTML = 
      "<p>Hubo un error al cargar los productos. Intentá de nuevo más tarde.</p>";
  }
}


// ==== Función que arma y muestra las cards en el HTML ====
function mostrarProductos(productos) {
  const container = document.getElementById("productos-container");
  container.innerHTML = "";

  productos.forEach(producto => {
    const card = document.createElement("article");
    card.className = "tarjeta producto";
    card.dataset.id = producto.id; // guardamos el id del producto en la tarjeta

    card.innerHTML = `
      <img src="${producto.image}" alt="${producto.name}">
      <h3>${producto.name}</h3>
      <p class="descripcion">${producto.description}</p>
      <div class="footer">
        <span class="precio">$${producto.price}</span>
        <button id="btn-agregar-${producto.id}" class="btn-agregar" data-id="${producto.id}">
          <i class="fa-solid fa-cart-shopping"></i>
        </button>
      </div>
    `;

    container.appendChild(card);

    
  

    // NUEVO: conectamos el botón de esta card con el carrito
    card.querySelector(".btn-agregar").addEventListener("click", () => {
      agregarAlCarrito(producto);
      mostrarToast(producto.name);
    });


  });
}


// ==== Función que filtra los productos según la categoría elegida ====
function filtrarPorCategoria(categoria) {
  if (categoria === "todos") {
    mostrarProductos(todosLosProductos); // mostramos todo, sin filtrar
  } else {
    const filtrados = todosLosProductos.filter(producto => producto.category === categoria);
    mostrarProductos(filtrados);
  }
}


// ==== Conectamos los botones de filtro con la función de filtrado ====
document.querySelectorAll(".filtro-btn").forEach(boton => {
  boton.addEventListener("click", () => {
    // Sacamos la clase "activo" de todos los botones
    document.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("activo"));
    // Se la ponemos solo al botón que se tocó
    boton.classList.add("activo");

    // Leemos la categoría guardada en el atributo data-categoria del botón
    const categoria = boton.dataset.categoria;
    filtrarPorCategoria(categoria);
  });
});


// ==== Ejecutamos todo al cargar la página ====
cargarProductos();

function mostrarToast(nombreProducto) {
  const container = document.getElementById("toast-container");

  if (!container) return; // 👈 evita que rompa todo

  const toast = document.createElement("div");
  toast.classList.add("toast", "exito");

  toast.innerHTML = `
    <div class="toast-icon">🛒</div>
    <div>
      <strong>${nombreProducto}</strong>
      <small>Agregado al carrito</small>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}
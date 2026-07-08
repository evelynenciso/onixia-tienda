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

    container.appendChild(card);

    //  BOTÓN AGREGAR AL CARRITO
    card.querySelector(".btn-agregar").addEventListener("click", () => {
      agregarAlCarrito(producto);
      mostrarToast(producto.name);
    });

    //  BOTÓN VER DESCRIPCIÓN (MODAL)
    card.querySelector(".btn-ver-descripcion").addEventListener("click", () => {
      abrirModal(producto);
    });
  });
}



// ==== Estado de la galería del modal ====
let imagenesModalActual = [];
let indiceModalActual = 0;

// ==== Función ABRIR MODAL ====
function abrirModal(producto) {
  document.getElementById("modal-nombre").textContent = producto.name;
  document.getElementById("modal-descripcion").textContent = producto.description;
  document.getElementById("modal-precio").textContent = `$${producto.price}`;

  // Armamos el array de imágenes disponibles, descartando las vacías
  imagenesModalActual = [producto.image, producto.image2, producto.image3]
    .filter(img => img && img.trim() !== "");
  indiceModalActual = 0;

  mostrarImagenActiva();
 

  // Ocultar las flechas si el producto tiene una sola imagen
  const hayVarias = imagenesModalActual.length > 1;
  document.getElementById("modal-img-prev").classList.toggle("oculto", !hayVarias);
  document.getElementById("modal-img-next").classList.toggle("oculto", !hayVarias);

  const overlay = document.getElementById("modal-overlay");
  overlay.classList.add("activo");

  document.getElementById("modal-btn-agregar").onclick = () => {
    agregarAlCarrito(producto);
    mostrarToast(producto.name);
    cerrarModal();
  };
}

// ==== Mostrar la imagen según el índice actual ====
function mostrarImagenActiva() {
  document.getElementById("modal-imagen").src = imagenesModalActual[indiceModalActual];

}

// ==== Avanzar / retroceder con las flechas ====
function irImagenSiguiente() {
  if (imagenesModalActual.length <= 1) return;
  indiceModalActual = (indiceModalActual + 1) % imagenesModalActual.length;
  mostrarImagenActiva();
}

function irImagenAnterior() {
  if (imagenesModalActual.length <= 1) return;
  indiceModalActual = (indiceModalActual - 1 + imagenesModalActual.length) % imagenesModalActual.length;
  mostrarImagenActiva();
}

// ==== Dibujar las miniaturas (si hay más de 1 imagen) ====
function renderizarMiniaturasModal() {
  const contenedor = document.getElementById("modal-miniaturas");
  if (!contenedor) return;

  if (imagenesModalActual.length <= 1) {
    contenedor.innerHTML = "";
    contenedor.style.display = "none";
    return;
  }

  contenedor.style.display = "flex";
  contenedor.innerHTML = imagenesModalActual.map((img, i) => `
    <img src="${img}" class="modal-miniatura ${i === 0 ? "activa" : ""}" data-index="${i}">
  `).join("");

  contenedor.querySelectorAll(".modal-miniatura").forEach(mini => {
    mini.addEventListener("click", () => {
      indiceModalActual = parseInt(mini.dataset.index);
      mostrarImagenActiva();
    });
  });
}

// ==== Función CERRAR MODAL ====
function cerrarModal() {
  document.getElementById("modal-overlay").classList.remove("activo");
}

// ==== Eventos que solo se conectan una vez al cargar la página ====
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn-cerrar-modal").addEventListener("click", cerrarModal);

  document.getElementById("modal-overlay").addEventListener("click", (e) => {
    if (e.target.id === "modal-overlay") cerrarModal(); // cierra si clickeás fuera del cuadro
  });

  document.getElementById("modal-img-next")?.addEventListener("click", irImagenSiguiente);
  document.getElementById("modal-img-prev")?.addEventListener("click", irImagenAnterior);
});
// ==== HASTA ACA LLEGO LA FUNCION MODAL ====


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


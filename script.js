/* ==========================================
   VENTA POKE-GIANFRANCO
   CATÁLOGO CON FIREBASE
========================================== */

// ==========================================
// IMPORTAR FIREBASE
// ==========================================

import { db } from "./firebaseConfig.js";

import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";


// ==========================================
// CONFIGURACIÓN GENERAL
// ==========================================

const CONFIG = {
  nombreTienda: "Venta Poke-Gianfranco",

  // Pendiente de configurar.
  // Ejemplo de formato: 521234567890
  whatsapp: "",

  moneda: "MXN"
};


// ==========================================
// VARIABLES
// ==========================================

let productos = [];

let categoriaActual = "Todos";

let productoSeleccionado = null;

let catalogoCargado = false;

let errorCatalogo = false;

let elementoAnteriorModal = null;


// ==========================================
// ELEMENTOS HTML
// ==========================================

const productosGrid =
  document.getElementById("productosGrid");

const buscador =
  document.getElementById("buscador");

const ordenar =
  document.getElementById("ordenar");

const contador =
  document.getElementById("contador");

const sinResultados =
  document.getElementById("sinResultados");

const botonesCategorias =
  document.querySelectorAll(".categoria");

const modal =
  document.getElementById("modal");

const modalImagen =
  document.getElementById("modalImagen");

const modalCategoria =
  document.getElementById("modalCategoria");

const modalTitulo =
  document.getElementById("modalTitulo");

const modalDescripcion =
  document.getElementById("modalDescripcion");

const modalDatos =
  document.getElementById("modalDatos");

const modalPrecio =
  document.getElementById("modalPrecio");

const modalWhatsapp =
  document.getElementById("modalWhatsapp");


// ==========================================
// EMOJIS POR CATEGORÍA
// ==========================================

const emojis = {
  Shinys: "✨",
  Legendarios: "🏆",
  Fondo: "🌄",
  "Fondo/Shiny": "🌟",
  Evento: "🎟️",
  Cuentas: "👤"
};


// ==========================================
// FORMATO DE PRECIOS
// ==========================================

function formatoPrecio(valor) {

  const numero = Number(valor);

  const precio = Number.isFinite(numero)
    ? numero
    : 0;

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: CONFIG.moneda,
    maximumFractionDigits: 0
  }).format(precio);

}


// ==========================================
// CREAR ELEMENTOS HTML
// ==========================================

function crearElemento(
  etiqueta,
  clase = "",
  texto = undefined
) {

  const elemento =
    document.createElement(etiqueta);

  if (clase) {
    elemento.className = clase;
  }

  if (texto !== undefined) {
    elemento.textContent = String(texto);
  }

  return elemento;

}


// ==========================================
// NORMALIZAR PRODUCTOS DE FIREBASE
// ==========================================

function normalizarProducto(id, datos) {

  let fecha = "";

  if (typeof datos.fecha === "string") {

    fecha = datos.fecha;

  } else if (
    datos.fecha &&
    typeof datos.fecha.toDate === "function"
  ) {

    fecha = datos.fecha.toDate().toISOString();

  }

  return {

    id: id,

    nombre: String(
      datos.nombre || "Sin nombre"
    ),

    categoria: String(
      datos.categoria || "Sin categoría"
    ),

    precio: Number(datos.precio) || 0,

    descripcion: String(
      datos.descripcion || "Sin descripción"
    ),

    disponibilidad: String(
      datos.disponibilidad || ""
    ),

    imagen:
      typeof datos.imagen === "string"
        ? datos.imagen
        : "",

    detalles: String(
      datos.detalles || ""
    ),

    fecha: fecha,

    emoji:
      emojis[datos.categoria] || "🎮"

  };

}


// ==========================================
// MOSTRAR CATÁLOGO
// ==========================================

function mostrarProductos() {

  productosGrid.replaceChildren();

  // ESPERANDO FIREBASE

  if (!catalogoCargado) {

    contador.textContent =
      "Cargando catálogo...";

    sinResultados.classList.add("oculto");

    return;

  }

  // ERROR DE CONEXIÓN

  if (errorCatalogo) {

    contador.textContent =
      "No se pudo cargar el catálogo. Revisa la conexión con Firebase.";

    sinResultados.classList.add("oculto");

    return;

  }

  // BUSCADOR

  const textoBusqueda =
    buscador.value
      .trim()
      .toLocaleLowerCase("es");

  // FILTRAR PRODUCTOS

  let lista = productos.filter(producto => {

    const coincideCategoria =
      categoriaActual === "Todos" ||
      producto.categoria === categoriaActual;

    const textoProducto = [
      producto.nombre,
      producto.descripcion,
      producto.categoria
    ]
      .join(" ")
      .toLocaleLowerCase("es");

    const coincideBusqueda =
      textoProducto.includes(textoBusqueda);

    return (
      coincideCategoria &&
      coincideBusqueda
    );

  });


  // ======================================
  // ORDENAMIENTO
  // ======================================

  lista = [...lista];

  const tipoOrden = ordenar.value;

  if (tipoOrden === "nombre") {

    lista.sort((a, b) =>
      a.nombre.localeCompare(
        b.nombre,
        "es"
      )
    );

  } else if (tipoOrden === "menor") {

    lista.sort((a, b) =>
      a.precio - b.precio
    );

  } else if (tipoOrden === "mayor") {

    lista.sort((a, b) =>
      b.precio - a.precio
    );

  } else {

    lista.sort((a, b) =>
      b.fecha.localeCompare(a.fecha)
    );

  }


  // ======================================
  // CONTADOR
  // ======================================

  contador.textContent =
    `${lista.length} publicaciones encontradas`;


  // ======================================
  // SIN RESULTADOS
  // ======================================

  if (lista.length === 0) {

    sinResultados.classList.remove("oculto");

    return;

  }

  sinResultados.classList.add("oculto");


  // ======================================
  // CREAR TARJETAS
  // ======================================

  const fragmento =
    document.createDocumentFragment();

  lista.forEach(producto => {

    const tarjeta =
      crearElemento(
        "article",
        "producto"
      );


    // IMAGEN

    const imagenCaja =
      crearElemento(
        "div",
        "producto-imagen"
      );

    if (producto.imagen) {

      const imagen =
        document.createElement("img");

      imagen.src = producto.imagen;

      imagen.alt = producto.nombre;

      imagen.loading = "lazy";

      imagenCaja.appendChild(imagen);

    } else {

      const emoji =
        crearElemento(
          "span",
          "producto-emoji",
          producto.emoji
        );

      imagenCaja.appendChild(emoji);

    }


    // ETIQUETA

    const etiqueta =
      crearElemento(
        "span",
        "producto-etiqueta",
        producto.categoria
      );

    imagenCaja.appendChild(etiqueta);


    // CONTENIDO

    const contenido =
      crearElemento(
        "div",
        "producto-contenido"
      );


    // NOMBRE

    const nombre =
      crearElemento(
        "h3",
        "",
        producto.nombre
      );


    // DESCRIPCIÓN

    const descripcion =
      crearElemento(
        "p",
        "producto-descripcion",
        producto.descripcion
      );


    // PRECIO

    const precio =
      crearElemento(
        "div",
        "producto-precio",
        formatoPrecio(producto.precio)
      );


    // BOTÓN

    const boton =
      crearElemento(
        "button",
        "producto-boton",
        "Ver detalles"
      );

    boton.type = "button";

    boton.addEventListener(
      "click",
      () => abrirModal(producto.id)
    );


    // UNIR ELEMENTOS

    contenido.append(
      nombre,
      descripcion,
      precio,
      boton
    );

    tarjeta.append(
      imagenCaja,
      contenido
    );

    fragmento.appendChild(tarjeta);

  });

  productosGrid.appendChild(fragmento);

}


// ==========================================
// FILTRAR POR CATEGORÍAS
// ==========================================

botonesCategorias.forEach(boton => {

  boton.addEventListener("click", () => {

    categoriaActual =
      boton.dataset.categoria;

    botonesCategorias.forEach(item => {

      item.classList.toggle(
        "activa",
        item === boton
      );

    });

    mostrarProductos();

    document
      .getElementById("catalogo")
      .scrollIntoView({
        behavior: "smooth"
      });

  });

});


// ==========================================
// BUSCADOR
// ==========================================

buscador.addEventListener(
  "input",
  mostrarProductos
);


// ==========================================
// ORDENAR
// ==========================================

ordenar.addEventListener(
  "change",
  mostrarProductos
);


// ==========================================
// LIMPIAR FILTROS
// ==========================================

document
  .getElementById("limpiarFiltros")
  .addEventListener("click", () => {

    categoriaActual = "Todos";

    buscador.value = "";

    ordenar.value = "recientes";

    botonesCategorias.forEach(boton => {

      boton.classList.toggle(
        "activa",
        boton.dataset.categoria === "Todos"
      );

    });

    mostrarProductos();

  });


// ==========================================
// ABRIR VENTANA DE DETALLES
// ==========================================

function abrirModal(id) {

  const producto =
    productos.find(item =>
      item.id === id
    );

  if (!producto) {
    return;
  }

  productoSeleccionado = producto;

  elementoAnteriorModal =
    document.activeElement;


  // CATEGORÍA

  modalCategoria.textContent =
    producto.categoria;


  // NOMBRE

  modalTitulo.textContent =
    producto.nombre;


  // DESCRIPCIÓN

  modalDescripcion.textContent =
    producto.descripcion;


  // INFORMACIÓN

  const datos = [];

  if (producto.detalles) {

    datos.push(producto.detalles);

  }

  if (producto.disponibilidad) {

    datos.push(
      `Estado: ${producto.disponibilidad}`
    );

  }

  modalDatos.textContent =
    datos.join(" · ");


  // PRECIO

  modalPrecio.textContent =
    formatoPrecio(producto.precio);


  // IMAGEN

  modalImagen.replaceChildren();

  if (producto.imagen) {

    const imagen =
      document.createElement("img");

    imagen.src = producto.imagen;

    imagen.alt = producto.nombre;

    modalImagen.appendChild(imagen);

  } else {

    modalImagen.textContent =
      producto.emoji;

  }


  // MOSTRAR VENTANA

  modal.classList.remove("oculto");

  document.body.style.overflow =
    "hidden";

  document
    .getElementById("cerrarModal")
    .focus();

}


// ==========================================
// CERRAR VENTANA DE DETALLES
// ==========================================

function cerrarModal() {

  modal.classList.add("oculto");

  document.body.style.overflow = "";

  productoSeleccionado = null;

  if (
    elementoAnteriorModal &&
    elementoAnteriorModal.isConnected
  ) {

    elementoAnteriorModal.focus();

  }

}


// BOTÓN CERRAR

document
  .getElementById("cerrarModal")
  .addEventListener(
    "click",
    cerrarModal
  );


// CERRAR TOCANDO EL FONDO

document
  .getElementById("modalFondo")
  .addEventListener(
    "click",
    cerrarModal
  );


// CERRAR CON ESCAPE

document.addEventListener(
  "keydown",
  evento => {

    if (
      evento.key === "Escape" &&
      !modal.classList.contains("oculto")
    ) {

      cerrarModal();

    }

  }
);


// ==========================================
// WHATSAPP
// ==========================================

function contactarWhatsapp(
  producto = null
) {

  const numero =
    CONFIG.whatsapp.replace(/\D/g, "");

  if (!numero) {

    alert(
      "Todavía no hemos configurado el número de WhatsApp de la tienda."
    );

    return;

  }


  let mensaje = "";

  if (producto) {

    mensaje =
      `Hola, quiero información sobre:\n\n` +
      `${producto.nombre}\n` +
      `Categoría: ${producto.categoria}\n` +
      `Precio: ${formatoPrecio(producto.precio)}\n\n` +
      `¿Podrías darme más información?`;

  } else {

    mensaje =
      `Hola, quiero información sobre el catálogo de ${CONFIG.nombreTienda}.`;

  }


  const enlace =
    `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

  window.open(
    enlace,
    "_blank",
    "noopener,noreferrer"
  );

}


// WHATSAPP DEL PRODUCTO

modalWhatsapp.addEventListener(
  "click",
  () => {

    if (productoSeleccionado) {

      contactarWhatsapp(
        productoSeleccionado
      );

    }

  }
);


// WHATSAPP GENERAL

document
  .getElementById("botonWhatsappGeneral")
  .addEventListener(
    "click",
    () => contactarWhatsapp()
  );


// ==========================================
// MENÚ MÓVIL
// ==========================================

const botonMenu =
  document.getElementById("botonMenu");

const navegacion =
  document.getElementById("navegacion");


botonMenu.addEventListener(
  "click",
  () => {

    const abierta =
      navegacion.classList.toggle(
        "abierta"
      );

    botonMenu.setAttribute(
      "aria-expanded",
      String(abierta)
    );

  }
);


// CERRAR MENÚ AL SELECCIONAR

document
  .querySelectorAll(".navegacion a")
  .forEach(enlace => {

    enlace.addEventListener(
      "click",
      () => {

        navegacion.classList.remove(
          "abierta"
        );

        botonMenu.setAttribute(
          "aria-expanded",
          "false"
        );

      }
    );

  });


// ==========================================
// LOGO PRINCIPAL
// ==========================================

const logoPrincipal =
  document.getElementById(
    "logoPrincipal"
  );

logoPrincipal.addEventListener(
  "error",
  () => {

    logoPrincipal.style.display =
      "none";

    const contenedor =
      document.querySelector(
        ".logo-contenedor"
      );

    if (contenedor) {

      contenedor.textContent = "⚡";

      contenedor.style.fontSize =
        "100px";

    }

  }
);


// ==========================================
// AÑO AUTOMÁTICO
// ==========================================

document
  .getElementById("anio")
  .textContent =
    new Date().getFullYear();


// ==========================================
// CONECTAR CATÁLOGO CON FIREBASE
// ==========================================

function iniciarCatalogoFirebase() {

  contador.textContent =
    "Conectando con Firebase...";

  const productosRef =
    collection(db, "productos");


  // ESCUCHAR CAMBIOS EN TIEMPO REAL

  onSnapshot(

    productosRef,

    (instantanea) => {

      productos = instantanea.docs.map(
        documento => {

          return normalizarProducto(
            documento.id,
            documento.data()
          );

        }
      );


      catalogoCargado = true;

      errorCatalogo = false;


      // ACTUALIZAR TARJETAS

      mostrarProductos();


      // ACTUALIZAR VENTANA ABIERTA

      if (productoSeleccionado) {

        const idAbierto =
          productoSeleccionado.id;

        const modalSigueAbierto =
          productos.some(
            producto =>
              producto.id === idAbierto
          );

        if (!modalSigueAbierto) {

          cerrarModal();

        } else {

          abrirModal(idAbierto);

        }

      }


      console.log(
        "Venta Poke-Gianfranco:",
        productos.length,
        "publicaciones cargadas desde Firebase."
      );

    },

    (error) => {

      console.error(
        "Error al consultar Firestore:",
        error
      );

      catalogoCargado = true;

      errorCatalogo = true;

      mostrarProductos();

    }

  );

}


// ==========================================
// INICIAR
// ==========================================

mostrarProductos();

iniciarCatalogoFirebase();
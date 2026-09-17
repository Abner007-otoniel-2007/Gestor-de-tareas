
interface Tarea {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  prioridad: "alta" | "media" | "baja";
  completada: boolean;
}


let tareas: Tarea[] = [];


let idEditando: number | null = null;


const form = document.getElementById("form-tarea") as HTMLFormElement;
const inputId = document.getElementById("tarea-id") as HTMLInputElement;
const inputTitulo = document.getElementById("titulo") as HTMLInputElement;
const inputDescripcion = document.getElementById("descripcion") as HTMLTextAreaElement;
const inputCategoria = document.getElementById("categoria") as HTMLInputElement;
const inputPrioridad = document.getElementById("prioridad") as HTMLSelectElement;
const btnGuardar = document.getElementById("btn-guardar") as HTMLButtonElement;

const inputBuscar = document.getElementById("buscar") as HTMLInputElement;
const filtroEstado = document.getElementById("filtro-estado") as HTMLSelectElement;
const filtroPrioridad = document.getElementById("filtro-prioridad") as HTMLSelectElement;

const listaTareas = document.getElementById("lista-tareas") as HTMLUListElement;



function cargarTareas(): void {
  const datosGuardados = localStorage.getItem("tareas");
  if (datosGuardados) {
    tareas = JSON.parse(datosGuardados);
  }
}

function guardarTareas(): void {
  localStorage.setItem("tareas", JSON.stringify(tareas));
}



function generarId(): number {
  return Date.now();
}

function agregarTarea(nuevaTarea: Tarea): void {
  tareas.push(nuevaTarea);
  guardarTareas();
  renderizarTareas();
}

function actualizarTarea(id: number, datos: Omit<Tarea, "id" | "completada">): void {
  const tarea = tareas.find((t) => t.id === id);
  if (!tarea) return;
  tarea.titulo = datos.titulo;
  tarea.descripcion = datos.descripcion;
  tarea.categoria = datos.categoria;
  tarea.prioridad = datos.prioridad;
  guardarTareas();
  renderizarTareas();
}

function eliminarTarea(id: number): void {
  const confirmar = confirm("¿Seguro que quieres eliminar esta tarea?");
  if (!confirmar) return;
  tareas = tareas.filter((t) => t.id !== id);
  guardarTareas();
  renderizarTareas();
}

function cambiarCompletada(id: number): void {
  const tarea = tareas.find((t) => t.id === id);
  if (!tarea) return;
  tarea.completada = !tarea.completada;
  guardarTareas();
  renderizarTareas();
}

function cargarTareaEnFormulario(id: number): void {
  const tarea = tareas.find((t) => t.id === id);
  if (!tarea) return;

  idEditando = id;
  inputId.value = String(tarea.id);
  inputTitulo.value = tarea.titulo;
  inputDescripcion.value = tarea.descripcion;
  inputCategoria.value = tarea.categoria;
  inputPrioridad.value = tarea.prioridad;
  btnGuardar.textContent = "Actualizar Tarea";
}

function limpiarFormulario(): void {
  idEditando = null;
  form.reset();
  inputId.value = "";
  btnGuardar.textContent = "Agregar Tarea";
}



function obtenerTareasFiltradas(): Tarea[] {
  let resultado = tareas;

  const estado = filtroEstado.value;
  if (estado === "pendientes") {
    resultado = resultado.filter((t) => !t.completada);
  } else if (estado === "completadas") {
    resultado = resultado.filter((t) => t.completada);
  }

  const prioridad = filtroPrioridad.value;
  if (prioridad !== "todas") {
    resultado = resultado.filter((t) => t.prioridad === prioridad);
  }

  const busqueda = inputBuscar.value.toLowerCase().trim();
  if (busqueda !== "") {
    resultado = resultado.filter((t) => t.titulo.toLowerCase().includes(busqueda));
  }

  return resultado;
}



function renderizarTareas(): void {
  listaTareas.innerHTML = "";

  const tareasAMostrar = obtenerTareasFiltradas();

  if (tareasAMostrar.length === 0) {
    listaTareas.innerHTML = "<li>No hay tareas para mostrar.</li>";
    return;
  }

  for (const tarea of tareasAMostrar) {
    const li = document.createElement("li");

    const estadoTexto = tarea.completada ? "[Completada]" : "[Pendiente]";

    li.textContent = `${estadoTexto} ${tarea.titulo} - ${tarea.descripcion} (Categoría: ${tarea.categoria}, Prioridad: ${tarea.prioridad}) `;


    const btnCompletar = document.createElement("button");
    btnCompletar.textContent = tarea.completada ? "Marcar pendiente" : "Marcar completada";
    btnCompletar.addEventListener("click", () => cambiarCompletada(tarea.id));
 

    const btnEditar = document.createElement("button");
    btnEditar.textContent = "Editar";
    btnEditar.addEventListener("click", () => cargarTareaEnFormulario(tarea.id));


    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.addEventListener("click", () => eliminarTarea(tarea.id));

    li.appendChild(btnCompletar);
    li.appendChild(btnEditar);
    li.appendChild(btnEliminar);

    listaTareas.appendChild(li);
  }
}



form.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const datos = {
    titulo: inputTitulo.value.trim(),
    descripcion: inputDescripcion.value.trim(),
    categoria: inputCategoria.value.trim() || "General",
    prioridad: inputPrioridad.value as "alta" | "media" | "baja",
  };

  if (datos.titulo === "") {
    alert("El título es obligatorio.");
    return;
  }

  if (idEditando === null) {

    const nuevaTarea: Tarea = {
      id: generarId(),
      titulo: datos.titulo,
      descripcion: datos.descripcion,
      categoria: datos.categoria,
      prioridad: datos.prioridad,
      completada: false,
    };
    agregarTarea(nuevaTarea);
  } else {

    actualizarTarea(idEditando, datos);
  }

  limpiarFormulario();
});

inputBuscar.addEventListener("input", renderizarTareas);
filtroEstado.addEventListener("change", renderizarTareas);
filtroPrioridad.addEventListener("change", renderizarTareas);



cargarTareas();
renderizarTareas();
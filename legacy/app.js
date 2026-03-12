const STORAGE_KEY = "registro-data-v1";

const initialData = {
  carreras: [],
  clases: [],
  anios: [],
  alumnos: [],
  carreraAnio: [],
  anioClase: [],
  alumnoAnio: []
};

const data = loadData();

const $ = (id) => document.getElementById(id);

const refs = {
  tabs: document.querySelectorAll(".tab"),
  panels: document.querySelectorAll(".panel"),

  formCarrera: $("form-carrera"),
  formClase: $("form-clase"),
  formAnio: $("form-anio"),
  formAlumno: $("form-alumno"),

  formCarreraAnio: $("form-carrera-anio"),
  formAnioClase: $("form-anio-clase"),
  formAlumnoAnio: $("form-alumno-anio"),

  listCarreras: $("lista-carreras"),
  listClases: $("lista-clases"),
  listAnios: $("lista-anios"),
  listAlumnos: $("lista-alumnos"),
  listCarreraAnio: $("lista-carrera-anio"),
  listAnioClase: $("lista-anio-clase"),
  listAlumnoAnio: $("lista-alumno-anio"),

  selCarrera: $("sel-carrera"),
  selAnioCarrera: $("sel-anio-carrera"),
  selAnioClase: $("sel-anio-clase"),
  selClase: $("sel-clase"),
  selAlumno: $("sel-alumno"),
  selAnioAlumno: $("sel-anio-alumno"),

  tablaAlumnos: $("tabla-alumnos")
};

bindEvents();
renderAll();

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(initialData);

  try {
    return { ...structuredClone(initialData), ...JSON.parse(raw) };
  } catch {
    return structuredClone(initialData);
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function bindEvents() {
  refs.tabs.forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });

  refs.formCarrera.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = $("carrera-nombre").value.trim();
    if (!nombre) return;
    data.carreras.push({ id: crypto.randomUUID(), nombre });
    e.target.reset();
    persistAndRender();
  });

  refs.formClase.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = $("clase-nombre").value.trim();
    if (!nombre) return;
    data.clases.push({ id: crypto.randomUUID(), nombre });
    e.target.reset();
    persistAndRender();
  });

  refs.formAnio.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = $("anio-nombre").value.trim();
    if (!nombre) return;
    data.anios.push({ id: crypto.randomUUID(), nombre });
    e.target.reset();
    persistAndRender();
  });

  refs.formAlumno.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = $("alumno-nombre").value.trim();
    const apellido = $("alumno-apellido").value.trim();
    const fechaNacimiento = $("alumno-fecha").value;
    if (!nombre || !apellido || !fechaNacimiento) return;
    data.alumnos.push({ id: crypto.randomUUID(), nombre, apellido, fechaNacimiento });
    e.target.reset();
    persistAndRender();
  });

  refs.formCarreraAnio.addEventListener("submit", (e) => {
    e.preventDefault();
    const carreraId = refs.selCarrera.value;
    const anioId = refs.selAnioCarrera.value;
    if (!carreraId || !anioId) return;

    if (!data.carreraAnio.some((item) => item.carreraId === carreraId && item.anioId === anioId)) {
      data.carreraAnio.push({ carreraId, anioId });
      persistAndRender();
    }
  });

  refs.formAnioClase.addEventListener("submit", (e) => {
    e.preventDefault();
    const anioId = refs.selAnioClase.value;
    const claseId = refs.selClase.value;
    if (!anioId || !claseId) return;

    if (!data.anioClase.some((item) => item.anioId === anioId && item.claseId === claseId)) {
      data.anioClase.push({ anioId, claseId });
      persistAndRender();
    }
  });

  refs.formAlumnoAnio.addEventListener("submit", (e) => {
    e.preventDefault();
    const alumnoId = refs.selAlumno.value;
    const anioId = refs.selAnioAlumno.value;
    if (!alumnoId || !anioId) return;

    const existing = data.alumnoAnio.find((item) => item.alumnoId === alumnoId);
    if (existing) {
      existing.anioId = anioId;
    } else {
      data.alumnoAnio.push({ alumnoId, anioId });
    }
    persistAndRender();
  });
}

function switchTab(tabName) {
  refs.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === tabName));
  refs.panels.forEach((panel) => panel.classList.toggle("active", panel.id === tabName));
}

function persistAndRender() {
  saveData();
  renderAll();
}

function renderAll() {
  renderSimpleList(refs.listCarreras, data.carreras, (item) => item.nombre);
  renderSimpleList(refs.listClases, data.clases, (item) => item.nombre);
  renderSimpleList(refs.listAnios, data.anios, (item) => item.nombre);
  renderSimpleList(refs.listAlumnos, data.alumnos, (item) => `${item.nombre} ${item.apellido} (${item.fechaNacimiento})`);

  fillSelect(refs.selCarrera, data.carreras, "Selecciona una carrera");
  fillSelect(refs.selAnioCarrera, data.anios, "Selecciona un año");
  fillSelect(refs.selAnioClase, data.anios, "Selecciona un año");
  fillSelect(refs.selClase, data.clases, "Selecciona una clase");
  fillSelect(refs.selAlumno, data.alumnos, "Selecciona un alumno", (item) => `${item.nombre} ${item.apellido}`);
  fillSelect(refs.selAnioAlumno, data.anios, "Selecciona un año");

  const carreraName = mapById(data.carreras);
  const anioName = mapById(data.anios);
  const claseName = mapById(data.clases);
  const alumnoName = mapById(data.alumnos, (a) => `${a.nombre} ${a.apellido}`);

  renderSimpleList(
    refs.listCarreraAnio,
    data.carreraAnio,
    (item) => `${carreraName.get(item.carreraId) || "Carrera sin registro"} → ${anioName.get(item.anioId) || "Año sin registro"}`
  );

  renderSimpleList(
    refs.listAnioClase,
    data.anioClase,
    (item) => `${anioName.get(item.anioId) || "Año sin registro"} → ${claseName.get(item.claseId) || "Clase sin registro"}`
  );

  renderSimpleList(
    refs.listAlumnoAnio,
    data.alumnoAnio,
    (item) => `${alumnoName.get(item.alumnoId) || "Alumno sin registro"} → ${anioName.get(item.anioId) || "Año sin registro"}`
  );

  renderTablaAlumnos();
}

function renderSimpleList(container, items, labeler) {
  container.innerHTML = "";
  if (!items.length) {
    container.innerHTML = '<li class="empty">Sin registros</li>';
    return;
  }

  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = labeler(item);
    container.appendChild(li);
  }
}

function fillSelect(select, items, placeholder, labeler = (item) => item.nombre) {
  const current = select.value;
  select.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = placeholder;
  select.appendChild(defaultOption);

  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = labeler(item);
    select.appendChild(option);
  });

  if (items.some((item) => item.id === current)) {
    select.value = current;
  }
}

function mapById(items, formatter = (item) => item.nombre) {
  return new Map(items.map((item) => [item.id, formatter(item)]));
}

function renderTablaAlumnos() {
  refs.tablaAlumnos.innerHTML = "";

  if (!data.alumnos.length) {
    refs.tablaAlumnos.innerHTML = '<tr><td colspan="3" class="empty">Sin alumnos registrados.</td></tr>';
    return;
  }

  for (const alumno of data.alumnos) {
    const alumnoAnio = data.alumnoAnio.find((item) => item.alumnoId === alumno.id);
    const anio = data.anios.find((a) => a.id === alumnoAnio?.anioId);

    const carrerasDelAnio = data.carreraAnio
      .filter((item) => item.anioId === anio?.id)
      .map((item) => data.carreras.find((c) => c.id === item.carreraId)?.nombre)
      .filter(Boolean);

    let carreraTexto = "Sin carrera asociada";
    if (carrerasDelAnio.length === 1) carreraTexto = carrerasDelAnio[0];
    if (carrerasDelAnio.length > 1) carreraTexto = carrerasDelAnio.join(", ");

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${alumno.nombre} ${alumno.apellido}</td>
      <td>${carreraTexto}</td>
      <td>${anio?.nombre || "Sin año asociado"}</td>
    `;
    refs.tablaAlumnos.appendChild(tr);
  }
}

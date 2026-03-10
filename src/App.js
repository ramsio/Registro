import React from "https://esm.sh/react@18.3.1";
import htm from "https://esm.sh/htm@3.1.1";
import "./styles.css";

const { useMemo, useState } = React;
const html = htm.bind(React.createElement);
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

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

const loadData = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(initialData);
  try {
    return { ...structuredClone(initialData), ...JSON.parse(raw) };
  } catch {
    return structuredClone(initialData);
  }
};

const listOrEmpty = (items, renderer) => items.length ? items.map(renderer) : html`<li className="empty">Sin registros</li>`;

export function App() {
  const [tab, setTab] = useState("configuracion");
  const [data, setData] = useState(loadData);
  const [forms, setForms] = useState({
    carreraNombre: "", claseNombre: "", anioNombre: "",
    alumnoNombre: "", alumnoApellido: "", alumnoFecha: "",
    carreraId: "", carreraAnioId: "", anioClaseId: "",
    claseId: "", alumnoId: "", alumnoAnioId: ""
  });

  const updateForm = (key, value) => setForms((prev) => ({ ...prev, [key]: value }));
  const updateData = (updater) => setData((prev) => {
    const next = updater(prev);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  });

  const maps = useMemo(() => ({
    carrera: new Map(data.carreras.map((i) => [i.id, i.nombre])),
    anio: new Map(data.anios.map((i) => [i.id, i.nombre])),
    clase: new Map(data.clases.map((i) => [i.id, i.nombre])),
    alumno: new Map(data.alumnos.map((i) => [i.id, `${i.nombre} ${i.apellido}`]))
  }), [data]);

  const resumen = useMemo(() => data.alumnos.map((alumno) => {
    const rel = data.alumnoAnio.find((i) => i.alumnoId === alumno.id);
    const anio = data.anios.find((i) => i.id === rel?.anioId);
    const carreras = data.carreraAnio
      .filter((i) => i.anioId === anio?.id)
      .map((i) => data.carreras.find((c) => c.id === i.carreraId)?.nombre)
      .filter(Boolean);
    return {
      id: alumno.id,
      alumno: `${alumno.nombre} ${alumno.apellido}`,
      anio: anio?.nombre || "Sin año asociado",
      carrera: carreras.length ? carreras.join(", ") : "Sin carrera asociada"
    };
  }), [data]);

  return html`
    <header className="app-header">
      <h1>🎓 Sistema de Registro de Alumnos (React)</h1>
      <nav className="tabs">
        <button className=${`tab ${tab === "configuracion" ? "active" : ""}`} onClick=${() => setTab("configuracion")}>Configuración</button>
        <button className=${`tab ${tab === "principal" ? "active" : ""}`} onClick=${() => setTab("principal")}>Principal</button>
      </nav>
    </header>

    <main className="container">
      ${tab === "configuracion" && html`
        <section className="panel active">
          <h2>Configuración</h2>
          <div className="grid">
            <article className="card">
              <h3>Carreras</h3>
              <form className="stack" onSubmit=${(e) => { e.preventDefault(); if (!forms.carreraNombre.trim()) return; updateData((d) => ({ ...d, carreras: [...d.carreras, { id: uid(), nombre: forms.carreraNombre.trim() }] })); updateForm("carreraNombre", ""); }}>
                <input value=${forms.carreraNombre} onChange=${(e) => updateForm("carreraNombre", e.target.value)} placeholder="Nombre de la carrera" />
                <button type="submit">Agregar carrera</button>
              </form>
              <ul className="list">${listOrEmpty(data.carreras, (c) => html`<li key=${c.id}>${c.nombre}</li>`)}</ul>
            </article>

            <article className="card">
              <h3>Clases</h3>
              <form className="stack" onSubmit=${(e) => { e.preventDefault(); if (!forms.claseNombre.trim()) return; updateData((d) => ({ ...d, clases: [...d.clases, { id: uid(), nombre: forms.claseNombre.trim() }] })); updateForm("claseNombre", ""); }}>
                <input value=${forms.claseNombre} onChange=${(e) => updateForm("claseNombre", e.target.value)} placeholder="Nombre de la clase" />
                <button type="submit">Agregar clase</button>
              </form>
              <ul className="list">${listOrEmpty(data.clases, (c) => html`<li key=${c.id}>${c.nombre}</li>`)}</ul>
            </article>

            <article className="card">
              <h3>Años escolares</h3>
              <form className="stack" onSubmit=${(e) => { e.preventDefault(); if (!forms.anioNombre.trim()) return; updateData((d) => ({ ...d, anios: [...d.anios, { id: uid(), nombre: forms.anioNombre.trim() }] })); updateForm("anioNombre", ""); }}>
                <input value=${forms.anioNombre} onChange=${(e) => updateForm("anioNombre", e.target.value)} placeholder="Ej: 1er Año" />
                <button type="submit">Agregar año</button>
              </form>
              <ul className="list">${listOrEmpty(data.anios, (a) => html`<li key=${a.id}>${a.nombre}</li>`)}</ul>
            </article>

            <article className="card full">
              <h3>Alumnos</h3>
              <form className="stack two-cols" onSubmit=${(e) => { e.preventDefault(); if (!forms.alumnoNombre.trim() || !forms.alumnoApellido.trim() || !forms.alumnoFecha) return; updateData((d) => ({ ...d, alumnos: [...d.alumnos, { id: uid(), nombre: forms.alumnoNombre.trim(), apellido: forms.alumnoApellido.trim(), fechaNacimiento: forms.alumnoFecha }] })); setForms((f) => ({ ...f, alumnoNombre: "", alumnoApellido: "", alumnoFecha: "" })); }}>
                <input value=${forms.alumnoNombre} onChange=${(e) => updateForm("alumnoNombre", e.target.value)} placeholder="Nombre" />
                <input value=${forms.alumnoApellido} onChange=${(e) => updateForm("alumnoApellido", e.target.value)} placeholder="Apellido" />
                <input type="date" value=${forms.alumnoFecha} onChange=${(e) => updateForm("alumnoFecha", e.target.value)} />
                <button type="submit">Agregar alumno</button>
              </form>
              <ul className="list">${listOrEmpty(data.alumnos, (a) => html`<li key=${a.id}>${a.nombre} ${a.apellido} (${a.fechaNacimiento})</li>`)}</ul>
            </article>
          </div>
        </section>
      `}

      ${tab === "principal" && html`
        <section className="panel active">
          <h2>Principal</h2>
          <div className="grid">
            <article className="card">
              <h3>Asociar carrera con año</h3>
              <form className="stack" onSubmit=${(e) => { e.preventDefault(); if (!forms.carreraId || !forms.carreraAnioId) return; updateData((d) => d.carreraAnio.some((i) => i.carreraId === forms.carreraId && i.anioId === forms.carreraAnioId) ? d : ({ ...d, carreraAnio: [...d.carreraAnio, { carreraId: forms.carreraId, anioId: forms.carreraAnioId }] })); }}>
                <select value=${forms.carreraId} onChange=${(e) => updateForm("carreraId", e.target.value)}>
                  <option value="">Selecciona una carrera</option>
                  ${data.carreras.map((c) => html`<option key=${c.id} value=${c.id}>${c.nombre}</option>`) }
                </select>
                <select value=${forms.carreraAnioId} onChange=${(e) => updateForm("carreraAnioId", e.target.value)}>
                  <option value="">Selecciona un año</option>
                  ${data.anios.map((a) => html`<option key=${a.id} value=${a.id}>${a.nombre}</option>`) }
                </select>
                <button type="submit">Asociar</button>
              </form>
              <ul className="list">${listOrEmpty(data.carreraAnio, (r, i) => html`<li key=${`${r.carreraId}-${r.anioId}-${i}`}>${maps.carrera.get(r.carreraId) || "Carrera sin registro"} → ${maps.anio.get(r.anioId) || "Año sin registro"}</li>`)}</ul>
            </article>

            <article className="card">
              <h3>Asociar año con clase</h3>
              <form className="stack" onSubmit=${(e) => { e.preventDefault(); if (!forms.anioClaseId || !forms.claseId) return; updateData((d) => d.anioClase.some((i) => i.anioId === forms.anioClaseId && i.claseId === forms.claseId) ? d : ({ ...d, anioClase: [...d.anioClase, { anioId: forms.anioClaseId, claseId: forms.claseId }] })); }}>
                <select value=${forms.anioClaseId} onChange=${(e) => updateForm("anioClaseId", e.target.value)}>
                  <option value="">Selecciona un año</option>
                  ${data.anios.map((a) => html`<option key=${a.id} value=${a.id}>${a.nombre}</option>`) }
                </select>
                <select value=${forms.claseId} onChange=${(e) => updateForm("claseId", e.target.value)}>
                  <option value="">Selecciona una clase</option>
                  ${data.clases.map((c) => html`<option key=${c.id} value=${c.id}>${c.nombre}</option>`) }
                </select>
                <button type="submit">Asociar</button>
              </form>
              <ul className="list">${listOrEmpty(data.anioClase, (r, i) => html`<li key=${`${r.anioId}-${r.claseId}-${i}`}>${maps.anio.get(r.anioId) || "Año sin registro"} → ${maps.clase.get(r.claseId) || "Clase sin registro"}</li>`)}</ul>
            </article>

            <article className="card">
              <h3>Asociar alumno con año</h3>
              <form className="stack" onSubmit=${(e) => { e.preventDefault(); if (!forms.alumnoId || !forms.alumnoAnioId) return; updateData((d) => { const ex = d.alumnoAnio.find((i) => i.alumnoId === forms.alumnoId); if (ex) return { ...d, alumnoAnio: d.alumnoAnio.map((i) => i.alumnoId === forms.alumnoId ? { ...i, anioId: forms.alumnoAnioId } : i) }; return { ...d, alumnoAnio: [...d.alumnoAnio, { alumnoId: forms.alumnoId, anioId: forms.alumnoAnioId }] }; }); }}>
                <select value=${forms.alumnoId} onChange=${(e) => updateForm("alumnoId", e.target.value)}>
                  <option value="">Selecciona un alumno</option>
                  ${data.alumnos.map((a) => html`<option key=${a.id} value=${a.id}>${a.nombre} ${a.apellido}</option>`) }
                </select>
                <select value=${forms.alumnoAnioId} onChange=${(e) => updateForm("alumnoAnioId", e.target.value)}>
                  <option value="">Selecciona un año</option>
                  ${data.anios.map((a) => html`<option key=${a.id} value=${a.id}>${a.nombre}</option>`) }
                </select>
                <button type="submit">Asociar</button>
              </form>
              <ul className="list">${listOrEmpty(data.alumnoAnio, (r, i) => html`<li key=${`${r.alumnoId}-${i}`}>${maps.alumno.get(r.alumnoId) || "Alumno sin registro"} → ${maps.anio.get(r.anioId) || "Año sin registro"}</li>`)}</ul>
            </article>

            <article className="card full">
              <h3>Resumen de alumnos</h3>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Alumno</th><th>Carrera</th><th>Año</th></tr></thead>
                  <tbody>
                    ${resumen.length
                      ? resumen.map((r) => html`<tr key=${r.id}><td>${r.alumno}</td><td>${r.carrera}</td><td>${r.anio}</td></tr>`)
                      : html`<tr><td colSpan="3" className="empty">Sin alumnos registrados.</td></tr>`}
                  </tbody>
                </table>
              </div>
            </article>
          </div>
        </section>
      `}
    </main>
  `;
}

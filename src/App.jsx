import { useMemo, useState } from "react";

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

const uid = () => {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(initialData);
  try {
    return { ...structuredClone(initialData), ...JSON.parse(raw) };
  } catch {
    return structuredClone(initialData);
  }
}

export default function App() {
  const [tab, setTab] = useState("configuracion");
  const [data, setData] = useState(loadData);
  const [forms, setForms] = useState({
    carreraNombre: "",
    claseNombre: "",
    anioNombre: "",
    alumnoNombre: "",
    alumnoApellido: "",
    alumnoFecha: "",
    carreraId: "",
    carreraAnioId: "",
    anioClaseId: "",
    claseId: "",
    alumnoId: "",
    alumnoAnioId: ""
  });

  const updateData = (updater) => {
    setData((current) => {
      const next = updater(current);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const updateForm = (field, value) => setForms((s) => ({ ...s, [field]: value }));

  const byId = useMemo(
    () => ({
      carrera: new Map(data.carreras.map((item) => [item.id, item.nombre])),
      clase: new Map(data.clases.map((item) => [item.id, item.nombre])),
      anio: new Map(data.anios.map((item) => [item.id, item.nombre])),
      alumno: new Map(data.alumnos.map((item) => [item.id, `${item.nombre} ${item.apellido}`]))
    }),
    [data]
  );

  const resumenAlumnos = useMemo(() => {
    return data.alumnos.map((alumno) => {
      const relacionAlumnoAnio = data.alumnoAnio.find((item) => item.alumnoId === alumno.id);
      const anio = data.anios.find((item) => item.id === relacionAlumnoAnio?.anioId);
      const carrerasDelAnio = data.carreraAnio
        .filter((item) => item.anioId === anio?.id)
        .map((item) => data.carreras.find((c) => c.id === item.carreraId)?.nombre)
        .filter(Boolean);

      return {
        id: alumno.id,
        alumno: `${alumno.nombre} ${alumno.apellido}`,
        anio: anio?.nombre || "Sin año asociado",
        carrera: carrerasDelAnio.length ? carrerasDelAnio.join(", ") : "Sin carrera asociada"
      };
    });
  }, [data]);

  const onSubmit = (event, action) => {
    event.preventDefault();
    action();
  };

  return (
    <>
      <header className="app-header">
        <h1>🎓 Sistema de Registro de Alumnos (React)</h1>
        <nav className="tabs">
          <button className={`tab ${tab === "configuracion" ? "active" : ""}`} onClick={() => setTab("configuracion")}>Configuración</button>
          <button className={`tab ${tab === "principal" ? "active" : ""}`} onClick={() => setTab("principal")}>Principal</button>
        </nav>
      </header>

      <main className="container">
        {tab === "configuracion" && (
          <section className="panel active">
            <h2>Configuración</h2>
            <div className="grid">
              <article className="card">
                <h3>Carreras</h3>
                <form className="stack" onSubmit={(e) => onSubmit(e, () => {
                  if (!forms.carreraNombre.trim()) return;
                  updateData((current) => ({
                    ...current,
                    carreras: [...current.carreras, { id: uid(), nombre: forms.carreraNombre.trim() }]
                  }));
                  updateForm("carreraNombre", "");
                })}>
                  <input value={forms.carreraNombre} onChange={(e) => updateForm("carreraNombre", e.target.value)} placeholder="Nombre de la carrera" />
                  <button type="submit">Agregar carrera</button>
                </form>
                <ul className="list">{data.carreras.length ? data.carreras.map((c) => <li key={c.id}>{c.nombre}</li>) : <li className="empty">Sin registros</li>}</ul>
              </article>

              <article className="card">
                <h3>Clases</h3>
                <form className="stack" onSubmit={(e) => onSubmit(e, () => {
                  if (!forms.claseNombre.trim()) return;
                  updateData((current) => ({
                    ...current,
                    clases: [...current.clases, { id: uid(), nombre: forms.claseNombre.trim() }]
                  }));
                  updateForm("claseNombre", "");
                })}>
                  <input value={forms.claseNombre} onChange={(e) => updateForm("claseNombre", e.target.value)} placeholder="Nombre de la clase" />
                  <button type="submit">Agregar clase</button>
                </form>
                <ul className="list">{data.clases.length ? data.clases.map((c) => <li key={c.id}>{c.nombre}</li>) : <li className="empty">Sin registros</li>}</ul>
              </article>

              <article className="card">
                <h3>Años escolares</h3>
                <form className="stack" onSubmit={(e) => onSubmit(e, () => {
                  if (!forms.anioNombre.trim()) return;
                  updateData((current) => ({
                    ...current,
                    anios: [...current.anios, { id: uid(), nombre: forms.anioNombre.trim() }]
                  }));
                  updateForm("anioNombre", "");
                })}>
                  <input value={forms.anioNombre} onChange={(e) => updateForm("anioNombre", e.target.value)} placeholder="Ej: 1er Año" />
                  <button type="submit">Agregar año</button>
                </form>
                <ul className="list">{data.anios.length ? data.anios.map((a) => <li key={a.id}>{a.nombre}</li>) : <li className="empty">Sin registros</li>}</ul>
              </article>

              <article className="card full">
                <h3>Alumnos</h3>
                <form className="stack two-cols" onSubmit={(e) => onSubmit(e, () => {
                  if (!forms.alumnoNombre.trim() || !forms.alumnoApellido.trim() || !forms.alumnoFecha) return;
                  updateData((current) => ({
                    ...current,
                    alumnos: [
                      ...current.alumnos,
                      {
                        id: uid(),
                        nombre: forms.alumnoNombre.trim(),
                        apellido: forms.alumnoApellido.trim(),
                        fechaNacimiento: forms.alumnoFecha
                      }
                    ]
                  }));
                  setForms((s) => ({ ...s, alumnoNombre: "", alumnoApellido: "", alumnoFecha: "" }));
                })}>
                  <input value={forms.alumnoNombre} onChange={(e) => updateForm("alumnoNombre", e.target.value)} placeholder="Nombre" />
                  <input value={forms.alumnoApellido} onChange={(e) => updateForm("alumnoApellido", e.target.value)} placeholder="Apellido" />
                  <input type="date" value={forms.alumnoFecha} onChange={(e) => updateForm("alumnoFecha", e.target.value)} />
                  <button type="submit">Agregar alumno</button>
                </form>
                <ul className="list">{data.alumnos.length ? data.alumnos.map((a) => <li key={a.id}>{a.nombre} {a.apellido} ({a.fechaNacimiento})</li>) : <li className="empty">Sin registros</li>}</ul>
              </article>
            </div>
          </section>
        )}

        {tab === "principal" && (
          <section className="panel active">
            <h2>Principal</h2>
            <div className="grid">
              <article className="card">
                <h3>Asociar carrera con año</h3>
                <form className="stack" onSubmit={(e) => onSubmit(e, () => {
                  if (!forms.carreraId || !forms.carreraAnioId) return;
                  updateData((current) => {
                    if (current.carreraAnio.some((i) => i.carreraId === forms.carreraId && i.anioId === forms.carreraAnioId)) return current;
                    return { ...current, carreraAnio: [...current.carreraAnio, { carreraId: forms.carreraId, anioId: forms.carreraAnioId }] };
                  });
                })}>
                  <select value={forms.carreraId} onChange={(e) => updateForm("carreraId", e.target.value)}>
                    <option value="">Selecciona una carrera</option>
                    {data.carreras.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                  <select value={forms.carreraAnioId} onChange={(e) => updateForm("carreraAnioId", e.target.value)}>
                    <option value="">Selecciona un año</option>
                    {data.anios.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                  </select>
                  <button type="submit">Asociar</button>
                </form>
                <ul className="list">{data.carreraAnio.length ? data.carreraAnio.map((r, i) => <li key={`${r.carreraId}-${r.anioId}-${i}`}>{byId.carrera.get(r.carreraId) || "Carrera sin registro"} → {byId.anio.get(r.anioId) || "Año sin registro"}</li>) : <li className="empty">Sin registros</li>}</ul>
              </article>

              <article className="card">
                <h3>Asociar año con clase</h3>
                <form className="stack" onSubmit={(e) => onSubmit(e, () => {
                  if (!forms.anioClaseId || !forms.claseId) return;
                  updateData((current) => {
                    if (current.anioClase.some((i) => i.anioId === forms.anioClaseId && i.claseId === forms.claseId)) return current;
                    return { ...current, anioClase: [...current.anioClase, { anioId: forms.anioClaseId, claseId: forms.claseId }] };
                  });
                })}>
                  <select value={forms.anioClaseId} onChange={(e) => updateForm("anioClaseId", e.target.value)}>
                    <option value="">Selecciona un año</option>
                    {data.anios.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                  </select>
                  <select value={forms.claseId} onChange={(e) => updateForm("claseId", e.target.value)}>
                    <option value="">Selecciona una clase</option>
                    {data.clases.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                  <button type="submit">Asociar</button>
                </form>
                <ul className="list">{data.anioClase.length ? data.anioClase.map((r, i) => <li key={`${r.anioId}-${r.claseId}-${i}`}>{byId.anio.get(r.anioId) || "Año sin registro"} → {byId.clase.get(r.claseId) || "Clase sin registro"}</li>) : <li className="empty">Sin registros</li>}</ul>
              </article>

              <article className="card">
                <h3>Asociar alumno con año</h3>
                <form className="stack" onSubmit={(e) => onSubmit(e, () => {
                  if (!forms.alumnoId || !forms.alumnoAnioId) return;
                  updateData((current) => {
                    const existing = current.alumnoAnio.find((i) => i.alumnoId === forms.alumnoId);
                    if (existing) {
                      return {
                        ...current,
                        alumnoAnio: current.alumnoAnio.map((item) => item.alumnoId === forms.alumnoId ? { ...item, anioId: forms.alumnoAnioId } : item)
                      };
                    }
                    return { ...current, alumnoAnio: [...current.alumnoAnio, { alumnoId: forms.alumnoId, anioId: forms.alumnoAnioId }] };
                  });
                })}>
                  <select value={forms.alumnoId} onChange={(e) => updateForm("alumnoId", e.target.value)}>
                    <option value="">Selecciona un alumno</option>
                    {data.alumnos.map((a) => <option key={a.id} value={a.id}>{a.nombre} {a.apellido}</option>)}
                  </select>
                  <select value={forms.alumnoAnioId} onChange={(e) => updateForm("alumnoAnioId", e.target.value)}>
                    <option value="">Selecciona un año</option>
                    {data.anios.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                  </select>
                  <button type="submit">Asociar</button>
                </form>
                <ul className="list">{data.alumnoAnio.length ? data.alumnoAnio.map((r, i) => <li key={`${r.alumnoId}-${i}`}>{byId.alumno.get(r.alumnoId) || "Alumno sin registro"} → {byId.anio.get(r.anioId) || "Año sin registro"}</li>) : <li className="empty">Sin registros</li>}</ul>
              </article>

              <article className="card full">
                <h3>Resumen de alumnos</h3>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Alumno</th>
                        <th>Carrera</th>
                        <th>Año</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumenAlumnos.length ? resumenAlumnos.map((item) => (
                        <tr key={item.id}>
                          <td>{item.alumno}</td>
                          <td>{item.carrera}</td>
                          <td>{item.anio}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="3" className="empty">Sin alumnos registrados.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </article>
            </div>
          </section>
        )}
      </main>
    </>
  );
}

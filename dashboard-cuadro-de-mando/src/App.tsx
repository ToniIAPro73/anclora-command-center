import { useEffect, useMemo, useState } from "react";
import dataset from "./generated/dataset.json";
import "./App.css";

type Theme = "dark" | "light" | "system";
type Band = "critical" | "high" | "medium" | "low";

const bandLabels: Record<Band, string> = {
  critical: "Crítica",
  high: "Alta",
  medium: "Media",
  low: "Baja",
};

const layerLabels: Record<string, string> = {
  "commercial-vertical": "Vertical comercial",
  intelligence: "Inteligencia",
  partnerships: "Partnerships",
  operations: "Operaciones",
  content: "Contenido",
};

function stripPath(value: string) {
  return value.replaceAll("\\", "/");
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("es-ES", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

function bandClassName(band: string) {
  return `band band--${band}`;
}

function ThemeIcon({ theme }: { theme: Theme }) {
  if (theme === "light") return <span aria-hidden="true">L</span>;
  if (theme === "system") return <span aria-hidden="true">S</span>;
  return <span aria-hidden="true">D</span>;
}

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    const stored = window.localStorage.getItem("anclora-cuadro-de-mando-theme");
    return stored === "light" || stored === "system" ? stored : "dark";
  });
  const [activeLayer, setActiveLayer] = useState<string>("all");

  useEffect(() => {
    const root = document.documentElement;
    const resolveTheme = () =>
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark"
        : theme;

    root.dataset.theme = resolveTheme();
    window.localStorage.setItem("anclora-cuadro-de-mando-theme", theme);

    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      root.dataset.theme = media.matches ? "light" : "dark";
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  const topPriority = dataset.derived.priorityRanking[0];
  const filteredApps = useMemo(() => {
    return activeLayer === "all"
      ? dataset.apps
      : dataset.apps.filter((app) => app.ecosystem_layer === activeLayer);
  }, [activeLayer]);

  const layers = useMemo(
    () =>
      ["all", ...new Set(dataset.apps.map((app) => app.ecosystem_layer))] as string[],
    [],
  );

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div className="topbar__brand">
          <img
            className="topbar__brand-logo"
            src="/brand/logo-anclora-command-center.png"
            alt="Anclora"
          />
          <div>
            <p className="topbar__brand-name">ANCLORA CUADRO DE MANDO</p>
            <p className="topbar__brand-line">Prioridades operativas del dataset Real Estate</p>
          </div>
        </div>

        <div className="topbar__controls">
          {(["dark", "light", "system"] as const).map((value) => (
            <button
              key={value}
              type="button"
              className={value === theme ? "is-active" : ""}
              onClick={() => setTheme(value)}
              aria-label={`Activar tema ${value}`}
            >
              <ThemeIcon theme={value} />
            </button>
          ))}
        </div>
      </header>

      <section className="hero">
        <div className="hero__copy">
          <p className="hero__eyebrow">Surface ejecutiva</p>
          <h1>Qué requiere atención ahora</h1>
          <p className="hero__lede">
            Dashboard local para explorar el dataset de Anclora Real Estate como un sistema de
            decisiones: prioridad, riesgo, siguiente acción y dependencias.
          </p>
          <div className="hero__meta">
            <span>Fuente: {stripPath(dataset.sourceWorkbook)}</span>
            <span>Actualizado: {formatDate(dataset.generatedAt)}</span>
            <span>Apps en alcance: {dataset.apps.length}</span>
          </div>
        </div>

        <aside className="hero__priority-card">
          <p className="hero__eyebrow">Prioridad principal</p>
          <h2>{topPriority.app_name}</h2>
          <div className="hero__score-row">
            <strong>{topPriority.priority_score}</strong>
            <span className={bandClassName(topPriority.priority_band)}>
              {bandLabels[topPriority.priority_band as Band]}
            </span>
          </div>
          <p className="hero__action">{topPriority.action_now}</p>
          <p className="hero__why">{topPriority.main_risks}</p>
        </aside>
      </section>

      <section className="grid grid--top">
        <section className="panel">
          <p className="panel__eyebrow">Ranking</p>
          <h2 className="panel__title">Board de prioridades</h2>
          <div className="priority-list">
            {dataset.derived.priorityRanking.map((item) => (
              <article className="priority-item" key={item.app_id}>
                <div className="priority-item__rank">{item.rank}</div>
                <div className="priority-item__copy">
                  <div className="priority-item__header">
                    <strong>{item.app_name}</strong>
                    <span className={bandClassName(item.priority_band)}>
                      {bandLabels[item.priority_band as Band]}
                    </span>
                  </div>
                  <p>{item.action_now}</p>
                </div>
                <div className="priority-item__score">{item.priority_score}</div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel panel--accent">
          <p className="panel__eyebrow">Acción inmediata</p>
          <h2 className="panel__title">Tarjetas operativas</h2>
          <div className="action-grid">
            {dataset.derived.actionCards.map((item) => (
              <article className="action-card" key={item.app_id}>
                <div className="action-card__top">
                  <h3>{item.title}</h3>
                  <span className={bandClassName(item.priority_band)}>
                    {bandLabels[item.priority_band as Band]}
                  </span>
                </div>
                <p className="action-card__body">{item.action_now}</p>
                <p className="action-card__why">{item.why_now}</p>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="grid grid--middle">
        <section className="panel">
          <p className="panel__eyebrow">Inventario</p>
          <div className="panel__heading-row">
            <h2 className="panel__title">Apps y foco actual</h2>
            <div className="filter-row">
              {layers.map((layer) => (
                <button
                  key={layer}
                  type="button"
                  className={layer === activeLayer ? "is-active" : ""}
                  onClick={() => setActiveLayer(layer)}
                >
                  {layer === "all" ? "Todas" : layerLabels[layer] ?? layer}
                </button>
              ))}
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>App</th>
                  <th>Capa</th>
                  <th>Estado</th>
                  <th>Prioridad</th>
                  <th>Siguiente foco</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app) => {
                  const ranked = dataset.derived.priorityRanking.find((item) => item.app_id === app.app_id);
                  return (
                    <tr key={app.app_id}>
                      <td>
                        <strong>{app.app_name}</strong>
                        <div className="table-sub">{app.ecosystem_role}</div>
                      </td>
                      <td>{layerLabels[app.ecosystem_layer] ?? app.ecosystem_layer}</td>
                      <td>{app.documented_state}</td>
                      <td>
                        <span className={bandClassName(ranked?.priority_band ?? "low")}>
                          {bandLabels[(ranked?.priority_band ?? "low") as Band]}
                        </span>
                      </td>
                      <td>{app.next_focus}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <p className="panel__eyebrow">Relaciones</p>
          <h2 className="panel__title">Mapa de dependencias críticas</h2>
          <div className="dependency-grid">
            {dataset.derived.dependencyMap.links.map((link) => (
              <article className="dependency-link" key={`${link.source}-${link.target}-${link.type}`}>
                <div className="dependency-link__apps">
                  <span>{link.source}</span>
                  <span className="dependency-link__arrow">→</span>
                  <span>{link.target}</span>
                </div>
                <strong>{link.type}</strong>
                <p>{link.label}</p>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="grid grid--bottom">
        <section className="panel">
          <p className="panel__eyebrow">Riesgo</p>
          <h2 className="panel__title">Riesgos principales</h2>
          <div className="risk-list">
            {dataset.derived.riskSummary.map((item) => (
              <article className="risk-item" key={item.app_name}>
                <div className="risk-item__header">
                  <strong>{item.app_name}</strong>
                  <span className={bandClassName(item.priority_band)}>
                    {bandLabels[item.priority_band as Band]}
                  </span>
                </div>
                <p>{item.main_risks}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <p className="panel__eyebrow">Trazabilidad</p>
          <h2 className="panel__title">Fuentes y distribución</h2>
          <div className="mini-stats">
            <div>
              <h3>Capas</h3>
              <ul>
                {dataset.derived.layerDistribution.map((item) => (
                  <li key={item.label}>
                    <span>{layerLabels[item.label] ?? item.label}</span>
                    <strong>{item.value}</strong>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Confianza</h3>
              <ul>
                {dataset.derived.confidenceSummary.map((item) => (
                  <li key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="sources-list">
            {dataset.sources.map((item, index) => (
              <article className="source-item" key={`${item.app_name}-${item.source_note}-${index}`}>
                <div className="source-item__top">
                  <strong>{item.app_name}</strong>
                  <span>{item.source_type}</span>
                </div>
                <p>{item.evidence_summary}</p>
                <code>{item.source_note}</code>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

export default App;

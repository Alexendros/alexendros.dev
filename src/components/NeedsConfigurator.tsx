import { useId, useState } from 'react';
import {
  normalizePortalModuleIds,
  portalBase,
  portalModules,
  serializePortalModuleIds,
  type PortalModuleId
} from '../content/portalModules';

export default function NeedsConfigurator() {
  const summaryId = useId();
  const [selected, setSelected] = useState<PortalModuleId[]>([]);

  const toggle = (id: PortalModuleId) => {
    setSelected((previous) =>
      normalizePortalModuleIds(
        previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]
      )
    );
  };

  const query = selected.length
    ? `?motivo=propuestaComercial&origen=servicios&modulos=${encodeURIComponent(serializePortalModuleIds(selected))}`
    : '?motivo=propuestaComercial&origen=servicios';
  const selectedModules = portalModules.filter((module) => selected.includes(module.id));

  return (
    <div data-needs-configurator className="rounded-lg border border-border bg-card p-6 md:p-8">
      <h2 id="portal-heading" className="text-xl font-bold">
        Sitio web profesional: selecciona las necesidades del proyecto.
      </h2>
      <p className="mt-2 text-sm text-muted">
        Base: {portalBase.delivery}. Plazo orientativo: {portalBase.timeline}. Los módulos y sus
        dependencias se revisan antes de definir el calendario y las condiciones en la propuesta.
      </p>

      <ul className="mt-6 space-y-3" data-needs-list>
        <li className="text-sm">
          <strong>{portalBase.title}</strong>
          <span className="block text-muted">{portalBase.short}</span>
          <span className="block text-muted">{portalBase.scope}</span>
        </li>
        {portalModules.map((module) => (
          <li key={module.id} className="border-t border-border pt-3 text-sm">
            <label className="flex cursor-pointer items-start gap-3" htmlFor={`mod-${module.id}`}>
              <input
                id={`mod-${module.id}`}
                type="checkbox"
                value={module.id}
                data-module={module.id}
                checked={selected.includes(module.id)}
                onChange={() => toggle(module.id)}
                className="focus-ring mt-1"
                aria-describedby={summaryId}
              />
              <span>
                <strong>{module.title}</strong>
                <span className="block text-muted">{module.short}</span>
                <span className="block text-muted">{module.scope}</span>
                <span className="block text-muted">{module.timeline}</span>
                {module.dependencies.map((dependency) => (
                  <span key={dependency} className="block text-xs text-muted">
                    Requisito: {dependency}
                  </span>
                ))}
              </span>
            </label>
          </li>
        ))}
      </ul>

      <div
        id={summaryId}
        className="mt-6 border-t border-border pt-4 text-sm"
        aria-live="polite"
        aria-atomic="true"
        data-selected-modules
      >
        <strong>Necesidades seleccionadas</strong>
        {selectedModules.length > 0 ? (
          <ul className="mt-2 list-disc pl-5 text-muted">
            {selectedModules.map((module) => (
              <li key={module.id}>{module.title}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-muted">
            Todavía no hay módulos seleccionados. La propuesta puede partir solo de la base.
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <a
          href={`/contacto${query}`}
          className="btn focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-ink transition-colors hover:bg-primaryHover"
        >
          Solicitar propuesta
        </a>
        <a
          href="/contacto?motivo=informacionCliente"
          className="focus-ring rounded text-sm font-medium text-muted underline decoration-dotted underline-offset-4 hover:text-primary"
        >
          Solicitar información sin seleccionar módulos
        </a>
      </div>
    </div>
  );
}

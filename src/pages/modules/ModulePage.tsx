import { Suspense, lazy } from "react";
import { useParams } from "react-router-dom";
import ModuleErrorBoundary from "../../components/ModuleErrorBoundary";
import PageLoader from "../../components/PageLoader";
import { moduleMap } from "./moduleMap";

// Cache for lazy-loaded components to ensure stability and correct swapping
const componentCache: Record<string, React.LazyExoticComponent<any>> = {};

function titleize(input: string): string {
  return input
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ModulePage() {
  const { moduleKey } = useParams<{ moduleKey: string }>();

  // Use the cached component if it exists, otherwise create it
  if (moduleKey && moduleMap[moduleKey] && !componentCache[moduleKey]) {
    componentCache[moduleKey] = lazy(moduleMap[moduleKey] as any);
  }

  const DynamicModule = moduleKey ? componentCache[moduleKey] : null;

  if (DynamicModule) {
    const title = moduleKey ? titleize(moduleKey) : "Module";
    return (
      <ModuleErrorBoundary key={moduleKey} moduleKey={moduleKey || "module"}>
        <Suspense fallback={<PageLoader message={`Initializing ${title}...`} />}>
          <DynamicModule />
        </Suspense>
      </ModuleErrorBoundary>
    );
  }

  const title = moduleKey ? titleize(moduleKey) : "Module";

  return (
    <div style={{ padding: 24 }} key="not-found">
      <h2 style={{ marginBottom: 8 }}>{title}</h2>
      <p style={{ opacity: 0.85, marginBottom: 16 }}>
        A direct page component was not found for this module key: <code>{moduleKey}</code>
      </p>
      <p style={{ opacity: 0.75 }}>
        Please verify the module registration in <code>moduleMap.ts</code>.
      </p>
    </div>
  );
}
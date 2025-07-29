import { StandardDataIntegrityView } from "./StandardDataIntegrityView";

interface DataIntegrityEngineViewProps {
  loading?: boolean;
}

export function DataIntegrityEngineView({ loading }: DataIntegrityEngineViewProps) {
  return <StandardDataIntegrityView loading={loading} />;
}
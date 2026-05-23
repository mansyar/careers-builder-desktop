/// <reference types="vite/client" />

declare namespace JSX {
  type Element = React.ReactElement;
  type ElementType = React.ElementType;
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface IntrinsicElements extends React.JSX.IntrinsicElements {}
}

interface Window {
  electronAPI: Record<string, unknown>;
}

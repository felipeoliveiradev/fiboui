declare module '*?raw' {
  const src: string
  export default src
}

declare module 'leaflet' {
  const leaflet: unknown
  export default leaflet
}

interface ImportMeta {
  readonly hot?: {
    readonly accept: (cb?: () => void) => void
  }
}

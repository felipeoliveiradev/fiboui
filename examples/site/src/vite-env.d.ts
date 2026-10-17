/// <reference types="vite/client" />

declare module '*?raw' {
  const src: string
  export default src
}

declare module 'leaflet' {
  const leaflet: unknown
  export default leaflet
}

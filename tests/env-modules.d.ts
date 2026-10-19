declare module '*?raw' {
  const src: string
  export default src
}

declare module 'lucide-react' {
  const lucide: unknown
  export default lucide
}

interface ImportMeta {
  readonly hot?: {
    readonly accept: (cb?: () => void) => void
  }
}

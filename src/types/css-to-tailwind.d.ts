declare module '@metagptx/css-to-tailwind' {
  export function cssToTailwind(
    css: string | Record<string, string | number | undefined>
  ): string;
}

/**
 * Insert SSR html/styles into the Vite HTML shell.
 * Must use a function replacer — String.replace treats $& $$ $` $' as specials
 * and would corrupt markup (hydration mismatch).
 */
export function injectSsrMarkup(template, html, styles) {
  if (!template.includes('<!--app-html-->')) {
    throw new Error('SSR template missing <!--app-html--> placeholder');
  }
  if (!template.includes('<!--app-styles-->')) {
    throw new Error('SSR template missing <!--app-styles--> placeholder');
  }
  return template
    .replaceAll('<!--app-html-->', () => html)
    .replaceAll('<!--app-styles-->', () => styles);
}

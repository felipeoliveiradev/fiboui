/** Turn `my-card` / `user_profile` / `Hero` into a TS identifier. */
export function toPascalCase(name: string): string {
  if (name == null) return '';
  const parts = String(name)
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return '';
  const ident = parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  return /^[0-9]/.test(ident) ? `N${ident}` : ident;
}

export function toKebabCase(name: string): string {
  const pascal = toPascalCase(name);
  return pascal
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

export function pluginNames(raw: string): { safeName: string; label: string; path: string } {
  const pascal = toPascalCase(raw);
  if (!pascal) return { safeName: '', label: '', path: '' };
  // Strip a redundant "Plugin" suffix, but keep the stem when the name is only "Plugin"
  // (otherwise label is empty and the sidebar path becomes "/").
  const stripped = pascal.endsWith('Plugin') ? pascal.slice(0, -'Plugin'.length) : pascal;
  const base = stripped || pascal;
  return {
    safeName: `${stripped}Plugin`,
    label: base,
    path: `/${toKebabCase(base)}`,
  };
}

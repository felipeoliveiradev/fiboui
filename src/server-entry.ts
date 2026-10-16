/**
 * React Server Components entry (`package.json` exports["."].react-server).
 * Static fluent builders + page() — no 'use client', no hooks.
 * Client-only APIs (.observer, Router, …) resolve via the default export.
 */
export { page, withFiboStyles } from './core/page';
export type { FiboPageBuild, FiboPageOptions } from './core/page';
export { FiboStyles, MotionStyles, getCss, getStyleTag, endSsrRequest } from './core/styleManager';

export { Center } from './layout/Center';
export { Column } from './layout/Column';
export { Container } from './layout/Container';
export { Row } from './layout/Row';
export { Spacer } from './layout/Spacer';
export { Box } from './structure/Box';
export { Card } from './structure/Card';
export { Text } from './content/Text';
export { Button } from './interactive/Button';

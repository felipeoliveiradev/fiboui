import { renderScaffoldHost, type ScaffoldConfig } from '../layout/Scaffold/host';
import { peekProviders } from './StateWrapper';

/** RSC island — same host as client, parent providers from the request maps. */
export function ScaffoldInner(props: ScaffoldConfig) {
  return renderScaffoldHost(props, peekProviders());
}

import { renderButtonHost } from '../interactive/Button/host';

/** RSC island — same button paint, no event handlers in the Flight payload. */
export function ButtonInner(props: any) {
  return renderButtonHost(props, false);
}

/** Flutter-style handle for a mounted ScrollView — no document.querySelector. */
export class ScrollController {
  private _node: HTMLElement | null = null;

  /** @internal Attached by ScrollView on mount. */
  attach(node: HTMLElement | null): void {
    this._node = node;
  }

  get node(): HTMLElement | null {
    return this._node;
  }

  scrollBy(options: ScrollToOptions): void {
    this._node?.scrollBy(options);
  }

  scrollTo(options: ScrollToOptions): void {
    this._node?.scrollTo(options);
  }

  /**
   * Carousel step: scroll by the first child's outer width (+ gap).
   * Prefer this over measuring in app code.
   */
  scrollByChild(dir: -1 | 1 = 1, gap = 0): void {
    const el = this._node;
    if (!el) return;
    const child = el.firstElementChild as HTMLElement | null;
    if (!child) return;
    const horizontal = el.scrollWidth > el.clientWidth;
    const size = horizontal
      ? child.getBoundingClientRect().width
      : child.getBoundingClientRect().height;
    const step = size + gap;
    el.scrollBy(
      horizontal
        ? { left: dir * step, behavior: "smooth" }
        : { top: dir * step, behavior: "smooth" },
    );
  }

  scrollToChild(index: number, gap = 0): void {
    const el = this._node;
    if (!el) return;
    const child = el.children[index] as HTMLElement | undefined;
    if (!child) return;
    const axis = el.scrollWidth > el.clientWidth ? "left" : "top";
    const offset =
      axis === "left"
        ? child.offsetLeft - (gap ? 0 : 0)
        : child.offsetTop;
    el.scrollTo({
      [axis]: offset,
      behavior: "smooth",
    });
  }
}

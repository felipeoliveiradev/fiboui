/** Flutter-style handle for a mounted ScrollView — no document.querySelector. */
export class ScrollController {
  private _node: HTMLElement | null = null;

  /** @internal Attached by ScrollView on mount. */
  attach(node: HTMLElement | null): void {
    if (node == null) {
      this._node = null;
      return;
    }
    if (typeof document === 'undefined') return;
    this._node = node;
  }

  get node(): HTMLElement | null {
    return this._node;
  }

  /** Prefer the inner strip so wrapping for overflow does not count as a slide. */
  private itemHost(): HTMLElement | null {
    const el = this._node;
    if (!el) return null;
    const first = el.firstElementChild as HTMLElement | null;
    if (first?.classList?.contains('fibo-scroll-inner')) return first;
    return el;
  }

  private alive(): HTMLElement | null {
    if (typeof document === 'undefined') return null;
    return this._node;
  }

  scrollBy(options: ScrollToOptions): void {
    this.alive()?.scrollBy?.(options);
  }

  scrollTo(options: ScrollToOptions): void {
    this.alive()?.scrollTo?.(options);
  }

  /** Prefer overflow styles (direction) over whether content currently overflows. */
  private scrollAxis(el: HTMLElement): "left" | "top" {
    const ox = el.style.overflowX;
    const oy = el.style.overflowY;
    const canX = ox === "auto" || ox === "scroll";
    const canY = oy === "auto" || oy === "scroll";
    if (canX && !canY) return "left";
    if (!canX && canY) return "top";
    return el.scrollWidth > el.clientWidth ? "left" : "top";
  }

  /**
   * Carousel step: scroll by the first child's outer width (+ gap).
   * Prefer this over measuring in app code.
   */
  scrollByChild(dir: -1 | 1 = 1, gap = 0): void {
    const el = this.alive();
    const host = this.itemHost();
    if (!el || !host) return;
    const child = host.firstElementChild as HTMLElement | null;
    if (!child) return;
    const axis = this.scrollAxis(el);
    const size =
      axis === "left"
        ? child.getBoundingClientRect().width
        : child.getBoundingClientRect().height;
    const step = size + gap;
    el.scrollBy(
      axis === "left"
        ? { left: dir * step, behavior: "smooth" }
        : { top: dir * step, behavior: "smooth" },
    );
  }

  scrollToChild(index: number, gap = 0): void {
    const el = this.alive();
    const host = this.itemHost();
    if (!el || !host) return;
    const child = host.children[index] as HTMLElement | undefined;
    if (!child) return;
    const axis = this.scrollAxis(el);
    const offset = (axis === "left" ? child.offsetLeft : child.offsetTop) + index * gap;
    el.scrollTo({
      [axis]: offset,
      behavior: "smooth",
    });
  }
}

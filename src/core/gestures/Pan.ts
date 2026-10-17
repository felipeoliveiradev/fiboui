import { GestureRecognizer, GestureState, GestureEvent, Offset } from './Recognizer';

export type PanCallback = (event: GestureEvent) => void;

export class PanRecognizer extends GestureRecognizer {
  private startLocation: Offset = { x: 0, y: 0 };
  private lastLocation: Offset = { x: 0, y: 0 };
  private startTime: number = 0;
  private pointerId: number | undefined;
  private hasPointer = false;

  constructor(
    private callbacks: {
      onStart?: PanCallback;
      onUpdate?: PanCallback;
      onEnd?: PanCallback;
    }
  ) {
    super();
  }

  onPointerDown(e: PointerEvent) {
    if (this.hasPointer && !this.isOurPointer(e)) return;
    if (this.state === GestureState.Began || this.state === GestureState.Changed) return;

    this.hasPointer = true;
    this.pointerId = e.pointerId;
    this.state = GestureState.Began;
    this.startLocation = { x: e.clientX, y: e.clientY };
    this.lastLocation = { x: e.clientX, y: e.clientY };
    this.startTime = Date.now();

    this.callbacks.onStart?.(this.createEvent(e));
  }

  onPointerMove(e: PointerEvent) {
    if (!this.isOurPointer(e)) return;
    if (this.state !== GestureState.Began && this.state !== GestureState.Changed) return;

    this.state = GestureState.Changed;
    const event = this.createEvent(e);
    this.callbacks.onUpdate?.(event);
    this.lastLocation = { x: e.clientX, y: e.clientY };
  }

  onPointerUp(e: PointerEvent) {
    if (!this.isOurPointer(e)) return;
    if (this.state === GestureState.Changed || this.state === GestureState.Began) {
      this.state = GestureState.Ended;
      this.callbacks.onEnd?.(this.createEvent(e));
    }
    this.reset();
  }

  onPointerCancel(e: PointerEvent) {
    if (this.hasPointer && !this.isOurPointer(e)) return;
    if (this.state === GestureState.Changed || this.state === GestureState.Began) {
      this.state = GestureState.Cancelled;
      this.callbacks.onEnd?.(this.createEvent(e));
    } else {
      this.state = GestureState.Cancelled;
    }
    this.reset();
  }

  /** End an in-progress pan at the last known location (unmount / lost capture). */
  cancel() {
    if (this.state === GestureState.Changed || this.state === GestureState.Began) {
      this.state = GestureState.Cancelled;
      this.callbacks.onEnd?.(
        this.createEvent({
          clientX: this.lastLocation.x,
          clientY: this.lastLocation.y,
          pointerId: this.pointerId,
        } as PointerEvent)
      );
    }
    this.reset();
  }

  reset() {
    super.reset();
    this.hasPointer = false;
    this.pointerId = undefined;
  }

  private isOurPointer(e: PointerEvent): boolean {
    if (!this.hasPointer) return false;
    if (this.pointerId === undefined || e.pointerId === undefined) return true;
    return e.pointerId === this.pointerId;
  }

  private createEvent(e: PointerEvent): GestureEvent {
    const location = { x: e.clientX, y: e.clientY };
    const translation = {
      x: location.x - this.startLocation.x,
      y: location.y - this.startLocation.y
    };
    const delta = {
      x: location.x - this.lastLocation.x,
      y: location.y - this.lastLocation.y
    };

    const timeDelta = (Date.now() - this.startTime) / 1000;
    const velocity = {
      x: translation.x / (timeDelta || 1),
      y: translation.y / (timeDelta || 1)
    };

    return { translation, delta, velocity, location };
  }
}

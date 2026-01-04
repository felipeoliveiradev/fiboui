import { GestureRecognizer, GestureState, GestureEvent, Offset } from './Recognizer';

export type PanCallback = (event: GestureEvent) => void;

export class PanRecognizer extends GestureRecognizer {
  private startLocation: Offset = { x: 0, y: 0 };
  private lastLocation: Offset = { x: 0, y: 0 };
  private startTime: number = 0;

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
    this.state = GestureState.Began;
    this.startLocation = { x: e.clientX, y: e.clientY };
    this.lastLocation = { x: e.clientX, y: e.clientY };
    this.startTime = Date.now();

    this.callbacks.onStart?.(this.createEvent(e));
  }

  onPointerMove(e: PointerEvent) {
    if (this.state !== GestureState.Began && this.state !== GestureState.Changed) return;

    this.state = GestureState.Changed;
    const event = this.createEvent(e);
    this.callbacks.onUpdate?.(event);
    this.lastLocation = { x: e.clientX, y: e.clientY };
  }

  onPointerUp(e: PointerEvent) {
    if (this.state === GestureState.Changed || this.state === GestureState.Began) {
      this.state = GestureState.Ended;
      this.callbacks.onEnd?.(this.createEvent(e));
    }
    this.reset();
  }

  onPointerCancel(_e: PointerEvent) {
    this.state = GestureState.Cancelled;
    this.reset();
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

    // Simple velocity calculation
    const timeDelta = (Date.now() - this.startTime) / 1000;
    const velocity = {
      x: translation.x / (timeDelta || 1),
      y: translation.y / (timeDelta || 1)
    };

    return { translation, delta, velocity, location };
  }
}

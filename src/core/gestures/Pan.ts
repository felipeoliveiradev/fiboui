import {
  GestureRecognizer,
  GestureState,
  GestureEvent,
  Offset,
  DragAxis,
} from './Recognizer';

export type PanCallback = (event: GestureEvent) => void;

const PREDICT_DT = 0.15;

export type PanOptions = {
  /** Pixels before recognition (SwiftUI `minimumDistance`). Default 0. */
  minimumDistance?: number;
  /** Lock translation to one axis. Default `free`. */
  axis?: DragAxis;
};

export class PanRecognizer extends GestureRecognizer {
  private startLocation: Offset = { x: 0, y: 0 };
  private lastLocation: Offset = { x: 0, y: 0 };
  private startTime: number = 0;
  private pointerId: number | undefined;
  private hasPointer = false;
  private recognized = false;
  private readonly minimumDistance: number;
  private readonly axis: DragAxis;

  constructor(
    private callbacks: {
      onStart?: PanCallback;
      onUpdate?: PanCallback;
      onEnd?: PanCallback;
    },
    options: PanOptions = {}
  ) {
    super();
    this.minimumDistance = Math.max(0, options.minimumDistance ?? 0);
    this.axis = options.axis ?? 'free';
  }

  onPointerDown(e: PointerEvent) {
    if (this.hasPointer && !this.isOurPointer(e)) return;
    if (this.state === GestureState.Began || this.state === GestureState.Changed) return;

    this.hasPointer = true;
    this.pointerId = e.pointerId;
    this.startLocation = { x: e.clientX, y: e.clientY };
    this.lastLocation = { x: e.clientX, y: e.clientY };
    this.startTime = Date.now();
    this.recognized = false;

    if (this.minimumDistance <= 0) {
      this.state = GestureState.Began;
      this.recognized = true;
      this.callbacks.onStart?.(this.createEvent(e));
    } else {
      this.state = GestureState.Possible;
    }
  }

  onPointerMove(e: PointerEvent) {
    if (!this.isOurPointer(e)) return;
    if (
      this.state !== GestureState.Possible &&
      this.state !== GestureState.Began &&
      this.state !== GestureState.Changed
    ) {
      return;
    }

    const rawDx = e.clientX - this.startLocation.x;
    const rawDy = e.clientY - this.startLocation.y;

    if (!this.recognized) {
      const dist = Math.hypot(rawDx, rawDy);
      if (dist < this.minimumDistance) {
        this.lastLocation = { x: e.clientX, y: e.clientY };
        return;
      }
      if (this.axis === 'horizontal' && Math.abs(rawDx) < Math.abs(rawDy)) {
        this.state = GestureState.Failed;
        this.reset();
        return;
      }
      if (this.axis === 'vertical' && Math.abs(rawDy) < Math.abs(rawDx)) {
        this.state = GestureState.Failed;
        this.reset();
        return;
      }
      this.recognized = true;
      this.state = GestureState.Began;
      this.callbacks.onStart?.(this.createEvent(e));
    }

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
    this.recognized = false;
  }

  private isOurPointer(e: PointerEvent): boolean {
    if (!this.hasPointer) return false;
    if (this.pointerId === undefined || e.pointerId === undefined) return true;
    return e.pointerId === this.pointerId;
  }

  private lockTranslation(t: Offset): Offset {
    if (this.axis === 'horizontal') return { x: t.x, y: 0 };
    if (this.axis === 'vertical') return { x: 0, y: t.y };
    return t;
  }

  private createEvent(e: PointerEvent): GestureEvent {
    const location = { x: e.clientX, y: e.clientY };
    const translation = this.lockTranslation({
      x: location.x - this.startLocation.x,
      y: location.y - this.startLocation.y,
    });
    const delta = this.lockTranslation({
      x: location.x - this.lastLocation.x,
      y: location.y - this.lastLocation.y,
    });

    const timeDelta = (Date.now() - this.startTime) / 1000;
    const velocity = this.lockTranslation({
      x: translation.x / (timeDelta || 1),
      y: translation.y / (timeDelta || 1),
    });

    const predictedEndTranslation: Offset = {
      x: translation.x + velocity.x * PREDICT_DT,
      y: translation.y + velocity.y * PREDICT_DT,
    };
    const predictedEndLocation: Offset = {
      x: this.startLocation.x + predictedEndTranslation.x,
      y: this.startLocation.y + predictedEndTranslation.y,
    };

    return {
      translation,
      delta,
      velocity,
      location,
      predictedEndTranslation,
      predictedEndLocation,
    };
  }
}

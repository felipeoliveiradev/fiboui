export enum GestureState {
  Possible,
  Began,
  Changed,
  Ended,
  Cancelled,
  Failed
}

export interface Offset {
  x: number;
  y: number;
}

export interface GestureEvent {
  translation: Offset;
  delta: Offset;
  velocity: Offset;
  location: Offset;
}

export abstract class GestureRecognizer {
  state: GestureState = GestureState.Possible;

  abstract onPointerDown(e: PointerEvent): void;
  abstract onPointerMove(e: PointerEvent): void;
  abstract onPointerUp(e: PointerEvent): void;
  abstract onPointerCancel(e: PointerEvent): void;

  reset() {
    this.state = GestureState.Possible;
  }
}

export interface Heading {
  degrees: number;
  updated: number;
  valid: boolean;
}

export const DEFAULT_HEADING = {
  degrees: 0,
  updated: 0,
  valid: false
};

export type HeadingCallback = (degrees: Heading) => void;

export default interface HeadingManagerInterface {
  supported: boolean;

  registerJsCallbacks(callback: HeadingCallback): void;

  unregisterJsCallbacks(): void;

  startJsCallbacks(): void;

  stopJsCallbacks(): void;
}

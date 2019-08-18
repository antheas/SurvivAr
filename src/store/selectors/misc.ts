import { State } from "../types";

export function selectAppState({ session: { state } }: State) {
  return state;
}

export function selectBackgroundTrackingState({
  session: { backgroundTrackingEnabled }
}: State) {
  return backgroundTrackingEnabled;
}

export function selectStashedBackgroundProgress({
  session: { backgroundProgress }
}: State) {
  return backgroundProgress;
}

import { State } from "../types";

export function selectAppState({ session: { state } }: State) {
  return state;
}

export function selectBackgroundTrackingState({
  session: { backgroundTrackingEnabled }
}: State) {
  return backgroundTrackingEnabled;
}

export function selectHasCompletedPoints({
  session: {
    completedIds,
    pointMetadata: { currentAreaId }
  }
}: State) {
  return completedIds.length > 0 && currentAreaId;
}

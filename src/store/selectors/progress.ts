import { isWaitPoint, State } from "../types";
import { selectCurrentArea, selectDistance } from "./points";

export function selectWaitPointProgress(
  { progress: { waitPoints } }: State,
  id: string
) {
  return waitPoints[id] ? waitPoints[id] : { elapsedTime: 0 };
}

export function selectCollectPointProgress(
  { progress: { collectPoints } }: State,
  id: string
) {
  return collectPoints[id] ? collectPoints[id] : { qrPoints: {} };
}

export function selectCachedCurrentWaitPoints({
  session: { currentPointCache }
}: State) {
  return currentPointCache;
}

export function selectCurrentWaitPoints(state: State) {
  const currentArea = selectCurrentArea(state);
  if (!currentArea) return [];

  // Return ids from wait points which have not been completed
  // and the user is within their radius
  return currentArea.children
    .filter(isWaitPoint)
    .filter(p => selectWaitPointProgress(state, p.id).elapsedTime < p.duration)
    .filter(p => {
      const distance = selectDistance(state, p.id);
      return distance !== -1 && distance <= p.radius;
    })
    .map(p => p.id);
}

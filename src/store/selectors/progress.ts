import { isWaitPoint, State } from "../types";
import { selectCurrentPoints, selectDistance } from "./points";

export function selectCachedCurrentWaitPoints({
  session: { currentPointCache }
}: State) {
  return currentPointCache;
}

export function selectCurrentWaitPoints(state: State) {
  const points = selectCurrentPoints(state);

  // Return ids from wait points which have not been completed
  // and the user is within their radius
  return points
    .filter(isWaitPoint)
    .filter(p => selectWaitPointProgress(state, p.id).elapsedTime < p.duration)
    .filter(p => {
      const distance = selectDistance(state, p.id);
      return distance !== -1 && distance <= p.radius;
    })
    .map(p => p.id);
}

export function selectWaitPointProgress(
  { progress: { waitPoints } }: State,
  id: string
) {
  return waitPoints[id] ? waitPoints[id] : { elapsedTime: 0 };
}

export function selectMultipleWaitPointProgress(state: State, ids: string[]) {
  return ids.map(id => selectWaitPointProgress(state, id));
}

export function selectCollectPointProgress(
  { progress: { collectPoints } }: State,
  id: string
) {
  return collectPoints[id] ? collectPoints[id] : { qrPoints: {} };
}

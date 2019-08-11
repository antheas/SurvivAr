import { ExtendedCollectPoint } from "./model/ExtendedCollectPoint";
import { ExtendedPoint } from "./model/ExtendedPoint";
import { ExtendedWaitPoint } from "./model/ExtendedWaitPoint";
import {
  isCollectPoint,
  isWaitPoint,
  PointState,
  PositionState,
  State
} from "./types";

export function selectPoints({ points }: State): PointState {
  return points;
}

export function selectPosition({
  navigation: { position }
}: State): PositionState {
  return position;
}

export function selectAppState({ session: { state } }: State) {
  return state;
}

export function selectAreas({ points: { areas } }: State) {
  return areas;
}

export function selectCurrentArea({
  points: { areas },
  session: {
    pointMetadata: { currentAreaId }
  }
}: State) {
  return currentAreaId
    ? areas.find((a): boolean => a.id === currentAreaId)
    : undefined;
}

export function selectSortedPoints({
  session: {
    pointMetadata: { sortedPoints }
  }
}: State) {
  return sortedPoints;
}

export function selectExtendedPoints(state: State, ids?: string[]) {
  const currentArea = selectCurrentArea(state);

  if (!currentArea) return [];
  const areaPoints = currentArea.children;
  const progressPoints = state.progress.points;

  let sortedPoints = selectSortedPoints(state);
  if (ids)
    sortedPoints = sortedPoints.filter(ps => ids.indexOf(ps.pointId) !== -1);

  return sortedPoints.map(
    (ps): ExtendedPoint => {
      const p = areaPoints.find((c): boolean => c.id === ps.pointId);
      const progress = progressPoints[ps.pointId];

      if (!p) throw new Error(`Point with id: ${ps.pointId} not found!`);

      if (isWaitPoint(p)) {
        return new ExtendedWaitPoint(p, ps.distance, progress);
      } else if (isCollectPoint(p)) {
        return new ExtendedCollectPoint(p, ps.distance, progressPoints);
      } else {
        return new ExtendedPoint(p, ps.distance);
      }
    }
  );
}

export function selectExtendedCollectPoint(state: State, id: string) {
  const currentArea = selectCurrentArea(state);

  if (!currentArea) return undefined;
  const areaPoints = currentArea.children;
  const progressPoints = state.progress.points;

  const ps = selectSortedPoints(state).find(po => po.pointId === id);
  const p = areaPoints.find((c): boolean => c.id === id);

  if (!p || !ps) throw new Error(`Point with id: ${id} not found!`);

  if (isCollectPoint(p)) {
    return new ExtendedCollectPoint(p, ps.distance, progressPoints);
  } else {
    throw new Error(`Point with id: ${id} is not a collect point.`);
  }
}

export function selectCachedCurrentWaitPoints({
  session: { currentPointCache }
}: State) {
  return currentPointCache;
}

export function selectCurrentWaitPoints(state: State) {
  return selectExtendedPoints(state)
    .filter(p => p.userWithin && !p.completed && p instanceof ExtendedWaitPoint)
    .map(p => p.id);
}

export function selectWaitPointProgress(
  { progress: { points } }: State,
  ids: string[]
) {
  return ids.map(id =>
    points[id]
      ? { id, progress: points[id] }
      : { id, progress: { elapsedTime: 0 } }
  );
}

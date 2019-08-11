import {
  State,
  PointState,
  PositionState,
  isWaitPoint,
  isCollectPoint
} from "./types";
import { ExtendedPoint } from "./model/ExtendedPoint";
import { ExtendedWaitPoint } from "./model/ExtendedWaitPoint";
import { ExtendedCollectPoint } from "./model/ExtendedCollectPoint";

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

export function selectExtendedPoints(state: State) {
  const currentArea = selectCurrentArea(state);

  if (!currentArea) return [];
  const areaPoints = currentArea.children;
  const progressPoints = state.progress.points;

  return state.session.pointMetadata.sortedPoints.map(
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

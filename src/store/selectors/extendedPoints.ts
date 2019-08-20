import { ExtendedCollectPoint } from "../model/ExtendedCollectPoint";
import { ExtendedPoint } from "../model/ExtendedPoint";
import { ExtendedWaitPoint } from "../model/ExtendedWaitPoint";
import { isCollectPoint, isWaitPoint, State } from "../types";
import {
  selectCurrentArea,
  selectCurrentPoints,
  selectDistance,
  selectPointsById
} from "./points";
import {
  selectCollectPointProgress,
  selectWaitPointProgress
} from "./progress";

export function selectExtendedPoints(state: State, ids?: string[]) {
  const points = ids
    ? selectPointsById(state, ids)
    : selectCurrentPoints(state);

  return points.map(p => {
    const distance = selectDistance(state, p.id);

    if (isWaitPoint(p)) {
      const progress = selectWaitPointProgress(state, p.id);
      return new ExtendedWaitPoint(p, distance, progress);
    } else if (isCollectPoint(p)) {
      const progress = selectCollectPointProgress(state, p.id);
      return new ExtendedCollectPoint(p, distance, progress);
    } else {
      return new ExtendedPoint(p, distance);
    }
  });
}

export function selectExtendedCollectPoint(state: State, id: string) {
  const currentArea = selectCurrentArea(state);
  if (!currentArea) return [];

  const p = selectCurrentPoints(state).find(c => c.id === id);

  if (!p || !isCollectPoint(p))
    throw new Error(`Point with id: ${id} is not a collect point`);

  const distance = selectDistance(state, p.id);
  const progress = selectCollectPointProgress(state, p.id);
  return new ExtendedCollectPoint(p, distance, progress);
}

export function selectCompletedPoints(state: State): ExtendedPoint[] {
  const {
    session: { completedIds }
  } = state;
  if (!completedIds.length) return [];

  return selectExtendedPoints(state, completedIds);
}

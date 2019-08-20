import { State } from "../types";

export function selectPointState({ points }: State) {
  return points;
}

export function selectPoints({ points: { points } }: State) {
  return points;
}

export function selectPointsById({ points: { points } }: State, ids: string[]) {
  return ids.map(id => points[id]).filter(p => p);
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

export function selectCurrentPoints(state: State) {
  const area = selectCurrentArea(state);
  const points = selectPoints(state);

  return area ? area.children.map(id => points[id]).filter(p => p) : [];
}

export function selectDistances({
  session: {
    pointMetadata: { distances }
  }
}: State) {
  return distances;
}

export function selectDistance(state: State, id: string) {
  const distance = selectDistances(state)[id];

  return typeof distance !== undefined ? distance : -1;
}

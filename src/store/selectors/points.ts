import { State } from "../types";

export function selectPoints({ points }: State) {
  return points;
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

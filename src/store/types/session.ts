export enum StateType {
  STARTUP,
  WAITING_FOR_FINE_LOCATION,
  RETRIEVING_DATA,
  LOADING_ERROR,
  TRACKING
}

export interface PointMetadata {
  currentAreaId?: string;
  sortedPoints: Array<{
    pointId: string;
    distance: number;
  }>;
}

export interface SessionState {
  state: StateType;
  pointMetadata: PointMetadata;
  currentPointCache: {
    // WaitPoints Only
    ids: string[];
    updated: number;
  };
}

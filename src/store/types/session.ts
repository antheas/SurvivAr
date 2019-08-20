import { WaitProgressUpdate } from "../actions";

export enum StateType {
  STARTUP,
  WAITING_FOR_FINE_LOCATION,
  RETRIEVING_DATA,
  LOADING_ERROR,
  TRACKING
}

export interface PointMetadata {
  currentAreaId?: string;
  distances: Record<string, number>;
}

// Session contains the transient application state
export interface SessionState {
  state: StateType;
  backgroundTrackingEnabled: boolean;
  pointMetadata: PointMetadata;
  currentPointCache: {
    // WaitPoints Only
    ids: string[];
    updated: number;
  };
  completedIds: string[];
}

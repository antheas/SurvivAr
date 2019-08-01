export enum StateType {
  STARTUP,
  WAITING_FOR_FINE_LOCATION,
  RETRIEVING_DATA,
  TRACKING
}

export interface SessionState {
  state: StateType;
}

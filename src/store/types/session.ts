export enum StateType {
  STARTUP,
  WAITING_FOR_FINE_LOCATION,
  RETRIEVING_DATA,
  LOADING_ERROR,
  TRACKING
}

export interface SessionState {
  state: StateType;
}

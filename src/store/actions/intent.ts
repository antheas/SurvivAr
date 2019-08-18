export const APP_LAUNCH_COMPLETED = "APP_LAUNCH_COMPLETED";
export const APP_EXITING = "APP_EXITING";
export const BEGIN_FOREGROUND_FETCH = "BEGIN_FOREGROUND_FETCH";
export const STOP_FOREGROUND_FETCH = "STOP_FOREGROUND_FETCH";
export const RETRY_FETCH = "RETRY_FETCH";
export const CLEAR_COMPLETED = "CLEAR_COMPLETED";

export interface IntentAction {
  type: string;
  reason?: string;
}

export function retryFetch(): IntentAction {
  return {
    type: RETRY_FETCH
  };
}

// Main activity is mounted and location permission has been accepted
export function appLaunchCompleted(): IntentAction {
  return {
    type: APP_LAUNCH_COMPLETED
  };
}

export function appAboutToExit(): IntentAction {
  return {
    type: APP_EXITING
  };
}

export function setForegroundFetch(state: boolean): IntentAction {
  return {
    type: state ? BEGIN_FOREGROUND_FETCH : STOP_FOREGROUND_FETCH
  };
}

export function clearCompletedPoints(): IntentAction {
  return {
    type: CLEAR_COMPLETED
  };
}

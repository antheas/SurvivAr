import { WaitPointProgress, CollectPointProgress } from "../types";

export const UPDATE_CURRENT_WAIT_POINT_CACHE =
  "UPDATE_CURRENT_WAIT_POINT_CACHE";
export const UPDATE_WAIT_PROGRESS = "UPDATE_WAIT_PROGRESS";
export const UPDATE_COLLECT_PROGRESS = "UPDATE_COLLECT_PROGRESS";

export interface CurrentPointAction {
  type: typeof UPDATE_CURRENT_WAIT_POINT_CACHE;

  currentIds: string[];
  updated: number;
}

export function updateCurrentWaitPointCache(
  pointIds: string[],
  updated: number
): CurrentPointAction {
  return {
    type: UPDATE_CURRENT_WAIT_POINT_CACHE,

    currentIds: pointIds,
    updated
  };
}

export interface WaitProgressUpdate {
  id: string;
  progress: WaitPointProgress;
}

export interface WaitProgressAction {
  type: typeof UPDATE_WAIT_PROGRESS;

  update: WaitProgressUpdate[];
}

export function updateWaitPointProgress(
  update: WaitProgressUpdate[] | WaitProgressUpdate
): WaitProgressAction {
  return {
    type: UPDATE_WAIT_PROGRESS,

    update: Array.isArray(update) ? update : [update]
  };
}

export interface CollectProgressUpdate {
  id: string;
  progress: CollectPointProgress;
}

export interface CollectProgressAction {
  type: typeof UPDATE_COLLECT_PROGRESS;

  update: CollectProgressUpdate[];
}

export function updateCollectPointProgress(
  update: CollectProgressUpdate[] | CollectProgressUpdate
): CollectProgressAction {
  return {
    type: UPDATE_COLLECT_PROGRESS,

    update: Array.isArray(update) ? update : [update]
  };
}

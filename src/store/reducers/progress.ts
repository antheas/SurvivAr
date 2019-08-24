import { combineReducers } from "redux";
import {
  UPDATE_WAIT_PROGRESS,
  WaitProgressAction,
  CollectProgressAction,
  UPDATE_COLLECT_PROGRESS
} from "../actions";
import { WaitPointProgress, CollectPointProgress } from "../types";

function waitPoints(
  state: Record<string, WaitPointProgress> = {},
  action: WaitProgressAction
): Record<string, WaitPointProgress> {
  if (action.type === UPDATE_WAIT_PROGRESS) {
    const newState = { ...state };
    for (const { id, progress: pointProgress } of action.update) {
      newState[id] = pointProgress;
    }
    return newState;
  } else {
    return state;
  }
}

function collectPoints(
  state: Record<string, CollectPointProgress> = {},
  action: CollectProgressAction
): Record<string, CollectPointProgress> {
  if (action.type === UPDATE_COLLECT_PROGRESS) {
    const newState = { ...state };
    for (const { id, progress: pointProgress } of action.update) {
      // Combine with old progress
      newState[id] = {
        ...newState[id]
      };
      newState[id].qrPoints = {
        ...newState[id].qrPoints,
        ...pointProgress.qrPoints
      };
    }
    return newState;
  } else {
    return state;
  }
}

export default combineReducers({
  waitPoints,
  collectPoints
});

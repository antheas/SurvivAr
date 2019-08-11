import { ProgressState } from "../types";
import {
  CollectProgressAction,
  WaitProgressAction,
  UPDATE_WAIT_PROGRESS,
  UPDATE_COLLECT_PROGRESS
} from "../actions";

export default function progress(
  state: ProgressState = {
    waitPoints: {},
    collectPoints: {}
  },
  action: WaitProgressAction | CollectProgressAction
): ProgressState {
  if (action.type === UPDATE_WAIT_PROGRESS) {
    const newState = { ...state };
    newState.waitPoints = { ...state.waitPoints };
    for (const { id, progress: pointProgress } of action.update) {
      newState.waitPoints[id] = pointProgress;
    }
    return newState;
  } else if (action.type === UPDATE_COLLECT_PROGRESS) {
    const newState = { ...state };
    newState.collectPoints = { ...state.collectPoints };
    for (const { id, progress: pointProgress } of action.update) {
      newState.collectPoints[id] = pointProgress;
    }
    return newState;
  } else {
    return state;
  }
}

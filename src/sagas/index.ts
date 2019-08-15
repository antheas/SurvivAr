// @ts-ignore
import { Dispatch } from "redux";
import { cancel, fork, take } from "redux-saga/effects";
import {
  APP_EXITING,
  APP_LAUNCH_COMPLETED,
  BEGIN_FOREGROUND_FETCH,
  STOP_FOREGROUND_FETCH,
  updatePosition
} from "../store/actions";
import init from "./init";
import watch from "./watch";
import LocationManagerInterface from "../location/position/LocationInterface";
import { handleBackgroundEvents, startBackgroundService } from "./background";
import LocationManager from "../location/position/LocationManager";

function* mainEventLoop() {
  while (1) {
    yield* init();
    yield* watch();
  }
}

function registerPositionUpdates(
  manager: LocationManagerInterface,
  dispatch: Dispatch
) {
  manager.registerJsCallbacks(p => dispatch(updatePosition(p)));
}

const BEGIN_ACTIONS = [BEGIN_FOREGROUND_FETCH, APP_EXITING];
const STOP_ACTIONS = [STOP_FOREGROUND_FETCH, APP_EXITING];

export default function* rootSaga(dispatch: Dispatch) {
  yield take(APP_LAUNCH_COMPLETED);

  // Setup callbacks
  const manager: LocationManagerInterface = new LocationManager();
  registerPositionUpdates(manager, dispatch);

  while ((yield take(BEGIN_ACTIONS)).type !== APP_EXITING) {
    // Start
    yield* handleBackgroundEvents(manager);
    manager.startJsCallbacks();
    const loopTask = yield fork(mainEventLoop);

    const action = yield take(STOP_ACTIONS);

    // Stop
    yield cancel(loopTask);
    manager.stopJsCallbacks();

    // Start Background
    yield* startBackgroundService(manager);

    if (action.type === APP_EXITING) break;
  }

  manager.unregisterJsCallbacks();
}

// @ts-ignore
import { Dispatch } from "redux";
import { cancel, fork, select, take } from "redux-saga/effects";
import LocationManagerInterface from "../location/position/LocationInterface";
import LocationManager from "../location/position/LocationManager";
import {
  APP_EXITING,
  APP_LAUNCH_COMPLETED,
  BEGIN_FOREGROUND_FETCH,
  STOP_FOREGROUND_FETCH,
  updatePosition,
  UPDATE_POINT_METADATA
} from "../store/actions";
import { ExtendedPoint } from "../store/model/ExtendedPoint";
import { selectExtendedPoints } from "../store/selectors";
import { handleBackgroundEvents, startBackgroundService } from "./background";
import init from "./init";
import watch from "./watch";

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

function* updateClosestDistance(manager: LocationManagerInterface) {
  while (1) {
    yield take(UPDATE_POINT_METADATA);
    const points: ExtendedPoint[] = yield select(selectExtendedPoints);

    const distances = points
      .filter(p => p.completed)
      .map(p => p.distance)
      .sort((a, b) => a - b);
    if (distances.length) {
      const minDistance = distances[0];
      console.log(minDistance);
      manager.updateClosestDistance(minDistance);
    }
  }
}

const BEGIN_ACTIONS = [BEGIN_FOREGROUND_FETCH, APP_EXITING];
const STOP_ACTIONS = [STOP_FOREGROUND_FETCH, APP_EXITING];

export default function* rootSaga(dispatch: Dispatch) {
  yield take(APP_LAUNCH_COMPLETED);

  // Setup Location Manager
  const manager: LocationManagerInterface = new LocationManager();
  const distanceTask = yield fork(updateClosestDistance, manager);
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

  yield cancel(distanceTask);
  manager.unregisterJsCallbacks();
}

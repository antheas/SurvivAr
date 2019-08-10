import { combineReducers } from "redux";
import {
  PointMetadataAction,
  PointsAction,
  PositionAction,
  ProgressAction,
  StateAction,
  UPDATE_POINTS,
  UPDATE_POINT_METADATA,
  UPDATE_POSITION,
  UPDATE_PROGRESS,
  UPDATE_STATE,
  HeadingAction,
  UPDATE_HEADING
} from "./actions";
import {
  PointState,
  ProgressState,
  SessionState,
  StateType,
  Location,
  PositionState,
  HeadingState
} from "./types";

const NULL_LOCATION: Location = { lon: 0, lat: 0 };

function position(
  state: PositionState = {
    coords: NULL_LOCATION,
    accuracy: Infinity,
    updated: 0,
    valid: false
  },
  action: PositionAction
): PositionState {
  if (action.type === UPDATE_POSITION) {
    return action.position;
  } else {
    return state;
  }
}

function heading(
  state: HeadingState = {
    degrees: 0,
    updated: 0,
    valid: false
  },
  action: HeadingAction
): HeadingState {
  if (action.type === UPDATE_HEADING) {
    return action.heading;
  } else {
    return state;
  }
}

const navigation = combineReducers({
  position,
  heading
});

function points(
  state: PointState = {
    valid: false,
    updated: 0,
    location: NULL_LOCATION,
    bounds: 0,
    areas: []
  },
  action: PointsAction
): PointState {
  // TODO: handle errors
  if (action.type === UPDATE_POINTS) {
    return action.newState;
  } else {
    return state;
  }
}

function progress(
  state: ProgressState = {
    points: {}
  },
  action: ProgressAction
): ProgressState {
  if (action.type === UPDATE_PROGRESS) {
    const newState = { ...state };
    newState.points = { ...state.points, [action.id]: action.point };
    return newState;
  } else {
    return state;
  }
}

function session(
  state: SessionState = {
    state: StateType.STARTUP,
    pointMetadata: {
      sortedPoints: []
    }
  },
  action: StateAction | PointMetadataAction
): SessionState {
  if (action.type === UPDATE_STATE) {
    const newState: SessionState = { ...state };
    newState.state = action.state;
    return newState;
  } else if (action.type === UPDATE_POINT_METADATA) {
    const newState: SessionState = { ...state };
    newState.pointMetadata = action.metadata;
    return newState;
  } else {
    return state;
  }
}

export default combineReducers({
  navigation,
  points,
  progress,
  session
});

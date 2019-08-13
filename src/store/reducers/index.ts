import { combineReducers } from "redux";
import position from "./position";
import points from "./points";
import progress from "./progress";
import session from "./session";

export default combineReducers({
  position,
  points,
  progress,
  session
});

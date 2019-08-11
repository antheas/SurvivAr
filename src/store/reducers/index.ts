import { combineReducers } from "redux";
import navigation from "./navigation";
import points from "./points";
import progress from "./progress";
import session from "./session";

export default combineReducers({
  navigation,
  points,
  progress,
  session
});

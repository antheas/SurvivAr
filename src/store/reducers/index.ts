import { combineReducers } from "redux";
import position from "./position";
import points from "./points";
import progress from "./progress";
import session from "./session";
import { State } from "../types";

export default combineReducers<State>({
  position,
  points,
  progress,
  session
});

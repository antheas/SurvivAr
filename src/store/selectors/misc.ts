import { State } from "../types";

export function selectAppState({ session: { state } }: State) {
  return state;
}

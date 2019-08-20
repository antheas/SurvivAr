import { createStore, applyMiddleware, Middleware } from "redux";
import createSagaMiddleware from "redux-saga";
import { createLogger } from "redux-logger";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-community/async-storage";
import autoMergeLevel2 from "redux-persist/es/stateReconciler/autoMergeLevel2";

import rootReducer from "./reducers";
import rootSaga from "../sagas";
import {
  UPDATE_CURRENT_WAIT_POINT_CACHE,
  UPDATE_POINT_METADATA,
  UPDATE_POINTS,
  UPDATE_WAIT_PROGRESS,
  UPDATE_COLLECT_PROGRESS,
  UPDATE_STATE
} from "./actions";

// Redux persist
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  stateReconciler: autoMergeLevel2,
  blacklist: ["session"]
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Apply sagas
const sagaMiddleware = createSagaMiddleware();
const middleware: Middleware[] = [sagaMiddleware];

// On development add logger with blacklists
if (process.env.NODE_ENV !== "production") {
  // FIXME: redux-logger performance on react native is poor
  // app may freeze if updates occur too fast
  const ACTION_BLACKLIST = [
    UPDATE_CURRENT_WAIT_POINT_CACHE,
    UPDATE_POINT_METADATA
  ];
  const NON_COLLAPSED_ACTIONS = [
    UPDATE_POINTS,
    UPDATE_WAIT_PROGRESS,
    UPDATE_COLLECT_PROGRESS
  ];

  const logger = createLogger({
    predicate: (getState, action) =>
      ACTION_BLACKLIST.indexOf(action.type) === -1,
    collapsed: (getState, action) =>
      NON_COLLAPSED_ACTIONS.indexOf(action.type) === -1,
    actionTransformer: action => {
      if (action.type === UPDATE_STATE)
        return action.type + ": " + action.state;
      return action.type;
    },
    stateTransformer: state => ""
  });

  middleware.push(logger);
}

const store = createStore(persistedReducer, applyMiddleware(...middleware));
const persistor = persistStore(store);

// If we are running a dev build expose store to global state
if (process.env.NODE_ENV !== "production") {
  // @ts-ignore
  window.__store = store;
  // @ts-ignore
  window.__clear = persistor.purge;
}

// Start root saga
sagaMiddleware.run(rootSaga, store.dispatch);

export default store;
export { persistor };

import { createStore, applyMiddleware } from "redux";
import createSagaMiddleware from "redux-saga";
import logger from "redux-logger";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-community/async-storage";
import autoMergeLevel2 from "redux-persist/es/stateReconciler/autoMergeLevel2";

import rootReducer from "./reducers";

// Redux persist
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  stateReconciler: autoMergeLevel2,
  blacklist: ["session"]
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Apply logger and thunk
const sagaMiddleware = createSagaMiddleware();
let middleware = [sagaMiddleware];
if (process.env.NODE_ENV !== "production") {
  middleware = [...middleware, logger];
}

const store = createStore(persistedReducer, applyMiddleware(...middleware));
const persistor = persistStore(store);

export default store;
export { persistor, sagaMiddleware };

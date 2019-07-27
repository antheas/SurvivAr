import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import logger from "redux-logger";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import autoMergeLevel2 from "redux-persist/es/stateReconciler/autoMergeLevel2";

import rootReducer from "./reducers";

// Redux persist
const persistConfig = {
  key: "root",
  storage,
  stateReconciler: autoMergeLevel2
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Apply logger and thunk
let middleware = { thunk };
if (process.env.NODE_ENV !== "production") {
  middleware = { ...middleware, logger };
}

const store = createStore(persistedReducer, applyMiddleware(...middleware));
const persistor = persistStore(store);

export default store;
export { persistor };

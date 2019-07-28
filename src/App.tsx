import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import store, { persistor } from "./store";
import SplashScreen from "./screens/SplashScreen";
import MainScreen from "./screens/MainScreen/MainScreen";

const App = (): React.FunctionComponent => {
  return (
    <Provider store={store}>
      <PersistGate loading={<SplashScreen />} persistor={persistor}>
        <MainScreen />
      </PersistGate>
    </Provider>
  );
};

export default App;

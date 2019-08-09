import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import RouteStack from "./Routes";
import rootSaga from "./sagas";
import store, { persistor, sagaMiddleware } from "./store";

class App extends React.Component<void> {
  public render() {
    return (
      <Provider store={store}>
        <PersistGate
          persistor={persistor}
          onBeforeLift={() => sagaMiddleware.run(rootSaga)}
        >
          <RouteStack />
        </PersistGate>
      </Provider>
    );
  }
}

export default App;

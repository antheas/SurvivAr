import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { JSXElement } from "@babel/types";

import store, { persistor, sagaMiddleware } from "./store";
import RouteStack from "./Routes";
import { helloSaga } from "./sagas";

sagaMiddleware.run(helloSaga);

class App extends React.Component<void> {
  public render(): JSXElement {
    return (
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <RouteStack />
        </PersistGate>
      </Provider>
    );
  }
}

export default App;

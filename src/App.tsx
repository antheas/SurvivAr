import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import store, { persistor } from "./store";
import RouteStack from "./Routes";
import { JSXElement } from "@babel/types";

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

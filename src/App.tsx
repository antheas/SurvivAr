import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import RouteStack from "./Routes";
import store, { persistor } from "./store";

class App extends React.Component<void> {
  public render() {
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

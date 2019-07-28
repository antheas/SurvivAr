import React from "react";
import { Provider } from "react-redux";
import { View } from "react-native";
import { PersistGate } from "redux-persist/integration/react";

import store, { persistor } from "./store";
import RootStack from "./Routes";
import StorageLoader from "./screens/StorageLoader";

const App = (): React.FunctionComponent => {
  return (
    <Provider store={store}>
      <PersistGate loading={<StorageLoader />} persistor={persistor}>
        <View style={{ flex: 1 } /* eslint-disable-line */}>
          <RootStack />
        </View>
      </PersistGate>
    </Provider>
  );
};

export default App;

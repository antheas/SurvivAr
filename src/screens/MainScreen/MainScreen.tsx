import React from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { JSXElement } from "@babel/types";
import { checkLocationPermission } from "../../utils/Permissions";
import * as Theme from "../../utils/Theme";
import Loader from "./Loader";
const styles = StyleSheet.create({
  container: {
    ...Theme.component.container.background,
    alignItems: "center",
    justifyContent: "flex-start",
    alignContent: "stretch"
  },
  map: {
    flex: 5,
    width: "100%"
  },
  ui: {
    flex: 1,
    width: "100%"
  }
});

class MainScreen extends React.Component {
  public componentDidMount(): void {
    //checkLocationPermission().then((res): void => {});
  }

  public render(): JSXElement {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          translucent={true}
          backgroundColor={"transparent"}
        />
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          customMapStyle={Theme.mapStyle}
          initialRegion={{
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421
          }}
        />
        <View style={styles.ui}>
          <Loader />
        </View>
      </View>
    );
  }
}

export default MainScreen;

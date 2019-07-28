import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import MapView from "react-native-maps";
import { JSXElement } from "@babel/types";
import { checkLocationPermission } from "../utils/Permissions.android";

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-start",
    alignContent: "stretch"
  },
  map: {
    flex: 3,
    width: Dimensions.get("window").width,
    height: Math.round(Dimensions.get("window").height / 2)
  },
  status: {
    flex: 1
  }
});

class MainScreen extends React.Component {
  public componentDidMount(): void {
    checkLocationPermission().then((res): void => {});
  }

  public render(): JSXElement {
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421
          }}
        />
        <View style={styles.status}>
          <Text>Status</Text>
        </View>
      </View>
    );
  }
}

export default MainScreen;

import React, { Component } from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import NavigationScreenProp from "react-navigation";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { connect } from "react-redux";
import { JSXElement } from "@babel/types";

import * as Theme from "../../utils/Theme";
import Loader from "./Loader";
import { checkLocationPermission } from "../../location/Permissions";
import LocationManager from "../../location/LocationManager";
import { State } from "../../store/types";
import { updateNavigation } from "../../store/actions";

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

export interface MainProps {
  navigation: NavigationScreenProp;
  position: NavigationState;
  updatePosition: (pos: NavigationState) => void;
}

class MainScreen extends Component<MainProps> {
  public componentDidMount(): void {
    checkLocationPermission().then((res): void => {
      if (!res) {
        this.props.navigation.navigate("Intro");
      } else {
        LocationManager.startJsCallbacks(this.props.updatePosition);
      }
    });
  }

  public componentWillUnmount(): void {
    LocationManager.stopJsCallbacks();
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
          region={{
            latitude: this.props.position.currentLocation.lat,
            longitude: this.props.position.currentLocation.lon,
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

const mapStateToProps = ({ navigation }: State): { Navigation } => ({
  position: navigation
});

const mapDispatchToProps = (dispatch): (() => void)[] => {
  return {
    updatePosition: (nav: NavigationState): void =>
      dispatch(updateNavigation(nav))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainScreen);

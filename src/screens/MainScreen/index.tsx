import React, { Component } from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import NavigationScreenProp from "react-navigation";
import { connect } from "react-redux";
import { JSXElement } from "@babel/types";

import * as Theme from "../../utils/Theme";
import Loader, { LoadStage } from "./Loader";
import { checkLocationPermission } from "../../location/Permissions";
import LocationManager from "../../location/LocationManager";
import { State } from "../../store/types";
import { updatePosition } from "../../store/actions";
import Map from "./Map";

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
        <View style={styles.map}>
          <Map position={this.props.position} />
        </View>
        <View style={styles.ui}>
          <Loader stage={LoadStage.LOCATING} />
        </View>
      </View>
    );
  }
}

const mapStateToProps = ({ position }: State): { PositionState } => ({
  position: position
});

const mapDispatchToProps = (dispatch): (() => void)[] => {
  return {
    updatePosition: (pos: PositionState): void => dispatch(updatePosition(pos))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainScreen);

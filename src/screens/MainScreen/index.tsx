import React, { Component } from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import NavigationScreenProp from "react-navigation";
import { connect } from "react-redux";
import { JSXElement } from "@babel/types";

import * as Theme from "../../utils/Theme";
import Loader from "./Loader";
import { checkLocationPermission } from "../../location/Permissions";
import LocationManager from "../../location/LocationManager";
import { State, StateType } from "../../store/types";
import { updatePosition, retryFetch } from "../../store/actions";
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
  position: PositionState;
  state: StateType;
  updatePosition: (pos: PositionState) => void;
  retry: () => void;
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
          <Loader state={this.props.state} retry={this.props.retry} />
        </View>
      </View>
    );
  }
}

const mapStateToProps = ({
  position,
  session: { state }
}: State): { position: PositionState; state: StateType } => {
  return { position, state };
};

const mapDispatchToProps = (
  dispatch
): {
  updatePosition: (pos: PositionState) => void;
  retry: () => void;
} => {
  return {
    updatePosition: (pos: PositionState): void => dispatch(updatePosition(pos)),
    retry: (): void => dispatch(retryFetch())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainScreen);

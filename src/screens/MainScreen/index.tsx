import React, { Component } from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import NavigationScreenProp from "react-navigation";
import { connect } from "react-redux";
import { JSXElement } from "@babel/types";

import * as Theme from "../../utils/Theme";
import Loader from "./Loader";
import { checkLocationPermission } from "../../location/Permissions";
import LocationManager from "../../location/LocationManager";
import {
  State,
  StateType,
  QrPoint,
  WaitPoint,
  AreaPoint
} from "../../store/types";
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

interface MainStateProps {
  position: PositionState;
  state: StateType;
  areas: AreaPoint[];
  currentArea?: AreaPoint;
  currentPoint?: QrPoint | WaitPoint;
}

interface MainDispatchProps {
  updatePosition: (pos: PositionState) => void;
  retry: () => void;
}

export interface MainProps extends MainStateProps, MainDispatchProps {
  navigation: NavigationScreenProp;
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
          <Map
            position={this.props.position}
            areas={this.props.areas}
            currentArea={this.props.currentArea}
            currentPoint={this.props.currentPoint}
          />
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
  points,
  session: { state, currentAreaId, currentPointId }
}: State): MainStateProps => {
  let areas = points.areas;
  let currentArea = currentAreaId
    ? areas.find((a): boolean => a.id === currentAreaId)
    : undefined;
  let currentPoint =
    currentPointId && currentArea
      ? currentArea.children.find((p): boolean => p.id === currentPointId)
      : undefined;

  return { position, state, areas, currentArea, currentPoint };
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

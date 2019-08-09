import React, { Component, ReactElement } from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import { NavigationScreenProps, NavigationParams } from "react-navigation";
import { connect } from "react-redux";
import * as Theme from "../../utils/Theme";
import Loader from "./Loader";
import { checkLocationPermission } from "../../location/Permissions";
import LocationManager from "../../location/LocationManager";
import {
  State,
  StateType,
  AreaPoint,
  PositionState,
  isWaitPoint,
  isCollectPoint
} from "../../store/types";
import {
  updatePosition,
  retryFetch,
  setForegroundFetch
} from "../../store/actions";
import Map from "./Map";
import {
  ExtendedWaitPoint,
  ExtendedPoint,
  ExtendedCollectPoint
} from "./ExtendedPoint";
import PointCardList from "./PointCardList";

const styles = StyleSheet.create({
  container: {
    ...Theme.component.container.background,
    alignItems: "center",
    justifyContent: "flex-start",
    alignContent: "stretch"
  },
  map: {
    flex: 10,
    width: "100%"
  },
  loader: {
    flex: 2,
    width: "100%"
  },
  cards: {
    flex: 3,
    width: "100%"
  }
});

interface MainStateProps {
  position: PositionState;
  state: StateType;
  areas: AreaPoint[];
  currentArea?: AreaPoint;
  points: ExtendedPoint[];
}

interface MainDispatchProps {
  updatePosition: (pos: PositionState) => void;
  setForegroundFetch: (state: boolean) => void;
  retry: () => void;
}

export interface MainProps extends MainStateProps, MainDispatchProps {
  navigation: NavigationParams;
}

class MainScreen extends Component<MainProps> {
  public componentDidMount(): void {
    checkLocationPermission().then((res): void => {
      if (!res) {
        this.props.navigation.navigate("Intro");
      } else {
        this.props.setForegroundFetch(true);
        LocationManager.startJsCallbacks(this.props.updatePosition);
      }
    });
  }

  public componentWillUnmount(): void {
    LocationManager.stopJsCallbacks();
    this.props.setForegroundFetch(false);
  }

  public render(): ReactElement {
    const loaderActive: boolean = this.props.state !== StateType.TRACKING;

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
            points={this.props.points}
          />
        </View>
        <View style={loaderActive ? styles.loader : styles.cards}>
          {loaderActive ? (
            <Loader state={this.props.state} retry={this.props.retry} />
          ) : (
            <PointCardList points={this.props.points} />
          )}
        </View>
      </View>
    );
  }
}

/**
 * Maps normalized state of redux model to objects.
 */
const mapStateToProps = ({
  position,
  points,
  progress: { points: progressPoints },
  session: {
    state,
    pointMetadata: { currentAreaId, sortedPoints }
  }
}: State): MainStateProps => {
  const areas = points.areas;
  const currentArea = currentAreaId
    ? areas.find((a): boolean => a.id === currentAreaId)
    : undefined;

  let extendedPoints: ExtendedPoint[] = [];
  if (currentArea) {
    const points = currentArea.children;

    extendedPoints = sortedPoints.map(
      (ps): ExtendedPoint => {
        const p = points.find((p): boolean => p.id === ps.pointId);
        const progress = progressPoints.get(ps.pointId);

        if (isWaitPoint(p)) {
          return new ExtendedWaitPoint(p, ps.distance, progress);
        } else if (isCollectPoint(p)) {
          return new ExtendedCollectPoint(p, ps.distance, progressPoints);
        } else {
          return new ExtendedPoint(p, ps.distance);
        }
      }
    );
  }

  return { position, state, areas, currentArea, points: extendedPoints };
};

const mapDispatchToProps = (dispatch): MainDispatchProps => {
  return {
    updatePosition: (pos: PositionState): void => dispatch(updatePosition(pos)),
    setForegroundFetch: (state): void => dispatch(setForegroundFetch(state)),
    retry: (): void => dispatch(retryFetch())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainScreen);

import React, { Component, ReactElement } from "react";
import {
  StatusBar,
  StyleSheet,
  View,
  AppState,
  AppStateStatus
} from "react-native";
import { NavigationParams } from "react-navigation";
import { connect } from "react-redux";
import LocationManager from "../../location/LocationManager";
import { checkLocationPermission } from "../../location/Permissions";
import {
  retryFetch,
  setForegroundFetch,
  updatePosition,
  appLaunchCompleted
} from "../../store/actions";
import {
  AreaPoint,
  isCollectPoint,
  isWaitPoint,
  PositionState,
  State,
  StateType
} from "../../store/types";
import * as Theme from "../../utils/Theme";
import { ExtendedCollectPoint } from "../model/ExtendedCollectPoint";
import { ExtendedPoint } from "../model/ExtendedPoint";
import { ExtendedWaitPoint } from "../model/ExtendedWaitPoint";
import Loader from "./Loader";
import Map from "./Map";
import PointCardList from "./PointCardList";
import { Dispatch } from "redux";

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
  appLaunchCompleted: () => void;
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
        this.props.appLaunchCompleted();
        AppState.addEventListener("change", this.stateListenerCallback);
      }
    });
  }

  public componentWillUnmount() {
    AppState.removeEventListener("change", this.stateListenerCallback);
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
            points={this.props.points}
            headingSupport={false}
            syncEnabled={false}
            loading={loaderActive}
            onSyncToggled={() => {}}
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

  private stateListenerCallback = (state: AppStateStatus) => {
    this.props.setForegroundFetch(state === "active");
  };
}

/**
 * Maps normalized state of redux model to objects.
 */
const mapStateToProps = ({
  navigation: { position },
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
    const areaPoints = currentArea.children;

    extendedPoints = sortedPoints.map(
      (ps): ExtendedPoint => {
        const p = areaPoints.find((c): boolean => c.id === ps.pointId);
        const progress = progressPoints[ps.pointId];

        if (!p) throw new Error(`Point with id: ${ps.pointId} not found!`);

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

const mapDispatchToProps = (dispatch: Dispatch): MainDispatchProps => {
  return {
    updatePosition: (pos: PositionState) => dispatch(updatePosition(pos)),
    appLaunchCompleted: () => dispatch(appLaunchCompleted()),
    setForegroundFetch: (state: boolean) => dispatch(setForegroundFetch(state)),
    retry: () => dispatch(retryFetch())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainScreen);

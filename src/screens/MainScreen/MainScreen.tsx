import React, { Component, ReactElement } from "react";
import {
  AppState,
  AppStateStatus,
  StatusBar,
  StyleSheet,
  View
} from "react-native";
import { NavigationParams } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { checkLocationPermission } from "../../location/Permissions";
import {
  appLaunchCompleted,
  retryFetch,
  setForegroundFetch,
  updatePosition
} from "../../store/actions";
import { ExtendedPoint } from "../../store/model/ExtendedPoint";
import {
  selectAppState,
  selectAreas,
  selectCurrentArea,
  selectExtendedPoints,
  selectPosition
} from "../../store/selectors";
import { AreaPoint, PositionState, State, StateType } from "../../store/types";
import * as Theme from "../../utils/Theme";
import Loader from "./Loader";
import Map from "./Map";
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
const mapStateToProps = (state: State): MainStateProps => {
  return {
    position: selectPosition(state),
    state: selectAppState(state),
    areas: selectAreas(state),
    currentArea: selectCurrentArea(state),
    points: selectExtendedPoints(state)
  };
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

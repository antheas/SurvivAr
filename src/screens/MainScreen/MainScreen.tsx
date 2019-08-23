import React, { Component, ReactElement } from "react";
import {
  AppState,
  AppStateStatus,
  StatusBar,
  StyleSheet,
  View
} from "react-native";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { checkLocationPermission } from "../../location/Permissions";
import {
  appLaunchCompleted,
  retryFetch,
  setForegroundFetch
} from "../../store/actions";
import {
  selectAppState,
  selectHasCompletedPoints
} from "../../store/selectors";
import { State, StateType } from "../../store/types";
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
    flexShrink: 0,
    flex: 10,
    width: "100%"
  },
  loader: {
    flexShrink: 0,
    flex: 3,
    width: "100%"
  },
  cards: {
    flexShrink: 0,
    flex: 3,
    width: "100%"
  }
});

interface MainStateProps {
  state: StateType;
  hasCompletedPoints: boolean;
}

interface MainDispatchProps {
  appLaunchCompleted: () => void;
  setForegroundFetch: (state: boolean) => void;
  retry: () => void;
}

export interface IMainProps extends MainStateProps, MainDispatchProps {
  navigation: NavigationScreenProp<any>;
}

export interface IMainState {
  gotoPointId: string | null;
  selectedPointId: string | null;
  hasOpenedModal: boolean;
}

class MainScreen extends Component<IMainProps, IMainState> {
  public state = {
    gotoPointId: null,
    selectedPointId: null,
    hasOpenedModal: false
  };

  public componentDidMount(): void {
    checkLocationPermission().then((res): void => {
      if (!res) {
        this.props.navigation.navigate("Intro");
      } else {
        this.props.appLaunchCompleted();
        AppState.addEventListener("change", this.stateListenerCallback);
        // Call callback once since app is already active
        this.stateListenerCallback("active");
      }
    });
  }

  public componentDidUpdate() {
    if (this.props.hasCompletedPoints && !this.state.hasOpenedModal) {
      this.props.navigation.push("Completed");
      this.setState({ hasOpenedModal: true });
    }
    if (!this.props.hasCompletedPoints && this.state.hasOpenedModal)
      this.setState({ hasOpenedModal: false });
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
            selectedPointId={this.state.selectedPointId}
            onMarkerPressed={id => this.setState({ gotoPointId: id })}
          />
        </View>
        <View style={loaderActive ? styles.loader : styles.cards}>
          {loaderActive ? (
            <Loader state={this.props.state} retry={this.props.retry} />
          ) : (
            <PointCardList
              gotoPointId={this.state.gotoPointId}
              resetGotoPoint={() => this.setState({ gotoPointId: null })}
              onPoint={id => this.setState({ selectedPointId: id })}
              pointOpened={this.pointOpened}
            />
          )}
        </View>
      </View>
    );
  }

  private pointOpened = (id: string) => {
    this.props.navigation.push("CollectPoint", { id });
  };

  private stateListenerCallback = (state: AppStateStatus) => {
    this.props.setForegroundFetch(state === "active");
  };
}

/**
 * Maps normalized state of redux model to objects.
 */
const mapStateToProps = (state: State): MainStateProps => {
  return {
    state: selectAppState(state),
    hasCompletedPoints: selectHasCompletedPoints(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch): MainDispatchProps => {
  return {
    appLaunchCompleted: () => dispatch(appLaunchCompleted()),
    setForegroundFetch: (state: boolean) => dispatch(setForegroundFetch(state)),
    retry: () => dispatch(retryFetch())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainScreen);

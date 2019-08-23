import React from "react";
import { Platform } from "react-native";
import SplashScreen from "react-native-splash-screen";
import {
  createAppContainer,
  createStackNavigator,
  createSwitchNavigator
} from "react-navigation";
import CompletedModal from "./screens/CompletedModal";
import IntroScreen from "./screens/IntroScreen";
import MainScreen from "./screens/MainScreen";
import CollectScreen from "./screens/CollectScreen";

const MainScreenWithModalStack = createStackNavigator(
  {
    Main: {
      screen: MainScreen
    },
    Completed: {
      screen: CompletedModal
    }
  },
  {
    initialRouteName: "Main",
    headerMode: "none",
    transparentCard: true,
    cardStyle: {
      // makes transparentCard work for android
      opacity: 1.0
    }
  }
);

const MainStack = createStackNavigator(
  {
    MainScreenWithModal: {
      screen: MainScreenWithModalStack
    },
    CollectPoint: {
      screen: CollectScreen
    }
  },
  {
    initialRouteName: "MainScreenWithModal",
    headerMode: "none"
  }
);

const AppContainer = createAppContainer(
  createSwitchNavigator(
    {
      Intro: {
        screen: IntroScreen
      },
      MainStack: {
        screen: MainStack
      }
    },
    {
      initialRouteName: "MainStack",
      backBehavior: "none"
    }
  )
);

export default class RootStack extends React.Component {
  public componentDidMount(): void {
    // TODO: Implement Splash Screen for iOS.
    if (Platform.OS !== "android") return;
    SplashScreen.hide();
  }

  public render() {
    return <AppContainer />;
  }
}

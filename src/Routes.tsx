import React from "react";
import { Platform } from "react-native";
import SplashScreen from "react-native-splash-screen";
import { createAppContainer, createSwitchNavigator } from "react-navigation";
import IntroScreen from "./screens/IntroScreen";
import MainScreen from "./screens/MainScreen";

const AppContainer = createAppContainer(
  createSwitchNavigator(
    {
      Intro: IntroScreen,
      Main: MainScreen
    },
    {
      initialRouteName: "Main"
    }
  )
);

export default class SplashController extends React.Component {
  public componentDidMount(): void {
    // TODO: Implement Splash Screen for iOS.
    if (Platform.OS !== "android") return;
    SplashScreen.hide();
  }

  public render() {
    return <AppContainer />;
  }
}

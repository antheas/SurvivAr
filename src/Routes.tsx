import React from "react";
import { createAppContainer, createSwitchNavigator } from "react-navigation";
import { Platform } from "react-native";
import SplashScreen from "react-native-splash-screen";
import { JSXElement } from "@babel/types";

import MainScreen from "./screens/MainScreen";

const AppContainer = createAppContainer(
  createSwitchNavigator(
    {
      Main: MainScreen
    },
    {
      initialRouteName: "Main"
    }
  )
);

export default class SplashController extends React.Component<void> {
  public componentDidMount(): void {
    // TODO: Implement Splash Screen for android.
    if (Platform.OS !== "android") return;
    SplashScreen.hide();
  }

  public render(): JSXElement {
    return <AppContainer />;
  }
}

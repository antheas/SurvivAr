import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

interface BackgroundProps {
  children?: JSX.Element;
  style?: StyleProp<ViewStyle>;
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexGrow: 1,
    justifyContent: "center"
  }
});

const SplashScreen = (props: BackgroundProps): React.FunctionComponent => {
  return <View style={[styles.container, props.style]}>{props.children}</View>;
};

export default SplashScreen;

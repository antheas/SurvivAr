import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import * as Theme from "../../utils/Theme";
import { Spacer } from "../../utils/Components";

const styles = StyleSheet.create({
  status: {
    ...Theme.component.container.background,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  text: {
    ...Theme.text.size.normal,
    ...Theme.text.color.primary
  }
});

export enum LoadStage {
  STARTUP,
  LOCATING,
  UPDATING
}

export const Loader = ({ stage }: { stage: LoadStage }): JSXElement => {
  let loadString: string;
  switch (stage) {
    case LoadStage.STARTUP:
      loadString = "Starting...";
      break;
    case LoadStage.LOCATING:
      loadString = "Locating User...";
      break;
    default:
      //UPDATING
      loadString = "Loading Places...";
      break;
  }

  return (
    <View style={styles.status}>
      <ActivityIndicator size="large" color={Theme.colors.primaryText} />
      <Spacer med horz />
      <Text style={styles.text}>{loadString}</Text>
    </View>
  );
};

export default Loader;

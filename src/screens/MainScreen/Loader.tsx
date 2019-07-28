import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import * as Theme from "../../utils/Theme";
import Icon from "react-native-vector-icons/FontAwesome";
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

export const Loader = (): JSXElement => {
  return (
    <View style={styles.status}>
      <ActivityIndicator size="large" color={Theme.colors.primaryText} />
      <Spacer med horz />
      <Text style={styles.text}>Locating User...</Text>
    </View>
  );
};

export default Loader;

import React, { ReactElement } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Button
} from "react-native";
import * as Theme from "../../utils/Theme";
import { Spacer } from "../../utils/Components";
import { StateType } from "../../store/types";

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

export const Loader = ({
  state,
  retry
}: {
  state: StateType;
  retry: () => void;
}): ReactElement => {
  let loadString: string;
  switch (state) {
    case StateType.STARTUP:
      loadString = "Starting...";
      break;
    case StateType.WAITING_FOR_FINE_LOCATION:
      loadString = "Locating User...";
      break;
    case StateType.RETRIEVING_DATA:
      loadString = "Retrieving Markers...";
      break;
    default:
      loadString = "state: " + state;
  }

  if (state !== StateType.LOADING_ERROR) {
    return (
      <View style={styles.status}>
        <ActivityIndicator size="large" color={Theme.colors.primaryText} />
        <Spacer medium horz />
        <Text style={styles.text}>{loadString}</Text>
      </View>
    );
  } else {
    return (
      <View style={styles.status}>
        <Text style={styles.text}>Updating failed...</Text>
        <Spacer large horz />
        <Button title="Retry" color={Theme.colors.accentDark} onPress={retry} />
      </View>
    );
  }
};

export default Loader;

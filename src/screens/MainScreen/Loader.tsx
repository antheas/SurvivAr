import React, { Fragment, ReactElement } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity
} from "react-native";
import { StateType } from "../../store/types";
import { Spacer } from "../../utils/Components";
import * as Theme from "../../utils/Theme";

const styles = StyleSheet.create({
  status: {
    ...Theme.component.container.background,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  text: {
    ...Theme.text.size.large,
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
    case StateType.LOADING_ERROR:
      loadString = "Updating failed... Retry";
      break;
    default:
      loadString = "state: " + state;
  }

  return (
    <TouchableOpacity style={styles.status} onPress={retry}>
      {state !== StateType.LOADING_ERROR && (
        <Fragment>
          <ActivityIndicator size="large" color={Theme.colors.primaryText} />
          <Spacer medium horz />
        </Fragment>
      )}
      <Text style={styles.text}>{loadString}</Text>
    </TouchableOpacity>
  );
};

export default Loader;

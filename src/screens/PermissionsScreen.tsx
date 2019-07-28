import React from "react";
import { View, Dimensions, StyleSheet, Text } from "react-native";
import {
  checkLocationPermission,
  requestLocationPermission
} from "../utils/Permissions.android";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  desc: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height / 3,
    textAlign: "center"
  }
});

class PermissionsScreen extends React.Component<{
  navigation: NavigationScreenProp;
}> {
  public componentDidMount(): void {
    requestLocationPermission().then((): void =>
      this.props.navigation.navigate("Loader")
    );
  }

  public render(): void {
    return (
      <View style={styles.container}>
        <View style={styles.desc}>
          <Text>In order to know ... </Text>
        </View>
      </View>
    );
  }
}

export default PermissionsScreen;

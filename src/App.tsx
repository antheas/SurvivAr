import React, { Fragment } from "react";
import {
  Text,
  View,
  Image,
  StatusBar,
  StyleSheet,
  Dimensions
} from "react-native";

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width
  },
  title: {
    paddingVertical: 60,
    fontWeight: "bold",
    fontSize: 30,
    textAlign: "center"
  },
  img: {
    flex: 1,
    width: null,
    height: null
  }
});

const App = (): React.FunctionComponent => {
  return (
    <Fragment>
      <StatusBar barStyle="light-content" />

      <View style={styles.container}>
        <Text style={styles.title}>Very Nice Meme</Text>

        <Image
          resizeMode="cover"
          source={require("./img/meme.jpg")}
          style={styles.img}
        />
      </View>
    </Fragment>
  );
};

export default App;

import React, { ReactElement } from "react";
import { Button, Image, StatusBar, StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  NavigationParams,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";
import { requestLocationPermission } from "../location/Permissions";
import { Spacer } from "../utils/Components";
import * as Theme from "../utils/Theme";

interface IntroProps {
  navigation: NavigationScreenProp<NavigationState, NavigationParams>;
}

const handlePermissions = (navigate: (screen: string) => void): void => {
  requestLocationPermission().then((state): void => {
    if (state) {
      navigate("Main");
    }
  });
};

const s = StyleSheet.create({
  container: {
    ...Theme.component.container.accented,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center"
  },
  logo: {
    flex: 3,
    width: "70%"
  },
  textContainer: {
    flex: 5,
    width: "80%",
    justifyContent: "flex-start",
    textAlign: "justify"
  },
  text: {
    width: "100%",
    ...Theme.text.color.normal,
    ...Theme.text.size.small
  },
  header: {
    width: "100%",
    ...Theme.text.color.dark,
    ...Theme.text.size.header
  },
  imgContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  img: {
    width: "25%"
  },
  imgText: {
    flex: 3,
    textAlign: "left",
    ...Theme.text.color.normal,
    ...Theme.text.size.mini
  },
  button: {
    width: "70%"
  }
});

const iconSize = Theme.normalize(70);

const IntroScreen = ({
  navigation: { navigate }
}: IntroProps): ReactElement => {
  return (
    <View style={s.container}>
      <StatusBar
        barStyle="dark-content"
        translucent={true}
        backgroundColor={"transparent"}
      />
      <Spacer large />
      <Image
        source={require("../img/accent_splash.png")}
        style={s.logo}
        resizeMode="contain"
      />
      <Spacer large />
      <View style={s.textContainer}>
        <Text style={s.header}>Introduction</Text>
        <Text style={s.text}>
          Welcome to the world of SurvivAR. Collect resources while traveling
          through the real world and try to survive the impending apocalypse.
        </Text>
        <Spacer small />
        <View style={s.imgContainer}>
          <Icon
            name="pharmacy"
            color={Theme.colors.primary}
            style={s.img}
            size={iconSize}
          />
          <Spacer horz medium />
          <Text style={s.imgText}>
            Pharmacies contain essential medicines for survival and can be
            visited by following the marker on the left.
          </Text>
        </View>
        <Spacer tiny />
        <View style={s.imgContainer}>
          <Icon
            name="hotel"
            color={Theme.colors.primary}
            style={s.img}
            size={iconSize}
          />
          <Spacer horz medium />
          <Text style={s.imgText}>
            Bases that can be used for cover are marked by the bed icon
            (hotels).
          </Text>
        </View>
      </View>
      <Spacer small />
      <View style={s.button}>
        <Button
          title="Begin"
          color={Theme.colors.primary}
          onPress={(): void => handlePermissions(navigate)}
        />
      </View>
      <Spacer medium />
    </View>
  );
};

export default IntroScreen;

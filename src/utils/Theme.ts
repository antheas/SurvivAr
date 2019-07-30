import { Dimensions, Platform, PixelRatio, StyleSheet } from "react-native";

// https://stackoverflow.com/questions/33628677/react-native-responsive-font-size
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// based on iphone 5s's scale
const scale = SCREEN_WIDTH / 320;

export function normalize(size): number {
  const newSize = size * scale;
  if (Platform.OS === "ios") {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
}

// Don't forget to update colors.xml in android!
export const colors = {
  primary: "#b71c1c",
  primaryLight: "#f05545",
  primaryDark: "#7f0000",

  accent: "#f5f5f5",
  accentLight: "#ffffff",
  accentDark: "#c2c2c2",

  textDark: "#131516",
  text: "#373D3F",
  textLight: "#707C80",
  primaryText: "#ffffff",
  accentText: "#ffffff",

  white: "#ffffff"
};

export const text = {
  size: StyleSheet.create({
    mini: {
      fontSize: normalize(12)
    },
    small: {
      fontSize: normalize(15)
    },
    medium: {
      fontSize: normalize(17)
    },
    large: {
      fontSize: normalize(20)
    },
    xlarge: {
      fontSize: normalize(24)
    },
    normal: {
      fontSize: normalize(17)
    },
    header: {
      fontSize: normalize(20)
    }
  }),
  color: StyleSheet.create({
    primary: {
      color: colors.primaryText
    },
    accent: {
      color: colors.accentText
    },
    normal: {
      color: colors.text
    },
    light: {
      color: colors.textLight
    },
    dark: {
      color: colors.textDark
    }
  })
};

export const component = {
  container: StyleSheet.create({
    background: {
      flex: 1,
      backgroundColor: colors.primary
    },
    foreground: {
      flex: 1,
      backgroundColor: colors.white
    },
    accented: {
      flex: 1,
      backgroundColor: colors.accent
    }
  })
};

export const map = {
  circle: {
    user: {
      strokeWidth: 2,
      strokeColor: colors.primaryDark + "66",
      fillColor: colors.primary + "66"
    }
  },
  marker: {
    user: {
      icon: {
        name: "circle-slice-8",
        color: colors.primary,
        size: 30
      },
      marker: {
        anchor: { x: 0.5, y: 0.5 }
      }
    }
  }
};

import MapStyle from "./MapStyle";
export const mapStyle = MapStyle.white;

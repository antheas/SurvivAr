import React from "react";
import { View } from "react-native";
import * as Theme from "./Theme";
import { JSXElement } from "@babel/types";

export interface SpacerProps {
  small;
  medium;
  large;
  horz;
}

export const Spacer = (props: SpacerProps): JSXElement => {
  let size = 0;

  if (props.small) {
    size = Theme.normalize(10);
  } else if (props.med) {
    size = Theme.normalize(15);
  } else {
    size = Theme.normalize(25);
  }

  return (
    <View
      style={props.horz ? { marginStart: size } : { marginTop: size }}
    ></View>
  );
};

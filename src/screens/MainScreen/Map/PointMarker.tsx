import React, { Fragment } from "react";
import { Circle, Marker } from "react-native-maps";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { ExtendedPoint } from "../../../store/model/ExtendedPoint";
import * as Theme from "../../../utils/Theme";
import { convertCoords, isPointClose } from "./Utils";

const PointMarker = (point: ExtendedPoint) => {
  let theme;
  let circle;
  if (point.completed) {
    theme = Theme.map.point.completed;
  } else if (point.userWithin) {
    theme = Theme.map.point.active;
    circle = theme.circle;
  } else if (isPointClose(point)) {
    theme = Theme.map.point.nearby;
    circle = theme.circle;
  } else {
    theme = Theme.map.point.default;
  }

  const coords = convertCoords(point.loc);

  return (
    <Fragment key={point.id}>
      {circle ? (
        <Circle center={coords} radius={point.radius} {...circle} />
      ) : null}
      <Marker coordinate={coords} tracksViewChanges={false} {...theme.marker}>
        <Icon name={point.icon} {...theme.icon} />
      </Marker>
    </Fragment>
  );
};

export default PointMarker;

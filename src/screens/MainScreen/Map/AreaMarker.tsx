import React, { Fragment } from "react";
import { Circle, Marker } from "react-native-maps";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as Theme from "../../../utils/Theme";
import { convertCoords } from "./Utils";
import { AreaPoint } from "../../../store/types";

const AreaMarker = (a: AreaPoint) => {
  const coords = convertCoords(a.loc);
  return (
    <Fragment key={a.id}>
      <Circle center={coords} radius={a.radius} {...Theme.map.area.circle} />
      <Marker
        coordinate={coords}
        tracksViewChanges={false}
        {...Theme.map.area.marker}
      >
        <Icon {...Theme.map.area.icon} />
      </Marker>
    </Fragment>
  );
};

export default AreaMarker;

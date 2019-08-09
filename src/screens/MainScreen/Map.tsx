import React, { Fragment, ReactElement } from "react";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { AreaPoint, Location, PositionState } from "../../store/types";
import * as Theme from "../../utils/Theme";
import { ExtendedPoint } from "../model/ExtendedPoint";

const NEARBY_RATIO = 3;

function convertCoords(coords: Location) {
  return {
    latitude: coords.lat,
    longitude: coords.lon
  };
}

const AreaMarker = (a: AreaPoint): ReactElement => {
  const coords = convertCoords(a.loc);
  return (
    <Fragment key={a.id}>
      <Circle
        center={coords}
        radius={a.radius}
        tracksViewChanges={false}
        {...Theme.map.area.circle}
      />
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

const UserMarker = ({ accuracy, userCoords }): ReactElement => {
  const coords = convertCoords(userCoords);

  return (
    <Fragment>
      {accuracy > 20 ? (
        <Circle center={coords} radius={accuracy} {...Theme.map.user.circle} />
      ) : null}
      <Marker coordinate={coords} {...Theme.map.user.marker}>
        <Icon {...Theme.map.user.icon} />
      </Marker>
    </Fragment>
  );
};

const PointMarker = (point: ExtendedPoint) => {
  let theme;
  if (point.completed) {
    theme = Theme.map.point.completed;
  } else if (point.userWithin) {
    theme = Theme.map.point.active;
  } else if (point.distance <= NEARBY_RATIO * point.radius) {
    theme = Theme.map.point.nearby;
  } else {
    theme = Theme.map.point.default;
  }

  const hasCircle = typeof theme.circle !== "undefined";
  const coords = convertCoords(point.loc);

  return (
    <Fragment key={point.id}>
      {hasCircle ? (
        <Circle
          center={coords}
          radius={point.radius}
          tracksViewChanges={false}
          {...theme.circle}
        />
      ) : null}
      <Marker coordinate={coords} tracksViewChanges={false} {...theme.marker}>
        <Icon name={point.icon} {...theme.icon} />
      </Marker>
    </Fragment>
  );
};

export interface MapInterface {
  position: PositionState;
  areas: AreaPoint[];
  currentArea?: AreaPoint;
  points: ExtendedPoint[]; // Sorted by distance
}

export default class Map extends React.Component<MapInterface> {
  public render() {
    const pos = this.props.position;
    const userCoords = convertCoords(pos.coords);

    return (
      <MapView
        // eslint-disable-next-line
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        customMapStyle={Theme.mapStyle}
        region={{
          ...userCoords,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01
        }}
      >
        {/* Area Points */}
        {this.props.areas.map(AreaMarker)}
        {/* Points */}
        {this.props.points.map(PointMarker)}
        {/* User Marker */}
        <UserMarker accuracy={pos.accuracy} userCoords={pos.coords} />
      </MapView>
    );
  }
}

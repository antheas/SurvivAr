import React, { Fragment, ReactElement } from "react";
import MapView, {
  Circle,
  Marker,
  PROVIDER_GOOGLE,
  Region,
  AnimatedRegion
} from "react-native-maps";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { AreaPoint, Location, PositionState } from "../../store/types";
import * as Theme from "../../utils/Theme";
import { ExtendedPoint } from "../model/ExtendedPoint";
import { Platform } from "react-native";

const NEARBY_RATIO = 3;
const ANIMATION_DELAY = 1000;
const GREECE_COORDS: Region = {
  latitude: 39.282502,
  longitude: 22.61817,
  latitudeDelta: 20,
  longitudeDelta: 15
};
const DEFAULT_ZOOM = {
  latitudeDelta: 0.035,
  longitudeDelta: 0.02
};

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

const PointMarker = (point: ExtendedPoint) => {
  let theme;
  let circle;
  if (point.completed) {
    theme = Theme.map.point.completed;
  } else if (point.userWithin) {
    theme = Theme.map.point.active;
    circle = theme.circle;
  } else if (point.distance <= NEARBY_RATIO * point.radius) {
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

export interface MapInterface {
  position: PositionState;
  areas: AreaPoint[];
  currentArea?: AreaPoint;
  points: ExtendedPoint[]; // Sorted by distance
}

export default class Map extends React.Component<MapInterface> {
  public state = {
    coordinate: new AnimatedRegion(GREECE_COORDS)
  };
  // @ts-ignore
  private userMarker: Marker.Animated;
  // @ts-ignore
  private map: MapView;

  public componentDidMount() {
    // Set marker to previous position, if it is valid
    if (!this.props.position.valid) return;
    this.state.coordinate.setValue({
      ...convertCoords(this.props.position.coords),
      ...DEFAULT_ZOOM
    });
  }

  public componentDidUpdate() {
    if (!this.props.position.valid) return;

    const { coordinate } = this.state;
    const newCoords = convertCoords(this.props.position.coords);

    if (Platform.OS === "android") {
      if (this.userMarker) {
        this.userMarker._component.animateMarkerToCoordinate(
          newCoords,
          ANIMATION_DELAY
        );
      }
    } else {
      coordinate.timing(newCoords).start();
    }

    this.map.animateToRegion(
      {
        ...newCoords,
        ...DEFAULT_ZOOM
      },
      ANIMATION_DELAY
    );
  }

  public render() {
    const pos = this.props.position;
    const userCoords = convertCoords(pos.coords);

    return (
      <MapView
        // eslint-disable-next-line
        style={{ flex: 1 }}
        ref={el => (this.map = el)}
        provider={PROVIDER_GOOGLE}
        customMapStyle={Theme.mapStyle}
        initialRegion={GREECE_COORDS}
      >
        {/* Area Points */}
        {this.props.areas.map(AreaMarker)}
        {/* Points */}
        {this.props.points.map(PointMarker)}
        {/* User Marker */}
        {pos.accuracy > 20 ? (
          <Circle
            center={userCoords}
            radius={pos.accuracy}
            {...Theme.map.user.circle}
          />
        ) : null}
        <Marker.Animated
          ref={(marker: Marker.Animated) => (this.userMarker = marker)}
          coordinate={this.state.coordinate}
          {...Theme.map.user.marker}
        >
          <Icon {...Theme.map.user.icon} />
        </Marker.Animated>
      </MapView>
    );
  }
}

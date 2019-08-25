import React, {
  Fragment,
  FunctionComponent,
  memo,
  useEffect,
  useState
} from "react";
import { Circle, Marker } from "react-native-maps";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { ExtendedPoint } from "../../../store/model/ExtendedPoint";
import * as Theme from "../../../utils/Theme";
import { convertCoords, isPointClose } from "./Utils";

export interface IPointMarkerProps {
  point: ExtendedPoint;
  selected: boolean;
  onPress: () => void;
}

// Point marker is memoized (for performance), that may cause incorrect updates if
// state is not immutable. To disable look at export.
const PointMarker: FunctionComponent<IPointMarkerProps> = ({
  point,
  selected,
  onPress
}) => {
  let theme: { icon: any; marker: any; circle?: any };
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

  if (selected) {
    // Avoid mutating global constants
    theme = { ...theme };
    theme.icon = { ...theme.icon };
    theme.icon.size = Theme.map.point.selectedSize;
  }

  const coords = convertCoords(point.loc);

  // Retrofit to use ImageSource instead of nested Icon
  // For performance
  const [img, setImg] = useState(null);
  useEffect(() => {
    const name = point.icon;
    const size = theme.icon.size;
    const color = theme.icon.color;

    Icon.getImageSource(name, size, color).then(ig => setImg(ig));
  }, [theme.icon.size, theme.icon.color, point.icon]);

  return (
    <Fragment key={point.id}>
      {circle ? (
        <Circle center={coords} radius={point.radius} {...circle} />
      ) : null}
      {img !== null && (
        <Marker
          coordinate={coords}
          {...theme.marker}
          onPress={onPress}
          image={img}
        />
      )}
    </Fragment>
  );
};

export default memo(PointMarker);

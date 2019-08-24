import React, { Fragment, FunctionComponent, useState, useEffect } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { RNCamera } from "react-native-camera";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { completeQrPoint, addCompletedPoints } from "../../store/actions";
import { ExtendedCollectPoint } from "../../store/model/ExtendedCollectPoint";
import { ExtendedQrPoint } from "../../store/model/ExtendedQrPoint";
import { selectExtendedCollectPoint } from "../../store/selectors";
import { State } from "../../store/types";
import { Spacer } from "../../utils/Components";
import * as Theme from "../../utils/Theme";
import { ellipsis } from "../../utils/Theme";
import getImage from "./LocalImage";
import { notifyQrScanned } from "./QrNotify";

const s = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    flexDirection: "column",
    justifyContent: "flex-end"
  },
  mapContainer: {
    width: "100%"
  },
  camera: {
    flex: 1,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center"
  },
  scanBar: {
    width: "60%",
    height: 5,
    opacity: 0.7,
    borderRadius: 20,
    backgroundColor: Theme.colors.primaryDark
  },
  map: {
    flex: 1,
    marginTop: 12
  },
  mapIcon: {
    position: "absolute",
    fontSize: 20
  },
  headerContainer: {
    borderTopWidth: 3,
    borderTopColor: Theme.colors.accent,
    paddingTop: 12,
    borderBottomWidth: 3,
    borderBottomColor: Theme.colors.accent,
    paddingBottom: 12
  },
  header: {
    width: "100%",
    textAlign: "center",
    ...Theme.text.color.dark,
    ...Theme.text.size.header,
    marginBottom: 3
  },
  text: {
    width: "100%",
    ...Theme.text.color.light,
    ...Theme.text.size.medium,
    marginBottom: 12,
    textAlign: "center"
  },
  listContainer: {
    width: "100%",
    flex: 1,
    flexShrink: 2
  },
  list: {
    width: "100%",
    marginHorizontal: 20,
    flex: 1
  },

  pointContainer: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center"
  },
  pointIcon: {
    fontSize: 30
  },
  pointText: {
    ...Theme.text.size.medium
  },
  pointSubText: {
    ...Theme.text.size.small,
    ...Theme.text.color.light
  },

  buttonBackground: {
    backgroundColor: Theme.colors.primaryDark,
    width: "100%",
    height: Dimensions.get("window").height / 6
  },
  buttonForeground: {
    ...Theme.component.container.background,
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  buttonText: {
    ...Theme.text.size.large,
    ...Theme.text.color.primary
  }
});

const QrPoint = ({ p }: { p: ExtendedQrPoint }) => {
  const styleColor = p.completed
    ? Theme.text.color.success
    : Theme.text.color.primaryColored;

  return (
    <View style={s.pointContainer}>
      <Icon name={p.icon} style={{ ...s.pointIcon, ...styleColor }} />
      <Spacer medium horz />
      <View>
        <Text style={{ ...s.pointText, ...styleColor }}>
          {ellipsis(p.name, 25)}
        </Text>
        <Text style={s.pointSubText}>{ellipsis(p.desc, 35)}</Text>
      </View>
    </View>
  );
};

const MapMarker = ({
  p,
  width,
  height
}: {
  p: ExtendedQrPoint;
  width: number;
  height: number;
}) => {
  const color = p.completed ? Theme.colors.disabledDark : Theme.colors.primary;
  // Check we have map metadata
  if (!p.loc.x || !p.loc.y) return null;

  return (
    <Icon
      name={p.icon}
      style={{
        ...s.mapIcon,
        color,
        top: Math.max(Math.floor((height * p.loc.y) / 100.0 - 10), 0),
        left: Math.max(Math.floor((width * p.loc.x) / 100.0 - 10), 0)
      }}
    />
  );
};

interface ICollectStateProps {
  point?: ExtendedCollectPoint;
}

interface ICollectDispatchProps {
  pointCompleted: (p: string) => void;
  markAsCompleted: () => void;
}

export interface ICollectOwnProps {
  navigation: NavigationScreenProp<any>;
}

export interface ICollectProps
  extends ICollectStateProps,
    ICollectDispatchProps,
    ICollectOwnProps {}

const CollectScreen: FunctionComponent<ICollectProps> = ({
  point,
  pointCompleted,
  navigation,
  markAsCompleted
}) => {
  // Check there is a valid point
  if (!point) {
    navigation.goBack();
    return null;
  }

  // Setup camera hooks
  const [cameraOpen, setCameraOpen] = useState(false);
  const [lastScanned, setLastScanned] = useState(0);
  const switchToCamera = () => {
    setCameraOpen(!cameraOpen);
  };
  const qrRead = (type: string, data: string) => {
    // Rate limit
    if (Date.now() - lastScanned < 2000) return;
    setLastScanned(Date.now());

    const p = point.qrPoints.find(
      qr => !qr.completed && qr.qrData.data === data && qr.qrData.type === type
    );

    if (p) {
      notifyQrScanned(true);
      pointCompleted(p.id);

      // If this is the last point mark point as completed and exit
      if (
        point.qrPoints.findIndex(qr => qr.id !== p.id && !qr.completed) === -1
      ) {
        markAsCompleted();
        navigation.goBack();
      }
    } else {
      notifyQrScanned(false);
    }
  };

  // Set up image height
  const width = Dimensions.get("window").width;
  const [height, setHeight] = useState((3 / 4.0) * width);
  const updateHeight = (w: number, h: number) => {
    const newHeight = Math.floor(width * (h / (w * 1.0))) + 12; // Add top map margin
    if (newHeight !== height) setHeight(newHeight);
  };

  if (point.image.local) {
    const { width: w, height: h } = Image.resolveAssetSource(
      getImage(point.image.uri)
    );
    updateHeight(w, h);
  } else {
    Image.getSize(point.image.uri, updateHeight, () => {});
  }

  return (
    <View style={s.container}>
      {/* Map or camera container */}
      <View
        style={{
          ...s.mapContainer,
          width,
          height
        }}
      >
        {cameraOpen ? (
          <Fragment>
            <StatusBar barStyle="light-content" />
            <RNCamera
              style={s.camera}
              onBarCodeRead={({ data, type }) => qrRead(type, data)}
              captureAudio={false}
            >
              <View style={s.scanBar} />
            </RNCamera>
          </Fragment>
        ) : (
          <Fragment>
            <StatusBar barStyle="dark-content" />
            <ImageBackground
              style={s.map}
              resizeMode="stretch"
              source={
                point.image.local
                  ? getImage(point.image.uri)
                  : { uri: point.image.uri }
              }
            >
              {height !== -1 &&
                point.qrPoints.map(p => (
                  <MapMarker p={p} width={width} height={height} key={p.id} />
                ))}
            </ImageBackground>
          </Fragment>
        )}
      </View>
      {/* Header */}
      <View style={s.headerContainer}>
        <Text style={s.header}>Collect Point</Text>
        <Text
          style={s.text}
        >{`${point.name}, ${point.completedPoints}/${point.totalPoints}`}</Text>
      </View>
      {/* List */}
      <View style={s.listContainer}>
        <FlatList
          style={s.list}
          data={point.qrPoints}
          renderItem={i => <QrPoint p={i.item} key={i.item.id} />}
        />
      </View>
      {/* Button */}
      <View style={s.buttonBackground}>
        <TouchableOpacity style={s.buttonForeground} onPress={switchToCamera}>
          <Text style={s.buttonText}>
            {cameraOpen ? "Switch to Map" : "Switch to Camera"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const mapStateToProps = (
  state: State,
  ownProps: ICollectOwnProps
): ICollectStateProps => {
  return {
    point: selectExtendedCollectPoint(
      state,
      ownProps.navigation.getParam("id")
    ) as ExtendedCollectPoint
  };
};

const mapDispatchToProps = (
  dispatch: Dispatch,
  ownProps: ICollectOwnProps
): ICollectDispatchProps => {
  const id = ownProps.navigation.getParam("id");
  return {
    pointCompleted: (qrId: string) => dispatch(completeQrPoint(id, qrId)),
    markAsCompleted: () => dispatch(addCompletedPoints([id]))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CollectScreen);

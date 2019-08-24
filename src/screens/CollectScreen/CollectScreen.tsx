import React, {
  Fragment,
  FunctionComponent,
  useState,
  useRef,
  MutableRefObject
} from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar
} from "react-native";
import { RNCamera } from "react-native-camera";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { completeQrPoint } from "../../store/actions";
import { ExtendedCollectPoint } from "../../store/model/ExtendedCollectPoint";
import { ExtendedQrPoint } from "../../store/model/ExtendedQrPoint";
import { selectExtendedCollectPoint } from "../../store/selectors";
import { State } from "../../store/types";
import { Spacer } from "../../utils/Components";
import * as Theme from "../../utils/Theme";
import { ellipsis } from "../../utils/Theme";
import getImage from "./LocalImage";

const s = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    flexDirection: "column",
    justifyContent: "flex-end"
  },
  mapContainer: {
    flex: 3,
    width: "100%"
  },
  camera: {
    flex: 1,
    width: "100%",
    overflow: "hidden"
  },
  map: {
    flex: 1,
    width: "100%",
    marginHorizontal: 8,
    marginTop: 15
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
    flex: 4
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

interface ICollectStateProps {
  point?: ExtendedCollectPoint;
}

interface ICollectDispatchProps {
  pointCompleted: (p: string) => void;
}

export interface ICollectOwnProps {
  navigation: NavigationScreenProp<any>;
}

export interface ICollectProps
  extends ICollectStateProps,
    ICollectDispatchProps,
    ICollectOwnProps {}

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

const CollectScreen: FunctionComponent<ICollectProps> = ({
  point,
  pointCompleted,
  navigation
}) => {
  const [cameraOpen, setCameraOpen] = useState(false);

  if (!point) {
    navigation.goBack();
    return null;
  }

  const switchToCamera = () => {
    setCameraOpen(!cameraOpen);
  };

  const qrRead = (type: string, data: string) => {
    const p = point.qrPoints.find(
      qr => !qr.completed && qr.qrData.type === type && qr.qrData.data === data
    );

    // TODO: Handle error
    if (p) pointCompleted(p.id);
  };

  return (
    <View style={s.container}>
      {/* Map or camera container */}
      <View style={s.mapContainer}>
        {cameraOpen ? (
          <Fragment>
            <StatusBar barStyle="light-content" />
            <RNCamera
              style={s.camera}
              onBarCodeRead={({ data, type }) => qrRead(type, data)}
              captureAudio={false}
            />
          </Fragment>
        ) : (
          <Fragment>
            <StatusBar barStyle="dark-content" />
            <Image
              style={s.map}
              resizeMode="contain"
              source={
                point.image.local
                  ? getImage(point.image.uri)
                  : { uri: point.image.uri }
              }
            />
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
  return {
    pointCompleted: (id: string) =>
      dispatch(completeQrPoint(ownProps.navigation.getParam("id"), id))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CollectScreen);

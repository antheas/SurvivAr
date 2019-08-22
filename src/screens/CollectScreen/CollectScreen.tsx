import { FunctionComponent } from "react";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { completeQrPoint } from "../../store/actions";
import { ExtendedCollectPoint } from "../../store/model/ExtendedCollectPoint";
import { selectExtendedCollectPoint } from "../../store/selectors";
import { State } from "../../store/types";

interface ICollectStateProps {
  point?: ExtendedCollectPoint;
}

interface ICollectDispatchProps {
  pointCompleted: (p: string) => void;
}

export interface ICollectOwnProps {
  navigation: NavigationScreenProp<any>;
  pointId: string;
}

export interface ICollectProps
  extends ICollectStateProps,
    ICollectDispatchProps,
    ICollectOwnProps {}

const CollectScreen: FunctionComponent<ICollectProps> = props => {
  return null;
};

const mapStateToProps = (
  state: State,
  ownProps: ICollectOwnProps
): ICollectStateProps => {
  return {
    point: selectExtendedCollectPoint(
      state,
      ownProps.pointId
    ) as ExtendedCollectPoint
  };
};

const mapDispatchToProps = (
  dispatch: Dispatch,
  ownProps: ICollectOwnProps
): ICollectDispatchProps => {
  return {
    pointCompleted: (id: string) =>
      dispatch(completeQrPoint(ownProps.pointId, id))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CollectScreen);

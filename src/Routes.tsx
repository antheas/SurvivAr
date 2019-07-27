import { createAppContainer, createSwitchNavigator } from "react-navigation";
import PermissionsScreen from "./screens/PermissionsScreen";
import LocationLoader from "./screens/LocationLoader";
import MainScreen from "./screens/MainScreen";

// Implementation of HomeScreen, OtherScreen, SignInScreen, AuthLoadingScreen
export default createAppContainer(
  createSwitchNavigator(
    {
      Loader: LocationLoader,
      Permissions: PermissionsScreen,
      Main: MainScreen
    },
    {
      initialRouteName: "Loader"
    }
  )
);

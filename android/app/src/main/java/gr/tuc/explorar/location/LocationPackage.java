package gr.tuc.explorar.location;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import javax.annotation.Nonnull;

public class LocationPackage implements ReactPackage {
  @Nonnull
  @Override
  public List<NativeModule> createNativeModules(@Nonnull ReactApplicationContext reactContext) {
    return Collections.singletonList(new LocationManagerModule(reactContext));
  }

  @Nonnull
  @Override
  public List<ViewManager> createViewManagers(@Nonnull ReactApplicationContext reactContext) {
    return Collections.emptyList();
  }
}

package gr.tuc.explorar.location;

import android.content.Intent;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import javax.annotation.Nonnull;

public class LocationManagerModule extends ReactContextBaseJavaModule {

  public LocationManagerModule(@Nonnull ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Nonnull
  @Override
  public String getName() {
    return "NativeLocationManager";
  }

  @ReactMethod
  public void testService() {
    getReactApplicationContext().startService(new Intent(getReactApplicationContext(), BackgroundLocationService.class));
  }
}

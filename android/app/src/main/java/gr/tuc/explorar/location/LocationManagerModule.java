package gr.tuc.explorar.location;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import javax.annotation.Nonnull;

import gr.tuc.explorar.location.foreground.ForegroundHeadingManager;
import gr.tuc.explorar.location.foreground.ForegroundLocationManager;

public class LocationManagerModule extends ReactContextBaseJavaModule {

  private ForegroundLocationManager location;
  private ForegroundHeadingManager heading;

  public LocationManagerModule(@Nonnull ReactApplicationContext reactContext) {
    super(reactContext);

    location = new ForegroundLocationManager(reactContext);
    heading = new ForegroundHeadingManager(reactContext);
  }

  @Nonnull
  @Override
  public String getName() {
    return "NativeLocationManager";
  }

  @ReactMethod
  public void registerPositionCallback(Callback callback) {
    location.registerPositionCallback(p -> {
      WritableMap coords = Arguments.createMap();
      coords.putDouble("lat", p.lat);
      coords.putDouble("lon", p.lon);

      WritableMap pos = Arguments.createMap();
      pos.putMap("coords", coords);
      pos.putDouble("accuracy", p.accuracy);
      // FIXME: Should be long
      pos.putInt("updated", (int)p.updated);
      pos.putBoolean("valid", p.valid);

      callback.invoke(pos);
    });
  }

  @ReactMethod
  public void unregisterPositionCallback() {
    location.unregisterLocationCallback();
  }

  @ReactMethod
  public void setClosestPointDistance(double distance) {
    location.setClosestPointDistance(distance);
  }
  @ReactMethod
  public void registerHeadingCallback(Callback callback) {
    heading.registerHeadingCallback(h -> {
      WritableMap heading = Arguments.createMap();
      heading.putDouble("degrees", h.degrees);
      // FIXME: Should be long
      heading.putInt("updated", (int)h.updated);
      heading.putBoolean("valid", h.valid);
    });
  }

  @ReactMethod
  public void unregisterHeadingCallback() {
    heading.unregisterHeadingCallback();
  }

}

package gr.tuc.explorar.location;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Nonnull;

import gr.tuc.explorar.location.background.BackgroundServiceWrapper;
import gr.tuc.explorar.location.location.HeadingManager;
import gr.tuc.explorar.location.location.PositionManager;

public class LocationManagerModule extends ReactContextBaseJavaModule {

  private static final String NAME_EVENT_HEADING = "HEADING_EVENT";
  private static final String NAME_EVENT_POSITION = "POSITION_EVENT";
  private static final String EVENT_HEADING = "LOCATION_HEADING_EVENT";
  private static final String EVENT_POSITION = "LOCATION_POSITION_EVENT";

  private ReactApplicationContext context;
  private PositionManager location;
  private HeadingManager heading;

  public LocationManagerModule(@Nonnull ReactApplicationContext reactContext) {
    super(reactContext);

    context = reactContext;
    location = new PositionManager(reactContext, true, false);
    heading = new HeadingManager(reactContext, true);
  }

  @Nonnull
  @Override
  public String getName() {
    return "NativeLocationManager";
  }

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put(NAME_EVENT_HEADING, EVENT_HEADING);
    constants.put(NAME_EVENT_POSITION, EVENT_POSITION);
    return constants;
  }

  @ReactMethod
  public void enablePositionCallback() {
    location.registerPositionCallback(p -> {
      WritableMap coords = Arguments.createMap();
      coords.putDouble("lat", p.lat);
      coords.putDouble("lon", p.lon);

      WritableMap pos = Arguments.createMap();
      pos.putMap("coords", coords);
      pos.putDouble("accuracy", p.accuracy);
      // FIXME: Should be long
      pos.putInt("updated", (int) p.updated);
      pos.putBoolean("valid", p.valid);

      emitCallback(EVENT_POSITION, pos);
    });
  }

  @ReactMethod
  public void disablePositionCallback() {
    location.unregisterPositionCallback();
  }

  @ReactMethod
  public void setClosestPointDistance(double distance) {
    location.setClosestPointDistance(distance, true);
  }

  @ReactMethod
  public void enableHeadingCallback() {
    heading.registerHeadingCallback(h -> {
      WritableMap heading = Arguments.createMap();
      heading.putDouble("degrees", h.degrees);
      // FIXME: Should be long
      heading.putInt("updated", (int) h.updated);
      heading.putBoolean("valid", h.valid);

      emitCallback(EVENT_HEADING, heading);
    });
  }

  @ReactMethod
  public void disableHeadingCallback() {
    heading.unregisterHeadingCallback();
  }


  @ReactMethod
  public void enableBackgroundTracking(ReadableArray points) {
    BackgroundServiceWrapper.startBackgroundService(context, points);
  }

  @ReactMethod
  public void stopAndRetrieveProgress(Promise promise) {
    BackgroundServiceWrapper.stopAndRetrieve(context, promise);
  }

  private void emitCallback(
          String eventName,
          @Nullable WritableMap params) {
    context
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, params);
  }
}

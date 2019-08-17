package gr.tuc.explorar.location.background;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.IBinder;
import android.preference.PreferenceManager;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.util.ArrayList;
import java.util.Objects;

import gr.tuc.explorar.location.background.BackgroundLocationService.ProgressBinder;
import gr.tuc.explorar.location.background.model.BackgroundProgress;
import gr.tuc.explorar.location.background.model.ParcelPoint;

import static gr.tuc.explorar.location.background.BackgroundLocationService.ACTION_INITIALISE;
import static gr.tuc.explorar.location.background.BackgroundLocationService.POINT_DATA_KEY;
import static gr.tuc.explorar.location.background.BackgroundLocationService.PROGRESS_DATA_KEY;

public class BackgroundServiceWrapper {

  private static ArrayList<ParcelPoint> convertPoints(ReadableArray points) {
    int length = points.size();
    ArrayList<ParcelPoint> output = new ArrayList<>();

    for (int i = 0; i < length; i++) {
      ReadableMap p = points.getMap(i);
      if (p == null) throw new RuntimeException("Invalid Bundle");

      ReadableMap coords = p.getMap("loc");
      if (coords == null) throw new RuntimeException("Invalid Bundle");

      boolean isWaitpoint = p.hasKey("duration");
      double duration = isWaitpoint ? p.getDouble("duration") : -1;
      double completedDuration = isWaitpoint ? p.getDouble("completedDuration") : -1;

      output.add(new ParcelPoint(
              Objects.requireNonNull(p.getString("id")),
              Objects.requireNonNull(p.getString("icon")),

              Objects.requireNonNull(p.getString("name")),
              Objects.requireNonNull(p.getString("desc")),

              coords.getDouble("lat"),
              coords.getDouble("lon"),
              p.getDouble("radius"),

              isWaitpoint,
              duration,
              completedDuration
      ));
    }
    return output;
  }

  public static void startBackgroundService(Context context, ReadableArray rawPoints) {
    ArrayList<ParcelPoint> points = convertPoints(rawPoints);

    Intent intent = new Intent(ACTION_INITIALISE, null, context, BackgroundLocationService.class);
    intent.putParcelableArrayListExtra(POINT_DATA_KEY, points);

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      context.startForegroundService(intent);
    } else {
      context.startService(intent);
    }
  }

  private static ReadableArray retrieveProgress(Context c) {
    SharedPreferences sp = PreferenceManager.getDefaultSharedPreferences(c.getApplicationContext());
    String data = sp.getString(PROGRESS_DATA_KEY, null);
    if (data == null) return Arguments.createArray();

    // Clear data since we received it
    sp.edit().remove(PROGRESS_DATA_KEY).apply();

    return retrieveProgress(new BackgroundProgress(data));
  }

  private static ReadableArray retrieveProgress(BackgroundProgress progress) {
    WritableArray array = Arguments.createArray();
    for (String id : progress.getIds()) {
      WritableMap map = Arguments.createMap();
      map.putString("id", id);
      map.putDouble("progress", progress.get(id));

      array.pushMap(map);
    }

    return array;
  }

  public static void stopAndRetrieve(Context c, Promise promise) {
    final Intent bindIntent = new Intent(c, BackgroundLocationService.class);

    // Use a binder to retrieve progress (https://developer.android.com/guide/components/bound-services)
    boolean connected = c.bindService(bindIntent, new ServiceConnection() {
      @Override
      public void onServiceConnected(ComponentName name, IBinder service) {
        ProgressBinder binder = (ProgressBinder) service;
        if (binder.isServiceRunning()) {
          // If the service was running grab the data directly

          promise.resolve(retrieveProgress(binder.getProgress()));

          // Unbind and stop
          c.unbindService(this);
          c.stopService(new Intent(c, BackgroundLocationService.class));
        } else {
          // Otherwise grab it from storage
          promise.resolve(retrieveProgress(c));
          c.unbindService(this);
        }
      }

      @Override
      public void onServiceDisconnected(ComponentName name) {
        // Noop
      }
    }, Context.BIND_AUTO_CREATE);

    // If we did not connect for some reason retrieve progress from storage.
    if (!connected) {
      promise.resolve(retrieveProgress(c));
    }
  }
}

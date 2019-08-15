package gr.tuc.explorar.location.background;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.preference.PreferenceManager;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import static gr.tuc.explorar.location.background.BackgroundLocationService.POINT_DATA_KEY;
import static gr.tuc.explorar.location.background.BackgroundLocationService.PROGRESS_DATA_KEY;

public class BackgroundServiceWrapper {

  private static ParcelablePoint[] convertPoints(ReadableArray points) {
    int length = points.size();
    ParcelablePoint[] output = new ParcelablePoint[length];

    for (int i = 0; i < length; i++) {
      ReadableMap p = points.getMap(i);
      if (p == null) throw new RuntimeException("Invalid Bundle");

      boolean isWaitpoint = p.hasKey("duration");
      double duration = isWaitpoint ? p.getDouble("duration") : -1;
      double completedDuration = isWaitpoint ? p.getDouble("completedDuration") : -1;

      output[i] = new ParcelablePoint(
              p.getString("id"),
              p.getString("icon"),

              p.getString("name"),
              p.getString("desc"),

              p.getDouble("lat"),
              p.getDouble("lon"),
              p.getDouble("radius"),

              p.getBoolean("completed"),

              isWaitpoint,
              duration,
              completedDuration
      );
    }

    return output;
  }

  public static void startBackgroundService(Context context, ReadableArray rawPoints) {
    ParcelablePoint[] points = convertPoints(rawPoints);

    Intent intent = new Intent(context, BackgroundLocationService.class);
    intent.putExtra(POINT_DATA_KEY, points);

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      context.startForegroundService(intent);
    } else {
      context.startService(intent);
    }
  }

  public static void stopBackgroundService(Context context) {
    Intent i = new Intent(context, BackgroundLocationService.class);
    context.stopService(i);
  }

  public static ReadableArray retrieveProgress(Context c) {
    SharedPreferences sp = PreferenceManager.getDefaultSharedPreferences(c.getApplicationContext());
    String data = sp.getString(PROGRESS_DATA_KEY, null);
    if (data == null) return Arguments.createArray();

    // Clear data since we received it
    sp.edit().remove(PROGRESS_DATA_KEY).apply();

    BackgroundProgress progress = BackgroundProgress.unstringify(data);
    WritableArray array = Arguments.createArray();
    for (String id : progress.getIds()) {
      WritableMap map = Arguments.createMap();
      map.putString("id", id);
      map.putDouble("progress", progress.get(id));

      array.pushMap(map);
    }

    return array;
  }

}

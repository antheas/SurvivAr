package gr.tuc.explorar.location.background;

import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.Handler;
import android.os.IBinder;

import androidx.annotation.Nullable;

import gr.tuc.explorar.MainActivity;

public class BackgroundLocationService extends Service {

  public static final String POINT_DATA_KEY = "points";
  public static final String PROGRESS_DATA_KEY = "progress";

  private BackgroundNotificationManager manager;

  @Override
  public void onCreate() {
    super.onCreate();
  }

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    PendingIntent openAppIntent = PendingIntent.getActivity(
            this,
            0,
            new Intent(this, MainActivity.class),
            0);

    manager = new BackgroundNotificationManager(this, openAppIntent, null, null);
    manager.startForeground(this);

    new Handler().postDelayed(this::stopSelf, 20000);

    return START_STICKY;
  }

  @Override
  public void onDestroy() {
    super.onDestroy();
  }

  @Nullable
  @Override
  public IBinder onBind(Intent intent) {
    return null;
  }
}

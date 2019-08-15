package gr.tuc.explorar.location.background;

import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.Handler;
import android.os.IBinder;

import androidx.annotation.Nullable;

import gr.tuc.explorar.MainActivity;
import gr.tuc.explorar.SplashActivity;

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
    Intent openAppIntent = new Intent(this, SplashActivity.class);
    openAppIntent.setAction(Intent.ACTION_MAIN);
    openAppIntent.addCategory(Intent.CATEGORY_LAUNCHER);
    openAppIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

    PendingIntent openAppPending = PendingIntent.getActivity(this, 0, openAppIntent, 0);

    manager = new BackgroundNotificationManager(this, openAppPending, null, null);
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

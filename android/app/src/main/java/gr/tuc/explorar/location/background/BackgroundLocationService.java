package gr.tuc.explorar.location.background;

import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.IBinder;
import android.preference.PreferenceManager;

import androidx.annotation.Nullable;

import java.util.List;

import javax.annotation.Nonnull;

import gr.tuc.explorar.BuildConfig;
import gr.tuc.explorar.SplashActivity;
import gr.tuc.explorar.location.background.model.ParcelablePoint;

public class BackgroundLocationService extends Service implements BackgroundLocationManager.LocationListener {

  public static final String POINT_DATA_KEY = "points";
  public static final String PROGRESS_DATA_KEY = "progress";

  public static final String ACTION_INITIALISE = BuildConfig.APPLICATION_ID + "/initialise";
  public static final String ACTION_REFRESH = BuildConfig.APPLICATION_ID + "/refresh";
  public static final String ACTION_EXIT = BuildConfig.APPLICATION_ID + "/exit";

  private BackgroundNotificationManager notifications;
  private BackgroundLocationManager manager;

  @Override
  public void onCreate() {
    super.onCreate();
  }

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    final int returnFlag = START_NOT_STICKY;

    // Intent and action should never be null
    if (intent == null || intent.getAction() == null) {
      stopSelf();
      // In case function returns
      return returnFlag;
    }

    String action = intent.getAction();

    // Handle actions
    switch (action) {
      case ACTION_REFRESH:
        refreshData();
        return returnFlag;
      case ACTION_EXIT:
        exitService();
        return returnFlag;
    }

    // From now on we run initialisation
    if (!ACTION_INITIALISE.equals(action)) return returnFlag;

    notifications = new BackgroundNotificationManager(
            this,
            getOpenAppIntent(),
            getExitIntent(),
            getRefreshIntent());
    notifications.startForeground(this);

    // Point Data
    ParcelablePoint[] points = (ParcelablePoint[]) intent.getParcelableArrayExtra(POINT_DATA_KEY);

    // Previous Progress
    SharedPreferences sp = PreferenceManager.getDefaultSharedPreferences(getApplicationContext());
    String previousProgress = sp.getString(PROGRESS_DATA_KEY, null);

    manager = new BackgroundLocationManager(this, this, points, previousProgress);
    manager.startPosition();

    return returnFlag;
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

  private void exitService() {
    stopSelf();
  }

  private void refreshData() {

  }

  private PendingIntent getOpenAppIntent() {
    Intent openAppIntent = new Intent(this, SplashActivity.class);
    openAppIntent.setAction(Intent.ACTION_MAIN);
    openAppIntent.addCategory(Intent.CATEGORY_LAUNCHER);
    openAppIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

    return PendingIntent.getActivity(this, 0, openAppIntent, 0);
  }

  private PendingIntent getRefreshIntent() {
    Intent intent = new Intent(ACTION_REFRESH, null, this, BackgroundLocationService.class);
    return PendingIntent.getService(this, 0, intent, 0);
  }

  private PendingIntent getExitIntent() {
    Intent intent = new Intent(ACTION_EXIT, null, this, BackgroundLocationService.class);
    return PendingIntent.getService(this, 0, intent, 0);
  }

  @Override
  public void onDataUpdated(
          @Nullable BackgroundLocationManager.PointMetadata closestPoint,
          @Nullable BackgroundLocationManager.PointMetadata closestWaitPoint,
          @Nonnull List<ParcelablePoint> completedPoints) {
    if (closestPoint != null) System.out.println(closestPoint.distance);
    if (closestWaitPoint != null) System.out.println(closestWaitPoint.distance);
  }
}

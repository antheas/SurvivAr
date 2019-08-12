package gr.tuc.explorar.location;

import android.app.Notification;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.Handler;
import android.os.IBinder;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;

import gr.tuc.explorar.MainActivity;
import gr.tuc.explorar.R;

public class BackgroundLocationService extends Service {

  private static final int LOCATION_NOTIFICATION_ID = 345657543;

  @Override
  public void onCreate() {
    super.onCreate();
  }

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    Intent notificationIntent = new Intent(this, MainActivity.class);
    PendingIntent pendingIntent =
            PendingIntent.getActivity(this, 0, notificationIntent, 0);

    String channelId = NotificationUtils.createNotificationChannel(this);

    NotificationCompat.Builder builder =
            new NotificationCompat.Builder(this, channelId)
                    .setContentTitle(getText(R.string.location_service_notification_title))
                    .setContentText(getText(R.string.location_service_notification_content))
                    .setSmallIcon(R.drawable.location_notification_icon)
                    .setColor(ContextCompat.getColor(this, R.color.primary_color))
                    .setContentIntent(pendingIntent);

    Notification notification = builder.build();
    startForeground(LOCATION_NOTIFICATION_ID, notification);

    NotificationManagerCompat manager = NotificationManagerCompat.from(this);

    new Handler().postDelayed(() -> {
      Notification notification2 = builder.setContentText("update").build();
      manager.notify(LOCATION_NOTIFICATION_ID, notification2);
    }, 3000);

    new Handler().postDelayed(this::stopSelf, 10000);

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

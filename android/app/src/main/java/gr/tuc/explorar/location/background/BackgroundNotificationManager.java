package gr.tuc.explorar.location.background;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;

import gr.tuc.explorar.R;

/**
 * Simplifies common {@link Notification} tasks.
 */
public class BackgroundNotificationManager {

  private static final int LOCATION_NOTIFICATION_ID = 345657543;
  private static final String LOCATION_NOTIFICATION_CHANNEL_ID = "location_notification_channel";

  private NotificationCompat.Builder builder;
  private NotificationManagerCompat manager;

  public BackgroundNotificationManager(Context c,
                                       PendingIntent onClick,
                                       PendingIntent onExit,
                                       PendingIntent onRefresh) {
    createNotificationChannel(c);
    manager = NotificationManagerCompat.from(c);
    builder = createBaseBuilder(c, onClick, onExit, onRefresh);
  }

  public void startForeground(Service service) {
    service.startForeground(LOCATION_NOTIFICATION_ID, builder.build());
  }

  private static NotificationCompat.Builder createBaseBuilder(
          Context c,
          PendingIntent onClick,
          PendingIntent onExit,
          PendingIntent onRefresh) {
    return new NotificationCompat.Builder(c, LOCATION_NOTIFICATION_CHANNEL_ID)
            .setContentTitle(c.getText(R.string.location_service_notification_title))
            .setContentText(c.getText(R.string.location_service_notification_content))

            .setContentIntent(onClick)
            .addAction(0, "Refresh", onRefresh)
            .addAction(0, "Exit", onExit)

            .setSmallIcon(R.drawable.location_notification_icon)
            .setColor(ContextCompat.getColor(c, R.color.primary_color))
            .setColorized(true)

            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .setOnlyAlertOnce(true);
  }

  private static void createNotificationChannel(
          Context context) {

    // NotificationChannels are required for Notifications on O (API 26) and above.
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O)
      return;

    // The user-visible name of the channel.
    CharSequence channelName = context.getString(R.string.location_notification_channel_name);
    // The user-visible description of the channel.
    String channelDescription = context.getString(R.string.location_notification_channel_description);
    int channelImportance = NotificationManager.IMPORTANCE_DEFAULT;
    boolean channelEnableVibrate = false;
    int channelLockscreenVisibility = Notification.VISIBILITY_PUBLIC;

    // Initializes NotificationChannel.
    NotificationChannel notificationChannel =
            new NotificationChannel(LOCATION_NOTIFICATION_CHANNEL_ID, channelName, channelImportance);
    notificationChannel.setDescription(channelDescription);
    notificationChannel.enableVibration(channelEnableVibrate);
    notificationChannel.setLockscreenVisibility(channelLockscreenVisibility);

    // Adds NotificationChannel to system. Attempting to create an existing notification
    // channel with its original values performs no operation, so it's safe to perform the
    // below sequence.
    NotificationManager notificationManager =
            (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
    if (notificationManager != null) {
      notificationManager.createNotificationChannel(notificationChannel);
    } else {
      throw new RuntimeException("Notification Manager is null!");
    }
  }
}

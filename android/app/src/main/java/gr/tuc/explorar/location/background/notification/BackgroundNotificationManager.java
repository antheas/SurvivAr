package gr.tuc.explorar.location.background.notification;

import android.app.Notification;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.res.Resources;

import androidx.core.app.NotificationManagerCompat;
import androidx.core.os.ConfigurationCompat;

import java.util.Locale;

import gr.tuc.explorar.R;
import gr.tuc.explorar.location.background.model.ParcelPoint;

/**
 * Simplifies common {@link Notification} tasks.
 */
public class BackgroundNotificationManager {

  private static final int LOCATION_NOTIFICATION_ID = 345657543;

  private BackgroundNotificationBuilder builder;
  private NotificationManagerCompat nm;
  private Context c;
  private Resources r;
  private Locale l;

  public BackgroundNotificationManager(Context c,
                                       PendingIntent onClick,
                                       PendingIntent onExit,
                                       PendingIntent onRefresh) {
    nm = NotificationManagerCompat.from(c);
    builder = new BackgroundNotificationBuilder(c, onClick, onRefresh, onExit);
    builder.createChannels();
    this.c = c;
    this.r = c.getResources();
    this.l = ConfigurationCompat.getLocales(r.getConfiguration()).get(0);
  }

  public void startForeground(Service service) {
    service.startForeground(
            LOCATION_NOTIFICATION_ID,
            builder.createPersistentNotification().build());
  }

  public void setClosestPoint(ParcelPoint p, double distance) {
    nm.notify(LOCATION_NOTIFICATION_ID,
            builder.createPersistentNotification()
                    .setContentTitle(p.name)
                    .setContentText(
                            formatHtml(
                                    R.string.location_notification_closest_point,
                                    distance,
                                    "NW",
                                    p.desc
                            ))
                    .setOnlyAlertOnce(false)
                    .build());

  }
}

package gr.tuc.explorar.location.background.model;

import android.os.Parcel;
import android.os.Parcelable;

import java.util.Objects;

import javax.annotation.Nonnull;

import gr.tuc.explorar.location.background.utils.CoordinateUtils;

public class ParcelPoint implements Parcelable {

  public static final int DEFAULT = 0;
  public static final int ON_ENTER = 1;
  public static final int ON_EXIT = 2;
  public static final int ON_COMPLETE = 3;

  @Nonnull
  public final String id;
  @Nonnull
  public final String icon;

  @Nonnull
  public final String name;
  @Nonnull
  public final String desc;

  public final double lat;
  public final double lon;
  public final double radius;

  public final boolean isWaitPoint;
  public final double duration;
  public final double completedDuration;

  public ParcelPoint(@Nonnull String id, @Nonnull String icon,
                     @Nonnull String name, @Nonnull String desc,
                     double lat, double lon,
                     double radius, boolean isWaitPoint,
                     double duration, double completedDuration) {
    this.id = id;
    this.icon = icon;
    this.name = name;
    this.desc = desc;
    this.lat = lat;
    this.lon = lon;
    this.radius = radius;
    this.isWaitPoint = isWaitPoint;
    this.duration = duration;
    this.completedDuration = completedDuration;
  }

  public boolean isComplete() {
    return isWaitPoint && (completedDuration >= duration);
  }

  public double distanceFrom(double lat, double lon) {
    return CoordinateUtils.distance(this.lat, this.lon, lat, lon);
  }

  protected ParcelPoint(Parcel in) {
    this.id = Objects.requireNonNull(in.readString());
    this.icon = Objects.requireNonNull(in.readString());

    this.name = Objects.requireNonNull(in.readString());
    this.desc = Objects.requireNonNull(in.readString());

    this.lat = in.readDouble();
    this.lon = in.readDouble();

    this.radius = in.readDouble();

    this.isWaitPoint = in.readByte() == 1;
    this.duration = in.readDouble();
    this.completedDuration = in.readDouble();
  }

  @Override
  public void writeToParcel(Parcel dest, int flags) {
    dest.writeString(id);
    dest.writeString(icon);

    dest.writeString(name);
    dest.writeString(desc);

    dest.writeDouble(lat);
    dest.writeDouble(lon);

    dest.writeDouble(radius);

    dest.writeByte((byte) (isWaitPoint ? 1 : 0));
    dest.writeDouble(duration);
    dest.writeDouble(completedDuration);
  }

  @Override
  public int describeContents() {
    return 0;
  }

  public static final Creator<ParcelPoint> CREATOR = new Creator<ParcelPoint>() {
    @Override
    public ParcelPoint createFromParcel(Parcel in) {
      return new ParcelPoint(in);
    }

    @Override
    public ParcelPoint[] newArray(int size) {
      return new ParcelPoint[size];
    }
  };

  public static class Metadata {
    public final ParcelPoint point;
    public final double progress;
    public final double distance;
    public final double bearing;
    public final boolean userWithin;

    public Metadata(ParcelPoint point, double progress, double distance, double bearing, boolean userWithin) {
      this.point = point;
      this.progress = progress;
      this.distance = distance;
      this.bearing = bearing;
      this.userWithin = userWithin;
    }
  }
}

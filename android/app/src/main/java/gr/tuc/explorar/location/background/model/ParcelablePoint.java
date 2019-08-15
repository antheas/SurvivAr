package gr.tuc.explorar.location.background.model;

import android.os.Parcel;
import android.os.Parcelable;

import java.util.Objects;

import javax.annotation.Nonnull;

import gr.tuc.explorar.location.background.utils.Haversine;

public class ParcelablePoint implements Parcelable {
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

  public ParcelablePoint(@Nonnull String id, @Nonnull String icon,
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
    return Haversine.distance(this.lat, this.lon, lat, lon);
  }

  protected ParcelablePoint(Parcel in) {
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

  public static final Creator<ParcelablePoint> CREATOR = new Creator<ParcelablePoint>() {
    @Override
    public ParcelablePoint createFromParcel(Parcel in) {
      return new ParcelablePoint(in);
    }

    @Override
    public ParcelablePoint[] newArray(int size) {
      return new ParcelablePoint[size];
    }
  };
}

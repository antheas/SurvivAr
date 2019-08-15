package gr.tuc.explorar.location.background;

import android.os.Parcel;
import android.os.Parcelable;

public class ParcelablePoint implements Parcelable {
  public final String id;
  public final String icon;

  public final String name;
  public final String desc;

  public final double lat;
  public final double lon;
  public final double radius;

  public final boolean isWaitPoint;
  public final double duration;
  public final double completedDuration;

  public ParcelablePoint(String id, String icon, String name, String desc, double lat, double lon,
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

  protected ParcelablePoint(Parcel in) {
    this.id = in.readString();
    this.icon = in.readString();

    this.name = in.readString();
    this.desc = in.readString();

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

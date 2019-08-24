import { CollectPoint, Point, QrPoint } from "../store/types";

type PercentCoordinate = [number, number]; // x, y

const QR_DATA = [
  "survivar-pharmacy-0",
  "survivar-pharmacy-1",
  "survivar-pharmacy-2",
  "survivar-pharmacy-3",
  "survivar-pharmacy-4",
  "survivar-pharmacy-5",
  "survivar-pharmacy-6",
  "survivar-pharmacy-7",
  "survivar-pharmacy-8",
  "survivar-pharmacy-9"
];

const NAME_ICON = [
  ["Cannabis", "cannabis", "Convenience"],
  ["Toothbrush", "tooth", "Toiletries"],
  ["Bandage", "bandage", "Medical Supplies"],
  ["Needle", "needle", "Medical Supplies"],
  ["Blood Bag", "blood-bag", "Medical Supplies"],
  ["Pain Reliever", "pill", "Medical Supplies"],
  ["Defibrillator", "heart-pulse", "Medical Supplies"],
  ["Med. Equipment", "stethoscope", "Medical Supplies"],
  ["Heavy Drugs", "prescription", "Medical Supplies"],
  ["Med Kit", "medical-bag", "Medical Supplies"]
];

const floorplan_1_coords: PercentCoordinate[] = [
  [13, 34],
  [44, 61],
  [80, 52],
  [78, 28],
  [62, 18],
  [16, 77],
  [43, 21],
  [61, 32],
  [51, 83],
  [89, 52]
];

const floorplan_2_coords: PercentCoordinate[] = [
  [21, 22],
  [10, 40],
  [13, 81],
  [40, 27],
  [49, 43],
  [53, 66],
  [74, 66],
  [84, 32],
  [87, 22],
  [91, 51]
];

function shuffle<T>(array: T[]) {
  return array.concat().sort(() => Math.random() - 0.5);
}

function r() {
  return Math.random();
}

const generateFloorplan = (p: Point): CollectPoint => {
  // Generate random data.
  const nameIcons = shuffle(NAME_ICON);
  const names = nameIcons.map(a => a[0]);
  const icons = nameIcons.map(a => a[1]);
  const desc = nameIcons.map(a => a[2]);

  const choice = r() > 0.5;
  const imageUri = choice ? "floorplan_1" : "floorplan_2";
  const floorPlanBase = choice ? floorplan_1_coords : floorplan_2_coords;
  const floorplan = shuffle(floorPlanBase);

  // Generate random length 1+ and prevent out-of-bounds.
  const length = Math.min(
    Math.round(10 * r()),
    nameIcons.length,
    floorplan.length,
    QR_DATA.length
  );

  // Generate points
  const qrPoints = [] as QrPoint[];
  for (let i = 0; i < length; i++) {
    qrPoints.push({
      id: `${p.id}-${i}`,
      icon: icons[i],

      name: names[i],
      desc: `${desc[i]} (${i})`,

      loc: {
        ...p.loc,
        x: floorplan[i][0],
        y: floorplan[i][1]
      },
      radius: 2,

      qrData: {
        type: "QR_CODE",
        data: QR_DATA[i]
      }
    });
  }

  // Construct point
  return {
    id: p.id,
    icon: p.icon,

    name: p.name,
    desc: p.desc,

    loc: p.loc,
    radius: p.radius,

    image: {
      local: true,
      uri: imageUri
    },
    qrPoints
  };
};

export default generateFloorplan;

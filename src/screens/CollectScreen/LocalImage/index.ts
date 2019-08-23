const IMAGES: Record<string, any> = {
  floorplan_1: require("./floorplan_1.png"),
  floorplan_2: require("./floorplan_2.png"),
  floorplan_3: require("./floorplan_3.png"),
  floorplan_4: require("./floorplan_4.jpg")
};

function getImage(id: string): any {
  return IMAGES[id];
}

export default getImage;

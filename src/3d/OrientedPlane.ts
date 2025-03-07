import { Line3, Plane, Vector2, Vector3 } from "three";

export class OrientedPlane {
  #tmp1: Vector3 = new Vector3();
  #tmp2: Vector3 = new Vector3();

  plane: Plane = new Plane();
  yLine: Line3 = new Line3();
  xLine: Line3 = new Line3();

  constructor(p1: Vector3, p2: Vector3, p3: Vector3) {
    this.plane.setFromCoplanarPoints(p1, p2, p3);

    // getting line of y axis of length 1
    this.#tmp1.subVectors(p2, p1).normalize();
    this.#tmp2.addVectors(p1, this.#tmp1);

    this.yLine.set(p1, this.#tmp2);

    // getting line of x axis of length 1
    this.#tmp2.crossVectors(this.plane.normal, this.#tmp1).normalize();
    this.#tmp1.addVectors(p1, this.#tmp2);
    this.xLine.set(p1, this.#tmp1);
  }

  projectPoint(p: Vector3, target: Vector3) {
    this.plane.projectPoint(p, target);
  }

  getXYProjection(p: Vector3, target: Vector2) {
    this.plane.projectPoint(p, this.#tmp1);
    const x = this.xLine.closestPointToPointParameter(this.#tmp1, false);
    const y = this.yLine.closestPointToPointParameter(this.#tmp1, false);

    target.set(x, y);
  }
}

import { Vector3 } from "three";
import { BoundingRect, BoundingRectLike, getFromMinMaxCoordinates } from "../BoundingRect";
import { AreaConfig, convertAreaConfig, getDefaultAreaConfig } from "./AreaConfig";
import { AreaLayout, Space } from "./AreaLayout";
import { RawMesh } from "../rawModel/RawMesh";

export type AreaLike = {
    layout: AreaLayout;
    config?: AreaConfig;
    box: BoundingRectLike;
};

export class Area {
    layout: AreaLayout;
    config?: AreaConfig;
    box: BoundingRect;
    hasError?: boolean;

    static fromLike(like: AreaLike): Area {
        const area = new Area(like.layout, {
            min: new Vector3(like.box.min.x, like.box.min.y, like.box.min.z),
            max: new Vector3(like.box.max.x, like.box.max.y, like.box.max.z),
            center: new Vector3(like.box.center.x, like.box.center.y, like.box.center.z),
            sizeX: like.box.sizeX,
            sizeY: like.box.sizeY,
            sizeZ: like.box.sizeZ,
        });

        if (like.config) {
            area.config = like.config;
        }

        return area;
    }

    constructor(layout: AreaLayout, box: BoundingRect) {
        this.layout = layout;
        this.box = box;
    }

    getConfigForLayout(layout: AreaLayout): AreaConfig {
        return !!this.config
            ? convertAreaConfig(this.config, layout)
            : getDefaultAreaConfig(layout);
    }

    getSpace(): Space {
        return this.getSpaceForLayout(this.layout);
    }

    getSpaceForLayout(layout: AreaLayout): Space {
        switch (layout.type) {
            case "1axis":
                return {
                    type: "1axis",
                    start: this.box.min[layout.axis],
                    end: this.box.max[layout.axis],
                    size: this.box.max[layout.axis] - this.box.min[layout.axis],
                };
            default:
                throw Error("Unexpected layout type: " + layout.type);
        }
    }

    getChildBox(space: Space): BoundingRect | undefined {
        const layout = this.layout;
        if (layout.type !== "1axis") {
            console.error("layout " + layout.type + " is not supported");
            return undefined;
        }

        const min = this.box.min.clone();
        const max = this.box.max.clone();

        if (layout.axis === "x") {
            min.x = space.start;
            max.x = space.end;
        } else if (layout.axis === "y") {
            min.y = space.start;
            max.y = space.end;
        } else if (layout.axis === "z") {
            min.z = space.start;
            max.z = space.end;
        }

        return {
            min,
            max,
            center: new Vector3((min.x + max.x) / 2, (min.y + max.y) / 2, (min.z + max.z) / 2),
            sizeX: max.x - min.x,
            sizeY: max.y - min.y,
            sizeZ: max.z - min.z,
        };
    }

    applyBoundaries(rect: BoundingRect) {
        this.box = {
            min: rect.min.clone(),
            max: rect.max.clone(),
            center: rect.center.clone(),
            sizeX: rect.sizeX,
            sizeY: rect.sizeY,
            sizeZ: rect.sizeZ,
        };
    }

    applySpace(space: Space, parent: Area) {
        const box = parent.getChildBox(space);
        if (!box) {
            return;
        }

        this.box = box;
    }
}

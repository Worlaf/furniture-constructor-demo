type AreaLayout1axis = {
    type: "1axis";
    axis: "x" | "y" | "z";
};

export type AreaLayout = AreaLayout1axis;

type Space1axis = {
    type: "1axis";
    start: number;
    end: number;
    size: number;
};

export type Space = Space1axis;

import { AreaConfig } from "./AreaConfig";
import { Space } from "./AreaLayout";

const ERRORS = {
    SpaceMinSizeViolation: "SpaceMinSizeViolation",
};

const Layout1axisFunctions = {
    getFreeSpaceForConfig: (root: Space, child: Space[], config: AreaConfig): Space | undefined => {
        if (child.length === 0) {
            return {
                start: root.start + config.minStartOffset,
                size: root.size - config.minStartOffset,
                end: root.end,
                type: config.type,
            };
        }

        const sortedChildren = child.toSorted((a, b) => a.start - b.start);
        let interval = sortedChildren[0].start - root.start - config.minStartOffset;
        if (interval > config.minSize) {
            return {
                start: root.start + config.minStartOffset,
                size: interval,
                end: root.start + interval + config.minStartOffset,
                type: config.type,
            };
        }

        for (let i = 0; i < sortedChildren.length - 1; i++) {
            interval = sortedChildren[i + 1].start - sortedChildren[i].end;
            if (interval > config.minSize) {
                return {
                    start: sortedChildren[i].end,
                    size: interval,
                    end: sortedChildren[i].end + interval,
                    type: config.type,
                };
            }
        }

        interval = root.end - sortedChildren[sortedChildren.length - 1].end;
        if (interval > config.minSize) {
            return {
                start: sortedChildren[sortedChildren.length - 1].end,
                size: interval,
                end: sortedChildren[sortedChildren.length - 1].end + interval,
                type: config.type,
            };
        }
    },

    getFreeSpaceForConfigWithExistingChildReduction: (
        root: Space,
        child: { space: Space; config: AreaConfig }[],
        config: AreaConfig
    ): Space | undefined => {
        const sortedChildren = child.toSorted((a, b) => a.space.start - b.space.start);
        let maxInterval = 0;

        for (let i = 0; i < sortedChildren.length - 1; i++) {
            maxInterval =
                sortedChildren[i + 1].space.start -
                (sortedChildren[i].space.start + sortedChildren[i].config.minSize);
            if (maxInterval > config.minSize) {
                return {
                    start: sortedChildren[i + 1].space.start - config.minSize,
                    size: config.minSize,
                    end: sortedChildren[i + 1].space.start,
                    type: config.type,
                };
            }
        }

        maxInterval =
            root.end -
            (sortedChildren[sortedChildren.length - 1].space.start +
                sortedChildren[sortedChildren.length - 1].config.minSize);
        if (maxInterval > config.minSize) {
            return {
                start: root.end - config.minSize,
                size: config.minSize,
                end: root.end,
                type: config.type,
            };
        }
    },

    applyConfig: (space: Space, config: AreaConfig): { space: Space; error?: string } => {
        const start = space.start;
        const size = config.maxSize && space.size > config.maxSize ? config.maxSize : space.size;
        const end = start + size;

        let error: string | undefined = undefined;
        if (config.minSize && size < config.minSize) {
            error = ERRORS.SpaceMinSizeViolation;
        }

        return {
            space: { size, start, end, type: config.type },
        };
    },

    resizeSpace: (space: Space, parentOld: Space, parentNew: Space): Space => {
        const factor = parentNew.size / parentOld.size;
        return {
            size: space.size * factor,
            start: space.start * factor,
            end: space.end * factor,
            type: space.type,
        };
    },
};

export const LayoutFunctions = {
    "1axis": Layout1axisFunctions,
};

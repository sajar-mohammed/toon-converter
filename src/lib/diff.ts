import { diffLines, Change } from "diff";
import { serializeToToon, type ToonOptions } from "./converter";

export interface DiffResult {
    changes: Change[];
}

export function diffToon(oldJson: any, newJson: any, options: ToonOptions = {}): DiffResult {
    const oldToon = serializeToToon(oldJson, options);
    const newToon = serializeToToon(newJson, options);

    const changes = diffLines(oldToon, newToon);

    return {
        changes
    };
}

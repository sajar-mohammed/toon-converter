import { encodingForModel, type TiktokenModel } from "js-tiktoken";

export function calculateTokens(text: string, model: TiktokenModel = "gpt-4o"): number {
    try {
        const enc = encodingForModel(model);
        return enc.encode(text).length;
    } catch (e) {
        console.error("Tokenization error:", e);
        return 0;
    }
}

export interface ComparisonResult {
    jsonTokens: number;
    toonTokens: number;
    savingsPercent: number;
}

export function compareTokenEfficiency(json: any, toon: string, model: TiktokenModel = "gpt-4o"): ComparisonResult {
    const jsonStr = JSON.stringify(json, null, 2);
    const jsonTokens = calculateTokens(jsonStr, model);
    const toonTokens = calculateTokens(toon, model);

    const savingsPercent = jsonTokens > 0
        ? ((jsonTokens - toonTokens) / jsonTokens) * 100
        : 0;

    return {
        jsonTokens,
        toonTokens,
        savingsPercent
    };
}

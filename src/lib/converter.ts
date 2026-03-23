/**
 * TOON (Token-Oriented Object Notation) Serializer
 * Optimizes JSON for LLM token efficiency.
 */

export interface ToonOptions {
  indent?: number;
  delimiter?: string;
  foldKeys?: boolean;
}

export function serializeToToon(obj: any, options: ToonOptions = {}): string {
  const { indent = 2, delimiter = ",", foldKeys = true } = options;

  function isObject(val: any) {
    return val !== null && typeof val === "object" && !Array.isArray(val);
  }

  function serialize(data: any, depth: number = 0, prefix: string = ""): string[] {
    const spacing = " ".repeat(depth * indent);

    if (data === null) return [`${prefix}null`];
    if (typeof data !== "object") return [`${prefix}${data}`];

    if (Array.isArray(data)) {
      if (data.length === 0) return [`${prefix}[]`];

      const first = data[0];
      const isUniform = data.every(item =>
        isObject(item) &&
        Object.keys(item).sort().join(",") === Object.keys(first).sort().join(",")
      );

      if (isUniform && isObject(first)) {
        const keys = Object.keys(first);
        const header = `${prefix}[${data.length}]{${keys.join(",")}}:`;
        const rows = data.map(item => {
          return " ".repeat((depth + 1) * indent) + keys.map(k => item[k]).join(delimiter);
        });
        return [header, ...rows];
      } else {
        const header = `${prefix}[${data.length}]:`;
        const items = data.flatMap(item => serialize(item, depth + 1));
        return [header, ...items];
      }
    }

    const keys = Object.keys(data);
    if (keys.length === 0) return [`${prefix}{}`];

    if (foldKeys && keys.length === 1 && isObject(data[keys[0]])) {
      const childKey = keys[0];
      return serialize(data[childKey], depth, `${prefix}${childKey}.`);
    }

    const lines: string[] = [];
    for (const key of keys) {
      const val = data[key];
      if (isObject(val) || Array.isArray(val)) {
        lines.push(`${spacing}${prefix}${key}:`);
        lines.push(...serialize(val, depth + 1));
      } else {
        lines.push(`${spacing}${prefix}${key}: ${val}`);
      }
    }
    return lines;
  }

  return serialize(obj).join("\n");
}

/**
 * TOON Parser
 * Converts TOON back into JSON.
 */
export function parseToonToJson(toon: string): any {
  const lines = toon.split("\n").filter(l => l.trim() !== "");
  let currentLine = 0;

  function getIndent(line: string) {
    const match = line.match(/^(\s*)/);
    return match ? match[1].length : 0;
  }

  function parseValue(val: string): any {
    const trimmed = val.trim();
    if (trimmed === "null") return null;
    if (trimmed === "true") return true;
    if (trimmed === "false") return false;
    if (trimmed === "[]") return [];
    if (trimmed === "{}") return {};
    if (!isNaN(Number(trimmed)) && trimmed !== "") return Number(trimmed);
    return trimmed;
  }

  function parseBlock(baseIndent: number): any {
    let result: any = null;
    let isArray = false;
    let arrayHeader: { keys: string[] } | null = null;

    while (currentLine < lines.length) {
      const line = lines[currentLine];
      const indent = getIndent(line);
      const content = line.trim();

      if (indent < baseIndent) break;

      // Handle Tabular Array Header: [n]{k1,k2}:
      const tabularMatch = content.match(/^\[\d+\]\{(.+)\}:$/);
      if (tabularMatch) {
        isArray = true;
        arrayHeader = { keys: tabularMatch[1].split(",").map(k => k.trim()) };
        result = [];
        currentLine++;
        continue;
      }

      // Handle Generic Array Header: [n]:
      const genericArrayMatch = content.match(/^\[\d+\]:$/);
      if (genericArrayMatch) {
        isArray = true;
        result = [];
        currentLine++;
        // Recurse to fill items
        while (currentLine < lines.length && getIndent(lines[currentLine]) > indent) {
          result.push(parseBlock(getIndent(lines[currentLine])));
        }
        continue;
      }

      // Handle data rows for tabular array
      if (isArray && arrayHeader) {
        const rowValues = content.split(",").map(v => parseValue(v));
        const item: any = {};
        arrayHeader.keys.forEach((key, i) => {
          item[key] = rowValues[i];
        });
        result.push(item);
        currentLine++;
        continue;
      }

      // Handle Key-Value or Nested Object
      const colonIndex = content.indexOf(":");
      if (colonIndex !== -1) {
        if (!result) result = {};
        const keyPath = content.slice(0, colonIndex).trim().split(".");
        const valuePart = content.slice(colonIndex + 1).trim();

        let currentRef = result;
        for (let i = 0; i < keyPath.length - 1; i++) {
          const part = keyPath[i];
          if (!currentRef[part]) currentRef[part] = {};
          currentRef = currentRef[part];
        }

        const lastKey = keyPath[keyPath.length - 1];

        if (valuePart !== "") {
          currentRef[lastKey] = parseValue(valuePart);
          currentLine++;
        } else {
          // Nested block
          currentLine++;
          const nextLine = lines[currentLine];
          if (nextLine && getIndent(nextLine) > indent) {
            currentRef[lastKey] = parseBlock(getIndent(nextLine));
          } else {
            currentRef[lastKey] = {};
          }
        }
      } else {
        // Primitive or single value line
        if (result === null) result = parseValue(content);
        currentLine++;
      }
    }

    return result;
  }

  return parseBlock(0);
}

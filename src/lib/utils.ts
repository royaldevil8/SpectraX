type ClassValue = string | number | boolean | undefined | null;
type ClassArray = ClassValue[];
type ClassDict = Record<string, boolean | undefined | null>;

function isClassDict(v: unknown): v is ClassDict {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function cn(...args: (ClassValue | ClassArray | ClassDict)[]): string {
  const classes: string[] = [];
  for (const arg of args) {
    if (!arg) continue;
    if (typeof arg === 'string' || typeof arg === 'number') {
      classes.push(String(arg));
    } else if (Array.isArray(arg)) {
      for (const item of arg) {
        if (typeof item === 'string' && item) classes.push(item);
      }
    } else if (isClassDict(arg)) {
      for (const [key, val] of Object.entries(arg)) {
        if (val) classes.push(key);
      }
    }
  }
  return classes.join(' ');
}

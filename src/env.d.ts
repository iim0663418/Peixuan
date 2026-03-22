declare module '*.md' {
  const content: string;
  export default content;
}

declare module '*.txt' {
  const content: string;
  export default content;
}

declare module '*.json' {
  const value: Record<string, unknown>;
  export default value;
}

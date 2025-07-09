import { Language } from "../types";

export const languages: Language[] = [
  {
    id: "java",
    name: "Java",
    extension: ".java",
    isCompiled: true,
  },
  {
    id: "csharp",
    name: "CSharp",
    extension: ".cs",
    isCompiled: true,
  },
  {
    id: "python",
    name: "Python",
    extension: ".py",
    isCompiled: false,
  },
  {
    id: "javascript",
    name: "Javascript",
    extension: ".js",
    isCompiled: false,
  },
  {
    id: "typescript",
    name: "Typescript",
    extension: ".ts",
    isCompiled: true,
  },
  {
    id: "groovy",
    name: "Groovy",
    extension: ".groovy",
    isCompiled: true,
  },
];

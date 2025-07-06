export interface LanguageValidationConfig {
  name: string;
  keywords: RegExp[];
  structurePatterns: RegExp[];
}

export const languageValidationConfigs: Record<
  string,
  LanguageValidationConfig
> = {
  javascript: {
    name: "JavaScript",
    keywords: [
      /\bfunction\b/,
      /\bconst\b/,
      /\blet\b/,
      /\bvar\b/,
      /\b=>\b/,
      /\bclass\b/,
      /\bimport\b/,
      /\bexport\b/,
      /\breturn\b/,
      /\bawait\b/,
      /\basync\b/,
      /\byield\b/,
      /\bthis\b/,
      /\bsuper\b/,
      /\bstatic\b/,
      /\bextends\b/,
      /\bconstructor\b/,
      /\btry\b/,
      /\bcatch\b/,
      /\bfinally\b/,
      /\bthrow\b/,
      /\bdelete\b/,
      /\binstanceof\b/,
      /\btypeof\b/,
      /\bPromise\b/,
    ],    structurePatterns: [
      /function\s+[a-zA-Z_]\w{0,30}\s*\([^\n]{0,100}\)\s*{/, 
      /const\s+[a-zA-Z_]\w{0,30}\s*=\s*\([^\n]{0,100}\)\s*=>\s*{/, 
      /class\s+[a-zA-Z_]\w{0,30}\s*{/,
      /import\s+\S+\s+from\s+(['"])[^'"\n]{1,200}\1/,
      /export\s+(?:default\s+)?(?:function|class|const)\s+[a-zA-Z_]\w{0,30}/,
      /\b(?:if|for|while|switch)\s*\([^()\n]{0,100}\)\s*{/,
      /try\s*{[^}]{0,500}}\s*catch\s*\([^()\n]{0,50}\)\s*{/,
      /new\s+Promise\s*\(\s*(?:async\s*)?\([^()\n]{0,100}\)\s*=>\s*{/,
      /async\s+function\s+[a-zA-Z_]\w{0,30}\s*\([^()\n]{0,100}\)\s*{/,
      /\[\s*\.{3}[a-zA-Z_]\w{0,30}\s*\]/,
      /\{\s*\.{3}[a-zA-Z_]\w{0,30}\s*\}/,
      /\$\{[^}\n]{1,100}\}/,
      /\b(?:map|filter|reduce|forEach)\s*\(\s*(?:\([^()\n]{0,50}\)|[^\s)]{1,50})\s*=>/,
      /\bPromise\.(?:all|race|resolve|reject)\(/,
      /\bObject\.(?:keys|values|entries|assign|freeze)\(/,
    ],
  },
  typescript: {
    name: "TypeScript",
    keywords: [
      /\binterface\b/,
      /\btype\b/,
      /\bfunction\b/,
      /\bconst\b/,
      /\blet\b/,
      /\bclass\b/,
      /\bimport\b/,
      /\bexport\b/,
      /\breturn\b/,
      /\bawait\b/,
      /\basync\b/,
      /\bextends\b/,
      /\bimplements\b/,
      /\bnamespace\b/,
      /\benum\b/,
      /\bprivate\b/,
      /\bprotected\b/,
      /\bpublic\b/,
      /\breadonly\b/,
      /\babstract\b/,
      /\bdeclare\b/,
      /\bkeyof\b/,
      /\bas\b/,
      /\binfer\b/,
      /\bsatisfies\b/,
    ],    structurePatterns: [
      /interface\s+[a-zA-Z_]\w{0,30}\s{0,3}\{/, 
      /interface\s+[a-zA-Z_]\w{0,30}\s{0,3}<[^>]{1,100}>\s{0,3}\{/, 
      /interface\s+[a-zA-Z_]\w{0,30}\s{0,3}extends\s+[a-zA-Z_]\w{0,30}(?:\s{0,3},\s{0,3}[a-zA-Z_]\w{0,30})*\s{0,3}\{/, 
      /interface\s+[a-zA-Z_]\w{0,30}\s{0,3}<[^>]{1,100}>\s{0,3}extends\s+[a-zA-Z_]\w{0,30}(?:\s{0,3},\s{0,3}[a-zA-Z_]\w{0,30})*\s{0,3}\{/,
      /type\s+[a-zA-Z_]\w{0,30}(?:<[^>]{0,100}>)?\s{0,3}=\s{0,3}(?:\{[^}]{0,200}\}|[^;\n]{1,200});?/,
      /function\s+[a-zA-Z_]\w{0,30}<[^>]{0,100}>\s{0,3}\([^)]{0,100}\)\s{0,3}:\s{0,3}[a-zA-Z_]\w{0,30}/,
      /const\s+[a-zA-Z_]\w{0,30}:\s{0,3}(?:[a-zA-Z_]\w{0,30}|\{[^}]{0,200}\}|\[[^\]]{0,200}\]|Promise<[^>]{0,100}>)/,
      /class\s+[a-zA-Z_]\w{0,30}(?:<[^>]{0,100}>)?\s{0,3}(?:implements\s+[a-zA-Z_][\w\s,]{0,100})?\s{0,3}\{/,
      /import\s+(?:type\s+)?[^\s]{1,100}\s+from\s+['"][^'"]{1,200}['"]/, 
      /export\s+(?:type\s+)?(?:default\s+)?(function|class|const|interface|type)\s+\w+/,
      /(?:private|protected|public)\s+\w{1,50}:\s*[^;\s]{1,200};/,
      /readonly\s+[^;\s]{1,200};/,
      /<[^>]{1,100}>\s*\([^)]{0,200}\)\s*=>\s*[^;\s]{1,200}/,
      /\[\s*([^:\s]{1,50})\s*:\s*[^\s\]]{1,200}\]/,
      /\|\s*null\b|\|\s*undefined\b/,
      /as\s+const\b/,
      /satisfies\s+[^;]+/,
      /Pick<[^>]+>|Omit<[^>]+>|Partial<[^>]+>|Required<[^>]+>|Record<[^>]+>/,
    ],
  },
  groovy: {
    name: "Groovy",
    keywords: [
      /\bdef\b/,
      /\bclass\b/,
      /\bextends\b/,
      /\bimplements\b/,
      /\binterface\b/,
      /\benum\b/,
      /\bprivate\b/,
      /\bprotected\b/,
      /\bpublic\b/,
      /\bstatic\b/,
      /\bfinal\b/,
      /\babstract\b/,
      /\bthis\b/,
      /\bsuper\b/,
      /\bnull\b/,
      /\breturn\b/,
      /\bvoid\b/,
      /\bimport\b/,
      /\bpackage\b/,
      /\btrait\b/,
      /\bas\b/,
      /\bin\b/,
      /\bprintln\b/,
      /\bprint\b/,
      /\bit\b/,
      /\bdelegate\b/,
      /\bowner\b/,
      /\bcall\b/,
      /\bcontains\b/,
      /\bget\b/,
      /\bpop\b/,
      /\bpush\b/,
      /\bsize\b/,
      /\badd\b/,
      /\bremove\b/,
      /\bclear\b/,
    ],
    structurePatterns: [
      /def\s+\w+\s*=\s*{\s*[^}\r\n]{0,500}}/,
      /def\s+\w+\s*\([^)]*\)\s*{/,
      /@\w+(?:\s*\([^)]*\))?/,
      /import\s+(?:static\s+)?[\w.]+(?:\s+as\s+\w+)?/,
      /package\s+[\w.]+/,
      /\$\{[^}]+\}/,
      /"""[\s\S]*?"""/,
      /\[\s*\w{1,50}\s*:\s*[^\s\]]{1,200}\]/,
      /\b\w+\s*\.\s*each\s*{/,
      /\b\w+\s*\.\s*collect\s*{/,
      /\b\w+\s*\.\s*findAll\s*{/,
      /\b\w+\s*\.\s*grep\s*{/,
      /\b\w+\s*\?\.\s*\w+/,
      /\b\w+\s*\*\.\s*\w+/,
      /def\s+\w{1,30}\s*=\s*{\s*(?:->\s*)?[^}\s]{1,500}}/,
      /\w{1,30}\s*=\s*{\s*(?:->\s*)?[^}\s]{1,500}}/,
      /\w{1,30}\s*\(\s*{\s*(?:->\s*)?[^}\s]{1,500}}\s*\)/,
      /\w{1,30}\s*{\s*(?:->\s*)?[^}\s]{1,500}}/,
      /\w{1,50}\s*\(\s*\)/,
      /'[^']*'/,
      /"[^"]*"/,
      /\$\{[^}]+\}/,
      /\b\w+\s*\.\s*\w+\s*\([^()]{0,100}\)/,
      /\b[a-zA-Z_]\w*\s*\.\s*[a-zA-Z_]\w*\b/,
      /def\s+\w+\s*=\s*\[[^\]]*\]/,
      /\b\w+\s*=\s*\[[^\]]{0,100}\]/,
      /\b\w+\.contains\([^)]{1,100}\)/,
      /\b\w+\.get\(\d+\)/,
      /\b\w+\.pop\(\s*\)/,
      /\b\w+\.push\([^)]{1,100}\)/,
      /\b\w+\.size\(\s*\)/,
      /\b\w+\.add\([^)]{1,100}\)/,
      /\b\w+\.remove\([^)]{1,100}\)/,
      /\b\w+\.clear\(\s*\)/
    ]
  },
  python: {
    name: "Python",
    keywords: [
      /\bdef\b/,
      /\bclass\b/,
      /\blambda\b/,
      /\bimport\b/,
      /\bfrom\b/,
      /\breturn\b/,
      /\bif\b/,
      /\bfor\b/,
      /\bwhile\b/,
      /\bwith\b/,
      /\byield\b/,
      /\basync\b/,
      /\bawait\b/,
    ],    structurePatterns: [
      /def\s{0,3}[a-zA-Z_]\w{0,30}\s{0,3}\([^)]{0,100}\):/,
      /class\s{0,3}[a-zA-Z_]\w{0,30}(?:\s{0,3}\([^)]{0,100}\))?:/,
      /[a-zA-Z_]\w{0,30}\s{0,3}=\s{0,3}lambda\s{1,3}[^:\n]{0,100}:/,
      /from\s{1,3}[a-zA-Z_][\w.]{0,50}\s{1,3}import\s{1,3}[^#\n]{0,100}/,
      /import\s{1,3}[a-zA-Z_][\w.]{0,50}(?:\s{1,3}as\s{1,3}[a-zA-Z_]\w{0,30})?/,
      /if\s{1,3}(?:[^:#\n]){1,100}:/,
      /for\s{1,3}[a-zA-Z_]\w{0,30}\s{1,3}in\s{1,3}[^:#\n]{1,100}:/,
      /while\s{1,3}(?:[^:#\n]){1,100}:/,
      /async\s{1,3}def\s{1,3}[a-zA-Z_]\w{0,30}\s{0,3}\([^)]{0,100}\):/
    ]
  },
  java: {
    name: "Java",
    keywords: [
      /\bpublic\b/,
      /\bprivate\b/,
      /\bprotected\b/,
      /\bclass\b/,
      /\binterface\b/,
      /\benum\b/,
      /\bvoid\b/,
      /\bstatic\b/,
      /\bfinal\b/,
      /\bextends\b/,
      /\bimplements\b/,
      /\breturn\b/,
      /\bthrow\b/,
      /\btry\b/,
      /\bcatch\b/,
    ],    structurePatterns: [
      /(?:public|private|protected)\s{1,3}(?:static\s{1,3})?void\s{1,3}[a-zA-Z_]\w{0,30}\s{0,3}\([^)]{0,100}\)\s{0,3}\{/, 
      /(?:public|private|protected)\s{1,3}(?:static\s{1,3})?[a-zA-Z_]\w{0,30}\s{1,3}[a-zA-Z_]\w{0,30}\s{0,3}\([^)]{0,100}\)\s{0,3}\{/, 
      /(?:public|private|protected)\s{1,3}(?:static\s{1,3})?[a-zA-Z_]\w{0,30}<[^>]{0,100}>\s{1,3}[a-zA-Z_]\w{0,30}\s{0,3}\([^)]{0,100}\)\s{0,3}\{/, 
      /class\s{1,3}[a-zA-Z_]\w{0,30}(?:\s{1,3}extends\s{1,3}[a-zA-Z_]\w{0,30})?(?:\s{1,3}implements\s{1,3}[^{;]{1,200})?\s{0,3}\{/,
      /interface\s{1,3}[a-zA-Z_]\w{0,30}(?:\s{1,3}extends\s{1,3}[^{;]{1,200})?\s{0,3}\{/,
      /enum\s{1,3}[a-zA-Z_]\w{0,30}\s{0,3}\{/,
      /package\s{1,3}[a-zA-Z_][\w.]{0,50};/,
      /import\s{1,3}[a-zA-Z_][\w.]{0,50}(?:\s{0,3}\.\s{0,3}\*)?;/,
      /@[a-zA-Z_]\w{0,30}(?:\s{0,3}\([^)]{0,100}\))?/,
    ],
  },
  csharp: {
    name: "C#",
    keywords: [
      /\bpublic\b/,
      /\bprivate\b/,
      /\bprotected\b/,
      /\bclass\b/,
      /\binterface\b/,
      /\benum\b/,
      /\bvoid\b/,
      /\bstatic\b/,
      /\bconst\b/,
      /\breadonly\b/,
      /\bnamespace\b/,
      /\busing\b/,
      /\bawait\b/,
      /\basync\b/,
      /\bvar\b/,
    ],    structurePatterns: [
      /namespace\s{1,3}[a-zA-Z_][\w.]{0,50}\s{0,3}\{/,
      /using\s{1,3}[a-zA-Z_][\w.]{0,50};/,
      /class\s{1,3}[a-zA-Z_]\w{0,30}(?:\s{0,3}:\s{0,3}[^{]{0,100})?\s{0,3}\{/,
      /interface\s{1,3}[a-zA-Z_]\w{0,30}(?:\s{0,3}:\s{0,3}[^{]{0,100})?\s{0,3}\{/,
      /(?:public|private|protected)\s{1,3}(?:static\s{1,3})?(?:async\s{1,3})?[a-zA-Z_][\w<>]{0,50}\s{1,3}[a-zA-Z_]\w{0,30}\s{0,3}\([^)]{0,200}\)\s{0,3}\{/,
      /\[[a-zA-Z_][\w<>()]{0,50}\]/,
      /(?:get|set)\s{0,3}[{;]/,
    ],
  },
  go: {
    name: "Go",
    keywords: [
      /\bfunc\b/,
      /\btype\b/,
      /\bstruct\b/,
      /\binterface\b/,
      /\bpackage\b/,
      /\bimport\b/,
      /\bvar\b/,
      /\bconst\b/,
      /\breturn\b/,
      /\bdefer\b/,
      /\bgo\b/,
      /\bchan\b/,
      /\bselect\b/,
      /\brange\b/,
    ],    structurePatterns: [
      /package\s{1,3}[a-zA-Z_]\w{0,30}/,
      /import\s{1,3}(?:\(\s{0,3}[^)]{0,200}\s{0,3}\)|["'][a-zA-Z_][\w./]{0,50}["'])/,
      /func\s{1,3}[a-zA-Z_]\w{0,30}\s{0,3}\([^)]{0,100}\)\s{0,3}(?:\([^)]{0,100}\)\s{0,3})?\{/,
      /type\s{1,3}[a-zA-Z_]\w{0,30}\s{1,3}struct\s{0,3}\{/,
      /type\s{1,3}[a-zA-Z_]\w{0,30}\s{1,3}interface\s{0,3}\{/,
      /var\s{0,3}\(\s{0,3}[^)]{0,200}\s{0,3}\)/,
      /const\s{0,3}\(\s{0,3}[^)]{0,200}\s{0,3}\)/
    ]
  },
  rust: {
    name: "Rust",
    keywords: [
      /\bfn\b/,
      /\blet\b/,
      /\bconst\b/,
      /\bstatic\b/,
      /\bstruct\b/,
      /\benum\b/,
      /\btrait\b/,
      /\bimpl\b/,
      /\bpub\b/,
      /\buse\b/,
      /\bmod\b/,
      /\basync\b/,
      /\bawait\b/,
      /\bmut\b/,
    ],
    structurePatterns: [
      /struct\s+\w+(?:<[^>]*>)?\s*{/,
      /enum\s+\w+\s*{/,
      /trait\s+\w+(?:<[^>]*>)?\s*{/,
      /impl(?:<[^>]*>)?\s+\w+(?:\s+for\s+\w+(?:<[^>]*>)?)?\s*{/,
      /use\s+[\w:]+(?:::\{[^}]*\})?;/,
      /mod\s+\w+\s*{/,
    ],
  },
  ruby: {
    name: "Ruby",
    keywords: [
      /\bdef\b/,
      /\bclass\b/,
      /\bmodule\b/,
      /\binclude\b/,
      /\bextend\b/,
      /\brequire\b/,
      /\brequire_relative\b/,
      /\battr_accessor\b/,
      /\battr_reader\b/,
      /\battr_writer\b/,
      /\bprivate\b/,
      /\bprotected\b/,
      /\bpublic\b/,
      /\bend\b/,
      /\bdo\b/,
      /\byield\b/,
      /\breturn\b/,
      /\bnil\b/,
      /\bself\b/,
      /\bsuper\b/,
      /\brescue\b/,
      /\bensure\b/,
      /\balias\b/,
      /\blambda\b/,
      /\bproc\b/,
    ],    structurePatterns: [
      /class\s{1,3}[a-zA-Z_]\w{0,30}(?:\s{0,3}<\s{0,3}[a-zA-Z_]\w{0,30})?/,
      /module\s{1,3}[a-zA-Z_]\w{0,30}/,
      /def\s{1,3}[a-zA-Z_]\w{0,30}(?:\s{0,3}\([^)]{0,100}\))?/,
      /[a-zA-Z_]\w{0,30}\s{0,3}=\s{0,3}Class\.new/,
      /[a-z_]\w{0,30}\s{0,3}=\s{0,3}Module\.new/,
      /[a-zA-Z_]\w{0,30}\s{0,3}=\s{0,3}Proc\.new\s{0,3}\{/,
      /[a-z_]\w{0,30}\s{0,3}=\s{0,3}lambda\s{0,3}\{/,
      /(?:[a-z_]\w{0,30}|[A-Z]\w{0,30}(?:::[A-Z]\w{0,30})?)\s{0,3}\.\s{0,3}each(?:\s{0,3}\{|do\b)/,
      /(?:[a-z_]\w{0,30}|[A-Z]\w{0,30}(?:::[A-Z]\w{0,30})?)\s{0,3}\.\s{0,3}map(?:\s{0,3}\{|do\b)/,
      /(?:[a-z_]\w{0,30}|[A-Z]\w{0,30}(?:::[A-Z]\w{0,30})?)\s{0,3}\.\s{0,3}select(?:\s{0,3}\{|do\b)/,
      /(?:[a-z_]\w{0,30}|[A-Z]\w{0,30}(?:::[A-Z]\w{0,30})?)\s{0,3}\.\s{0,3}reject(?:\s{0,3}\{|do\b)/,
      /begin\s{0,3}\n[^;]{1,100}\n\s{0,3}rescue/,
      /if\s{1,3}[^;\n]{1,100}\s{1,3}then/,
      /unless\s{1,3}[^;\n]{1,100}\s{1,3}then/,
      /case\s{1,3}[^;\n]{1,100}\s{1,3}when/,      /%[qQrswWx][{[(][^})\]]{0,100}[})]/,
      /[a-zA-Z_]\w{0,30}\s{0,3}=\s{0,3}%[qQrswWx][{[(][^})\]]{0,100}[})]/,
      /\$[a-zA-Z_]\w{0,30}\b/,
      /@[a-zA-Z_]\w{0,30}\b/,
      /@@[a-zA-Z_]\w{0,30}\b/,
    ]
  },
  shell: {
    name: "Shell",
    keywords: [
      /\becho\b/,
      /\bexport\b/,
      /\bsource\b/,
      /\bcd\b/,
      /\bls\b/,
      /\bcp\b/,
      /\bmv\b/,
      /\brm\b/,
      /\bmkdir\b/,
      /\bchmod\b/,
      /\bchown\b/,
      /\bgrep\b/,
      /\bawk\b/,
      /\bsed\b/,
      /\bcat\b/,
      /\btail\b/,
      /\bhead\b/,
      /\bfind\b/,
      /\bif\b/,
      /\bthen\b/,
      /\belse\b/,
      /\bfi\b/,
      /\bfor\b/,
      /\bwhile\b/,
      /\bdo\b/,
      /\bdone\b/,
    ],    structurePatterns: [
      /^#!\/bin\/(?:ba)?sh\b/,
      /if\s{1,3}\[\s{0,3}[^\]]{1,100}\s{0,3}\]\s{0,3};\s{0,3}then\b/,
      /for\s{1,3}[a-zA-Z_]\w{0,30}\s{1,3}in\s{1,3}[^\s;]{1,100};\s{0,3}do\b/,
      /while\s{1,3}\[\s{0,3}[^\]]{1,100}\s{0,3}\]\s{0,3};\s{0,3}do\b/,
      /case\s{1,3}\$[a-zA-Z_]\w{0,30}\s{1,3}in\b/,
      /function\s{1,3}[a-zA-Z_]\w{0,30}\s{0,3}\(\s{0,3}\)\s{0,3}\{/,
      /\$\{[a-zA-Z_]\w{0,30}(?::-[^}]{0,50})?}/,
      /\$\(\([0-9a-zA-Z\s+\-*/()]{1,50}\)\)/,      /\$\([a-zA-Z_][\w\s-]{0,50}\)/,
      /\[\s{1,3}[^\]]{1,50}\s{1,3}\]/,
      /\|\s{0,3}[a-zA-Z_]\w{0,30}\b/,
      />\s{0,3}[a-zA-Z_][/.\w-]{0,100}/,
      />>\s{0,3}[a-zA-Z_][/.\w-]{0,100}/,
      /2>\s{0,3}[a-zA-Z_][/.\w-]{0,100}/,
      /2>>\s{0,3}[a-zA-Z_][/.\w-]{0,100}/,
      /&>\s{0,3}[a-zA-Z_][/.\w-]{0,100}/,
      /\$[a-zA-Z_]\w{0,30}\b/,
      /\$\{#[a-zA-Z_]\w{0,30}\}/,
      /\$\{[a-zA-Z_]\w{0,30}:-[^}]{0,50}\}/,
      /\$\{[a-zA-Z_]\w{0,30}:=[^}]{0,50}\}/,
    ],
  },
  powershell: {
    name: "PowerShell",
    keywords: [
      /\bfunction\b/,
      /\bparam\b/,
      /\bbegin\b/,
      /\bprocess\b/,
      /\bend\b/,
      /\bif\b/,
      /\belse\b/,
      /\belseif\b/,
      /\bforeach\b/,
      /\bwhile\b/,
      /\bdo\b/,
      /\bfor\b/,
      /\bin\b/,
      /\breturn\b/,
      /\bthrow\b/,
      /\btry\b/,
      /\bcatch\b/,
      /\bfinally\b/,
      /\bbreak\b/,
      /\bcontinue\b/,
      /\bswitch\b/,
      /\bdefault\b/,
      /\bNew-Object\b/,
      /\bWrite-Host\b/,
      /\bWrite-Output\b/,
    ],    structurePatterns: [
      /function\s{1,3}[a-zA-Z_]\w{0,30}(?:\s{0,3}\{|\s{0,3}\([^)]{0,100}\)\s{0,3}\{)/,
      /param\s{0,3}\([^)]{0,100}\)/,
      /if\s{0,3}\([^)]{0,100}\)\s{0,3}\{/,
      /foreach\s{0,3}\(\$[a-zA-Z_]\w{0,30}\s{1,3}in\s{1,3}[^)]{1,100}\)\s{0,3}\{/, 
      /while\s{0,3}\([^)]{0,100}\)\s{0,3}\{/, 
      /do\s{0,3}\{[^}]{0,200}\}\s{0,3}while\s{0,3}\([^)]{0,100}\)/, 
      /switch\s{0,3}\([^)]{0,100}\)\s{0,3}\{/, 
      /try\s{0,3}\{[^}]{0,200}\}\s{0,3}catch\s{0,3}\{/, 
      /\$[a-zA-Z_]\w{0,30}\s{0,3}=\s{0,3}New-Object\s{1,3}[a-zA-Z_.]{1,50}/, 
      /\[[a-zA-Z_.]{1,50}\]::[a-zA-Z_]\w{0,30}/, 
      /\$[a-zA-Z_]\w{0,30}\s{0,3}=\s{0,3}@\{[^}]{0,200}\}/, 
      /\$[a-zA-Z_]\w{0,30}\s{0,3}=\s{0,3}@\([^)]{0,200}\)/, 
      /\$[a-zA-Z_]\w{0,30}\.[a-zA-Z_]\w{0,30}\([^)]{0,100}\)/, 
      /\|\s{0,3}%\s{0,3}\{[^}]{0,100}\}/, 
      /\|\s{0,3}where\s{0,3}\{[^}]{0,100}\}/, 
      /\|\s{0,3}select\s{0,3}\{[^}]{0,100}\}/, 
      /\$PSScriptRoot\b/, 
      /\$PSCommandPath\b/, 
      /\$[a-zA-Z_]\w{0,30}\s{0,3}-[a-zA-Z]\w{0,30}/, 
      /\$\(\s{0,3}[^)]{1,100}\s{0,3}\)/
    ]
  },
  bash: {
    name: "Bash",
    keywords: [
      /\becho\b/,
      /\bexport\b/,
      /\bsource\b/,
      /\balias\b/,
      /\bfunction\b/,
      /\blocal\b/,
      /\bset\b/,
      /\bunset\b/,
      /\bshift\b/,
      /\btest\b/,
      /\blet\b/,
      /\bdeclare\b/,
      /\beval\b/,
      /\bexec\b/,
      /\bexit\b/,
      /\bread\b/,
      /\breturn\b/,
      /\bbreak\b/,
      /\bcontinue\b/,
      /\bselect\b/,
      /\btime\b/,
      /\btrap\b/,
      /\bwait\b/,
      /\bkill\b/,
      /\bgetopts\b/,
    ],
    structurePatterns: [
      /^#!\/bin\/bash/,
      /function\s+\w+\s*\(\)/,
      /for\s+\(\(.*\)\)/,
      /for\s+\w+\s+in\s+/,
      /case\s+\$\w+\s+in/,
      /select\s+\w+\s+in/,
      /\$\{[^#}]*#[^}]*\}/,
      /\$\{[^%}]*%[^}]*\}/,
      /\$\{[^/}]*\/[^}]*\}/,
      /\$\{[^:}]*:[^}]*\}/,
      /\$\(\(.*\)\)/,
      /<<-?'?EOF'?/,
      /\[\[?\s+[^\]\s]+\s+\]?\]/,
      /\$\{!.+\}/,
      /\$@/,
      /\$\{\d+\}/,
    ],
  },
};

export function validateCodeSnippet(
  code: string,
  language?: keyof (typeof languageValidationConfigs & { bdd: never })
): {
  isValid: boolean;
  language?: string;
  messages: string[];
} {
  if (language === "bdd") {
    return validateBDDScenario(code);
  }

  const results: string[] = [];

  const trimmedCode = code.trim().replace(/\s+/g, " ");

  if (trimmedCode.length < 10) {
    return {
      isValid: false,
      messages: ["Code snippet is too short"],
    };
  }

  if (language && languageValidationConfigs[language]) {
    const config = languageValidationConfigs[language];
    console.log(`Validating against specified language: ${config.name}`);

    const hasDisqualifyingPatterns = checkLanguageDisqualifiers(
      trimmedCode,
      config.name
    );
    if (hasDisqualifyingPatterns) {
      return {
        isValid: false,
        language,
        messages: [
          `Code contains syntax that is not valid in ${config.name}.`,
          "Please ensure you are using the correct language for this code.",
        ],
      };
    }

    const validationResult = validateAgainstLanguage(trimmedCode, config, true);

    if (
      !validationResult.isValid ||
      validationResult.score < validationResult.minRequiredScore * 1.5
    ) {
      return {
        isValid: false,
        language,
        messages: [
          `Code does not match ${config.name} syntax.`,
          `Please ensure the code follows ${config.name} conventions.`,
          ...validationResult.messages,
        ],
      };
    }

    return {
      isValid: true,
      language,
      messages: validationResult.messages,
    };
  }

  console.log("No language specified, attempting to detect language...");

  const detectedLanguage = detectLanguageFromIndicators(trimmedCode);
  if (detectedLanguage) {
    console.log(`Detected language from indicators: ${detectedLanguage}`);
    const config = languageValidationConfigs[detectedLanguage];
    const validationResult = validateAgainstLanguage(
      trimmedCode,
      config,
      false
    );

    if (validationResult.isValid) {
      return {
        isValid: true,
        language: detectedLanguage,
        messages: validationResult.messages,
      };
    }
  }

  const languagesToCheck = Object.keys(languageValidationConfigs);

  for (const lang of languagesToCheck) {
    const config = languageValidationConfigs[lang];
    const validationResult = validateAgainstLanguage(
      trimmedCode,
      config,
      false
    );

    if (validationResult.isValid) {
      return {
        isValid: true,
        language: lang,
        messages: validationResult.messages,
      };
    }
  }

  return {
    isValid: false,
    messages: [
      "No valid code structure detected.",
      "Ensure the code follows the syntax of the specified programming language.",
      "Code should include language-specific keywords and valid structure patterns.",
    ],
  };
}

export function detectLanguageFromIndicators(code: string): string | null {
  if (code.includes('def ') || /[a-zA-Z_]\w{0,30}\s{0,3}=\s{0,3}\{\s{0,3}[^}]{0,100}\s{0,3}\}/.test(code) || code.includes('println')) {
    return 'groovy';
  }

  if (code.includes("def ") && code.includes(":")) {
    return "python";
  }
  
  if (code.includes('interface ') || code.includes('type ') || /<[^>]{1,100}>/.test(code)) {
    return 'typescript';
  }

  if (/public\s{1,3}class/.test(code) || /private\s{1,3}void/.test(code)) {
    return "java";
  }

  if (code.includes("const ") || code.includes("let ") || /=>\s{0,3}\{/.test(code)) {
    return "javascript";
  }

  if (
    code.includes("public ") ||
    code.includes("private ") ||
    code.includes("protected ")
  ) {
    return "java";
  }

  return null;
}

export function validateAgainstLanguage(
  code: string,
  config: LanguageValidationConfig,
  isSpecificLanguage: boolean = false
): {
  isValid: boolean;
  messages: string[];
  score: number;
  minRequiredScore: number;
} {
  const results: string[] = [];
  let score = 0;
  const maxScore = config.keywords.length + config.structurePatterns.length;

  if (code.trim().length < 10) {
    return {
      isValid: false,
      messages: [
        "Code snippet is too short. Please provide a complete code example.",
      ],
      score: 0,
      minRequiredScore: Math.ceil(maxScore * 0.3),
    };
  }

  const hasBasicStructure =
    /^[\s\S]*\b(function|class|def|import|package|public|private|protected)\b[\s\S]*$/.test(
      code
    ) ||
    /^[\s\S]*\b\w+\s*\(.*\)\s*{[\s\S]*$/.test(code) ||
    /^[\s\S]*\b\w+\s*=[\s\S]*$/.test(code);

  if (!hasBasicStructure) {
    return {
      isValid: false,
      messages: [
        "No valid code structure detected. Please provide actual code with proper syntax.",
      ],
      score: 0,
      minRequiredScore: Math.ceil(maxScore * 0.3),
    };
  }

  const gibberishPattern = /^[a-zA-Z]{1,4}$/;
  if (gibberishPattern.test(code.trim())) {
    return {
      isValid: false,
      messages: ["Invalid input: Please provide actual code, not random text."],
      score: 0,
      minRequiredScore: Math.ceil(maxScore * 0.3),
    };
  }

  const minRequiredScore = isSpecificLanguage
    ? Math.ceil(maxScore * 0.3)
    : Math.ceil(maxScore * 0.2);

  const matchedKeywords = config.keywords.filter((keyword) => {
    const match = keyword.test(code);
    if (match) {
      const keywordStr = keyword.toString().replace(/\\b|\\/g, "");
      const contextPattern = new RegExp(`\\b${keywordStr}\\b[\\s{(]`);
      return contextPattern.test(code);
    }
    return false;
  });
  score += matchedKeywords.length;

  const matchedPatterns = config.structurePatterns.filter((pattern) => {
    const match = pattern.test(code);
    if (match) {
      const openBrackets = (code.match(/[{([]/g) || []).length;
      const closeBrackets = (code.match(/[}\])]/g) || []).length;
      return openBrackets === closeBrackets;
    }
    return false;
  });
  score += matchedPatterns.length * 2;

  const hasComplexity = code.split(/[;{}]/).length > 2;
  const hasValidNaming = /^[a-zA-Z_$][\w$]*$/.test(code.split(/[\s{();=]/)[0]);
  const hasProperIndentation = /\n\s+/.test(code);

  if (score >= minRequiredScore && hasComplexity && hasValidNaming) {
    if (matchedKeywords.length > 0) {
      results.push(
        `Found ${matchedKeywords.length} valid language-specific keywords`
      );
    }
    if (matchedPatterns.length > 0) {
      results.push(`Found ${matchedPatterns.length} valid code patterns`);
    }
    if (hasProperIndentation) {
      results.push("Code has proper formatting");
    }

    return {
      isValid: true,
      messages: results,
      score,
      minRequiredScore,
    };
  }

  return {
    isValid: false,
    messages: [
      `Code does not match ${config.name} syntax`,
      "Please ensure your code includes proper language syntax and structure",
      score < minRequiredScore
        ? "Not enough valid code patterns detected"
        : "Invalid code structure",
    ],
    score,
    minRequiredScore,
  };
}

export function checkLanguageDisqualifiers(code: string, language: string): boolean {
  switch (language) {
    case "Java": {
      const javaDisqualifiers = [
        /\bdef\b/, 
        /\b\w+\s*=\s*{/, 
        /\bprintln\s+"[^"]*"(?!\s*;)/, 
        /\b\w+\s*\(\s*\)(?!\s*;)/,
        /def\s+\w+\s*=\s*\[/, 
        /\b\w+\.pop\(\s*\)(?!\s*;)/u, 
        /\b\w+\.contains\(\s*[^)\s]+\s*\)(?!\s*;)/u, 
        /import\s+\w+\s+as\s+\w+/, 
        /\bfrom\s+[\w.]+\s+import\b/, 
        /\b\w+\s*=\s*\w+\s*\([^()]*\)\s*$/u, 
        /^\s*import\s+\w+\s*$/, 
        /^\b\w+\s*:\s*$/u, 
        /\s{4}|\t/,
      ];
      return javaDisqualifiers.some((pattern) => pattern.test(code));
    }

    case "JavaScript": {
      const jsDisqualifiers = [
        /\bdef\b/,
        /\bpublic\b/,
        /\bprivate\b/,
        /\bprotected\b/,
        /\bpackage\b/,
      ];
      return jsDisqualifiers.some((pattern) => pattern.test(code));
    }

    case "TypeScript": {
      const tsDisqualifiers = [/\bdef\b/, /\bpackage\b/, /\bprintln\b/];
      return tsDisqualifiers.some((pattern) => pattern.test(code));
    }

    default:
      return false;
  }
}

export function validateBDDScenario(scenario: string): {
  isValid: boolean;
  messages: string[];
} {
  const trimmedScenario = scenario.trim().replace(/\s+/g, " ");
  const bddKeywords = ["Given", "When", "Then"];
  const hasAllKeywords = bddKeywords.every((keyword) =>
    trimmedScenario.includes(keyword)
  );

  const isLongEnough = trimmedScenario.length >= 10;

  if (hasAllKeywords && isLongEnough) {
    return {
      isValid: true,
      messages: ["Valid BDD scenario structure detected"],
    };
  }

  return {
    isValid: false,
    messages: [
      "BDD scenario must include Given, When, and Then keywords",
      "Scenario should be at least 10 characters long",
    ],
  };
}

export function getCodeLanguage(code: string): string | null {
  for (const [lang, config] of Object.entries(languageValidationConfigs)) {
    if (config.keywords.some((keyword) => keyword.test(code))) {
      return lang;
    }
  }
  return null;
}

export function checkCodeSyntax(code: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (code.trim().length === 0) {
    errors.push("Code snippet is empty");
  }

  const openBrackets = (code.match(/[{([]/g) || []).length;
  const closeBrackets = (code.match(/[}\])]/g) || []).length;

  if (openBrackets !== closeBrackets) {
    errors.push("Unbalanced brackets detected");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

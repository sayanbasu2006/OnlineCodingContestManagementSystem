export const LANGUAGE_MAP: Record<string, string> = {
  cpp: "cpp",
  c: "c",
  java: "java",
  python: "python",
  javascript: "javascript",
};

export const BOILERPLATE: Record<string, string> = {
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your solution here\n    \n    return 0;\n}`,
  c: `#include <stdio.h>\n\nint main() {\n    // Your solution here\n    \n    return 0;\n}`,
  java: `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Your solution here\n        \n    }\n}`,
  python: `# Your solution here\n\ndef solve():\n    pass\n\nsolve()`,
  javascript: `// Your solution here\nconst readline = require('readline');\nconst rl = readline.createInterface({ input: process.stdin });\n\nrl.on('line', (line) => {\n    // Process input\n});`,
};

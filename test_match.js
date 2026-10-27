const code = `
  const handleDrumStyleSelect = (style: string) => {
    if (style === 'off') {
      return;
    }
  };
  return (
    <div>
      hello
    </div>
  );
}
`;
const targetFuncStart = "  const handleDrumStyleSelect =";
let startIdx = code.indexOf(targetFuncStart);
let currentIdx = startIdx + 10;
let depth = 0;
while (currentIdx < code.length) {
   if (code[currentIdx] === '{') depth++;
   if (code[currentIdx] === '}') {
      if (depth === 0) break;
      depth--;
   }
   currentIdx++;
}
console.log("oldFunc:", code.substring(startIdx, currentIdx + 1));

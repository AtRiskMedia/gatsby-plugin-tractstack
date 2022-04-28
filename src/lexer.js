const DOUBLEQUOTE = `"`;
const BRACKETLEFT = `(`;
const BRACKETRIGHT = `)`;
const SEMICOLON = `;`;
const NEWLINE = `\n`;
const WHITESPACE = [" ", "\n", "\t"];

function lispLexer(payload = "", inString = false) {
  const tokens = [];
  let curToken = "";

  for (let i = 0; i < payload.length; i++) {
    const char = payload.charAt(i);
    if (char === DOUBLEQUOTE && inString === false) {
      console.log("open quote");
      const [tokenized, remaining] = lispLexer(payload.substring(i + 1), true);
      tokens.push(tokenized);
      payload = remaining;
      i = -1;
    } else if (char === DOUBLEQUOTE) {
      console.log("close quote");
      if (curToken.length) {
        tokens.push(+curToken || curToken);
      }
      return [tokens, payload.substring(i + 1)];
    } else if (char === BRACKETLEFT) {
      const [tokenized, remaining] = lispLexer(payload.substring(i + 1));
      tokens.push(tokenized);
      payload = remaining;
      i = -1;
    } else if (char === BRACKETRIGHT) {
      if (curToken.length) {
        tokens.push(+curToken || curToken);
      }
      return [tokens, payload.substring(i + 1)];
    } else if (char === SEMICOLON) {
      while (payload.charAt(i) !== NEWLINE) {
        i++;
      }
    } else if (WHITESPACE.includes(char) && inString !== true) {
      if (curToken.length) {
        tokens.push(+curToken || curToken);
      }
      curToken = "";
    } else {
      curToken += char;
    }
  }
  return [tokens, ""];
}

export { lispLexer };

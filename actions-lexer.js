const BRACKETLEFT = `(`;
const BRACKETRIGHT = `)`;
const SEMICOLON = `;`;
const NEWLINE = `\n`;
const WHITESPACE = [" ", "\n", "\t"];

function lispLexer(payload = "") {
  const tokens = [];
  let curToken = "";

  for (let i = 0; i < payload.length; i++) {
    const char = payload.charAt(i);

    if (char === BRACKETLEFT) {
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
    } else if (WHITESPACE.includes(char)) {
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
//# sourceMappingURL=actions-lexer.js.map
export interface CharacterStream {
  next(): string;
  peek(num?: number): string;
  extract(): { position: number; lexeme: string };
}

export function scan(source: string): CharacterStream {
  let start = 0;
  let current = 0;

  const done = (num = 0) => current + num >= source.length;

  return {
    next() {
      return done() ? "\0" : source.charAt(current++);
    },
    peek(num = 0) {
      return done(num) ? "\0" : source.charAt(current + num);
    },
    extract() {
      const lexeme = source.slice(start, current);
      const position = start;
      start = current;
      return { position, lexeme };
    },
  };
}

export function match(char: string, ...matches: string[]) {
  for (let match of matches) {
    if (match.length === 1) {
      if (char === match) return true;
    } else {
      let [begin, _, end] = match;
      if (char >= begin && char <= end) return true;
    }
  }

  return false;
}

/*
export class Scanner {
  private tokens: Token[] = [];
  private start = 0;
  private current = 0;
  private line = 1;

  constructor(private readonly source: string) {}

  scanTokens() {
    while (!this.isAtEnd()) {
      // We are at the beginning of the next lexeme.
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(new Token(TokenType.EOF, "", null, this.line));
    return this.tokens;
  }

  private scanToken() {
    let c = this.advance();
    switch (c) {
      case "(":
        this.addToken(TokenType.LeftParen);
        break;
      case ")":
        this.addToken(TokenType.RightParen);
        break;
      case "{":
        this.addToken(TokenType.LeftBrace);
        break;
      case "}":
        this.addToken(TokenType.RightBrace);
        break;
      case ",":
        this.addToken(TokenType.Comma);
        break;
      case ".":
        this.addToken(TokenType.Dot);
        break;
      case "-":
        this.addToken(TokenType.Minus);
        break;
      case "+":
        this.addToken(TokenType.Plus);
        break;
      case ";":
        this.addToken(TokenType.Semicolon);
        break;
      case "*":
        this.addToken(TokenType.Star);
        break;
      case "!":
        this.addToken(this.match("=") ? TokenType.BangEqual : TokenType.Bang);
        break;
      case "=":
        this.addToken(this.match("=") ? TokenType.EqualEqual : TokenType.Equal);
        break;
      case "<":
        this.addToken(this.match("=") ? TokenType.LessEqual : TokenType.Less);
        break;
      case ">":
        this.addToken(
          this.match("=") ? TokenType.GreaterEqual : TokenType.Greater
        );
        break;

      case "/":
        if (this.match("/")) {
          // A comment goes until the end of the line.
          while (this.peek() != "\n" && !this.isAtEnd()) this.advance();
        } else {
          this.addToken(TokenType.Slash);
        }
        break;

      case " ":
      case "\r":
      case "\t":
        // Ignore whitespace.
        break;

      case "\n":
        this.line++;
        break;

      case '"':
        this.string();
        break;

      default:
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else {
          error(this.line, "Unexpected character.");
        }
        break;
    }
  }

  private identifier() {
    while (this.isAlphaNumeric(this.peek())) this.advance();

    const text = this.source.substring(this.start, this.current);
    if (text in keywords) {
      this.addToken(keywords[text]);
    } else {
      this.addToken(TokenType.Identifier);
    }
  }

  private number() {
    while (this.isDigit(this.peek())) this.advance();

    // Look for a fractional part.
    if (this.peek() == "." && this.isDigit(this.peekNext())) {
      // Consume the "."
      this.advance();

      while (this.isDigit(this.peek())) this.advance();
    }

    this.addToken(
      TokenType.Number,
      parseFloat(this.source.substring(this.start, this.current))
    );
  }

  private string() {
    while (this.peek() != '"' && !this.isAtEnd()) {
      if (this.peek() == "\n") this.line++;
      this.advance();
    }

    if (this.isAtEnd()) {
      error(this.line, "Unterminated string.");
      return;
    }

    // The closing ".
    this.advance();

    // Trim the surrounding quotes.
    const value = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(TokenType.String, value);
  }

  private match(expected: string) {
    if (this.isAtEnd()) return false;
    if (this.source.charAt(this.current) != expected) return false;

    this.current++;
    return true;
  }

  private peek() {
    if (this.isAtEnd()) return "\0";
    return this.source.charAt(this.current);
  }

  private peekNext() {
    if (this.current + 1 >= this.source.length) return "\0";
    return this.source.charAt(this.current + 1);
  }

  private isAlpha(c: string) {
    return !!c.match(/^[a-zA-Z_]$/);
  }

  private isAlphaNumeric(c: string) {
    return this.isAlpha(c) || this.isDigit(c);
  }

  private isDigit(c: string) {
    return !!c.match(/^[0-9]$/);
  }

  private isAtEnd() {
    return this.current >= this.source.length;
  }

  private advance() {
    return this.source.charAt(this.current++);
  }

  private addToken(type: TokenType, literal: LoxType = null) {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(type, text, literal, this.line));
  }
}

const keywords: { [keyword: string]: TokenType } = {
  and: TokenType.And,
  class: TokenType.Class,
  else: TokenType.Else,
  false: TokenType.False,
  for: TokenType.For,
  fun: TokenType.Fun,
  if: TokenType.If,
  nil: TokenType.Nil,
  or: TokenType.Or,
  print: TokenType.Print,
  return: TokenType.Return,
  super: TokenType.Super,
  this: TokenType.This,
  true: TokenType.True,
  var: TokenType.Var,
  while: TokenType.While,
};
*/

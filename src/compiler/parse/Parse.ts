import { Token } from "../scan/Token";
import { TokenType } from "../scan/TokenType";
import { State } from "../utils/State";
import { Expr } from "./AST/Expr";

interface ParseState {
  tokens: Token[];
  current: number;
}

export type Parse<A> = State<ParseState, A>;

export namespace Parse {
  // protected consume(type: TokenType, message: string) {
  //   if (this.check(type)) return this.advance();

  //   throw new ParseError(this.peek(), message);
  // }

  export const peek: Parse<Token> = State.gets(
    ({ tokens, current }) => tokens[current]
  );

  export const previous: Parse<Token> = State.gets(
    ({ tokens, current }) => tokens[current]
  );

  export const isAtEnd = peek.map(({ type }) => type === TokenType.EOF);

  // protected peekNext() {
  //   return this.isAtEnd()
  //     ? this.tokens[this.current]
  //     : this.tokens[this.current + 1];
  // }

  // protected synchronize() {
  //   let last: Token.Source;
  //   do {
  //     last = this.advance();
  //     if (this.previous().type == TokenType.LineBreak) return last;
  //   } while (!this.isAtEnd());

  //   return last;
  // }

  export function check(checkType: TokenType) {
    return peek.map(({ type }) => type === checkType);
  }

  export const advance = isAtEnd.bind(
    (ended) =>
      State.gets(({ current, ...rest }: ParseState) => ({
        current: current + (ended ? 0 : 1),
        ...rest,
      })).then(previous)
    // TODO: Handle Error and UnusedKeyword types
  );

  export function match(
    type: TokenType,
    ...types: TokenType[]
  ): Parse<boolean> {
    return check(type).bind((doesCheck) =>
      types.length > 0
        ? advance.map((_) => doesCheck)
        : match(types[0], ...types.slice(1))
    );
  }
}

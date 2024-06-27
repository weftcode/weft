import { TokenType } from "../parser/TokenType";

export const bindings = {
  addOne: (x: any) => x + 1,
  addAny: (...xs) => xs.reduce((x, y) => x + y, 0),
};

export const operators = {
  [TokenType.Plus]: (a, b) => a + b,
  [TokenType.Minus]: (a, b) => a - b,
  [TokenType.Star]: (a, b) => a * b,
  [TokenType.Slash]: (a, b) => a / b,
};

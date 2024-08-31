import { TokenType } from "../parser/TokenType";
import { Operators } from "../parser/Parser";

export const operators: Operators = new Map([
  // Haskell Operators
  [TokenType.Dollar, [0, "right"]],
  [TokenType.Dot, [9, "right"]],

  // Addition/subtration (and pattern variants)
  [TokenType.Plus, [6, "left"]],
  [TokenType.PlusSL, [6, "left"]],
  [TokenType.PlusSB, [6, "left"]],
  [TokenType.PlusSR, [6, "left"]],
  [TokenType.Minus, [6, "left"]],
  [TokenType.MinusSL, [6, "left"]],
  [TokenType.MinusSB, [6, "left"]],
  [TokenType.MinusSR, [6, "left"]],

  // Multiplication/division (and pattern variants)
  [TokenType.Star, [7, "left"]],
  [TokenType.StarSL, [7, "left"]],
  [TokenType.StarSB, [7, "left"]],
  [TokenType.StarSR, [7, "left"]],
  [TokenType.Slash, [7, "left"]],
  [TokenType.SlashSL, [7, "left"]],
  [TokenType.SlashSB, [7, "left"]],
  [TokenType.SlashSR, [7, "left"]],

  // Apply pattern values
  [TokenType.LeftSL, [8, "left"]],
  [TokenType.LeftSB, [8, "left"]],
  [TokenType.LeftSR, [8, "left"]],
  [TokenType.RightSL, [8, "left"]],
  [TokenType.RightSB, [8, "left"]],
  [TokenType.RightSR, [8, "left"]],
]);

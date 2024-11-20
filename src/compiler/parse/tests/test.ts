import { describe, it, expect } from "@jest/globals";

import { Scanner } from "../../scan/Scanner";
import { Parser } from "../Parser";
import { ErrorReporter } from "../Reporter";

import { makeEnv } from "../../typecheck/environment";
import prelude from "../../../standard-lib";

const env = prelude(makeEnv()).typeEnv;

const basicCode = `
-- Basic code example
putStrLn $ show (fmap (+ 8) [0, 1 + 2, 2, 3, 4])
putStrLn
   "Hello World!"
`;

describe("Basic Code Snapshot", () => {
  const basicTokens = new Scanner(basicCode).scanTokens();
  const basicAst = new Parser(basicTokens, env, new ErrorReporter()).parse();

  it("scans correctly", () => {
    expect(basicTokens).toMatchSnapshot();
  });

  it("parses correctly", () => {
    expect(basicAst).toMatchSnapshot();
  });
});

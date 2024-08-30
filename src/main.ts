import { EditorView, basicSetup } from "codemirror";
import { keymap, KeyBinding } from "@codemirror/view";
import { StateEffect } from "@codemirror/state";
import { Diagnostic, linter } from "@codemirror/lint";

import { StreamLanguage } from "@codemirror/language";
import { haskell } from "@codemirror/legacy-modes/mode/haskell";

import { AstPrinter } from "./parser/AstPrinter";
import { Scanner } from "./parser/Scanner";
import { Parser } from "./parser/Parser";
import { ErrorReporter } from "./parser/Reporter";
import { Interpreter } from "./parser/Interpreter";

import { getOperators } from "./parser/API";

import { bindings, hush, typeBindings } from "./strudel";

import { printType } from "./parser/typechecker/Printer";
import { TypeChecker } from "./parser/typechecker/Typechecker";

const EvalEffect = StateEffect.define<void>();

const evalKeymap: KeyBinding[] = [
  {
    key: "Mod-Enter",
    run: (view) => {
      view.dispatch({ effects: EvalEffect.of() });
      return true;
    },
  },
  {
    key: "Mod-.",
    run: () => {
      hush();
      return true;
    },
  },
];

const autosave = EditorView.updateListener.of((update) => {
  if (update.docChanged) {
    localStorage.setItem("document", update.state.doc.toString());
  }
});

const listener = EditorView.updateListener.of((update) => {
  let evaluated = false;

const listener = EditorView.updateListener.of((update) => {
  for (let tr of update.transactions) {
    for (let effect of tr.effects) {
      if (effect.is(EvalEffect)) {
        let reporter = new ErrorReporter();

        try {
          const scanner = new Scanner(update.state.doc.toString());
          const tokens = scanner.scanTokens();
          document.getElementById("output").innerText = tokens
            .map((t) => t.toString())
            .join("\n");
          const parser = new Parser(tokens, getOperators(bindings), reporter);
          const stmts = parser.parse();

          // TODO: Error Handling

          const printer = new AstPrinter();
          document.getElementById("output").innerText =
            printer.printStmts(stmts);

          if (!reporter.hasError) {
            let typechecker = new TypeChecker(reporter, typeBindings);
            let [_, type] = typechecker.check(stmts);
            console.log(printType(type));
          }

          if (reporter.hasError) {
            document.getElementById("output").innerText =
              reporter.errors.join("\n");
          } else {
            const interpreter = new Interpreter(reporter, bindings);

            let results = interpreter.interpret(stmts);

            document.getElementById("output").innerText = [
              ...results,
              ...reporter.errors,
            ].join("\n");
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
  }
});

const parseLinter = linter((view) => {
  try {
    let reporter = new ErrorReporter();

    const scanner = new Scanner(view.state.doc.toString());
    const tokens = scanner.scanTokens();
    const parser = new Parser(tokens, getOperators(bindings), reporter);
    const stmts = parser.parse();

    const printer = new AstPrinter();

    let diagnostics: Diagnostic[] = [];

    const typechecker = new TypeChecker(reporter, typeBindings);
    try {
      let [_s, _t, annotations] = typechecker.check(stmts);

      let annotationMap = new WeakMap(annotations);
      diagnostics = diagnostics.concat(
        generateTypeDiagnostics(stmts[0].expression, annotationMap)
      );
    } catch (e) {}

    if (reporter.hasError) {
      return reporter.errors.map(({ from, to, message }) => ({
        from,
        to,
        message,
        severity: "error",
      }));
    } else {
      document.getElementById("output").innerText = printer.printStmts(stmts);

      return diagnostics;
    }
  } catch (error) {
    console.log(error);
    return [];
  }
});

import { Expr, expressionBounds } from "./parser/Expr";
import { MonoType } from "./parser/typechecker/Types";

type TypeAnnotationMap = WeakMap<Expr, MonoType>;

function generateTypeDiagnostics(
  expr: Expr,
  annotations: TypeAnnotationMap
): Diagnostic[] {
  switch (expr.type) {
    case Expr.Type.Variable:
    case Expr.Type.Literal:
    case Expr.Type.Empty:
    case Expr.Type.Assignment:
      return annotations.has(expr)
        ? [
            {
              ...expressionBounds(expr),
              severity: "info",
              message: printType(annotations.get(expr)),
            },
          ]
        : [];
    case Expr.Type.Application:
    case Expr.Type.Binary:
      return generateTypeDiagnostics(expr.left, annotations).concat(
        generateTypeDiagnostics(expr.right, annotations)
      );
    case Expr.Type.Grouping:
    case Expr.Type.Section:
      return generateTypeDiagnostics(expr.expression, annotations);
    case Expr.Type.Unary:
      return generateTypeDiagnostics(expr.right, annotations);
    case Expr.Type.List:
      return expr.items.flatMap((e) => generateTypeDiagnostics(e, annotations));
    default:
      return expr satisfies never;
  }
}

window.addEventListener("load", () => {
  new EditorView({
    doc: localStorage.getItem("document") ?? "",
    extensions: [
      keymap.of(evalKeymap),
      basicSetup,
      listener,
      StreamLanguage.define(haskell),
      parseLinter,
      autosave,
    ],
    parent: document.getElementById("editor"),
  });
});

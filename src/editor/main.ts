import { EditorView, basicSetup } from "codemirror";
import { keymap, KeyBinding } from "@codemirror/view";
import { StateEffect } from "@codemirror/state";
import { Diagnostic, linter } from "@codemirror/lint";

import { StreamLanguage } from "@codemirror/language";
import { haskell } from "@codemirror/legacy-modes/mode/haskell";

import { AstPrinter } from "../compiler/parse/AstPrinter";
import { Scanner } from "../compiler/scan/Scanner";
import { Parser } from "../compiler/parse/Parser";
import { ErrorReporter } from "../compiler/parse/Reporter";
import { Interpreter } from "../compiler/Interpreter";

import { getOperators } from "../compiler/parse/API";

import { bindings, hush, typeBindings } from "../strudel";

import { TypeChecker } from "../compiler/typecheck/Typechecker";

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

async function updateURLField(input: HTMLInputElement, doc: string) {
  const stream = new ReadableStream({
    start: (controller) => {
      controller.enqueue(doc);
      controller.close();
    },
  })
    .pipeThrough(new TextEncoderStream())
    .pipeThrough<Uint8Array>(new CompressionStream("deflate-raw"));

  let output = "";

  for await (let chunk of stream) {
    console.log(chunk);
    output += Array.from(chunk, (byte) => String.fromCodePoint(byte)).join("");
  }

  input.value =
    window.location.origin + window.location.pathname + "#" + btoa(output);
}

const autosave = EditorView.updateListener.of((update) => {
  if (update.docChanged) {
    const doc = update.state.doc.toString();
    localStorage.setItem("document", doc);

    let urlField = document.getElementById("url");
    if (urlField instanceof HTMLInputElement) {
      updateURLField(urlField, doc);
    }
  }
});

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

            for (let stmt of stmts) {
              typechecker.check(stmt);
            }
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

    for (let stmt of stmts) {
      let [_s, _t, annotations] = typechecker.check(stmt);

      let annotationMap = new WeakMap(annotations.map((a) => [a.expr, a]));
      diagnostics = diagnostics.concat(
        generateTypeDiagnostics(stmt.expression, annotationMap)
      );
    }

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

import { Expr, expressionBounds } from "../compiler/parse/Expr";
import { TypeAnnotation } from "../compiler/typecheck/Annotations";

type TypeAnnotationMap = WeakMap<Expr, TypeAnnotation>;

function generateTypeDiagnostics(
  expr: Expr,
  annotations: TypeAnnotationMap
): Diagnostic[] {
  switch (expr.type) {
    case Expr.Type.Variable:
    case Expr.Type.Literal:
    case Expr.Type.Empty:
    case Expr.Type.Assignment: {
      return annotations.has(expr) ? [annotations.get(expr)] : [];
    }

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

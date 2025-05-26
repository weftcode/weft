import { EditorView, basicSetup } from "codemirror";
import { Diagnostic, linter } from "@codemirror/lint";

import { StreamLanguage } from "@codemirror/language";
import { haskell } from "@codemirror/legacy-modes/mode/haskell";

import { evaluation } from "./evaluation";

import { console as editorConsole } from "./console";

import { editorTheme } from "./theme";

// @ts-ignore
import { dracula } from "thememirror/dist/index.js";

import { Scanner } from "../compiler/scan/Scanner";
import { Parser } from "../compiler/parse/Parser";

import strudel from "../strudel";
import { hush } from "../strudel";
import standardLib from "../standard-lib";

import { makeEnv } from "../compiler/environment";
import { TypeChecker } from "../compiler/typecheck/Typechecker";

let env = standardLib(makeEnv());

// @ts-ignore
env = strudel(env);

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
    output += Array.from(chunk, (byte) => String.fromCodePoint(byte)).join("");
  }

  input.value =
    window.location.origin + window.location.pathname + "?" + btoa(output);
}

async function decodeDoc(encodedDoc: string) {
  const stream = new ReadableStream({
    start: (controller) => {
      const binString = atob(encodedDoc);
      controller.enqueue(
        Uint8Array.from(binString, (m) => m.codePointAt(0) ?? 0)
      );
      controller.close();
    },
  })
    .pipeThrough<Uint8Array>(new DecompressionStream("deflate-raw"))
    .pipeThrough(new TextDecoderStream());

  let doc = "";

  for await (let chunk of stream) {
    doc += chunk;
  }

  return doc;
}

const autosave = EditorView.updateListener.of((update) => {
  if (update.docChanged) {
    const doc = update.state.doc.toString();
    localStorage.setItem("document", doc);

    if (window.location.search) {
      window.history.pushState(undefined, "", window.location.pathname);
    }

    let urlField = document.getElementById("url");
    if (urlField instanceof HTMLInputElement) {
      updateURLField(urlField, doc);
    }
  }
});

const consoleComponent = editorConsole();

const parseLinter = linter((view) => {
  try {
    const scanner = new Scanner(view.state.doc.toString());
    const tokens = scanner.scanTokens();
    const parser = new Parser(tokens, env.typeEnv);
    const stmts = parser.parse();

    let diagnostics: Diagnostic[] = [];

    // Run renamer to check for undefined variables
    let renamedStmts = stmts.map((s) => renameStmt(s, env.typeEnv));

    const typechecker = new TypeChecker(env);

    for (let stmt of stmts) {
      let { expression } = typechecker.check(stmt);

      diagnostics = diagnostics.concat(collectTypeDiagnostics(expression));
    }

    // if (reporter.hasError) {
    //   return reporter.errors.map(({ from, to, message }) => ({
    //     from,
    //     to,
    //     message,
    //     severity: "error",
    //   }));
    // } else {
    //   return diagnostics;
    // }
    // TODO: Skipping error reporting for now
    return [];
  } catch (error) {
    console.log(error);
    return [];
  }
});

import { renameStmt } from "../compiler/rename/Renamer";
import { highlighter } from "../strudel/highlights";
import { handlerSet } from "../strudel/boot";
import { collectTypeDiagnostics } from "../compiler/typecheck/Annotations";

window.addEventListener("load", async () => {
  let doc: string;
  let search = window.location.search;
  if (search) {
    doc = await decodeDoc(search.slice(1));
  } else {
    doc = localStorage.getItem("document") ?? "";
  }

  updateURLField(document.getElementById("url") as HTMLInputElement, doc);

  consoleComponent.update({
    level: "info",
    text: "Welcome to the very experimental web Tidal editor!\nUse Ctrl+Enter (or Command+Enter on Mac) to evaluate a block of code. Play patterns in normal Tidal style with the functions `d1` to `d12`. To hush all currently-playing patterns, either evaluate the `hush` function or press Ctrl+. (or Command+. on Mac).",
  });

  window.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === ".") {
      hush();
    }
  });

  document.getElementById("output")?.appendChild(consoleComponent.dom);

  new EditorView({
    doc,
    extensions: [
      evaluation(env, consoleComponent),
      basicSetup,
      StreamLanguage.define(haskell),
      parseLinter,
      autosave,
      dracula,
      editorTheme,
      highlighter(handlerSet),
    ],
    parent: document.getElementById("editor") ?? undefined,
  });
});

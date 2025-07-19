import { EditorView } from "codemirror";
import { basicSetup } from "./basicSetup";

import { StreamLanguage } from "@codemirror/language";
import { haskell } from "@codemirror/legacy-modes/mode/haskell";

import { evaluation } from "./evaluation";

import { console as editorConsole } from "./console";

import { editorTheme } from "./theme";
import { nord } from "@fsegurai/codemirror-theme-nord";

import { WeftRuntime } from "../weft/src";

import { parseLinter } from "./linter";

import { core, boot, operators, controls } from "../strudel";
import { hush } from "../strudel";
import standardLib from "../standard-lib";

const runtime = new WeftRuntime();
runtime.loadLibrary(standardLib);
runtime.loadLibrary(core);
runtime.loadLibrary(boot);
runtime.loadLibrary(operators);
runtime.loadLibrary(controls);

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

import { highlighter } from "../strudel/highlights";
import { handlerSet } from "../strudel/boot";

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
    text: "Welcome to the very experimental Weft editor!\nUse Ctrl+Enter (or Command+Enter on Mac) to evaluate a block of code. Play patterns in normal Tidal style with the functions `d1` to `d12`. To hush all currently-playing patterns, either evaluate the `hush` function or press Ctrl+. (or Command+. on Mac).",
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
      evaluation(runtime, consoleComponent),
      basicSetup,
      StreamLanguage.define(haskell),
      parseLinter(runtime),
      autosave,
      editorTheme,
      nord,
      highlighter(handlerSet),
    ],
    parent: document.getElementById("editor") ?? undefined,
  });
});

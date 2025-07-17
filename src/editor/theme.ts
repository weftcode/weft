import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { EditorView } from "codemirror";

const layoutTheme = EditorView.theme({
  "&": {
    fontFamily: "inherit",
    width: "100%",
    height: "100%",
    overflow: "auto",
    fontSize: "18px",
  },

  "&.cm-focused .cm-cursor": {
    borderLeftWidth: "2px",
    marginLeft: "-1px",
  },

  "& .cm-gutters": {
    borderRight: "none",
    paddingRight: "0.5ch",
  },

  "& .cm-lineNumbers": {
    fontSize: "inherit",
    lineHeight: 1.6,
  },

  "& .cm-lineNumbers .cm-gutterElement": {
    padding: "0 0.5ch 0 1ch",
    minWidth: "2.5ch",
  },
});

const highlights = HighlightStyle.define([
  {
    tag: [tags.invalid],
    textDecoration: "none",
  },
]);

export const editorTheme = [layoutTheme, syntaxHighlighting(highlights)];

export const colorTheme = EditorView.theme({
  "&": {
    background: "var(--editor-background)",
    color: "var(--editor-foreground)",
  },

  ".cm-content": {
    caretColor: "var(--cursor)",
  },

  "&.cm-focused .cm-cursor": {
    borderLeftColor: "var(--cursor)",
  },

  "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, ::selection":
    {
      backgroundColor: "var(--selection-background)",
    },

  "& .cm-activeLine": {
    background: "var(--editor-active-line-background)",
  },

  "& .cm-gutter": {
    background: "var(--editor-gutter-background)",
    color: "var(--editor-line-number)",
  },

  "& .cm-activeLineGutter": {
    background: "var(--editor-active-line-background)",
    color: "var(--editor-active-line-number)",
  },
});

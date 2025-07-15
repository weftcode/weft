import { EditorView } from "codemirror";

export const editorTheme = EditorView.theme({
  "&": {
    fontFamily: "inherit",
    width: "100%",
    height: "100%",
    overflow: "auto",
  },

  "&.cm-focused .cm-cursor": {
    borderLeftWidth: "2px",
    marginLeft: "-1px",
  },

  "& .cm-gutters": {
    borderRight: "none",
  },
});

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

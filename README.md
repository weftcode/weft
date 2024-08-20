# Web Tidal

This is an expermental port of a [Tidalcycles](https://tidalcycles.org/)-like language to the web. Specifically, it combines a custom interpreter for a tiny subset of Haskell syntax with a set of bindings to the [Strudel library](https://strudel.cc/workshop/getting-started/).

It draws inspiration from a [similar project by Felix Roos](https://github.com/felixroos/haskell-tree-sitter-playground), which uses the Haskell tree-sitter library to parse code that gets bound to Strudel. The motivation for writing a custom parser (in addition to my own intellectual curiosity) is to allow for more specific error messages and eventually type checking.

# Weft

Weft is a functional programming language for live coding on the web. For now, it's designed as a tool for using the music live coding language [Strudel](https://strudel.cc/). If you've used [TidalCycles](https://tidalcycles.org/), then Weft will look pretty familiar. It borrows the syntax of Haskell and also has a type system which allows it to spot many common errors.

It draws inspiration from a [similar project by Felix Roos](https://github.com/felixroos/haskell-tree-sitter-playground), which uses the Haskell tree-sitter library to parse code that gets bound to Strudel. The motivation for writing a custom parser (in addition to my own intellectual curiosity) is to allow for more specific error messages and eventually type checking.

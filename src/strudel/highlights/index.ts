import {
  EditorState,
  StateEffect,
  Range,
  Extension,
  RangeSetBuilder,
  Prec,
} from "@codemirror/state";
import { Decoration, EditorView, ViewPlugin, keymap } from "@codemirror/view";

import {
  HighlightEvent,
  mininotationStringField,
  highlightTickEffect,
  highlightAddEffect,
  highlightSetField,
} from "./state";

export type HighlightHandler = (highlight: HighlightEvent) => void;

export function highlighter(handlerSet: Set<HighlightHandler>): Extension {
  const highlighterPlugin = ViewPlugin.define((view) => {
    const state: { pending: HighlightEvent[] } = { pending: [] };

    const handler: HighlightHandler = (highlight) => {
      // TODO: Filter out duplicate highlights
      state.pending.push(highlight);
    };

    handlerSet.add(handler);

    const update = (time: number) => {
      let effects: StateEffect<any>[] = [];

      effects.push(highlightTickEffect.of(time));

      let toAdd: HighlightEvent[] = [];
      let stillPending: HighlightEvent[] = [];

      // Partition the pending events based on whether they're ready
      for (let event of state.pending) {
        if (event.time > time) {
          stillPending.push(event);
        } else {
          if (event.time + event.duration >= time) {
            toAdd.push(event);
          }
          // Any events that were just dispatched and have already ended
          // are discarded
        }
      }

      state.pending = stillPending;

      if (toAdd.length) {
        effects.push(highlightAddEffect.of(toAdd));
      }

      if (effects.length) {
        view.dispatch({ effects });
      }

      animationFrame = requestAnimationFrame(update);
    };

    let animationFrame = requestAnimationFrame(update);

    return {
      destroy: () => {
        handlerSet.delete(handler);
        cancelAnimationFrame(animationFrame);
      },
    };
  });

  return [
    highlighterPlugin,
    highlightSetField,
    Prec.highest(highlightDecorations),
  ];
}

const highlightDecoration = Decoration.mark({
  attributes: {
    style: "background-color: #fff; color: #000",
  },
});

const highlightDecorations = EditorView.decorations.compute(
  [mininotationStringField, highlightSetField],
  (state) => {
    const setBuilder = new RangeSetBuilder<Decoration>();

    const mininotationRanges = state.field(mininotationStringField);
    const currentHighlights = state.field(highlightSetField);

    let mininotationCursor = mininotationRanges.iter();

    while (mininotationCursor.value !== null) {
      let {
        from,
        value: { id },
      } = mininotationCursor;

      let highlightsInMini = currentHighlights
        .filter(({ miniID }) => miniID === id)
        .sort((a, b) => a.from - b.from);

      for (let highlight of highlightsInMini) {
        setBuilder.add(
          highlight.from + from,
          highlight.to + from,
          highlightDecoration
        );
      }

      mininotationCursor.next();
    }

    return setBuilder.finish();
  }
);

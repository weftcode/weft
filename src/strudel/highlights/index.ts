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
  mininotationStringField,
  TimestampedHighlightEvent,
  highlightTickEffect,
  highlightAddEffect,
  highlightSetField,
} from "./state";

export function highlighter(api: typeof ElectronAPI): Extension {
  const highlighterPlugin = ViewPlugin.define((view) => {
    let pendingHighlights: TimestampedHighlightEvent[] = [];

    let offTidalHighlight = api.onTidalHighlight((highlight) => {
      // TODO: Filter out duplicate highlights
      pendingHighlights.push({
        ...highlight,
        time: fromNTPTime(highlight.onset),
      });
    });

    const update = (time: number) => {
      let effects: StateEffect<any>[] = [];

      effects.push(highlightTickEffect.of(time));

      let toAdd: TimestampedHighlightEvent[] = [];
      let stillPending: TimestampedHighlightEvent[] = [];

      // Partition the pending events based on whether they're ready
      for (let event of pendingHighlights) {
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
        offTidalHighlight();
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
    style:
      "background-color: var(--color-livecode-active-event-background); color: var(--color-foreground-inverted)",
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

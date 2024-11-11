import {
  Range,
  RangeValue,
  RangeSet,
  StateEffect,
  StateField,
} from "@codemirror/state";

import { Location } from "../../compiler/Interpreter";

export interface HighlightEvent {
  miniID: string;
  from: number;
  to: number;
  time: number;
  duration: number;
}

export class MininotationString extends RangeValue {
  constructor(readonly id: string) {
    super();

    // Equivalent to non-inclusive decorations
    this.startSide = 5e8;
    this.endSide = -6e8;
  }
}

const replaceMininotationEffect = StateEffect.define<{
  from: number;
  to: number;
  mininotationStrings: Range<MininotationString>[];
}>();

export function replaceMininotation(
  from: number,
  to: number,
  locations: Location[]
) {
  return replaceMininotationEffect.of({
    from,
    to,
    mininotationStrings: locations.map(([id, loc]) =>
      new MininotationString(id).range(loc.from, loc.to)
    ),
  });
}

export const mininotationStringField = StateField.define<
  RangeSet<MininotationString>
>({
  create: () => RangeSet.empty,
  update: (minis, tr) => {
    if (tr.docChanged) {
      tr.changes.iterChangedRanges((filterFrom, filterTo) => {
        minis = minis.update({
          filterFrom,
          filterTo,
          filter: (miniFrom, miniTo) =>
            filterTo <= miniFrom || miniTo <= filterFrom,
        });
      });
      minis = minis.map(tr.changes);
    }

    for (let effect of tr.effects) {
      if (effect.is(replaceMininotationEffect)) {
        let { from, to, mininotationStrings } = effect.value;

        minis = minis.update({
          filterFrom: from,
          filterTo: to,
          filter: () => false,
          add: mininotationStrings,
        });
      }
    }

    return minis;
  },
});

export const highlightTickEffect = StateEffect.define<number>();

export const highlightAddEffect = StateEffect.define<HighlightEvent[]>();

export const highlightSetField = StateField.define({
  create: () => [],
  update: (value: HighlightEvent[], tr) => {
    for (let effect of tr.effects) {
      if (effect.is(highlightTickEffect)) {
        value = value.filter((event) => {
          event.time + event.duration >= effect.value;
        });
      } else if (effect.is(highlightAddEffect)) {
        value = value.concat(effect.value);
      }
    }

    return value;
  },
});

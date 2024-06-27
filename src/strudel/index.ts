import { reify, Cyclist, silence, controls, fast } from "@strudel/core";
import { miniAllStrings } from "@strudel/mini";
import {
  initAudioOnFirstClick,
  getAudioContext,
  webaudioOutput,
  registerSynthSounds,
} from "@strudel/webaudio";

initAudioOnFirstClick();
const ctx = getAudioContext();
registerSynthSounds();

miniAllStrings();

function getTime() {
  return ctx.currentTime;
}

async function onTrigger(hap, deadline, duration, cps) {
  try {
    if (!hap.context.onTrigger || !hap.context.dominantTrigger) {
      await webaudioOutput(hap, deadline, duration, cps);
    }
    if (hap.context.onTrigger) {
      // call signature of output / onTrigger is different...
      await hap.context.onTrigger(getTime() + deadline, hap, getTime(), cps);
    }
  } catch (err) {
    console.log(`[cyclist] error: ${err.message}`, "error");
  }
}

const scheduler = new Cyclist({
  getTime,
  onTrigger,
});

scheduler.setPattern(silence);
scheduler.start();

import { TokenType } from "../parser/TokenType";

export const bindings = {
  addOne: (x: any) => x + 1,
  addAny: (...xs) => xs.reduce((x, y) => x + y, 0),
  p: (id: string | number, pattern) => {
    let pat = reify(pattern);
    scheduler.setPattern(pat);
    return pat;
  },
  hush: () => {
    scheduler.setPattern(silence);
  },
  ...controls,
  fast,
};

export const operators = {
  [TokenType.Plus]: (a, b) => a + b,
  [TokenType.Minus]: (a, b) => a - b,
  [TokenType.Star]: (a, b) => a * b,
  [TokenType.Slash]: (a, b) => a / b,
};

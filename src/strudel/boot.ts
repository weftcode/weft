// @ts-nocheck

import { reify, Cyclist, silence, stack } from "@strudel/core";
// import { registerVoicings } from "@strudel/tonal";
// import { simple } from "@strudel/tonal/ireal.mjs";

import {
  initAudioOnFirstClick,
  getAudioContext,
  webaudioOutput,
  registerSynthSounds,
  samples,
} from "@strudel/webaudio";

import { addBinding, BindingSpec } from "../compiler/environment";
import { validateSpec } from "../weft/src/environment/Type";
import { HighlightHandler } from "./highlights";

initAudioOnFirstClick();
const ctx = getAudioContext();
registerSynthSounds();

// Load default voicings
// registerVoicings("default", simple);

// Default Strudel samples
const ds = "https://raw.githubusercontent.com/felixroos/dough-samples/main";
samples(`${ds}/tidal-drum-machines.json`);
samples(`${ds}/piano.json`);
samples(`${ds}/Dirt-Samples.json`);
samples(`${ds}/EmuSP12.json`);
samples(`${ds}/vcsl.json`);

function getTime() {
  return ctx.currentTime;
}

export const handlerSet = new Set<HighlightHandler>();

async function onTrigger(hap, deadline, duration, cps) {
  for (let handler of handlerSet) {
    for (let { start, end, id } of hap.context.locations) {
      handler({
        from: start,
        to: end,
        miniID: id,
        time: performance.now() + deadline * 1000,
        duration: duration * 1000,
      });
    }
  }

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

export function hush() {
  patMap.clear();
  scheduler.setPattern(silence);
}

// Pattern Map
let patMap = new Map();

// Curried form
export function p(id: string | number) {
  return (pattern) => ({
    runIO: () => {
      let pat = reify(pattern);
      patMap.set(id, pat);

      scheduler.setPattern(stack(...patMap.values()));

      return pat;
    },
  });
}

export default (env: Environment) => {
  for (let [name, binding] of Object.entries(boot)) {
    env = addBinding(env, name, validateSpec(name, binding));
  }

  return env;
};

// Bindings (similar to Tidal's BootTidal.hs)
const boot: BindingSpec = {
  p: { type: "String -> Pattern Controls -> IO ()", value: p },
  d1: { type: "Pattern Controls -> IO ()", value: p(1) },
  d2: { type: "Pattern Controls -> IO ()", value: p(2) },
  d3: { type: "Pattern Controls -> IO ()", value: p(3) },
  d4: { type: "Pattern Controls -> IO ()", value: p(4) },
  d5: { type: "Pattern Controls -> IO ()", value: p(5) },
  d6: { type: "Pattern Controls -> IO ()", value: p(6) },
  d7: { type: "Pattern Controls -> IO ()", value: p(7) },
  d8: { type: "Pattern Controls -> IO ()", value: p(8) },
  d9: { type: "Pattern Controls -> IO ()", value: p(9) },
  d10: { type: "Pattern Controls -> IO ()", value: p(10) },
  d11: { type: "Pattern Controls -> IO ()", value: p(11) },
  d12: { type: "Pattern Controls -> IO ()", value: p(12) },
  hush: { type: "IO ()", value: { runIO: hush } },
  setCps: {
    type: "Number -> IO ()",
    value: (cps) => ({
      runIO: () => {
        scheduler.setCps(cps);
      },
    }),
  },
  setCpm: {
    type: "Number -> IO ()",
    value: (cpm) => ({
      runIO: () => {
        scheduler.setCps(cpm / 60);
      },
    }),
  },
  loadSounds: {
    type: "String -> IO ()",
    value: (path) => ({
      runIO: () => {
        console.log(`Loading from: "${path}"`);
      },
    }),
  },
};

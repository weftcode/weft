// @ts-nocheck

import * as strudelCore from "@strudel/core";
import { mini } from "@strudel/mini";
import {
  Environment,
  addDataType,
  addBinding,
  BindingSpec,
  addInstance,
} from "../compiler/environment";
import {
  KFunc,
  KType,
  TApp,
  TConst,
  TVar,
} from "../compiler/typecheck/BuiltIns";

export default (env: Environment) => {
  env = addDataType(env, {
    name: "Pattern",
    kind: KFunc(KType, KType),
    dataCons: [],
  });

  env = addInstance(env, {
    preds: [],
    inst: {
      isIn: "StringLit",
      type: TApp(TConst("Pattern", KFunc(KType, KType)), TVar("a")),
    },
    methods: {
      fromStringLit: { value: mini },
    },
  });

  env = addDataType(env, { name: "Controls", kind: KType, dataCons: [] });

  for (let [name, binding] of Object.entries(core)) {
    env = addBinding(env, { name, ...binding });
  }

  return env;
};

const core: BindingSpec = {
  // Cyclist: { type: "", value: strudelCore.Cyclist },
  // Drawer: { type: "", value: strudelCore.Drawer },
  // Fraction: { type: "", value: strudelCore.Fraction },
  // Framer: { type: "", value: strudelCore.Framer },
  // Hap: { type: "", value: strudelCore.Hap },
  // Pattern: { type: "", value: strudelCore.Pattern },
  // State: { type: "", value: strudelCore.State },
  // NumberSpan: { type: "", value: strudelCore.NumberSpan },
  // __chooseWith: { type: "", value: strudelCore.__chooseWith },
  _brandBy: {
    type: "Number -> Pattern Bool",
    value: strudelCore._brandBy,
  },
  _irand: {
    type: "Number -> Pattern Number",
    value: strudelCore._irand,
  },
  // _mod: { type: "", value: strudelCore._mod },
  // add: { type: "", value: strudelCore.add },
  almostAlways: {
    type: "(Pattern a -> Pattern a) -> Pattern a -> Pattern a",
    value: strudelCore.almostAlways,
  },
  almostNever: {
    type: "(Pattern a -> Pattern a) -> Pattern a -> Pattern a",
    value: strudelCore.almostNever,
  },
  always: {
    type: "(Pattern a -> Pattern a) -> Pattern a -> Pattern a",
    value: strudelCore.always,
  },
  // and: { type: "", value: strudelCore.and },
  // angle: { type: "", value: strudelCore.angle },
  // apply: { type: "", value: strudelCore.apply },
  // arrange: { type: "", value: strudelCore.arrange },
  // backgroundImage: { type: "", value: strudelCore.backgroundImage },
  // band: { type: "", value: strudelCore.band },
  // base64ToUnicode: { type: "", value: strudelCore.base64ToUnicode },
  // bjork: { type: "", value: strudelCore.bjork },
  // blshift: { type: "", value: strudelCore.blshift },
  // bor: { type: "", value: strudelCore.bor },
  brak: {
    type: "Pattern a -> Pattern a",
    value: strudelCore.brak,
  },
  brand: { type: "Pattern Bool", value: strudelCore.brand },
  brandBy: {
    type: "Pattern Number -> Pattern Bool",
    value: strudelCore.brandBy,
  },
  // brshift: { type: "", value: strudelCore.brshift },
  // bxor: { type: "", value: strudelCore.bxor },
  // bypass: { type: "", value: strudelCore.bypass },
  cat: {
    type: "[Pattern a] -> Pattern a",
    value: strudelCore.cat,
  },
  // ceil: { type: "", value: strudelCore.ceil },
  choose: {
    type: "[Pattern a] -> Pattern a",
    value: (choices) => strudelCore.choose(...choices),
  },
  // chooseCycles: { type: "", value: strudelCore.chooseCycles },
  // chooseInWith: { type: "", value: strudelCore.chooseInWith },
  // chooseWith: { type: "", value: strudelCore.chooseWith },
  chop: {
    type: "Pattern Number -> Pattern Controls -> Pattern Controls",
    value: strudelCore.chop,
  },
  // chunkBack: { type: "", value: strudelCore.chunkBack },
  // chunkback: { type: "", value: strudelCore.chunkback },
  // clamp: { type: "", value: strudelCore.clamp },
  // cleanupDraw: { type: "", value: strudelCore.cleanupDraw },
  // cleanupUi: { type: "", value: strudelCore.cleanupUi },
  // code2hash: { type: "", value: strudelCore.code2hash },
  // color: { type: "", value: strudelCore.color },
  // colour: { type: "", value: strudelCore.colour },
  // compose: { type: "", value: strudelCore.compose },
  compress: {
    type: "(Number, Number) -> Pattern a -> Pattern a",
    value: strudelCore.compress,
  },
  // compressSpan: { type: "", value: strudelCore.compressSpan },
  // compressspan: { type: "", value: strudelCore.compressspan },
  // constant: { type: "", value: strudelCore.constant },
  // controls: { type: "", value: strudelCore.controls },
  cosine: {
    type: "Pattern Number",
    value: strudelCore.cosine,
  },
  cosine2: {
    type: "Pattern Number",
    value: strudelCore.cosine2,
  },
  cpm: {
    type: "Pattern Number -> Pattern a -> Pattern a",
    value: strudelCore.cpm,
  },
  // curry: { type: "", value: strudelCore.curry },
  degrade: {
    type: "Pattern a -> Pattern a",
    value: strudelCore.degrade,
  },
  degradeBy: {
    type: "Pattern Number -> Pattern a -> Pattern a",
    value: strudelCore.degradeBy,
  },
  // degradeByWith: { type: "", value: strudelCore.degradeByWith },
  density: {
    type: "Pattern Number -> Pattern a -> Pattern a",
    value: strudelCore.density,
  },
  // div: { type: "", value: strudelCore.div },
  // drawLine: {
  //   type: "Pattern Char -> Render",
  //   value: strudelCore.drawLine,
  // },
  // drawPianoroll: { type: "", value: strudelCore.drawPianoroll },
  // duration: { type: "", value: strudelCore.duration },
  "<~": {
    type: "Pattern Number -> Pattern a -> Pattern a",
    value: strudelCore.early,
  },
  echo: {
    type: "Pattern Number -> Pattern Number -> Pattern Number -> Pattern Controls -> Pattern Controls",
    value: strudelCore.echo,
  },
  echoWith: {
    type: "Pattern Number -> Pattern Number -> (Pattern a -> Pattern a) -> Pattern a -> Pattern a",
    value: strudelCore.echoWith,
  },
  // echowith: { type: "", value: strudelCore.echowith },
  // eq: { type: "", value: strudelCore.eq },
  // eqt: { type: "", value: strudelCore.eqt },
  euclid: {
    type: "Pattern Number -> Pattern Number -> Pattern a -> Pattern a",
    value: strudelCore.euclid,
  },
  // euclidLegato: { type: "", value: strudelCore.euclidLegato },
  // euclidLegatoRot: { type: "", value: strudelCore.euclidLegatoRot },
  // euclidRot: { type: "", value: strudelCore.euclidRot },
  // euclidrot: { type: "", value: strudelCore.euclidrot },
  // evalScope: { type: "", value: strudelCore.evalScope },
  // evaluate: { type: "", value: strudelCore.evaluate },
  every: {
    type: "Pattern Number -> (Pattern a -> Pattern a) -> Pattern a -> Pattern a",
    value: strudelCore.every,
  },
  fast: {
    type: "Pattern Number -> Pattern a -> Pattern a",
    value: strudelCore.fast,
  },
  // fastChunk: { type: "", value: strudelCore.fastChunk },
  fastGap: {
    type: "Pattern Number -> Pattern a -> Pattern a",
    value: strudelCore.fastGap,
  },
  fastcat: {
    type: "[Pattern a] -> Pattern a",
    value: strudelCore.fastcat,
  },
  // fastchunk: { type: "", value: strudelCore.fastchunk },
  // fastgap: { type: "", value: strudelCore.fastgap },
  // fill: { type: "", value: strudelCore.fill },
  // firstOf: { type: "", value: strudelCore.firstOf },
  fit: {
    type: "Pattern Number -> [a] -> Pattern Number -> Pattern a",
    value: strudelCore.fit,
  },
  // flatten: { type: "", value: strudelCore.flatten },
  // floor: { type: "", value: strudelCore.floor },
  // focus: { type: "", value: strudelCore.focus },
  // focusSpan: { type: "", value: strudelCore.focusSpan },
  // focusspan: { type: "", value: strudelCore.focusspan },
  // fractionalArgs: { type: "", value: strudelCore.fractionalArgs },
  // freqToMidi: { type: "", value: strudelCore.freqToMidi },
  // fromBipolar: { type: "", value: strudelCore.fromBipolar },
  // func: { type: "", value: strudelCore.func },
  // getDrawContext: { type: "", value: strudelCore.getDrawContext },
  // getDrawOptions: { type: "", value: strudelCore.getDrawOptions },
  // getFreq: { type: "", value: strudelCore.getFreq },
  // getFrequency: { type: "", value: strudelCore.getFrequency },
  // getPlayableNoteValue: { type: "", value: strudelCore.getPlayableNoteValue },
  // getPunchcardPainter: {
  //   type: "",
  //   value: strudelCore.getPunchcardPainter,
  // },
  // getSoundIndex: { type: "", value: strudelCore.getSoundIndex },
  // getNumber: { type: "", value: strudelCore.getNumber },
  // getTrigger: { type: "", value: strudelCore.getTrigger },
  // gt: { type: "", value: strudelCore.gt },
  // gte: { type: "", value: strudelCore.gte },
  // h: { type: "", value: strudelCore.h },
  // hash2code: { type: "", value: strudelCore.hash2code },
  // hsl: { type: "", value: strudelCore.hsl },
  // hsla: { type: "", value: strudelCore.hsla },
  hurry: {
    type: "Pattern Number -> Pattern Controls -> Pattern Controls",
    value: strudelCore.hurry,
  },
  // id: { type: "", value: strudelCore.id },
  inhabit: {
    type: "[(String, Pattern a)] -> Pattern String -> Pattern a",
    value: strudelCore.inhabit,
  },
  // inhabitmod: { type: "", value: strudelCore.inhabitmod },
  inside: {
    type: "Pattern Number -> (Pattern a1 -> Pattern a) -> Pattern a1 -> Pattern a",
    value: strudelCore.inside,
  },
  inv: { type: "Pattern Bool -> Pattern Bool", value: strudelCore.inv },
  // invert: { type: "", value: strudelCore.invert },
  irand: {
    type: "Pattern Number -> Pattern Number",
    value: strudelCore.irand,
  },
  // isNote: { type: "", value: strudelCore.isNote },
  // isNoteWithOctave: { type: "", value: strudelCore.isNoteWithOctave },
  // isPattern: { type: "", value: strudelCore.isPattern },
  isaw: {
    type: "Pattern Number",
    value: strudelCore.isaw,
  },
  isaw2: {
    type: "Pattern Number",
    value: strudelCore.isaw2,
  },
  iter: {
    type: "Pattern Number -> Pattern c -> Pattern c",
    value: strudelCore.iter,
  },
  // iterBack: { type: "", value: strudelCore.iterBack },
  // iterback: { type: "", value: strudelCore.iterback },
  jux: {
    type: "(Pattern Controls -> Pattern Controls) -> Pattern Controls -> Pattern Controls",
    value: strudelCore.jux,
  },
  juxBy: {
    type: "Pattern Number -> (Pattern Controls -> Pattern Controls) -> Pattern Controls -> Pattern Controls",
    value: strudelCore.juxBy,
  },
  // juxby: { type: "", value: strudelCore.juxby },
  // keep: { type: "", value: strudelCore.keep },
  // keepif: { type: "", value: strudelCore.keepif },
  // lastOf: { type: "", value: strudelCore.lastOf },
  "~>": {
    type: "Pattern Number -> Pattern a -> Pattern a",
    value: strudelCore.late,
  },
  // legato: { type: "", value: strudelCore.legato },
  linger: {
    type: "Pattern Number -> Pattern a -> Pattern a",
    value: strudelCore.linger,
  },
  // listRange: { type: "", value: strudelCore.listRange },
  // logKey: { type: "", value: strudelCore.logKey },
  // logger: { type: "", value: strudelCore.logger },
  loopAt: {
    type: "Pattern Number -> Pattern Controls -> Pattern Controls",
    value: strudelCore.loopAt,
  },
  // loopAtCps: { type: "", value: strudelCore.loopAtCps },
  // loopat: { type: "", value: strudelCore.loopat },
  // loopatcps: { type: "", value: strudelCore.loopatcps },
  // lt: { type: "", value: strudelCore.lt },
  // lte: { type: "", value: strudelCore.lte },
  // mapArgs: { type: "", value: strudelCore.mapArgs },
  mask: {
    type: "Pattern Bool -> Pattern a -> Pattern a",
    value: strudelCore.mask,
  },
  // midi2note: { type: "", value: strudelCore.midi2note },
  // midiToFreq: { type: "", value: strudelCore.midiToFreq },
  // mod: { type: "", value: strudelCore.mod },
  // moveXY: { type: "", value: strudelCore.moveXY },
  // mul: { type: "", value: strudelCore.mul },
  // nanFallback: { type: "", value: strudelCore.nanFallback },
  // ne: { type: "", value: strudelCore.ne },
  // net: { type: "", value: strudelCore.net },
  never: {
    type: "(Pattern a -> Pattern a) -> Pattern a -> Pattern a",
    value: strudelCore.never,
  },
  // noteToMidi: { type: "", value: strudelCore.noteToMidi },
  // numeralArgs: { type: "", value: strudelCore.numeralArgs },
  // objectMap: { type: "", value: strudelCore.objectMap },
  off: {
    type: "Pattern Number -> (Pattern a -> Pattern a) -> Pattern a -> Pattern a",
    value: strudelCore.off,
  },
  often: {
    type: "(Pattern a -> Pattern a) -> Pattern a -> Pattern a",
    value: strudelCore.often,
  },
  // or: { type: "", value: strudelCore.or },
  outside: {
    type: "Pattern Number -> (Pattern a1 -> Pattern a) -> Pattern a1 -> Pattern a",
    value: strudelCore.outside,
  },
  palindrome: {
    type: "Pattern a -> Pattern a",
    value: strudelCore.palindrome,
  },
  // parseFractional: { type: "", value: strudelCore.parseFractional },
  // parseNumeral: { type: "", value: strudelCore.parseNumeral },
  perlin: {
    type: "Pattern Number",
    value: strudelCore.perlin,
  },
  perlinWith: {
    type: "Pattern Number -> Pattern Number",
    value: strudelCore.perlinWith,
  },
  // pianoroll: { type: "", value: strudelCore.pianoroll },
  pick: { type: "String -> Number -> String", value: strudelCore.pick },
  pickF: {
    type: "Pattern Number -> [Pattern a -> Pattern a] -> Pattern a -> Pattern a",
    value: strudelCore.pickF,
  },
  // pickmod: { type: "", value: strudelCore.pickmod },
  // pickmodF: { type: "", value: strudelCore.pickmodF },
  // pipe: { type: "", value: strudelCore.pipe },
  ply: {
    type: "Pattern Number -> Pattern a -> Pattern a",
    value: strudelCore.ply,
  },
  // pm: { type: "", value: strudelCore.pm },
  // polymeter: { type: "", value: strudelCore.polymeter },
  // polymeterSteps: { type: "", value: strudelCore.polymeterSteps },
  // polyrhythm: { type: "", value: strudelCore.polyrhythm },
  // pow: { type: "", value: strudelCore.pow },
  // pr: { type: "", value: strudelCore.pr },
  press: {
    type: "Pattern a -> Pattern a",
    value: strudelCore.press,
  },
  pressBy: {
    type: "Pattern Number -> Pattern a -> Pattern a",
    value: strudelCore.pressBy,
  },
  pure: { type: "a -> Pattern a", value: strudelCore.pure },
  // r: { type: "", value: strudelCore.r },
  rand: {
    type: "Pattern Number",
    value: strudelCore.rand,
  },
  // rand2: { type: "", value: strudelCore.rand2 },
  randcat: {
    type: "[Pattern a] -> Pattern a",
    value: strudelCore.randcat,
  },
  range: {
    type: "Pattern Number -> Pattern Number -> Pattern Number -> Pattern Number",
    value: strudelCore.range,
  },
  range2: {
    type: "Pattern Number -> Pattern Number -> Pattern Number -> Pattern Number",
    value: strudelCore.range2,
  },
  rangex: {
    type: "Pattern Number -> Pattern Number -> Pattern Number -> Pattern Number",
    value: strudelCore.rangex,
  },
  rarely: {
    type: "(Pattern a -> Pattern a) -> Pattern a -> Pattern a",
    value: strudelCore.rarely,
  },
  // ratio: { type: "", value: strudelCore.ratio },
  // ref: { type: "", value: strudelCore.ref },
  // register: { type: "", value: strudelCore.register },
  // reify: { type: "", value: strudelCore.reify },
  // removeUndefineds: { type: "", value: strudelCore.removeUndefineds },
  // repl: { type: "", value: strudelCore.repl },
  // rescale: { type: "", value: strudelCore.rescale },
  rev: {
    type: "Pattern a -> Pattern a",
    value: strudelCore.rev,
  },
  // ribbon: { type: "", value: strudelCore.ribbon },
  // rotate: { type: "", value: strudelCore.rotate },
  // round: { type: "", value: strudelCore.round },
  run: {
    type: "Pattern Number -> Pattern Number",
    value: strudelCore.run,
  },
  saw: {
    type: "Pattern Number",
    value: strudelCore.saw,
  },
  saw2: {
    type: "Pattern Number",
    value: strudelCore.saw2,
  },
  segment: {
    type: "Pattern Number -> Pattern a -> Pattern a",
    value: strudelCore.segment,
  },
  // seq: { type: "", value: strudelCore.seq },
  // sequence: { type: "", value: strudelCore.sequence },
  // set: { type: "", value: strudelCore.set },
  // setStringParser: { type: "", value: strudelCore.setStringParser },
  // setNumber: { type: "", value: strudelCore.setNumber },
  // signal: { type: "", value: strudelCore.signal },
  silence: {
    type: "Pattern a",
    value: strudelCore.silence,
  },
  sine: {
    type: "Pattern Number",
    value: strudelCore.sine,
  },
  sine2: {
    type: "Pattern Number",
    value: strudelCore.sine2,
  },
  slice: {
    type: "Pattern Number -> Pattern Number -> Pattern Controls -> Pattern Controls",
    value: strudelCore.slice,
  },
  slow: {
    type: "Pattern Number -> Pattern a -> Pattern a",
    value: strudelCore.slow,
  },
  slowcat: {
    type: "[Pattern a] -> Pattern a",
    value: strudelCore.slowcat,
  },
  // slowcatPrime: { type: "", value: strudelCore.slowcatPrime },
  // smear: { type: "", value: strudelCore.smear },
  // sol2note: { type: "", value: strudelCore.sol2note },
  someCycles: {
    type: "(Pattern a -> Pattern a) -> Pattern a -> Pattern a",
    value: strudelCore.someCycles,
  },
  someCyclesBy: {
    type: "Pattern Number -> (Pattern a -> Pattern a) -> Pattern a -> Pattern a",
    value: strudelCore.someCyclesBy,
  },
  someNumbers: {
    type: "(Pattern a -> Pattern a) -> Pattern a -> Pattern a",
    value: strudelCore.someNumbers,
  },
  someNumbersBy: {
    type: "Pattern Number -> (Pattern a -> Pattern a) -> Pattern a -> Pattern a",
    value: strudelCore.someNumbersBy,
  },
  sometimes: {
    type: "(Pattern a -> Pattern a) -> Pattern a -> Pattern a",
    value: strudelCore.sometimes,
  },
  sometimesBy: {
    type: "Pattern Number -> (Pattern a -> Pattern a) -> Pattern a -> Pattern a",
    value: strudelCore.sometimesBy,
  },
  sparsity: {
    type: "Pattern Number -> Pattern a -> Pattern a",
    value: strudelCore.sparsity,
  },
  // speak: { type: "", value: strudelCore.speak },
  splice: {
    type: "Pattern Number -> Pattern Number -> Pattern Controls -> Pattern Controls",
    value: strudelCore.splice,
  },
  // splitAt: { type: "", value: strudelCore.splitAt },
  square: {
    type: "Pattern Number",
    value: strudelCore.square,
  },
  square2: {
    type: "Pattern Number",
    value: strudelCore.square2,
  },
  squeeze: {
    type: "Pattern Number -> [Pattern a] -> Pattern a",
    value: strudelCore.squeeze,
  },
  stack: {
    type: "[Pattern a] -> Pattern a",
    value: (items) => strudelCore.stack(...items),
  },
  // steady: { type: "", value: strudelCore.steady },
  striate: {
    type: "Pattern Number -> Pattern Controls -> Pattern Controls",
    value: strudelCore.striate,
  },
  struct: {
    type: "Pattern Bool -> Pattern a -> Pattern a",
    value: strudelCore.struct,
  },
  stut: {
    type: "Pattern Number -> Pattern Number -> Pattern Number -> Pattern Controls -> Pattern Controls",
    value: strudelCore.stut,
  },
  stutWith: {
    type: "Pattern Number -> Pattern Number -> (Pattern a -> Pattern a) -> Pattern a -> Pattern a",
    value: strudelCore.stutWith,
  },
  // stutwith: { type: "", value: strudelCore.stutwith },
  // sub: { type: "", value: strudelCore.sub },
  superimpose: {
    type: "[Pattern a -> Pattern a] -> Pattern a -> Pattern a",
    value: strudelCore.superimpose,
  },
  // Number: { type: "", value: strudelCore.Number },
  NumberCat: {
    type: "[(Number, Pattern a)] -> Pattern a",
    value: strudelCore.NumberCat,
  },
  // toBipolar: { type: "", value: strudelCore.toBipolar },
  // tokenizeNote: { type: "", value: strudelCore.tokenizeNote },
  tri: {
    type: "Pattern Number",
    value: strudelCore.tri,
  },
  tri2: {
    type: "Pattern Number",
    value: strudelCore.tri2,
  },
  // undegrade: { type: "", value: strudelCore.undegrade },
  // undegradeBy: { type: "", value: strudelCore.undegradeBy },
  // unicodeToBase64: { type: "", value: strudelCore.unicodeToBase64 },
  // valueToMidi: { type: "", value: strudelCore.valueToMidi },
  // velocity: { type: "", value: strudelCore.velocity },
  // w: { type: "", value: strudelCore.w },
  wchoose: {
    type: "[(a, Number)] -> Pattern a",
    value: strudelCore.wchoose,
  },
  // wchooseCycles: { type: "", value: strudelCore.wchooseCycles },
  when: {
    type: "(Number -> Bool) -> (Pattern a -> Pattern a) -> Pattern a -> Pattern a",
    value: strudelCore.when,
  },
  // x: { type: "", value: strudelCore.x },
  // xfade: { type: "", value: strudelCore.xfade },
  // y: { type: "", value: strudelCore.y },
  // zipWith: { type: "", value: strudelCore.zipWith },
  zoom: {
    type: "(Number, Number) -> Pattern a -> Pattern a",
    value: strudelCore.zoom,
  },
  // zoomArc: {
  //   type: "Arc -> Pattern a -> Pattern a",
  //   value: strudelCore.zoomArc,
  // },
  // zoomIn: { type: "", value: strudelCore.zoomIn },
  // zoomarc: { type: "", value: strudelCore.zoomarc },
};

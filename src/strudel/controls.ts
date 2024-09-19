import { controls as strudelControls } from "@strudel/core";
import { Bindings } from "../compiler/parse/API";

export const controls: Bindings = {
  createParam: {
    type: "String -> (Pattern a -> Pattern Controls)",
    value: strudelControls.createParam,
  },

  s: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.s,
    synonyms: ["sound"],
  },

  // TODO: Input type here is maybe a Web Audio Node?
  source: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.source,
    synonyms: ["src"],
  },

  n: { type: "Pattern Number -> Pattern Controls", value: strudelControls.n },

  note: {
    type: "Pattern Note -> Pattern Controls",
    value: strudelControls.note,
  },

  accelerate: {
    type: "Pattern Number -> Pattern Controls",
    value: strudelControls.accelerate,
  },
  gain: {
    type: "Pattern Number -> Pattern Controls",
    value: strudelControls.gain,
  },
  postgain: {
    type: "Pattern Number -> Pattern Controls",
    value: strudelControls.postgain,
  },
  amp: {
    type: "Pattern Number -> Pattern Controls",
    value: strudelControls.amp,
  },
  attack: {
    type: "Pattern Number -> Pattern Controls",
    value: strudelControls.attack,
    synonyms: ["att"],
  },

  fmh: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.fmh,
  },
  fmi: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.fmi,
  },
  fm: { type: "Pattern String -> Pattern Controls", value: strudelControls.fm },
  fmenv: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.fmenv,
  },
  fmattack: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.fmattack,
  },
  fmdecay: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.fmdecay,
  },
  fmsustain: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.fmsustain,
  },
  fmrelease: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.fmrelease,
  },
  fmvelocity: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.fmvelocity,
  },
  bank: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.bank,
  },
  analyze: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.analyze,
  },
  fft: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.fft,
  },
  decay: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.decay,
  },
  dec: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.dec,
  },
  sustain: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.sustain,
  },
  sus: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.sus,
  },
  release: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.release,
  },
  rel: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.rel,
  },
  hold: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.hold,
  },
  bandf: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.bandf,
  },
  bpf: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.bpf,
  },
  bp: { type: "Pattern String -> Pattern Controls", value: strudelControls.bp },
  bandq: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.bandq,
  },
  bpq: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.bpq,
  },
  begin: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.begin,
  },
  end: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.end,
  },
  loop: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.loop,
  },
  loopBegin: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.loopBegin,
  },
  loopb: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.loopb,
  },
  loopEnd: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.loopEnd,
  },
  loope: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.loope,
  },
  crush: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.crush,
  },
  coarse: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.coarse,
  },
  channels: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.channels,
  },
  ch: { type: "Pattern String -> Pattern Controls", value: strudelControls.ch },
  phaserrate: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.phaserrate,
  },
  phasr: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.phasr,
  },
  phaser: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.phaser,
  },
  ph: { type: "Pattern String -> Pattern Controls", value: strudelControls.ph },
  phasersweep: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.phasersweep,
  },
  phs: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.phs,
  },
  phasercenter: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.phasercenter,
  },
  phc: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.phc,
  },
  phaserdepth: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.phaserdepth,
  },
  phd: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.phd,
  },
  phasdp: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.phasdp,
  },
  channel: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.channel,
  },
  cut: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.cut,
  },
  cutoff: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.cutoff,
  },
  ctf: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.ctf,
  },
  lpf: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.lpf,
  },
  lp: { type: "Pattern String -> Pattern Controls", value: strudelControls.lp },
  lpenv: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.lpenv,
  },
  lpe: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.lpe,
  },
  hpenv: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.hpenv,
  },
  hpe: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.hpe,
  },
  bpenv: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.bpenv,
  },
  bpe: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.bpe,
  },
  lpattack: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.lpattack,
  },
  lpa: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.lpa,
  },
  hpattack: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.hpattack,
  },
  hpa: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.hpa,
  },
  bpattack: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.bpattack,
  },
  bpa: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.bpa,
  },
  lpdecay: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.lpdecay,
  },
  lpd: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.lpd,
  },
  hpdecay: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.hpdecay,
  },
  hpd: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.hpd,
  },
  bpdecay: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.bpdecay,
  },
  bpd: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.bpd,
  },
  lpsustain: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.lpsustain,
  },
  lps: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.lps,
  },
  hpsustain: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.hpsustain,
  },
  hps: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.hps,
  },
  bpsustain: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.bpsustain,
  },
  bps: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.bps,
  },
  lprelease: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.lprelease,
  },
  lpr: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.lpr,
  },
  hprelease: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.hprelease,
  },
  hpr: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.hpr,
  },
  bprelease: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.bprelease,
  },
  bpr: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.bpr,
  },
  ftype: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.ftype,
  },
  fanchor: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.fanchor,
  },
  vib: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.vib,
  },
  vibrato: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.vibrato,
  },
  v: { type: "Pattern String -> Pattern Controls", value: strudelControls.v },
  noise: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.noise,
  },
  vibmod: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.vibmod,
  },
  vmod: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.vmod,
  },
  hcutoff: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.hcutoff,
  },
  hpf: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.hpf,
  },
  hp: { type: "Pattern String -> Pattern Controls", value: strudelControls.hp },
  hresonance: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.hresonance,
  },
  hpq: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.hpq,
  },
  resonance: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.resonance,
  },
  lpq: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.lpq,
  },
  djf: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.djf,
  },
  delay: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.delay,
  },
  delayfeedback: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.delayfeedback,
  },
  delayfb: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.delayfb,
  },
  dfb: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.dfb,
  },
  delaytime: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.delaytime,
  },
  delayt: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.delayt,
  },
  dt: { type: "Pattern String -> Pattern Controls", value: strudelControls.dt },
  lock: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.lock,
  },
  detune: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.detune,
  },
  det: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.det,
  },
  dry: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.dry,
  },
  fadeTime: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.fadeTime,
  },
  fadeOutTime: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.fadeOutTime,
  },
  fadeInTime: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.fadeInTime,
  },
  freq: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.freq,
  },
  pattack: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.pattack,
  },
  patt: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.patt,
  },
  pdecay: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.pdecay,
  },
  pdec: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.pdec,
  },
  psustain: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.psustain,
  },
  psus: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.psus,
  },
  prelease: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.prelease,
  },
  prel: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.prel,
  },
  penv: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.penv,
  },
  pcurve: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.pcurve,
  },
  panchor: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.panchor,
  },
  gate: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.gate,
  },
  gat: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.gat,
  },
  leslie: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.leslie,
  },
  lrate: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.lrate,
  },
  lsize: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.lsize,
  },
  activeLabel: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.activeLabel,
  },
  label: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.label,
  },
  degree: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.degree,
  },
  mtranspose: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.mtranspose,
  },
  ctranspose: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.ctranspose,
  },
  harmonic: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.harmonic,
  },
  stepsPerOctave: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.stepsPerOctave,
  },
  octaveR: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.octaveR,
  },
  nudge: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.nudge,
  },
  octave: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.octave,
  },
  orbit: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.orbit,
  },
  overgain: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.overgain,
  },
  overshape: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.overshape,
  },
  pan: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.pan,
  },
  panspan: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.panspan,
  },
  pansplay: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.pansplay,
  },
  panwidth: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.panwidth,
  },
  panorient: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.panorient,
  },
  rate: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.rate,
  },
  slide: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.slide,
  },
  semitone: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.semitone,
  },
  voice: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.voice,
  },
  chord: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.chord,
  },
  dictionary: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.dictionary,
  },
  dict: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.dict,
  },
  anchor: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.anchor,
  },
  offset: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.offset,
  },
  octaves: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.octaves,
  },
  mode: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.mode,
  },
  room: {
    type: "Pattern Number -> Pattern Controls",
    value: strudelControls.room,
  },
  roomlp: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.roomlp,
  },
  rlp: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.rlp,
  },
  roomdim: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.roomdim,
  },
  rdim: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.rdim,
  },
  roomfade: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.roomfade,
  },
  rfade: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.rfade,
  },
  ir: { type: "Pattern String -> Pattern Controls", value: strudelControls.ir },
  iresponse: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.iresponse,
  },
  roomsize: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.roomsize,
  },
  size: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.size,
  },
  sz: { type: "Pattern String -> Pattern Controls", value: strudelControls.sz },
  rsize: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.rsize,
  },
  shape: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.shape,
  },
  compressor: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.compressor,
  },
  compressorKnee: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.compressorKnee,
  },
  compressorRatio: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.compressorRatio,
  },
  compressorAttack: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.compressorAttack,
  },
  compressorRelease: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.compressorRelease,
  },
  speed: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.speed,
  },
  unit: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.unit,
  },
  squiz: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.squiz,
  },
  vowel: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.vowel,
  },
  waveloss: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.waveloss,
  },
  density: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.density,
  },
  dur: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.dur,
  },
  expression: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.expression,
  },
  sustainpedal: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.sustainpedal,
  },
  tremolodepth: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.tremolodepth,
  },
  tremdp: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.tremdp,
  },
  tremolorate: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.tremolorate,
  },
  tremr: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.tremr,
  },
  fshift: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.fshift,
  },
  fshiftnote: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.fshiftnote,
  },
  fshiftphase: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.fshiftphase,
  },
  triode: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.triode,
  },
  krush: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.krush,
  },
  kcutoff: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.kcutoff,
  },
  octer: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.octer,
  },
  octersub: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.octersub,
  },
  octersubsub: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.octersubsub,
  },
  ring: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.ring,
  },
  ringf: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.ringf,
  },
  ringdf: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.ringdf,
  },
  distort: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.distort,
  },
  freeze: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.freeze,
  },
  xsdelay: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.xsdelay,
  },
  tsdelay: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.tsdelay,
  },
  real: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.real,
  },
  imag: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.imag,
  },
  enhance: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.enhance,
  },
  partials: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.partials,
  },
  comb: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.comb,
  },
  smear: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.smear,
  },
  scram: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.scram,
  },
  binshift: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.binshift,
  },
  hbrick: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.hbrick,
  },
  lbrick: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.lbrick,
  },
  midichan: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.midichan,
  },
  control: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.control,
  },
  ccn: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.ccn,
  },
  ccv: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.ccv,
  },
  polyTouch: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.polyTouch,
  },
  midibend: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.midibend,
  },
  miditouch: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.miditouch,
  },
  ctlNum: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.ctlNum,
  },
  frameRate: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.frameRate,
  },
  frames: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.frames,
  },
  hours: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.hours,
  },
  midicmd: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.midicmd,
  },
  minutes: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.minutes,
  },
  progNum: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.progNum,
  },
  seconds: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.seconds,
  },
  songPtr: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.songPtr,
  },
  uid: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.uid,
  },
  val: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.val,
  },
  cps: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.cps,
  },
  clip: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.clip,
  },
  zrand: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.zrand,
  },
  curve: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.curve,
  },
  deltaSlide: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.deltaSlide,
  },
  pitchJump: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.pitchJump,
  },
  pitchJumpTime: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.pitchJumpTime,
  },
  lfo: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.lfo,
  },
  repeatTime: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.repeatTime,
  },
  znoise: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.znoise,
  },
  zmod: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.zmod,
  },
  zcrush: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.zcrush,
  },
  zdelay: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.zdelay,
  },
  tremolo: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.tremolo,
  },
  zzfx: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.zzfx,
  },
  createParams: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.createParams,
  },
  adsr: {
    type: "Pattern String -> Pattern Controls",
    value: strudelControls.adsr,
  },
  ad: { type: "Pattern String -> Pattern Controls", value: strudelControls.ad },
  ds: { type: "Pattern String -> Pattern Controls", value: strudelControls.ds },
};

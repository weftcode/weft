// @ts-nocheck
import $Types from "./pattern.weft?raw";

export { $Types };

export * from "@strudel/core/pattern.mjs";

import * as Base from "@strudel/core/pattern.mjs";

export const stack = (patterns) => Base.stack(...patterns);
export const polyrhythm = stack;
export const pr = stack;

export const polymeter = (patterns) => Base.polymeter(...patterns);
export const pm = polymeter;

export const cat = (patterns) => Base.cat(...patterns);
export const slowcat = (patterns) => Base.cat(...patterns);
export const seq = (patterns) => Base.seq(...patterns);
export const sequence = (patterns) => Base.seq(...patterns);
export const fastcat = (patterns) => Base.seq(...patterns);

export const stepCat = (patterns) => Base.stepcat(...patterns);
export const timeCat = (patterns) => Base.timecat(...patterns);
export const zip = (patterns) => Base.zip(...patterns);

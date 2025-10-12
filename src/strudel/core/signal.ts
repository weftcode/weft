// @ts-nocheck
import $Types from "./signal.weft?raw";

export { $Types };

export * from "@strudel/core/signal.mjs";

import * as Base from "@strudel/core/signal.mjs";

export const choose = (patterns) => Base.choose(...patterns);
export const chooseIn = (patterns) => Base.chooseIn(...patterns);
export const chooseOut = (patterns) => Base.chooseOut(...patterns);
export const chooseCycles = (patterns) => Base.chooseCycles(...patterns);
export const randcat = (patterns) => Base.randcat(...patterns);

export const wchoose = (weights) => Base.wchoose(...weights);
export const wchooseCycles = (weights) => Base.wchooseCycles(...weights);
export const wrandcat = (weights) => Base.wrandcat(...weights);

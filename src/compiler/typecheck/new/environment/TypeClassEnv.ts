import { Instance } from "../TypeClass";
import { TypeScheme } from "../TypeScheme";

export type TypeClassEnv = {
  readonly [name: string]: ClassDec;
};

export interface ClassDec {
  superClasses: string[];
  functions: { readonly [name: string]: { type: TypeScheme; value?: any } };
  instances: Instance[];
}

export interface ClassSpec {
  name: string;
  superClasses: string[];
  functions: { readonly [name: string]: { type: string; value?: any } };
}

// const getSuper = (ce: ClassEnv, id: Id) => ce.classes[id][0];

// const getInsts = (ce: ClassEnv, id: Id) => ce.classes[id][1];

// // Do we need `defined` function?

// const modify = ({ classes, defaults }: ClassEnv, id: Id, c: Class) => ({
//   classes: { ...classes, [id]: c },
//   defaults,
// });

function addClass(spec: ClassSpec, ce: TypeClassEnv): TypeClassEnv {
  let { name, superClasses } = spec;
  if (name in ce) {
    throw new Error(
      `Can't add new class ${name}: Class name is already defined`
    );
  }

  if (superClasses.some((sName) => !(sName in ce))) {
    throw new Error(`Can't add new class ${name}: Superclass is not defined`);
  }

  const functions = Object.fromEntries(
    Object.entries(spec.functions).map(([fName, { type, value }]) => [
      fName,
      { type: null, value },
    ])
  );

  return {
    ...ce,
    [name]: { superClasses, functions, instances: [] },
  };
}

function addInst(ps: Predicate[], p: Predicate, ce: ClassEnv) {
  let className = p.isIn;

  if (!(className in ce.classes)) {
    throw new Error("no class for instance");
  }

  let its = getInsts(ce, className);

  if (its.map((i) => i.head).some((q) => overlap(p, q))) {
    throw new Error(`overlapping instance`);
  }

  return modify(ce, className, [
    getSuper(ce, className),
    [{ preds: ps, head: p }, ...its],
  ]);
}

function overlap(p: Predicate, q: Predicate) {
  try {
    mguPred(p, q);
    return true;
  } catch (e) {
    return false;
  }
}

// Example Instances

// 7.3 Entailment

function bySuper(ce: ClassEnv, p: Predicate): Predicate[] {
  let { isIn: i, type: t } = p;
  return [
    p,
    ...getSuper(ce, i).flatMap((i1) => bySuper(ce, { isIn: i1, type: t })),
  ];
}

function byInst(ce: ClassEnv, p: Predicate) {
  let { isIn: i, type: t } = p;

  const tryInst = ({ preds: ps, head: h }: Inst) => {
    let u = matchPred(h, p);
    return ps.map((p1) => TypesPred.apply(u, p1));
  };

  //
  for (let it of getInsts(ce, i)) {
    try {
      return tryInst(it);
    } catch (e) {}
  }

  throw new Error("byInst failed");
}

function entail(ce: ClassEnv, ps: Predicate[], p: Predicate): boolean {
  let checkSupers = ps
    .map((p1) => bySuper(ce, p1))
    .some((ps1) => ps1.some((p2) => eq(p, p2)));

  let checkInst: boolean;

  try {
    checkInst = byInst(ce, p).every((q) => entail(ce, ps, q));
  } catch (e) {
    checkInst = false;
  }

  return checkSupers || checkInst;
}

// 7.4 Context Reduction

function inHnf({ type: t }: Predicate) {
  return hnf(t);

  function hnf(type: Type): boolean {
    switch (type.type) {
      case "tvar":
        return true;
      case "tyapp":
        return hnf(type.args[0]);
      default:
        return false;
    }
  }
}

const toHnfs = (ce: ClassEnv, ps: Predicate[]) =>
  ps.flatMap((p) => toHnf(ce, p));

function toHnf(ce: ClassEnv, p: Predicate): Predicate[] {
  if (inHnf(p)) {
    return [p];
  }

  try {
    return toHnfs(ce, byInst(ce, p));
  } catch (e) {
    throw new Error("context reduction");
  }
}

function simplify(ce: ClassEnv, ps: Predicate[]) {
  let rs: Predicate[] = [];
  let p: Predicate;

  while (ps.length > 0) {
    [p, ...ps] = ps;

    // If p is entailed by the existing list of predicates then
    // it can be eliminated. Otherwise, it's treated as necessary
    // and moved to rs
    if (!entail(ce, rs.concat(ps), p)) {
      rs = [p, ...rs];
    }
  }

  return rs;
}

const reduce = (ce: ClassEnv, ps: Predicate[]) => simplify(ce, toHnfs(ce, ps));

// export interface Instance {
//   class: string;
//   type: MonoType;
//   functions: { [name: string]: any };
// }

// export function defineClass(
//   name: string,
//   superClass: string[], // TODO: Make this part of the name signature
//   functions: { [name: string]: string | { type: string; value?: any } }
// ): Class {
//   let tokens = new Scanner(name).scanTokens();
//   let classType = new TypeParser(tokens, new ErrorReporter()).parse();
//   if (classType.type !== "ty-app")
//     throw new Error("Class must be defined as a type constructor");
//   let {
//     C: className,
//     mus: [classTypeVariable],
//   } = classType;
//   if (!classTypeVariable || classTypeVariable.type !== "ty-var")
//     throw new Error("Class must have type variable");
//   let classFunctions: ClassInterface = {};
//   for (let [fName, fTypeInfo] of Object.entries(functions)) {
//     let fTypeSig = typeof fTypeInfo === "string" ? fTypeInfo : fTypeInfo.type;
//     let fTokens = new Scanner(fTypeSig).scanTokens();
//     let fType = new TypeParser(fTokens, new ErrorReporter()).parse();
//     classFunctions[fName] = {
//       type: fType,
//       value: typeof fTypeInfo === "object" ? fTypeInfo.value : undefined,
//     };
//   }
//   return {
//     name: className,
//     superClass,
//     variable: classTypeVariable,
//     functions: classFunctions,
//   };
// }

// export function defineInstance(
//   name: string,
//   functions: { [name: string]: any } = {}
// ): Instance {
//   let tokens = new Scanner(name).scanTokens();
//   let instanceType = new TypeParser(tokens, new ErrorReporter()).parse();
//   if (instanceType.type !== "ty-app")
//     throw new Error("Instance must be defined as a type constructor");
//   if (instanceType.mus.length !== 1)
//     throw new Error("Instance must have once type parameter");
//   return {
//     class: instanceType.C,
//     type: instanceType.mus[0],
//     functions,
//   };
// }
// // A few example type class declarations for testing
// // Eq
// let Eq = defineClass("Eq a", [], {
//   "==": "a -> a -> Bool",
//   "/=": "a -> a -> Bool",
// });
// let basicEq = {
//   "==": (a, b) => a === b,
//   "/=": (a, b) => a !== b,
// };
// let EqNumber = defineInstance("Eq Number", basicEq);
// let EqString = defineInstance("Eq String", basicEq);
// // Ord
// let Ord = defineClass("Ord a", ["Eq"], {
//   compare: "a -> a -> Ordering",
//   "<": "a -> a -> Bool",
//   "<=": "a -> a -> Bool",
//   ">": "a -> a -> Bool",
//   ">=": "a -> a -> Bool",
//   max: "a -> a -> a",
//   min: "a -> a -> a",
// });
// // Functor
// // Currently the system doesn't entail checking the kind of f
// // Is this strictly needed for a minimum viable implementation?
// let Functor = defineClass("Functor f", [], {
//   fmap: "(a -> b) -> f a -> f b",
//   "<$": "a -> f a -> f b",
// });

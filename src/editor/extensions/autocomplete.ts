import { autocompletion, completeFromList } from "@codemirror/autocomplete";

export function autocomplete(bindingNames: string[]) {
  return autocompletion({ override: [completeFromList(bindingNames)] });
}

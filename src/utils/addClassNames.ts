/**
 * Add multiple class names to an element given a string of space-separated class names.
 */
export function addClassNames({ el, classNames }: { el: HTMLElement; classNames: string }): void {
  el.addClasses(classNames.split(" "));
}

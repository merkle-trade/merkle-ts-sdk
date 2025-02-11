/** side-effect: modifies original Error object */
const removeFirstStack = (e: Error): Error => {
  if (!e.stack) return e;
  const stack = e.stack.split("\n");
  e.stack = [stack[0], ...stack.slice(2)].join("\n");
  return e;
};

export const raise = (e?: string | Error) => {
  if (e === undefined || typeof e === "string") {
    throw removeFirstStack(new Error(e));
  }
  throw e;
};

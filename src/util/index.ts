export * from './dates';
export * from './numbers';

// General functions without grander categories

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Check if an object has a key, if not, create it given a default value */
export function setObjectDefault<
  O extends Record<K, V>,
  K extends string = string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  V extends O[K] = any
>(object: O, key: K, defaultValue: V) {
  // eslint-disable-next-line no-prototype-builtins
  if (!object.hasOwnProperty(key)) {
    object[key] = defaultValue;
  }
}

export function cleanPath(path: string): string {
  return path
    .split('/')
    .reduce((pathSoFar: string[], directory) => {
      if (directory === '..' && pathSoFar[pathSoFar.length - 1]) {
        pathSoFar.pop();
      } else if (directory !== '.') {
        pathSoFar.push(directory);
      }
      return pathSoFar;
    }, [])
    .join('/');
}

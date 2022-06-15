import fs, { accessSync, constants } from 'fs';
import { join } from 'path';
import { Config } from '.';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

const USER_CONFIG_PATH = '../..';
const USER_CONFIG_FILE = 'config.json';
const USER_CONFIG_FILE_PATH = join(
  __dirname,
  USER_CONFIG_PATH,
  USER_CONFIG_FILE
);

let userConfigExists;
// Check if the file exists in the current directory.
try {
  accessSync(USER_CONFIG_FILE_PATH, constants.F_OK);
  userConfigExists = true;
} catch {
  userConfigExists = false;
  console.log(
    `The config file "${USER_CONFIG_FILE_PATH}" doesn't exist. You'll likely want to create one.`
  );
}

if (userConfigExists) {
  // Check if the file is readable.
  try {
    accessSync(USER_CONFIG_FILE_PATH, constants.R_OK);
  } catch (err) {
    console.error(`"${USER_CONFIG_FILE}" is not readable: ${err as string}`);
  }
}

let userConfig: Partial<Config> = {};

try {
  const rawUserConfig = userConfigExists
    ? fs.readFileSync(USER_CONFIG_FILE_PATH, 'utf8')
    : '{}';
  userConfig = JSON.parse(rawUserConfig) as Partial<Config>;
} catch (err) {
  console.error(
    `User config file ${USER_CONFIG_FILE_PATH} is malformed or not readable in some way: ${
      err as string
    }`
  );
}

export { userConfig };

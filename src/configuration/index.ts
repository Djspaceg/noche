import defaultConfig from './default';
import { userConfig } from './user';

export type Config = typeof defaultConfig;

const config: Config = {
  ...defaultConfig,
  ...userConfig,
  ...process.env,
};

export default config;

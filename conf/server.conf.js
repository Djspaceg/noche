/**
 * Noche Configuration File
 *
 * Please keep your arms and legs inside the vehicle at all time. No flash
 * photography, and we'll have a pleasant journey.
 *
 * This file stores configuration and settings for the noche server.
 */

export default {
  ServerName: 'Noche Media Server',

  Listen: 8888,

  ServerAdmin: 'you@example.com',

  /**
   * Set your server's root level, the lowest level a visitor is allowed to go.
   * And a reminder, all directory names and paths do NOT end in a slash.
   */
  DocumentRoot: '/Users/stepblk/Source',

  DirectoryIndex: 'index.html',

  DefaultContentType: 'text/html',
};

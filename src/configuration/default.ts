/**
 * Noche Configuration File
 *
 * Please keep your arms and legs inside the vehicle at all time. No flash
 * photography, and we'll have a pleasant journey.
 *
 * This file stores configuration and settings for the noche server.
 */

export default {
  ServerName: 'Noche Server',

  Listen: 8888,

  ServerAdmin: 'you@example.com',

  /**
   * Set your server's root level, the lowest level a visitor is allowed to go.
   * And a reminder, all directory names and paths do NOT end in a slash.
   */
  DocumentRoot: '/Users/<userName>/Source',

  DirectoryIndex: 'index.html',

  DefaultContentType: 'text/html',

  /** Directory Index Configuration */
  directoryIndexing: {
    /** A regular expression of filenames which should not be included in the index. */
    Ignore: /^\./,

    /**
     * Specify the default output format that you'd like from getDirectory.
     * Options are: "json" "html"
     */
    Format: 'html',

    /**
     * Optionally include or exclude the "parent directory" item in directory indexes. (DocumentRoot
     * doesn't include this regardless of this setting)
     */
    IncludeParentDirJson: false,
    IncludeParentDirHtml: true,

    /**
     * If you'd like to inject HTML before and/or after the HTML, specify their names here.
     * HeaderFilename's contents is placed before the directory index, while FooterFilename's contents
     * is placed after the directory index. One, both, or neither are allowed. Set to empty-string
     * ("") to unset.
     * Note: These files are automatically excluded from all directory indexes.
     */
    HeaderFilename: '/HEADER.html',
    FooterFilename: '/FOOTER.html',

    /** Enable/disable media metadata checking and display. */
    MediaMetadata: true,

    /**
     * Check for a file in the media directory with the following extension to determine if said
     * directory contains media info.
     */
    // MediaMetadataThumbnailExtension: ".tbn",
    MediaMetadataThumbnailExtension: ['.tbn', '-poster.jpg'],
  },

  /** XML to JSON Extension Configuration */
  xml2json: {
    /** Toggle whether this module is enabled */
    Enabled: true,

    /**
     * For a list of ALLLLLL the options, see here:
     * https://github.com/Leonidas-from-XIV/node-xml2js#options
     */
    Options: {
      trim: true,
      explicitArray: false,
    },
  },
};

//
// Directory Index Configuration
//

// A regular expression of filenames which should not be included in the index.
exports.Ignore = /^\./;

// Specify the default output format that you'd like from getDirectory.
// Options are: "json" "html"
exports.Format = "html";

// Optionally include or exclude the "parent directory" item in directory indexes.
// (DocumentRoot doesn't include this regardless of this setting)
exports.IncludeParentDirJson = false;
exports.IncludeParentDirHtml = true;

// If you'd like to inject HTML before and/or after the HTML, specify their names here.
// HeaderFilename's contents is placed before the directory index, while
// FooterFilename's contents is placed after the directory index.
// One, both, or neither are allowed. Set to empty-string ("") to unset.
// Note: These files are automatically excluded from all directory indexes.
exports.HeaderFilename = "/HEADER.html";
exports.FooterFilename = "/FOOTER.html";

// Enable/disable media metadata checking and display.
exports.MediaMetadata = true;
// Check for a file in the media directory with the following extension
// to determine if said directory contains media info.
exports.MediaMetadataThumbnailExtension = ".tbn";

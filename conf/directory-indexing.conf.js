//
// Directory Index Configuration
//

// A regular expression of filenames which should not be included in the index.
exports.Ignore = /^\./;

// Specify the output format that you'd like from getDirectory.
// Options are: "json" "html"
exports.Format = "html";

// Optionally include or exclude the "parent directory" item in directory indexes.
// (DocumentRoot doesn't include this regardless of this setting)
exports.IncludeParentDirJson = false;
exports.IncludeParentDirHtml = true;

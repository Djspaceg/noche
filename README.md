noche
=====

A simple Node.JS server based on the design style and modules concepts of Apache.

What the hell does that mean: "style and modules concepts of Apache"? -- I really like the way Apache works, its modules, and even its internal configuration variables. Though some parts of it, like the directory indexing seem dated, tedious to configure and tedious integrate into modern applications.

Aren't there like dozens of web servers out there already? Why did you make this one? -- Why not? Sometimes you just can't find what you're wanting in existing projects or products. Take a look below at what Noche does well.

Noche (pronounced No-chee, like Node+Apache) to the rescue! Noche makes the following easy!

* Directory Indexing
	* Output in either stylable HTML or JSON
	* Smart indexing, detect if there's an index.html or <foldername>.nfo file inside a directory before opening it.
* Automatic conversion of XML files to JSON with just an optional URL parameter
* Easy configuration with a few powerful options in configuration files.

## Directory Indexing Bliss

### Header & Footer Insertion

Noche can be configured to insert a header and footer HTML file on to every page. Just place a HEADER.html and/or a FOOTER.html file in any folder and it will be inserted above and below the directory index when that directory is loaded. Alternatively, you can place a single HEADER.html and/or FOOTER.html at the document-root of your server directory and it/they will be placed on every directory index. **Planned feature:** having both HEADER.html at the root and inside a sub-folder, the  sub-folder's HEADER.html should win, and be inserted in leu of the root-level HEADER.html, allowing to you have custom overrides for some folders while still getting to use the main root-level one.

### Output in HTML or JSON

Noche will output any directory index in either format with the flip of a switch. Simply add `?f=json` to the end of any directory URL and the output will be returned in JSON format. An Example:

```
{
	"filesystem": [
		{
			"path": "/movie-info-page/",
			"name": "movie-info-page",
			"hasMedia": false,
			"contents": [
				{
					"name": "Exports",
					"size": 68,
					"mtime": "2014-01-22T17:59:23.000Z",
					"path": "/movie-info-page/Exports/",
					"ext": "folder",
					"isDir": true,
					"hasIndex": false,
					"hasMedia": false
				},
				{
					"name": "ImageHeader.js",
					"size": 2297,
					"mtime": "2013-12-30T22:09:30.000Z",
					"path": "/movie-info-page/ImageHeader.js",
					"ext": "js",
					"isDir": false,
					"hasIndex": false,
					"hasMedia": false
				},
				{
					"name": "Mockup.psd",
					"size": 13520443,
					"mtime": "2013-12-23T20:32:26.000Z",
					"path": "/movie-info-page/Mockup.psd",
					"ext": "psd",
					"isDir": false,
					"hasIndex": false,
					"hasMedia": false
				},
				{
					"name": "Serenity (2005)",
					"size": 170,
					"mtime": "2014-01-22T17:57:52.000Z",
					"path": "/movie-info-page/Serenity (2005)/",
					"ext": "folder",
					"isDir": true,
					"hasIndex": false,
					"hasMedia": "Serenity (2005)-poster.jpg"
				}
			]
		}
	]
}
```
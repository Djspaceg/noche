noche
=====

A simple Node.JS server based on the design style and modules concepts of Apache. (Pronounced "_No-chee_", like <strong>No</strong>de+Apa<strong>che</strong>.)

What the hell does that mean: "style and modules concepts of Apache"? -- I really like the way Apache works, its modules, and even its internal configuration variables. Though some parts of it, like the directory indexing seem dated, tedious to configure and tedious integrate into modern applications.

Aren't there like dozens of web servers out there already? Why did you make this one? -- Why not? Sometimes you just can't find what you're wanting in existing projects or products. Take a look below at what Noche does well.

Noche to the rescue! Noche makes the following easy!

* Directory Indexing
	* Output in either stylable HTML or JSON
	* Smart indexing, detect if there's an index.html or _folderName_.nfo file inside a directory before opening it.
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

## JSON for All!

Noche supports a fancy feature that can automatically parse and output any proper XML to JSON. Simply request any XML file with the familiar `?f=json` query-string GET arguments, and presto-chango you get that XML file converted to JSON.

In the event that the file is malformed or not actually XML, you get nothing, a blank/empty response.** But you do get a handy error, so you can trap against that with your XHR code.

** _This seems crappy in retrospect. Maybe I'll fix this so you get the original file without any conversion..._

### JSONP

So you like JSON, but you want JSONP. Well, just provide a `callback=YourFunctionNameHere` argument in the query-string and you'll get the response wrapped in a function of your naming. This argument works with anything outputtable in JSON format. Ex:

`/path/filename.xml?f=json&callback=YourFunctionNameHere`

```
YourFunctionNameHere({
	"filesystem": [
		{
			"path": "/movie-info-page/",
			"name": "movie-info-page",
			"hasMedia": false,
	...
});
```

## Configuration

What good is a thing, if it's not customizable? Everything that makes sense to be customizable, is. The core server, and each extension, has their own config files. This lets you customize just what you want and not have to sift through a bunch of noise.

Each extension's config file's settings take precedence over the core's config, just in case that's relevant to you.

## Installation

Currently, Noche is only set up to run as a service on Mac OS X. I plan on expanding this in the near future to at least run as a service under linux (Ubuntu/Mint).

### Basic Running (Any OS)

Simply execute "`$ node server.js`" from within the noche directory and you're up and running. Press `[Ctrl]`+`[c]` to exit it. You could be fancier and launch-and-detach so it stays running in the background like so:

```
$ node server.js >> logs/access.log 2>&1 &
```
Now your logs will be in the logs directory, in a file called "access.log".

### Classy Install (Mac OS X Service)

Included in the Noche package is a **service/** folder. In here you'll find a **com.resourcefork.noche.plist** file. From the command-line, type the following:

_Change directories in the command line to the service directory:_

```
cd service
```
_And Load the service p-list, then start the service:_

```
launchctl load com.resourcefork.noche.plist
```
Noche will then be loaded, output to Console.app, and start every time you boot up. Verify it's running like so:

```
launchctl list | grep noche
```
You should see a number, followed by a "-", then the service name: "com.resourcefork.noche". If there's no number (Process ID), then Noche is loaded, but not running.

Noche is persistent, so it will continuously relaunch if it's killed or the process is stopped.***

***If the process is stopped by launchctl, it shouldn't start back up, but it does. Need to figure out why.

_**Fun tip:** You can even kill the server and it will come back to life! It's allllllive!_

#### Uninstall

If you'd like to turn it off, or get rid of it, simply do the opposite of what you just did, like so:

```
launchctl unload com.resourcefork.noche.plist
```

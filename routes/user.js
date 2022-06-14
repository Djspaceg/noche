/*
 * GET users listing.
 */
'use strict';

export function list(req, res) {
  // res.send("respond with a resource");
  res.json([req, res]);
}

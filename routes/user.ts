/*
 * GET users listing.
 */
'use strict';

import e from 'express';

export function list(req: e.Request, res: e.Response) {
  // res.send("respond with a resource");
  res.json([req, res]);
}

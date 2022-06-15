import e from 'express';

/** GET users listing. */
export function listUsers(req: e.Request, res: e.Response) {
  // res.send("respond with a resource");
  res.json([req, res]);
}

export default listUsers;

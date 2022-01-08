import type { NextFunction, Request, Response } from "express";

/** Checks that the caller is an admin. */
export function admin(req: Request, res: Response, next: NextFunction) {
	if (!req.body.user.isAdmin) return res.status(403);
	next();
}

import { Request, Response, NextFunction } from "express";

export const logger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  console.log("➡️  REQUEST");
  console.log("Method:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("Body:", req.body);

  res.on("finish", () => {
    const duration = Date.now() - start;

    console.log("⬅️  RESPONSE");
    console.log("Status:", res.statusCode);
    console.log("Time:", `${duration}ms`);
    console.log("-----------------------------");
  });

  next();
};

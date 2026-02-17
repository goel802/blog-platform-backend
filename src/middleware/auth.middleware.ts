import jwt from "jsonwebtoken";

export const authMiddleware =(req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET!);
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
}
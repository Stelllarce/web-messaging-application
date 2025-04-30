import { verify } from "jsonwebtoken";
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).send({ error: "No token provided" });
    }
    try {
        const user = verify(token, process.env.JWT_SECRET);
        req.user = user;
    }
    catch (err) {
        return res.status(403).send({ error: "Invalid token" });
    }
    next();
};

import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
    try {
        let token;
        
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_super_secret");
        req.userId = decoded.id;
        
        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        return next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ message: "Not authorized, token failed" });
    }
};

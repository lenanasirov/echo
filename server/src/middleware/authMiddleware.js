import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication required."
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            id: decoded.userId
        };

        next();
    } catch {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired authentication token."
        });
    }
}
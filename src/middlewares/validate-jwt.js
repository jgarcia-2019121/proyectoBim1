import jwt from 'jsonwebtoken'
import User from '../user/user.model.js'


export const validateJwt = (req, res, next) => {
    const token = req.headers.authorization;
    const currentRoute = req.path;
    const publicRoutes = ['api/check/login'];

    if (publicRoutes.includes(currentRoute)) {
        return next();
    }
    if (!token) {
        return res.status(401).json({ message: 'Authentication token not provided' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: 'Invalid authentication token' });
    }
};

export const isClient = async (req, res, next) => {
    try {
        let { user } = req
        if (!user || user.role !== 'CLIENT') return res.status(403).send({ message: 'You do not have access check it' })
        next()
    } catch (error) {
        console.error(error);
        return res.status(403).send({ message: 'invalid authorization plis check' })
    }
}

export const isAdmin = async (req, res, next) => {
    try {
        let { user } = req
        if (!user || user.role !== 'ADMIN') return res.status(403).send({ message: 'You do not have access check it' })
        next()
    } catch (error) {
        console.error(error);
        return res.status(403).send({ message: 'invalid authorization plis check' })
    }
}


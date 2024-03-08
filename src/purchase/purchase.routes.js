import { Router } from "express";
import { validateJwt } from '../middlewares/validate-jwt.js'
import { test, register } from "../purchase/purchase.controller.js";

const api = Router()

api.get('/test', test)
api.post('/register', [validateJwt], register)

export default api
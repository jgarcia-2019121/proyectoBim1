import { Router } from "express";
import { test, register } from "./pruchase.controller.js";
import { validateJwt } from '../middlewares/validate-jwt.js'

const api = Router()

api.get('/test', test)
api.post('/register', [validateJwt], register)

export default api
import express from 'express'
import { isAdmin, validateJwt } from '../middlewares/validate-jwt.js'
import { test, register, registerA, login, update, deleteU, reportPurchase } from './user.controller.js';

const api = express.Router();

api.get('/test', test)
api.post('/login', login)
api.post('/register', register)
api.post('/registerA', registerA)
api.put('/update/:id', update)
api.delete('/deleteU/:id', deleteU)
api.get('/reportPurchase', [validateJwt], reportPurchase)

export default api
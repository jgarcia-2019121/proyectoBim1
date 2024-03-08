import express from 'express'
import { isAdmin, validateJwt } from '../middlewares/validate-jwt.js'
import { test, register, registerA, login, update, deleteU } from './user.controller.js';

const api = express.Router();

api.get('/test', test)
api.post('/login', login)
api.post('/register', register)
api.post('/registerA', [validateJwt, isAdmin], registerA)

api.put('/update/:id', [validateJwt], update)
api.delete('/deleteU/:id', [validateJwt], deleteU)

export default api
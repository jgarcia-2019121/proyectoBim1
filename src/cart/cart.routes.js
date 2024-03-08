import { Router } from 'express'
import { registerCart, deleteC } from './cart.controller.js'
import { isAdmin, validateJwt } from '../middlewares/validate-jwt.js'

const api = Router()

api.post('/registerCart', [validateJwt], registerCart)
api.get('/deleteC', [validateJwt], deleteC)

export default api
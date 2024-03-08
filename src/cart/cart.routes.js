import { Router } from 'express'
import { registerCart, deleteC, test } from './cart.controller.js'
import { isAdmin, validateJwt } from '../middlewares/validate-jwt.js'

const api = Router()

api.get('/test', test)
api.post('/registerCart', [validateJwt], registerCart)
api.delete('/deleteC', [validateJwt], deleteC)

export default api
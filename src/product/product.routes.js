'use stricts'

import express from 'express'
import { test, register, update, deleteP, search, list, spent, bestProductsPurchased, searchID } from './product.controller.js'
import { validateJwt, isAdmin } from '../middlewares/validate-jwt.js'

const api = express.Router();

api.get('/test', test)
api.post('/register', [validateJwt, isAdmin], register)

api.put('/update/:id', [validateJwt, isAdmin], update)
api.delete('/deleteP/:id', [validateJwt, isAdmin], deleteP)
api.get('/search', search)
api.get('/list', list)
api.get('/spent', [validateJwt, isAdmin], spent)
api.get('/bestProductsPurchased', bestProductsPurchased)
api.get('/searchID/:id', searchID)

export default api
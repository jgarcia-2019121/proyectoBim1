'use stricts'

import express from 'express'
import { register, update, deleteC, test, search, get } from './category.controller.js'
import { validateJwt, isAdmin } from '../middlewares/validate-jwt.js'

const api = express.Router();

api.get('/test', test)
api.post('/register', [validateJwt, isAdmin], register)

api.put('/update/:id', [validateJwt, isAdmin], update)
api.delete('/delete/:id', [validateJwt, isAdmin], deleteC)
api.post('/search', search)
api.get('/get', get)

export default api
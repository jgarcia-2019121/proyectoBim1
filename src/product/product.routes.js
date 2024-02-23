'use stricts'

import express from 'express'
import { test, register, get, update, deleteP, search } from './product.controller.js'

const api = express.Router();

api.get('/test', test)
api.post('/register', register)
api.get('/get', get)
api.delete('/delete/:id', deleteP)
api.post('/search', search)
api.put('/update/:id', update)

export default api
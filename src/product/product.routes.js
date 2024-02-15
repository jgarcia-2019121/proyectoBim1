'use stricts'

import express from 'express'
import { test, register, login, update, deleteP } from './product.controller.js';

const api = express.Router();

api.get('/test', test)
api.post('/register', register)
api.post('/seeProduct', seeProduct)
api.put('/update/:id', update)
api.delete('/delete/:id', deleteP)
api.post('/search', search)

export default api
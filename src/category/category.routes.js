'use stricts'

import express from 'express'
import { register, update, deleteC, test, search, get } from './category.controller.js';

const api = express.Router();

api.get('/test', test)
api.post('/register', register)
api.put('/update/:id', update)
api.delete('/delete/:id', deleteC)
api.post('/search', search)
api.get('/get', get)

export default api
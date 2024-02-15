'use stricts'

import express from 'express'
import { register, update, deleteC, test, seeCategory } from './category.controller.js';

const api = express.Router();

api.get('/test', test)
api.post('/register', register)
api.get('/seeCategory', seeCategory)
api.put('/update/:id', update)
api.delete('/delete/:id', deleteC)
api.post('/search', search)

export default api
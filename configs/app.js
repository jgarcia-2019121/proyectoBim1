//Levantar servidor HTTP (express)
//ESModules 
'use strict'

//Importaciones
import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import { config } from "dotenv"
import userRoutes from '../src/user/user.routes.js'
import categoryRoutes from '../src/category/category.routes.js'
import productRoutes from '../src/product/product.routes.js'
import purchaseRoutes from '../src/purchase/purchase.routes.js'
import cartRoutes from '../src/cart/cart.routes.js'


//Configuraciones
const app = express()
config();
const port = process.env.PORT || 3056

//Configuración del servidor
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors())
app.use(helmet())
app.use(morgan('dev'))

app.use(userRoutes)
app.use('/category', categoryRoutes)
app.use('/product', productRoutes)
app.use('/purchase', purchaseRoutes)
app.use('/cart', cartRoutes)

//Levantar el servidor
export const initServer = () => {
    app.listen(port)
    console.log(`Server HTTP running in port ${port}`)
}
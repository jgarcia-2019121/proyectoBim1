import Cart from './cart.model.js';
import Product from '../product/product.model.js'
import jwt from 'jsonwebtoken';

export const test = (req, res) => {
    console.log('Test is running')
    res.send({ message: 'Test is running' })
}

export const registerCart = async (req, res) => {
    try {
        // Obtener el ID del producto y la cantidad del cuerpo de la solicitud
        let { productId, quantity } = req.body;

        //Obtener token
        let token = req.headers.authorization
        //Decodificar el token y obtener el id
        let decodeToken = jwt.verify(token, process.env.SECRET_KEY)
        let id = decodeToken.id
        console.log(id)

        // Verificar si el usuario ya tiene un carrito
        let carrito = await Cart.findOne({ user: id });

        // Si el usuario no tiene un carrito, crear uno nuevo
        if (!carrito) {
            carrito = new Cart({ user: id, items: [] });
        }

        //Verificar stock y actualizarlo en producto
        let product = await Product.findById(productId)
        if (!product) {
            return res.status(404).send({ message: 'Producto no encontrado' })
        }
        if (parseInt(product.stock) < parseInt(quantity)) { return res.status(400).send({ message: 'No hay suficientes productos disponibles en stock' }) }

        // Calcular el precio total del producto
        let precioTotalProduct = + parseInt(product.price) * parseInt(quantity);
        console.log(precioTotalProduct)

        //Actualizar stock del producto
        product.stock = parseInt(product.stock) - parseInt(quantity);
        await product.save()

        // Verificar si el producto ya está en el carrito
        let itemExistenteIndex = carrito.items.findIndex(item => item.product.toString() === productId.toString());

        if (itemExistenteIndex !== -1) {
            // Si el producto ya está en el carrito, actualizar la cantidad
            carrito.items[itemExistenteIndex].quantity += parseInt(quantity);
            carrito.items[itemExistenteIndex].price += precioTotalProduct;
        } else {
            // Si el producto no está en el carrito, agregarlo
            carrito.items.push({ product: productId, quantity, price: precioTotalProduct });
        }

        // Guardar los cambios en el carrito
        await carrito.save();


        return res.status(200).send({ message: 'Producto agregado al carrito correctamente' });
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error al agregar producto al carrito' });
    }
}

//Eliminar carrito y devuelve los productos
export const deleteC = async (req, res) => {
    try {
        //Obtener token
        let token = req.headers.authorization
        //Decodificar el token y obtener el id
        let decodeToken = jwt.verify(token, process.env.SECRET_KEY)
        let id = decodeToken.id
        let carrito = await Cart.findOne({ user: id });
        //Devolver productos al stock
        for (let item of carrito.items) {
            let product = await Product.findById(item.product)

            if (product) {
                product.stock = parseInt(product.stock) + parseInt(item.quantity)
                await product.save()
            }
        }
        //Eliminar carrito
        await Cart.findOneAndDelete({ user: id })

        return res.send({ message: `deleted successfully` });

    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error deleting cart' });
    }
}
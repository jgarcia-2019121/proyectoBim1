'user stict'

import Products from './product.model.js'
import { checkUpdateP } from '../utils/validator.js'

export const test = (req, res) => {
    console.log('test is running')
    return res.send({ message: 'Test is running' })
}

export const register = async (req, res) => {
    try {
        let data = req.body
        let product = new Products(data)
        await product.save()
        return res.send({ message: `Registered succesfully, can be logged with name ${product.name}` })
    } catch (err) {
        console.error(err)
        return res.status(200).send({ message: 'Error registering product', err: err })
    }
}

export const get = async (req, res) => {
    try {
        const products = await Products.find();
        return res.send(products)
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error retrieving product' })
    }
}

export const update = async (req, res) => {
    try {
        let { id } = req.params
        let data = req.body
        let update = checkUpdateP(data, id)
        if (!update) return res.status(400).send({ message: 'Have submitted some data that cannot be updated' })
        let updatedProducts = await Products.findOneAndUpdate(
            { _id: id },
            data,
            { new: true }
        )
        if (!updatedProducts) return res.status(404).send({ message: 'Product not found and not updated' })
        return res.send({ message: 'Product updated', updatedProducts })
    } catch (err) {
        console.error(err)
        if (err.keyValue && err.keyValue.name) return res.status(400).send({ message: `Product ${err.keyValue.name} is already taken` })
        return res.status(500).send({ message: 'Error updating product' })
    }
}

export const deleteP = async (req, res) => {
    try {
        let { id } = req.params;
        let deletedProduct = await Products.findOneAndDelete({ _id: id });
        if (!deletedProduct) return res.status(404).send({ message: 'Product not found and not deleted' });
        return res.send({ message: `Product with name ${deletedProduct.name} deleted successfully` });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error deleting product' });
    }
}

export const search = async (req, res) => {
    try {
        let { search } = req.body
        let products = await Products.find({ name: search })
        if (!products) return res.status(404).send({ message: 'Product not found' })
        return res.send({ message: 'Product found', products })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error searching products' })
    }
}
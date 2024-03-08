'use strict'

import Category from './category.model.js'
import { checkUpdateUser } from '../utils/validator.js'


//Test
export const test = (req, res) => {
    console.log('test is running')
    return res.send({ message: 'Test is running' })
}

//Guardar categoria
export const register = async (req, res) => {
    try {
        let data = req.body
        let category = new Category(data)
        await category.save()
        return res.send({ message: `Registered succesfully, can be logged with name ${category.name}` })
    } catch (err) {
        console.error(err)
        return res.status(200).send({ message: 'Error registering category', err: err })
    }
}

//Obteniene las categorias
export const get = async (req, res) => {
    try {
        const category = await Category.find();
        return res.send(category)
    } catch (err) {
        console.error(err);
        return res.status(404).send({ message: 'error getting category' })
    }
}

//Actualizar categoria
export const update = async (req, res) => {
    try {
        let data = req.body
        let { id } = req.params
        let update = checkUpdateUser(data, id)
        if (update === false) return res.status(400).send({ message: 'enter all data' })
        let updateCat = await Category.findOneAndUpdate(
            { _id: id },
            data,
            { new: true }
        )
        if (!updateCat) return res.status(401).send({ message: 'Category not found and not updated' })
        return res.send({ message: 'Updated category', updateCat })
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'error updating' })

    }
}

//Eliminar la categoria
export const deleteC = async (req, res) => {
    try {
        let { id } = req.params;
        let deletedCategory = await Category.findOneAndDelete({ _id: id });
        if (!deletedCategory) return res.status(404).send({ message: 'Category not found and not deleted' });
        return res.send({ message: `Category with name ${deletedCategory.name} deleted successfully` });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error deleting Category' });
    }
}

//Buscar categoria
export const search = async (req, res) => {
    try {
        let { search } = req.body
        let category = await Category.find({ name: search })
        if (!category) return res.status(404).send({ message: 'Category not found' })
        return res.send({ message: 'Category found', category })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error searching Category' })
    }
}

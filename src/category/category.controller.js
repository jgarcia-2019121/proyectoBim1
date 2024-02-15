'use strict'

import { checkUpdate } from '../utils/validator.js'
import Category from './category.model.js'
import User from '../user/user.controller.js'

//Test
export const test = (req, res) => {
    console.log('test is running')
    return res.send({ message: 'Test is running' })
}

//registro
export const register = async (req, res) => {
    try {
        let data = req.body
        let user = await User.findOne({ _id: data.keeper })
        if (!user) return res.status(404).send({ message: 'Keeper not found' })
        let category = new Category(data)
        await category.save()
        return res.send({ message: `Registered successfully, can be logged with category ${category.name}` })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error registering category', err: err })
    }
}

//obtener las categorias
export const seeCategory = async (req, res) => {
    try {
        const category = await Category.find();
        return res.send(category);
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error' });
    }
}

//Update
export const update = async (req, res) => {
    try {
        let data = req.body
        let { id } = req.params
        let update = checkUpdate(data, false)
        if (!update) return res.status(400).send({ message: 'Have submitted some data that cannot be updated or missing data' })
        let updateCategory = await Category.findOneAndUpdate(
            { _id: id },
            data,
            { new: true }
        ).populate('user', ['name'])
        if (!updateCategory) return res.status(404).send({ menssage: 'Category not found and not upadate' })
        return res.send({ menssage: 'Update new', updateCategory })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error updatting account' })
    }
}

//delete
export const deleteC = async (req, res) => {
    try {
        let { id } = req.params
        let deleteCategory = await Category.findOneAndDelete({ _id: id })
        if (deleteCategory.deleteCount === 0) return res.status(404).send({ message: 'Category not found and not delete' })
        return res.send({ message: `Delete successfully` })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error deleting account' })
    }
}

//Buscar
export const search = async (req, res) => {
    try {
        let { search } = req.body
        let categories = await Category.find(
            { name: search }
        ).populate('user', ['name'])
        if (!categories) return res.status(404).send({ message: 'Categories not found' })
        return res.send({ message: 'Category found', categories })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ menssage: 'Error searching categories' })
    }
}
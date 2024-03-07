import User from './user.model.js'
import Invoice from '../invoice/invoice.model.js'
import jwt from 'jsonwebtoken'
import { encrypt, checkPassword, checkUpdateAdmin, checkUpdateClient } from '../utils/validator.js'
import { generateJwt } from '../utils/jwt.js'

//test
export const test = (req, res) => {
    console.log('test is running')
    return res.send({ message: 'Test is running' })
}

//login
export const login = async (req, res) => {
    try {
        let { user, password } = req.body
        let users = await User.findOne({
            $or: [
                { username: user },
                { email: user }
            ]
        })
        if (users && await checkPassword(password, users.password)) {
            let loggedUser = {
                uid: users.id,
                username: users.username,
                name: users.name,
                role: users.role
            }
            let token = await generateJwt(loggedUser)
            return res.send({ message: `Welcome ${loggedUser.name}`, loggedUser, token })
        }
        return res.status(404).send({ message: 'Invalid credentials' })

    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error to login' })
    }
}

//Registra los usuarios
export const register = async (req, res) => {
    try {
        let data = req.body
        let existingUser = await User.findOne({ username: data.username });
        if (existingUser) {
            return res.status(400).send({ message: 'Username is already in use' });
        }
        data.password = await encrypt(data.password)
        data.role = 'CLIENT'
        let user = new User(data)
        await user.save()
        return res.send({ message: `Registered successfully, can be logged with username ${user.username}` })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error registering user', err: err })
    }
}

//Registra los administradores
export const registerA = async (req, res) => {
    try {
        let data = req.body
        let existingUser = await User.findOne({ username: data.username });
        if (existingUser) {
            return res.status(400).send({ message: 'Username is already in use' });
        }
        data.password = await encrypt(data.password)
        data.role = 'ADMIN'
        let user = new User(data)
        await user.save()
        return res.send({ message: `Registered successfully, can be logged with username ${user.username}` })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error registering user', err: err })
    }
}

//actualizar por el ID
export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const uid = req.user._id;
        const role = req.user.role;

        switch (role) {
            case 'ADMIN':
                const adminUpdate = checkUpdateAdmin(data, id);
                if (!adminUpdate) return res.status(400).send({ message: 'Some data submitted cannot be updated or is missing.' })
                const updatedAdminUser = await User.findOneAndUpdate(
                    { _id: id },
                    data,
                    { new: true }
                )
                if (!updatedAdminUser) return res.status(404).send({ message: 'User not found and not updated.' })
                return res.send({ message: 'User updated successfully.', updatedUser: updatedAdminUser })
            case 'CLIENT':
                if (id !== uid) return res.status(401).send({ message: 'You can only update your own account.' })
                const clientUpdate = checkUpdateClient(data, id);
                if (!clientUpdate) return res.status(400).send({ message: 'Some data submitted cannot be updated or is missing.' })
                const updatedClientUser = await User.findOneAndUpdate(
                    { _id: uid },
                    data,
                    { new: true }
                );
                if (!updatedClientUser) return res.status(404).send({ message: 'User not found and not updated.' })
                return res.send({ message: 'User updated successfully.', updatedUser: updatedClientUser })
            default:
                return res.status(401).send({ message: 'Unauthorized role.' })
        }
    } catch (err) {
        console.error(err);
        if (err.keyValue && err.keyValue.username) return res.status(400).send({ message: `Username ${err.keyValue.username} is already taken.` })
        return res.status(500).send({ message: 'Error updating account.' })
    }
}

//Elimina por el ID ya sea el cliente o el admin
export const deleteU = async (req, res) => {
    try {
        const { id } = req.params;
        const { confirm } = req.body;
        const uid = req.user._id;
        const role = req.user.role;
        // Verifica si la palabra clave es requerida y correcta
        const validateKeyword = (keyword) => {
            if (!confirm) return res.status(400).send({ message: `Validation word is required.` })
            if (confirm !== keyword) return res.status(400).send({ message: `Validation word must be "${keyword}".` })
            return true;
        };
        switch (role) {
            case 'CLIENT':
                if (!validateKeyword('CHECK')) return
                if (id !== uid) return res.status(401).send({ message: 'You can only delete your own account.' })
                const deletedUser = await User.findOneAndDelete({ _id: uid })
                if (!deletedUser) return res.status(404).send({ message: 'Account not found and not deleted.' })
                return res.send({ message: `Account with username ${deletedUser.username} deleted successfully.` })
            case 'ADMIN':
                if (!validateKeyword('CONFIRM')) return
                const adminDeletedUser = await User.findOneAndDelete({ _id: id })
                if (!adminDeletedUser) return res.status(404).send({ message: 'Account not found and not deleted.' })
                return res.send({ message: `Account with username ${adminDeletedUser.username} deleted successfully.` })
            default:
                return res.status(401).send({ message: 'Unauthorized role.' })
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error deleting account.' })
    }
};

//El admin default para registrar
export const defaultAdmin = async () => {
    try {
        const defaultUser = await User.findOne({ username: 'default' })
        if (defaultUser) {
            return;
        }//Revisamos el modelo del usuario
        let data = {
            name: 'Default',
            surname: 'default',
            username: 'default',
            email: 'adminDefault@gmail.com',
            phone: '12345678',
            password: await encrypt('admin123'),
            role: 'ADMIN'
        }
        let user = new User(data)
        await user.save()
    } catch (error) {
        console.error(error)
    }
}

//EL historial de la compra
export const reportPurchase = async (req, res) => {
    try {
        let uid = req.user._id
        //Obtenemos las compras del usuario
        let purchases = await Invoice.find({ user: uid }).populate({
            path: 'items',
            populate: {
                path: 'product',
                model: 'product',
                select: 'name'
            }
        })
        return res.send(purchases)
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error cannot recover purchases history' })
    }
}
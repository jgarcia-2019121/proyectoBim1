import { hash, compare } from 'bcrypt'

export const encrypt = (password) => {
    try {
        return hash(password, 10)
    } catch (error) {
        console.error(error)
        return error
    }
}

export const checkPassword = async (password, hash) => {
    try {
        return await compare(password, hash)
    } catch (error) {
        console.error(error);
        return error
    }
}

export const checkUpdateClient = (data, id) => {
    if (id) {
        if (
            Object.entries(data).length === 0 ||
            data.name == '' ||
            data.description == '' ||
            data.password ||
            data.password == '' ||
            data.role == '' ||
            data.role

        ) {
            return false
        }
        return true
    } else {
        if (
            Object.entries(data).length === 0 ||
            data.category ||
            data.category == ''
        ) {
            return false
        }
        return true
    }
}

export const checkUpdateAdmin = (data, id) => {
    if (id) {
        if (
            Object.entries(data).length === 0 ||
            data.name == '' ||
            data.description == '' ||
            data.password ||
            data.password == '' ||
            data.role == ''

        ) {
            return false
        }
        return true
    }
}  
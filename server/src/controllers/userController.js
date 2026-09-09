import {
    getAllUsers,
    createUser,
    updateUser
} from "../services/userService.js";

export async function getUsers(req, res, next) {
    try {
        const users = await getAllUsers();

        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        next(error);
    }
}

export async function postUser(req, res, next) {
    try {
        const user = await createUser(req.body);

        res.status(201).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
}

export async function patchUser(req, res, next) {
    try {
        const user = await updateUser(req.params.id, req.body);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
}
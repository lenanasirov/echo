import {
    updateUser
} from "../services/userService.js";


export async function patchUser(req, res, next) {
    try {
        const user = await updateUser(req.user.id, req.body);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
}
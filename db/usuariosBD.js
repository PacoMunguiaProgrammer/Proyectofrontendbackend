import User from "../models/usuarioModelo.js";
import { mensajes } from "../libs/manejoErrores.js";
import { crearToken } from "../libs/jwt.js";
import { encriptarPassword, validarPassword } from "../middlewares/funcionesPassword.js";

export async function register({ username, email, password, tipoUsuario }) {
    try {
        const usuarioExistente = await User.findOne({ username });
        const emailExistente = await User.findOne({ email });

        if (usuarioExistente || emailExistente) {
            return mensajes(400, "usuario duplicado");
        }

        const { hash, salt } = encriptarPassword(password);

        // Asigna el tipoUsuario si se proporciona, de lo contrario, usa el valor predeterminado
        const data = new User({
            username,
            email,
            password: hash,
            salt,
            tipoUsuario: tipoUsuario || "usuario" // Asigna "usuario" por defecto si no se proporciona
        });

        const respuesta = await data.save();

        const token = await crearToken({
            id: respuesta._id,
            username: respuesta.username,
            email: respuesta.email,
            tipoUsuario: respuesta.tipoUsuario
        });

        return mensajes(200, respuesta.tipoUsuario, "", token);
    } catch (error) {
        return mensajes(400, "Error al registrar al usuario", error);
    }
}

export const login = async ({ username, password }) => {
    try {
        const usuarioCorrecto = await User.findOne({ username });
        console.log("🔍 Usuario encontrado en la BD:", usuarioCorrecto);

        if (!usuarioCorrecto) {
            return mensajes(400, "datos incorrectos, usuario");
        }

        const passwordCorrecto = validarPassword(password, usuarioCorrecto.salt, usuarioCorrecto.password);
        if (!passwordCorrecto) {
            return mensajes(400, "datos incorrectos, password");
        }

        const token = await crearToken({
            id: usuarioCorrecto._id,
            username: usuarioCorrecto.username,
            email: usuarioCorrecto.email,
            tipoUsuario: usuarioCorrecto.tipoUsuario
        });

        console.log("Respuesta enviada desde el backend:", mensajes(200, usuarioCorrecto.tipoUsuario, "", token));

        return mensajes(200, usuarioCorrecto.tipoUsuario, "", token);
    } catch (error) {
        console.error("Error en login:", error);
        return mensajes(400, "datos incorrectos", error);
    }
};

export const buscaUsuarioPorID = async (id) => {
    try {
        const respuesta = await User.findById(id);
        return mensajes(200, "Usuario encontrado", respuesta);
    } catch (error) {
        return mensajes(500, "Error al buscar usuario", error.message);
    }
};

export const borrarUsuario = async (id) => {
    try {
        const usuario = await User.findByIdAndDelete(id);

        if (!usuario) {
            return mensajes(404, "Usuario no encontrado", "No se encontró un usuario con ese ID");
        }

        return mensajes(200, "Usuario borrado correctamente");
    } catch (error) {
        return mensajes(500, "Error al borrar el usuario", error.message);
    }
};

export const actualizarUsuario = async (id, nuevosDatos, usuarioAutenticado) => {
    try {
        const usuario = await User.findById(id);
        if (!usuario) {
            return mensajes(404, "Usuario no encontrado");
        }

        // Si no es admin, solo puede cambiar su email y contraseña
        if (usuarioAutenticado.tipoUsuario !== "admin") {
            nuevosDatos = {
                email: nuevosDatos.email || usuario.email,
                password: nuevosDatos.password || usuario.password
            };
        }

        // Actualiza los datos en MongoDB
        await User.findByIdAndUpdate(id, nuevosDatos);
        return mensajes(200, "Usuario actualizado correctamente");
    } catch (error) {
        return mensajes(500, "Error al actualizar usuario", error.message);
    }
};

export const actualizarUsuarioAdmin = async (id, nuevosDatos) => {
    try {
        const usuario = await User.findById(id);
        if (!usuario) {
            return mensajes(404, "Usuario no encontrado");
        }

        // Actualiza los datos en MongoDB
        const usuarioActualizado = await User.findByIdAndUpdate(id, nuevosDatos, { new: true });
        return mensajes(200, "Usuario actualizado correctamente", usuarioActualizado);
    } catch (error) {
        return mensajes(500, "Error al actualizar usuario", error.message);
    }
};

export const isAdmin = async (id) => {
    try {
        const usuario = await User.findById(id);
        console.log(usuario);
        if (usuario.tipoUsuario != "admin") {
            return false;
        } else {
            return true;
        }
    } catch (error) {
        return mensajes(400, "Admin no autorizado", error);
    }
};

export const todos = async (req, res) => {
    try {
        const usuarios = await User.find({}); // Excluye datos sensibles

        // Filtra usuarios y admins
        const listaUsuarios = usuarios.filter(user => user.tipoUsuario === "usuario");
        const listaAdmins = usuarios.filter(user => user.tipoUsuario === "admin");

        res.status(200).json({
            status: 200,
            mensajeUsuario: "Lista de usuarios y administradores",
            usuarios: listaUsuarios,
            admins: listaAdmins
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            mensajeUsuario: "Error al obtener usuarios",
            error: error.message
        });
    }
};
import { Router } from "express";
import { register, login,todos,actualizarUsuario,actualizarUsuarioAdmin } from "../db/usuariosBD.js";
import { usuarioAutorizado, adminAutorizado} from "../middlewares/funcionesPassword.js";
import { verificarToken } from "../libs/jwt.js";
const router = Router();

router.post("/registro", async (req, res) => {
    try {
        console.log("Datos recibidos en el backend:", req.body); // Verifica que el campo sea "tipoUsuario"
        const respuesta = await register(req.body);
        console.log(respuesta);
        res.cookie('token', respuesta.token).status(respuesta.status).json(respuesta.mensajeUsuario);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al registrar usuario", error: error.message });
    }
});

router.post("/ingresar", async (req, res) => {
    try {
        const respuesta = await login(req.body);
        console.log("Respuesta enviada al frontend:", respuesta);
        res.cookie("token", respuesta.token).status(respuesta.status).json(respuesta);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al ingresar", error: error.message });
    }
});


router.get("/salir", async (req, res) => {
    try {
        res.cookie('token', '', { expires: new Date(0) }).clearCookie('token').status(200).json("Cerraste sesión correctamente");
    } catch (error) {
        res.status(500).json({ mensaje: "Error al cerrar sesión", error: error.message });
    }
});

router.get("/usuarios", async (req, res) => {
    try {
        const respuesta = usuarioAutorizado(req.cookies.token, req);
        res.status(respuesta.status).json(respuesta.mensajeUsuario);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener usuarios", error: error.message });
    }
});

router.get("/administradores", async (req, res) => {
    try {
        const respuesta = await adminAutorizado(req);
        res.status(respuesta.status).json(respuesta.mensajeUsuario);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener administradores", error: error.message });
    }
});

router.get("/obtenerTodosUsuarios", todos);

// 🔹 Actualizar perfil de usuario (autenticado)
// 🔹 Buscar usuario por ID
// 🔹 Actualizar perfil de usuario (autenticado)
router.put("/usuarios/:id", verificarToken, async (req, res) => {
    if (req.usuario.tipoUsuario !== "admin") {
        return res.status(403).json({ mensaje: "No tienes permisos para actualizar este usuario" });
    }

    try {
        const usuarioActualizado = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(usuarioActualizado);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al actualizar usuario" });
    }
});


router.put("/admin/actualizarUsuario/:id", async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; // Extrae el token
        const usuario = await verificarToken(token); // Verifica el token

        if (usuario.tipoUsuario !== "admin") {
            return res.status(403).json(mensajes(403, "No tienes permisos para esta acción"));
        }

        req.usuario = usuario; // Guarda el usuario en la request
        next(); // Continúa con la ejecución del controlador
    } catch (error) {
        res.status(error.codigo || 500).json(error);
    }
}, actualizarUsuario);
  
  // 🔹 Buscar usuario por ID
router.get("/buscarPorId/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const respuesta = await buscaUsuarioPorID(id);
        res.status(respuesta.status).json(respuesta);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al buscar usuario", error: error.message });
    }
});
  
 // ✅ Eliminar usuario (admin)
export const eliminarUsuarioAdmin = async (id, token) => {
    try {
        const respuesta = await axios.delete(`${API}/admin/borrarUsuario/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return respuesta.data;
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        return null;
    }
};


export default router;
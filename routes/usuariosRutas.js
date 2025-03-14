import { Router } from "express";
import { register, login,todos,actualizarUsuario,actualizarAdmin,borrarUsuario} from "../db/usuariosBD.js";
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

router.get("/usuario", async (req, res) => {
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

  router.put("/admins/:id", async (req, res) => {
    try {
        const respuesta = await actualizarAdmin(req.params.id, req.body);
        console.log(respuesta);
        res.status(respuesta.status).json(respuesta.mensajeAdmin);
    } catch (error) {
        console.error("Error al actualizar admin:", error);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
});
// 🔹 Buscar usuario por ID
// 🔹 Actualizar perfil de usuario (autenticado)
router.put("/usuarios/:id", async (req, res) => {
    const respuesta = await actualizarUsuario(req.params.id, req.body);
    console.log(respuesta);
    res.status(respuesta.status).json(respuesta.mensajeUsuario);
  });

  
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
router.delete("/usuarios/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await borrarUsuario(id);
        res.status(resultado.status).json(resultado);
    } catch (error) {
        res.status(500).json({ status: 500, mensaje: "Error interno del servidor", error: error.message });
    }
});
  
router.put("/actualizarPassword", async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ mensaje: "Faltan datos" });
        }

        const actualizado = await actualizarPassword(email, newPassword);

        if (!actualizado) {
            return res.status(400).json({ mensaje: "Error al actualizar la contraseña" });
        }

        return res.json({ mensaje: "Contraseña actualizada correctamente" });

    } catch (error) {
        console.error("Error en /actualizarPassword:", error);
        return res.status(500).json({ mensaje: "Error interno del servidor" });
    }
});

export default router;
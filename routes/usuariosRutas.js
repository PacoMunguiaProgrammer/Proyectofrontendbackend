import { Router } from "express";
import { register, login,todos,actualizarUsuario } from "../db/usuariosBD.js";
import { usuarioAutorizado, adminAutorizado,verificarToken } from "../middlewares/funcionesPassword.js";
const router = Router();

router.post("/registro", async (req, res) => {
    console.log("Datos recibidos en el backend:", req.body); // Verifica que el campo sea "tipoUsuario"
    const respuesta = await register(req.body);
    console.log(respuesta);
    res.cookie('token', respuesta.token).status(respuesta.status).json(respuesta.mensajeUsuario);
});

router.post("/ingresar", async (req, res) => {
    const respuesta = await login(req.body);
    
    console.log("Respuesta enviada al frontend:", respuesta);

    res.cookie("token", respuesta.token).status(respuesta.status).json(respuesta);
});


router.get("/salir", async(req,res)=>{
    res.cookie('token','',{expires:new Date(0)}).clearCookie('token').status(200).json("Cerraste sesión correctamente");
});

router.get("/usuarios", async(req,res)=>{
    const respuesta = usuarioAutorizado(req.cookies.token, req);
    res.status(respuesta.status).json(respuesta.mensajeUsuario);
});

router.get("/administradores", async(req,res)=>{
    const respuesta = await adminAutorizado(req);
    res.status(respuesta.status).json(respuesta.mensajeUsuario);
});

router.get("/obtenerTodosUsuarios", todos);

// 🔹 Actualizar perfil de usuario (autenticado)
// 🔹 Buscar usuario por ID
// 🔹 Actualizar perfil de usuario (autenticado)
router.put("/usuarios/:id", async (req, res) => {
    const respuesta = usuarioAutorizado(req.cookies.token, req);
    if (respuesta.status !== 200) {
        return res.status(respuesta.status).json({ mensaje: respuesta.mensajeUsuario });
    }

    try {
        const { id } = req.params;
        const nuevosDatos = req.body;
        const resultado = await actualizarUsuario(id, nuevosDatos);
        res.status(resultado.status).json({ mensaje: resultado.mensajeUsuario });
    } catch (error) {
        res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
});

// 🔹 Actualizar usuario (solo admins pueden editar cualquier usuario)
router.put("/admin/actualizarUsuario/:id", async (req, res) => {
    const respuesta = usuarioAutorizado(req.cookies.token, req, "admin");
    if (respuesta.status !== 200) {
        return res.status(respuesta.status).json({ mensaje: respuesta.mensajeUsuario });
    }

    try {
        const { id } = req.params;
        const nuevosDatos = req.body;
        const resultado = await actualizarUsuarioAdmin(id, nuevosDatos);
        res.status(resultado.status).json({ mensaje: resultado.mensajeUsuario });
    } catch (error) {
        res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
    }
});
  
  // 🔹 Buscar usuario por ID
  router.get("/buscarPorId/:id", async (req, res) => {
    const { id } = req.params;
    const respuesta = await buscaUsuarioPorID(id);
    res.status(respuesta.status).json(respuesta);
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
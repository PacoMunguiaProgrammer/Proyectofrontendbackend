import { log } from "console";
import crypto from "crypto";
import { crearToken } from "../libs/jwt.js";  

import "dotenv/config";
import jwt from "jsonwebtoken";
import { buscaUsuarioPorID } from "../db/usuariosBD.js";
import { mensajes } from "../libs/manejoErrores.js";


export function encriptarPassword(password){
    const salt = crypto.randomBytes(32).toString("hex");
    const hash = crypto.scryptSync(password, salt, 10, 64, "sha512").toString("hex");
    return{
        salt,
        hash
    }
}

export function validarPassword(password, salt, hash){
    const hashEvaluar = crypto.scryptSync(password, salt, 10, 64, "sha512").toString("hex");    
    return hashEvaluar === hash;
}

export function usuarioAutorizado(token, req) {
    if(!token){
        return mensajes(400, "Usuario no autorizado - token");
    }
    jwt.verify(token,process.env.SECRET_TOKEN,(error, usuario)=>{
        if(error){
            return mensajes(400, "Usuario no autorizado - token no válido")
        }
        req.usuario=usuario;
    });
    return mensajes(200,"Usuario autorizado");
}

export async function adminAutorizado(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ mensaje: "Usuario no autorizado - token requerido" });
    }

    try {
        const usuario = await verificarToken(token);
        req.usuario = usuario;
        const usuarioDB = await buscaUsuarioPorID(usuario.id);
        if (!usuarioDB || usuarioDB.tipoUsuario !== "admin") {
            return res.status(403).json({ mensaje: "Admin no autorizado" });
        }
        next(); 
    } catch (error) {
        return res.status(403).json({ mensaje: "Token no válido", error: error.message });
    }
}

export function verificarToken(req, res, next) {
    const token = req.cookies.token;  
    if (!token) {
        return res.status(401).json({ mensaje: "Usuario no autorizado - token requerido" });
    }

    jwt.verify(token, process.env.SECRET_TOKEN, (error, usuario) => {
        if (error) {
            return res.status(403).json({ mensaje: "Token no válido" });
        }
        req.usuario = usuario;
        next();
    });
}
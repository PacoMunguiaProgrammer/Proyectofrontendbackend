import jwt from "jsonwebtoken";
import 'dotenv/config';
import { mensajes } from "./manejoErrores.js";
export function crearToken(dato){
    return new Promise((resolve, reject)=>{
        jwt.sign(
            dato,
            process.env.SECRET_TOKEN,
            {
                expiresIn:"1d"
            },
            (err,token)=>{
                if(err){
                    reject(mensajes(400,"Error al generar el token"));
                }
                resolve(token);
            }
        );
    });
}

export function verificarToken(token) {
    return new Promise((resolve, reject) => {
        if (!token) {
            reject(mensajes(401, "Acceso denegado. No hay token"));
        }

        jwt.verify(token, process.env.SECRET_TOKEN, (err, usuario) => {
            if (err) {
                reject(mensajes(403, "Token inválido o expirado"));
            }
            resolve(usuario); // Retorna los datos del usuario
        });
    });
}

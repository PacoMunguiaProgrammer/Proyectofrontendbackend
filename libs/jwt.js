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
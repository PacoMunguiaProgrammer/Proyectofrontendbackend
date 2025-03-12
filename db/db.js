import mongoose from "mongoose";
import { mensajes } from "../libs/manejoErrores.js";

export async function conectarBD() {
    try {
        const respuesta=await mongoose.connect("mongodb://localhost/appMongo");
        return mensajes(200, "Conexion a la BD Ok");
    } catch (error) {
        //console.log(error);
        return mensajes(400,"Error al conectarse a la BD",error);
    }
}

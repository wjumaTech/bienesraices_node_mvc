import express from "express";
import {
  formularioLogin,
  formularioOlvidePassword,
  formularioRegistro,
  registrar,
  confirmar,
  resetPassword,
  comprobarToken,
  nuevoPassword
} from "../controllers/usuarioController.js";

const router = express.Router();

router.get("/auth/login", formularioLogin);

router.get("/auth/registro", formularioRegistro);

router.post("/auth/registro", registrar);

router.get("/auth/confirmar/:token", confirmar);

router.get("/auth/olvide-password", formularioOlvidePassword);

router.post("/auth/olvide-password", resetPassword);

// Almacena el nuevo password 
router.get('/auth/olvide-password/:token', comprobarToken)
router.post('/auth/olvide-password/:token', nuevoPassword)

export default router;

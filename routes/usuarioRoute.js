import express from "express";
import {
  formularioLogin,
  formularioOlvidePassword,
  formularioRegistro,
  registrar,
  confirmar,
  resetPassword
} from "../controllers/usuarioController.js";

const router = express.Router();

router.get("/auth/login", formularioLogin);

router.get("/auth/registro", formularioRegistro);

router.post("/auth/registro", registrar);

router.get("/auth/confirmar/:token", confirmar);

router.get("/auth/olvide-password", formularioOlvidePassword);

router.post("/auth/olvide-password", resetPassword);

export default router;

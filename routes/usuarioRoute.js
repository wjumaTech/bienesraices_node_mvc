import express from 'express'
import { formularioLogin, formularioOlvidePassword, formularioRegistro, registrar } from '../controllers/usuarioController.js'

const router = express.Router()

router.get('/auth/login', formularioLogin)

router.get('/auth/registro', formularioRegistro)

router.post('/auth/registro', registrar)

router.get('/auth/olvide-password', formularioOlvidePassword)

export default router
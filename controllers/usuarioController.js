import { check, validationResult } from 'express-validator'
import Usuario from '../models/Usuario.js'

import { generarId } from '../helpers/tokens.js'

const formularioLogin = (req, res) => {
	res.render('auth/login', {
			
		pagina: 'Iniciar sesión'
	})
}

const formularioRegistro = (req, res) => {
	res.render('auth/registro', {
			
		pagina: 'Crea una cuenta'
	})
}

const registrar = async (req, res) => {

	// Validaciones
	await check('nombre').notEmpty().withMessage('El nombre no puede ir vacio').run(req)
	await check('email').isEmail().withMessage('Eso al parecer no es un correo electrónico').run(req)
	await check('password').isLength({ min: 6 }).withMessage('El password debe ser al menos 6 caracteres').run(req)
	await check('repetir_password').equals(req.body.password).withMessage('Las contraseñas no son iguales').run(req)

	const resultado = validationResult(req)

	// Verificar que el resultado este vacio
	if( !resultado.isEmpty() ) {
		// Hay errores
		return res.render('auth/registro', {
			pagina: 'Crea una cuenta',
			errores: resultado.array(),
			usuario: {
				nombre: req.body.nombre,
				email: req.body.email
			}
		})
	}

	// Extraer informacion del body
	const { nombre, email, password } = req.body

	// Verificar que el usuario no este registrado
	const existeEmail = await Usuario.findOne({ where: { email } })

	if(existeEmail) {
		return res.render('auth/registro', {
			pagina: 'Crea una cuenta',
			errores: [{ msg: 'El usuario ya esta registrado' }],
			usuario: {
				nombre: req.body.nombre,
				email: req.body.email
			}
		})
	}
	
	// Almacenar un usuario
	await Usuario.create({
		nombre,
		email,
		password,
		token: generarId()
	})

}

const formularioOlvidePassword = (req, res) => {
	res.render('auth/olvide-password', {
			
		pagina: 'Olvidaste tu contraseña'
	})
}


export {
	formularioLogin,
	formularioRegistro,
	registrar,
	formularioOlvidePassword
}
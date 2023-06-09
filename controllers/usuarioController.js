import { request, response } from 'express'
import { check, validationResult } from "express-validator";
import bcript from 'bcrypt';
import Usuario from "../models/Usuario.js";

import { generarId } from "../helpers/tokens.js";
import { emailRegistro, emailOlvidePassword } from "../helpers/emails.js";

const formularioLogin = (req, res) => {
  res.render("auth/login", {
    pagina: "Iniciar sesión",
  });
};

const formularioRegistro = (req, res) => {

  res.render("auth/registro", {
    pagina: "Crea una cuenta",
    csrfToken: req.csrfToken()
  });
};

const registrar = async (req, res) => {
  // Validaciones
  await check("nombre")
    .notEmpty()
    .withMessage("El nombre no puede ir vacio")
    .run(req);
  await check("email")
    .isEmail()
    .withMessage("Eso al parecer no es un correo electrónico")
    .run(req);
  await check("password")
    .isLength({ min: 6 })
    .withMessage("El password debe ser al menos 6 caracteres")
    .run(req);
  await check("repetir_password")
    .equals(req.body.password)
    .withMessage("Las contraseñas no son iguales")
    .run(req);

  const resultado = validationResult(req);

  // Verificar que el resultado este vacio
  if (!resultado.isEmpty()) {
    // Hay errores
    return res.render("auth/registro", {
      pagina: "Crea una cuenta",
      errores: resultado.array(),
      csrfToken: req.csrfToken(),
      usuario: {
        nombre: req.body.nombre,
        email: req.body.email,
      },
    });
  }

  // Extraer informacion del body
  const { nombre, email, password } = req.body;

  // Verificar que el usuario no este registrado
  const existeEmail = await Usuario.findOne({ where: { email } });

  if (existeEmail) {
    return res.render("auth/registro", {
      pagina: "Crea una cuenta",
      errores: [{ msg: "El usuario ya esta registrado" }],
      csrfToken: req.csrfToken(),
      usuario: {
        nombre: req.body.nombre,
        email: req.body.email,
      },
    });
  }

  // Almacenar un usuario
  const usuario = await Usuario.create({
    nombre,
    email,
    password,
    token: generarId(),
  });

  // Enviar email de confirmacion
  emailRegistro({
    nombre: usuario.nombre,
    email: usuario.email,
    token: usuario.token,
  });

  // Mostrar mensaje de confirmacion
  res.render("templates/mensaje", {
    pagina: "Cuenta Creada Correctamente",
    mensaje: "Hemos Enviado un Email de Confirmacion, presiona en el enlace",
  });
};

// Funcion que comprueba una cuenta
const confirmar = async (req, res) => {
  const { token } = req.params;

  // Validar si el TOKEN es valido
  const usuario = await Usuario.findOne({ where: { token } });

  // Verificar si el TOKEN es valido
  if(!usuario) {
    return res.render('auth/confirmar-cuenta', {
      pagina: "Error al confirmar tu cuenta",
      mensaje: "Hubo un error al confirmar tu cuenta, intentalo de nuevo",
      error: true
    })
  }

  // Confirmar la cuenta
  usuario.token = null;
  usuario.confirmado = true;
  usuario.save();

  res.render('auth/confirmar-cuenta', {
    pagina: "Cuenta Confirmada",
    mensaje: "La cuenta ha sido confirmada correctamente"
  })

};

const formularioOlvidePassword = (req, res) => {
  res.render("auth/olvide-password", {
    pagina: "Olvidaste tu contraseña",
    csrfToken: req.csrfToken(),
  });
};

const resetPassword = async (req, res) => {

  await check("email")
    .isEmail()
    .withMessage("Eso al parecer no es un correo electrónico")
    .run(req);

  const resultado = validationResult(req);

  // Verificar que el resultado este vacio
  if (!resultado.isEmpty()) {
    // Hay errores
    return res.render("auth/olvide-password", {
      pagina: "Recupera tu acceso a BienesRaices",
      errores: resultado.array(),
      csrfToken: req.csrfToken(),
    });
  }

  // Buscar al usuario
  const { email } = req.body;
  const usuario = await Usuario.findOne({ where: { email } })
  
  // Si el email no existe mostrar una alerta
  if(!usuario) {
    return res.render("auth/olvide-password", {
      pagina: "Recupera tu acceso a BienesRaices",
      errores: [{ msg: 'El Email no Pertenece a ningun usuario' }],
      csrfToken: req.csrfToken()
    });
  }

  // Generar un token y enviar correo
  usuario.token = generarId();
  await usuario.save();

  // Enviar un email
  emailOlvidePassword({
    email: usuario.email,
    nombre: usuario.nombre,
    token: usuario.token
  })

  // Renderizar un mensaje
  res.render("templates/mensaje", {
    pagina: "Reestablece tu password",
    mensaje: "Hemos Enviado un Email con las instrucciones",
  });

}

const comprobarToken = async (req=request, res=response) => {

  const { token } = req.params;

  const usuario = await Usuario.findOne({ where: { token } })

  // Si el usuario no existe, mostrar un mensaje
  if(!usuario) {
    return res.render('auth/confirmar-cuenta', {
      pagina: "Reestablecer tu password",
      mensaje: "Hubo un error al validar tu informacion, intentalo de nuevo",
      error: true
    })
  }

  // Mostrar el formularion de recetear la password
  res.render('auth/reset-password', {
    pagina: 'Reestablece tu password',
    csrfToken: req.csrfToken(),
  })
  
}

const nuevoPassword = async (req=request, res=response) => {
  
  // 1ro. Validar el password
  await check('password').isLength({ min: 6 }).withMessage('El password debe ser al menos 6 caracteres').run(req);

  const resultado = validationResult(req)

  if(!resultado.isEmpty()) {
    return res.render('auth/reset-password', {
      pagina: 'Reestablece tu password',
      csrfToken: req.csrfToken(),
      errores: resultado.array()
    })
  }


  const { token } = req.params;
  const { password } = req.body; 
  // 2do. Identificar quien hacer el cambio
  const usuario = await Usuario.findOne({ where: { token } })


  // 3ro. Hashear el nuevo password
  const salt = await bcript.genSalt(10);
  usuario.password = await bcript.hash(password, salt);
  usuario.token = null;

  await usuario.save();

  res.render('auth/confirmar-cuenta', {
    pagina: 'Password Reestablecido',
    mensaje: 'El password se guardo correctamente'
  })

}

export {
  formularioLogin,
  formularioRegistro,
  registrar,
  confirmar,
  formularioOlvidePassword,
  resetPassword,
  comprobarToken,
  nuevoPassword
};

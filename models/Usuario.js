import { DataTypes } from 'sequelize'
import bcript from 'bcrypt'
import db from '../config/db.js'


const Usuario = db.define('usuarios', {

  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  token: DataTypes.STRING,
  confirmado: DataTypes.BOOLEAN

}, {
  hooks: {
    beforeCreate: async function(usuario) {
      const salt = await bcript.genSalt(10)
      usuario.password = await bcript.hash(usuario.password, salt)
    }
  }
}) 

export default Usuario
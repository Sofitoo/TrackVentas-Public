import { getConnection } from '../db/connection.js'; 





// Traer todos los usuarios
export const getUsuarios = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM USUARIO');
    res.json(result.recordset);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener usuarios');
  }
};

// Crear un nuevo usuario
export const createUsuario = async (req, res) => {
  try {
    const { Documento, NombreCompleto, Correo, Clave, IdRol, Estado } = req.body;

    //Validaciones de campos obligatorios:
      if (!Documento || !NombreCompleto || !Correo || !Clave) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    // Valida que IdRol sea un número válido mayor a 0
    if (!IdRol || IdRol <= 0 || isNaN(IdRol)) {
      return res.status(400).json({ message: "Rol inválido o no seleccionado" });
    }

    const pool = await getConnection();

    // Verifica que el rol exista en la tabla ROL
    const rolExistente = await pool
      .request()
      .input("IdRol", IdRol)
      .query("SELECT IdRol FROM ROL WHERE IdRol = @IdRol");

    if (rolExistente.recordset.length === 0) {
      return res.status(400).json({ message: "El rol especificado no existe en la base de datos" });
    }

    const result = await pool
      .request()
      .input('Documento', Documento)
      .input('NombreCompleto', NombreCompleto)
      .input('Correo', Correo)
      .input('Clave', Clave)
      .input('IdRol',IdRol)
      .input('Estado', Estado)
      .query(`
        INSERT INTO USUARIO 
        (Documento, NombreCompleto, Correo, Clave, IdRol, Estado, FechaRegistro)
        OUTPUT INSERTED.*
        VALUES 
        (@Documento, @NombreCompleto, @Correo, @Clave, @IdRol, @Estado, GETDATE())
      `);

         const nuevoUsuario = result.recordset[0]; // ← AHORA sí existe.

    return res.status(201).json({
      message: "Usuario creado correctamente.",
      user: nuevoUsuario
    });

  } catch (error) {
    console.error("Error al crear usuario:", error);
    return res.status(500).json({
      message: "Error al crear usuario",
      error: error.message
    });
  }
};
// Editar un usuario existente
export const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { Documento, NombreCompleto, Correo, Clave, IdRol, Estado } = req.body;

    const pool = await getConnection();

    // 🔒 Si no se manda una nueva clave, no la cambiamos
    if (!Clave || Clave.trim() === "") {
      await pool
        .request()
        .input("IdUsuario", id)
        .input("Documento", Documento)
        .input("NombreCompleto", NombreCompleto)
        .input("Correo", Correo)
        .input("IdRol", IdRol)
        .input("Estado", Estado)
        .query(`
          UPDATE USUARIO
          SET Documento = @Documento,
              NombreCompleto = @NombreCompleto,
              Correo = @Correo,
              IdRol = @IdRol,
              Estado = @Estado
          WHERE IdUsuario = @IdUsuario
        `);
    } else {
      await pool
        .request()
        .input("IdUsuario", id)
        .input("Documento", Documento)
        .input("NombreCompleto", NombreCompleto)
        .input("Correo", Correo)
        .input("Clave", Clave)
        .input("IdRol", IdRol)
        .input("Estado", Estado)
        .query(`
          UPDATE USUARIO
          SET Documento = @Documento,
              NombreCompleto = @NombreCompleto,
              Correo = @Correo,
              Clave = @Clave,
              IdRol = @IdRol,
              Estado = @Estado
          WHERE IdUsuario = @IdUsuario
        `);
    }

    res.json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al actualizar usuario");
  }
};

// Eliminar un usuario
export const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();

    await pool.request().input("IdUsuario", id).query(`
      DELETE FROM USUARIO WHERE IdUsuario = @IdUsuario
    `);

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al eliminar usuario");
  }
};

/*import { getConnection } from '../db/connection.js';
import { hashPassword } from '../utils/auth.utils.js';

// Listar usuarios activos
export const getUsers = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query('SELECT IdUsuario, Documento, NombreCompleto, Correo, IdRol, Estado, FechaRegistro FROM USUARIO WHERE Estado = 1 ORDER BY NombreCompleto');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear nuevo usuario
/*export const createUser  = async (req, res) => {
  const { Documento, NombreCompleto, Correo, Clave, IdRol } = req.body;
  if (!Documento || !NombreCompleto || !Correo || !Clave || !IdRol) {
    return res.status(400).json({ message: 'Documento, NombreCompleto, Correo, Clave e IdRol son obligatorios' });
  }
  try {
    const pool = await getConnection();
    // Verificar si el Documento o Correo ya existe
    const existing = await pool.request()
      .input('Documento', Documento)
      .input('Correo', Correo)
      .query('SELECT * FROM USUARIO WHERE Documento = @Documento OR Correo = @Correo');
    if (existing.recordset.length > 0) {
      return res.status(400).json({ message: 'Documento o Correo ya registrado' });
    }
    const hashedPassword = await hashPassword(Clave);
    await pool.request()
      .input('Documento', Documento)
      .input('NombreCompleto', NombreCompleto)
      .input('Correo', Correo)
      .input('Clave', hashedPassword)
      .input('IdRol', IdRol)
      .input('Estado', 1) // Activo por defecto
      .query(`INSERT INTO USUARIO (Documento, NombreCompleto, Correo, Clave, IdRol, Estado, FechaRegistro)
              VALUES (@Documento, @NombreCompleto, @Correo, @Clave, @IdRol, @Estado, GETDATE())`);
    res.status(201).json({ message: 'Usuario creado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};*/

//actualizar usuario

/*export const updateUser  = async (req, res) => {
  const { id}
}*/

//falta el resto (actualizar usuario y eliminar)



/*export const createUser  = async (req, res) => { //acomodar a la base de datos
  const { username, fullname, password, role } = req.body;
  try {
    const pool = await getConnection();
    const hashedPassword = await hashPassword(password);
    await pool.request()
      .input('Documento', username)
      .input('Nombre Completo', fullname)
      .input('Correo', )
      .input('Clave', hashedPassword)
      .input('role', role)
      .query('INSERT INTO Users (username, fullname, password, role, created_at, updated_at) VALUES (@username, @password, @role, GETDATE(), GETDATE())');
    res.status(201).json({ message: 'Usuario creado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};*/
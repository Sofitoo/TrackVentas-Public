import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

const dbSettings = { //parametros para la conexion con la base de datos puerto por defecto 1433(se corrigen con las de .env)
  user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      server: process.env.DB_SERVER,
      database: process.env.DB_DATABASE,
      options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true', 
  }

}

/*async function getConnection() { <---- TEST
  const pool = await sql.connect(dbSettings); //conexion a traves de los parametros
  const result = await pool.request().query("SELECT 1");//se hace una peticion(consulta sql: SELECT 1) a la base de datos
  console.log(result); //nos muestra el rsultado por consola
}*/

export async function getConnection() {
  try{
    const pool = await sql.connect(dbSettings);
    return pool;
  } catch (error) {
    console.error(error);
    throw error;  // Lanza el error para que el controlador lo maneje
  }
}

//getConnection(); <-- TEST llamamos la funcion para que se ejecute

export { sql };
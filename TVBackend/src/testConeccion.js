   import sql from 'mssql';

   const config = {
     user: 'DESKTOP-MTJ19CU\\Sofia', // Escapa la barra invertida
     password: '',
     server: '192.168.0.146',
     database: 'DBSISTEMA_VENTA',
     options: {
       encrypt: true,
       trustServerCertificate: true,
     },
   };

   async function getConnection() {
     try {
       const pool = await sql.connect(config);
       console.log('Conexión exitosa a la base de datos');
       return pool;
     } catch (error) {
       console.error('Error en la conexión a la BD:', error);
       throw error;
     }
   }

   // Función para probar la conexión
async function testConnection() {
    try {
        // Conexión a la base de datos
        const pool = await sql.connect(config);
        
        // Consulta de prueba (no requiere tablas existentes)
        const result = await pool.request().query('SELECT 1 AS test');
        
        console.log('✅ Conexión exitosa!');
        console.log('Resultado de prueba:', result.recordset);
        
        // Cierra la conexión
        await pool.close();
        
        return true;
    } catch (err) {
        console.error('❌ Error de conexión:', err);
        return false;
    }
}
// Ejecutar prueba de conexión
testConnection();
   

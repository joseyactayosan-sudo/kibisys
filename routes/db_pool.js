const { Pool } = require('pg');
require('dotenv').config();
// variables de entorno
const dbhost =process.env.PGHOST;
const dbbase =process.env.PGDATABASE;
const dbport =process.env.PGPORT; 

async function getConnection(dbuser, dbpassword) {
    // 1. Configurar el Pool
    // Configuración de la conexión a PostgreSQL
    let array_conect={user:dbuser, host:dbhost, database:dbbase, 
                      password:dbpassword,   port: dbport}
    if (dbhost !=='localhost'){ array_conect['ssl']={ rejectUnauthorized: false } } 
    const dbp = await new Pool(array_conect); 

    try {
        // 2. Realizar la Prueba de Conexión (Validación)
        // Usamos pool.query('SELECT 1') para tomar prestado un cliente, ejecutar la consulta, 
        // y devolverlo al pool, probando así la conexión, la autenticación y la disponibilidad.
        await dbp.query('SELECT 1');        
        console.log("✅ Conexión Pool validada y lista.");
        db= dbp;
        return dbp;
    } catch (error) {
        // 3. Manejar el Error de Conexión
        console.error("❌ Error al validar la conexión Pool:");
        //console.error(error.severity);
        db=null;
        // Cierra el pool que falló antes de lanzar el error.
        await dbp.end();
        
        // Relanza el error para que el proceso que llamó a esta función sepa que falló.
        throw new Error("Fallo la conexión a la base de datos. Detalles: " + error.message);
        return null;
    }
}

// Exportar la funcion para usarla en otros archivos
module.exports =  getConnection;
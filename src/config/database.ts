import mysql from 'mysql2/promise';
import dotenv from 'dotenv'

dotenv.config();
export const connect = async ()=>{
try{
    const conexion=await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'asistencias'
    });    return conexion;
}catch(error){
    console.error('Error al conectar a la base de datos:', error);
    process.exit(1);

}
};
export const checkUserInDatabase = async (email: string): Promise<boolean> => {
  const connection = await connect();
  try {
    const [rows]: any = await connection.execute(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    return rows.length > 0;
  } catch (error) {
    console.error('Error verificando usuario:', error);
    return false;
  } finally {
    await connection.end();
  }
};
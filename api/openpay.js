import mysql from 'mysql2/promise';

let pool;
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      waitForConnections: true,
      connectionLimit: 5,
    });
  }
  return pool;
}

const ESTADOS = {
  'charge.created': 'pending',
  'charge.succeeded': 'completed',
  'charge.failed': 'failed',
  'charge.cancelled': 'cancelled',
  'charge.refunded': 'refunded',
  'cashout.created': 'pending',
  'cashout.charged': 'completed',
  'cashout.completed': 'completed',
  'cashout.expired': 'expired',
  'cashout.canceled': 'cancelled',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ success: true, method: req.method });
  }

  const data = req.body;

  if (!data) {
    console.log('ERROR JSON VACIO');
    return res.status(400).json({ success: false });
  }

  const tipo = data.type ?? null;

  if (tipo === 'verification') {
    console.log('VERIFICACION RECIBIDA');
    return res.status(200).json({ success: true });
  }

  const openpayId = data?.transaction?.id ?? data?.id ?? null;

  if (!openpayId) {
    console.log('SIN OPENPAY ID');
    return res.status(200).json({ success: true });
  }

  const estado = ESTADOS[tipo];

  if (!estado) {
    console.log('EVENTO NO UTILIZADO:', tipo);
    return res.status(200).json({ success: true });
  }

  let conn;
  try {
    conn = await getPool().getConnection();

    const [rows] = await conn.execute(
      'SELECT id, status, openpay_id FROM pagos WHERE openpay_id = ?',
      [openpayId]
    );
    console.log('BUSQUEDA:', rows);

    const [result] = await conn.execute(
      'UPDATE pagos SET status = ? WHERE openpay_id = ?',
      [estado, openpayId]
    );

    console.log(
      'EVENTO:', tipo,
      'OPENPAY ID:', openpayId,
      'ESTADO:', estado,
      'FILAS UPDATE:', result.affectedRows
    );

    return res.status(200).json({
      success: true,
      tipo,
      estado,
      openpay_id: openpayId,
      filas: result.affectedRows,
    });
  } catch (err) {
    console.error('ERROR DB:', err.message);
    return res.status(500).json({ success: false });
  } finally {
    if (conn) conn.release();
  }
}

import mysql from 'mysql2/promise';

try {
  const connection = await mysql.createConnection({
    host: 'tidbcloud-prod-gateway.us-east-1.prod.aws.tidbcloud.com',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'el_mar_dins_meu',
  });

  await connection.execute(
    `UPDATE pickupPoints 
     SET address = 'c/Santa Maria 17', 
         city = 'Guardiola de Font-rubí',
         postalCode = '08736',
         phone = '672 87 89 17',
         openingHours = NULL,
         updatedAt = NOW()
     WHERE id = 7`
  );

  console.log('✅ La Gatera updated successfully');
  await connection.end();
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

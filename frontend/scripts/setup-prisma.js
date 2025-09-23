const fs = require('fs');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
const prodSchemaPath = path.join(__dirname, '../prisma/schema.production.prisma');

if (isProduction && fs.existsSync(prodSchemaPath)) {
  // Copy production schema over the default schema
  const prodSchema = fs.readFileSync(prodSchemaPath, 'utf8');
  fs.writeFileSync(schemaPath, prodSchema);
  console.log('✅ Using PostgreSQL schema for production');
} else {
  console.log('✅ Using SQLite schema for development');
}

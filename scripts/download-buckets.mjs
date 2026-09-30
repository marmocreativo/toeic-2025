// scripts/download-buckets.mjs
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en tu .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function login() {
  const email = process.env.SCRIPT_ADMIN_EMAIL;
  const password = process.env.SCRIPT_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('❌ Faltan SCRIPT_ADMIN_EMAIL o SCRIPT_ADMIN_PASSWORD en tu .env');
    process.exit(1);
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error('❌ Error iniciando sesión:', error.message);
    process.exit(1);
  }

  console.log('🔐 Sesión iniciada correctamente\n');
}

const BUCKETS = ['centros', 'general', 'examenes', 'sliders'];
const OUTPUT_DIR = path.resolve('./descargas');

const summary = {};

async function listAllFiles(bucket, prefix = '') {
  const { data, error } = await supabase.storage.from(bucket).list(prefix, {
    limit: 1000,
    sortBy: { column: 'name', order: 'asc' },
  });

  if (error) {
    console.error(`❌ Error listando ${bucket}/${prefix}:`, error.message);
    return [];
  }

  let files = [];

  for (const item of data) {
    const itemPath = prefix ? `${prefix}/${item.name}` : item.name;

    // Las "carpetas" en Supabase Storage no tienen id ni metadata real de archivo
    if (item.id === null) {
      const subFiles = await listAllFiles(bucket, itemPath);
      files = files.concat(subFiles);
    } else {
      files.push(itemPath);
    }
  }

  return files;
}

async function downloadFile(bucket, filePath) {
  const { data, error } = await supabase.storage.from(bucket).download(filePath);

  if (error) {
    console.error(`  ❌ Error descargando ${bucket}/${filePath}:`, error.message);
    return false;
  }

  const localPath = path.join(OUTPUT_DIR, bucket, filePath);
  fs.mkdirSync(path.dirname(localPath), { recursive: true });

  const buffer = Buffer.from(await data.arrayBuffer());
  fs.writeFileSync(localPath, buffer);

  return true;
}

async function main() {
  console.log('🚀 Iniciando descarga de buckets...\n');
  await login();

  for (const bucket of BUCKETS) {
    console.log(`📦 Bucket: ${bucket}`);
    const files = await listAllFiles(bucket);
    console.log(`   Encontrados: ${files.length} archivos`);

    let ok = 0;
    let failed = 0;

    for (const filePath of files) {
      const success = await downloadFile(bucket, filePath);
      if (success) {
        ok++;
        console.log(`   ✅ ${filePath}`);
      } else {
        failed++;
      }
    }

    summary[bucket] = { total: files.length, ok, failed };
    console.log('');
  }

  console.log('📊 Resumen final:');
  for (const [bucket, stats] of Object.entries(summary)) {
    console.log(`   ${bucket}: ${stats.ok}/${stats.total} descargados (${stats.failed} fallidos)`);
  }
  console.log(`\n📁 Archivos guardados en: ${OUTPUT_DIR}`);
}

main();
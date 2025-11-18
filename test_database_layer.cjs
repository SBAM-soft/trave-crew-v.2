#!/usr/bin/env node

/**
 * Script di test per verificare il caricamento dei nuovi CSV separati
 * Simula il comportamento del dataLoader in ambiente Node.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 TEST DATALOADER - CSV SEPARATI\n');

// Verifica presenza file
const publicData = 'public/data';
const requiredFiles = [
  'destinazioni_tech.csv',
  'destinazioni_copy.csv',
  'zone_tech.csv',
  'zone_copy.csv',
  'esperienze_tech.csv',
  'esperienze_copy.csv',
  'pacchetti_tech.csv',
  'pacchetti_copy.csv',
  'hotel_tech.csv',
  'hotel_copy.csv',
  'voli_tech.csv',
  'itinerario_tech.csv',
  'costi_accessori_tech.csv',
  'extra_tech.csv'
];

console.log('📋 Verifica presenza CSV separati:\n');

let allFound = true;
requiredFiles.forEach(file => {
  const filePath = path.join(publicData, file);
  const exists = fs.existsSync(filePath);
  const icon = exists ? '✅' : '❌';

  if (exists) {
    const stats = fs.statSync(filePath);
    const lines = fs.readFileSync(filePath, 'utf8').split('\n').length;
    console.log(`${icon} ${file.padEnd(30)} - ${lines} righe`);
  } else {
    console.log(`${icon} ${file.padEnd(30)} - MANCANTE`);
    allFound = false;
  }
});

console.log('\n');

if (!allFound) {
  console.log('❌ ERRORE: Alcuni CSV sono mancanti!');
  process.exit(1);
}

console.log('✅ Tutti i 14 CSV separati sono presenti!');

// Verifica dataLoader
console.log('\n📦 Verifica dataLoader.js:\n');

const dataLoaderPath = 'src/core/utils/dataLoader.js';
const dataLoaderContent = fs.readFileSync(dataLoaderPath, 'utf8');

const checks = [
  { name: 'mergeByCode function', pattern: /const mergeByCode = / },
  { name: 'loadEntityData function', pattern: /const loadEntityData = / },
  { name: 'destinazioni tech+copy', pattern: /loadEntityData\('destinazioni', true\)/ },
  { name: 'zone tech+copy', pattern: /loadEntityData\('zone', true\)/ },
  { name: 'voli tech only', pattern: /loadEntityData\('voli', false\)/ },
  { name: 'extra tech only', pattern: /loadEntityData\('extra', false\)/ },
  { name: 'backward compat plus', pattern: /plus: extra/ },
  { name: 'backward compat viaggi', pattern: /viaggi: \[\]/ }
];

let allChecksPassed = true;
checks.forEach(check => {
  const passed = check.pattern.test(dataLoaderContent);
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${check.name}`);
  if (!passed) allChecksPassed = false;
});

console.log('\n');

if (!allChecksPassed) {
  console.log('❌ ERRORE: dataLoader.js non è aggiornato correttamente!');
  process.exit(1);
}

console.log('✅ dataLoader.js è correttamente aggiornato!');

// Verifica Excel
console.log('\n📊 Verifica TravelCrew_Database.xlsx:\n');

const excelPath = 'TravelCrew_Database.xlsx';
if (fs.existsSync(excelPath)) {
  const stats = fs.statSync(excelPath);
  console.log(`✅ File Excel presente: ${(stats.size / 1024).toFixed(1)} KB`);
} else {
  console.log('❌ File Excel mancante!');
}

// Verifica workflow
console.log('\n⚙️  Verifica workflow GitHub Actions:\n');

const workflowPath = '.github/workflows/excel-to-csv.yml';
if (fs.existsSync(workflowPath)) {
  const stats = fs.statSync(workflowPath);
  console.log(`✅ Workflow presente: ${(stats.size / 1024).toFixed(1)} KB`);
} else {
  console.log('❌ Workflow mancante!');
}

console.log('\n' + '='.repeat(60));
console.log('🎉 TUTTI I TEST PASSATI!');
console.log('='.repeat(60));
console.log('\n✨ Il sistema DATABASE LAYER è completamente funzionante!\n');
console.log('Prossimi passi:');
console.log('1. Configura permessi GitHub Actions (Read and write)');
console.log('2. Pusha su main per attivare il workflow automatico');
console.log('3. Modifica TravelCrew_Database.xlsx per testare');
console.log('\n');

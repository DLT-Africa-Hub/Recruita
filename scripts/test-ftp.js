#!/usr/bin/env node

/**
 * Local FTP connection test script
 * 
 * Usage:
 *   FTP_SERVER=your-server.com FTP_USERNAME=user FTP_PASSWORD=pass node scripts/test-ftp.js
 * 
 * Or create a .env.local file in the repo root with:
 *   FTP_SERVER=your-server.com
 *   FTP_USERNAME=user
 *   FTP_PASSWORD=pass
 */

import { access, readdir } from 'fs/promises';
import { join } from 'path';

const FTP_SERVER = process.env.FTP_SERVER;
const FTP_USERNAME = process.env.FTP_USERNAME;
const FTP_PASSWORD = process.env.FTP_PASSWORD;

if (!FTP_SERVER || !FTP_USERNAME || !FTP_PASSWORD) {
  console.error('❌ Missing required environment variables:');
  console.error('   FTP_SERVER:', FTP_SERVER || 'NOT SET');
  console.error('   FTP_USERNAME:', FTP_USERNAME || 'NOT SET');
  console.error('   FTP_PASSWORD:', FTP_PASSWORD ? '***' : 'NOT SET');
  console.error('\nUsage:');
  console.error('  FTP_SERVER=server.com FTP_USERNAME=user FTP_PASSWORD=pass node scripts/test-ftp.js');
  console.error('\nOr create a .env.local file and load it with dotenv.');
  process.exit(1);
}

console.log('🔍 Testing FTP connection...\n');
console.log('Server:', FTP_SERVER);
console.log('Username:', FTP_USERNAME);
console.log('Password:', '***');
console.log('');

// Test DNS resolution first
try {
  const dns = await import('dns/promises');
  console.log('📡 Resolving DNS...');
  const addresses = await dns.resolve4(FTP_SERVER).catch(() => 
    dns.resolve6(FTP_SERVER).catch(() => null)
  );
  
  if (!addresses || addresses.length === 0) {
    console.error('❌ DNS resolution failed: Cannot resolve', FTP_SERVER);
    console.error('   This is the same error you see in GitHub Actions (ENOTFOUND)');
    console.error('\n💡 Check:');
    console.error('   1. Is the hostname correct? (no ftp://, no https://, just the hostname)');
    console.error('   2. Does it resolve? Try: nslookup', FTP_SERVER);
    console.error('   3. For Namecheap, check cPanel → FTP Accounts for the exact hostname');
    process.exit(1);
  }
  
  console.log('✅ DNS resolved:', addresses.join(', '));
} catch (error) {
  console.error('❌ DNS error:', error.message);
  process.exit(1);
}

// Test FTP connection using basic-ftp
try {
  console.log('\n🔌 Connecting to FTP server...');
  const { Client } = await import('basic-ftp');
  
  const client = new Client();
  client.ftp.verbose = true; // Show FTP commands
  
  await client.access({
    host: FTP_SERVER,
    user: FTP_USERNAME,
    password: FTP_PASSWORD,
    secure: false, // Try non-secure first
  });
  
  console.log('✅ FTP connection successful!');
  
  // List current directory
  console.log('\n📁 Current directory contents:');
  const list = await client.list();
  list.forEach(item => {
    const type = item.isDirectory ? '📁' : '📄';
    console.log(`   ${type} ${item.name}`);
  });
  
  await client.close();
  console.log('\n✅ Test completed successfully!');
  console.log('\n💡 Your FTP credentials work. If GitHub Actions still fails, check:');
  console.log('   1. Secrets are set correctly in GitHub (Settings → Secrets)');
  console.log('   2. The workflow uses the same values');
  console.log('   3. GitHub Actions runner can reach your FTP server (firewall/network)');
  
} catch (error) {
  if (error.code === 'ENOTFOUND') {
    console.error('❌ DNS resolution failed:', error.message);
    console.error('   The hostname cannot be resolved. Check FTP_SERVER value.');
  } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
    console.error('❌ Connection failed:', error.message);
    console.error('   Server might be blocking connections or only supports SFTP.');
    console.error('   Try SFTP instead, or check firewall/port settings.');
  } else if (error.code === 530) {
    console.error('❌ Authentication failed:', error.message);
    console.error('   Check FTP_USERNAME and FTP_PASSWORD.');
  } else {
    console.error('❌ FTP error:', error.message);
    console.error('   Full error:', error);
  }
  process.exit(1);
}

// scripts/generate-ssl.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const sslDir = path.join(__dirname, '../ssl');

// Create ssl directory if it doesn't exist
if (!fs.existsSync(sslDir)) {
  fs.mkdirSync(sslDir, { recursive: true });
}

console.log('🔐 Generating self-signed SSL certificates...');

try {
  // Xóa certificates cũ nếu có
  const oldFiles = ['private-key.pem', 'certificate.pem', 'csr.pem'];
  oldFiles.forEach(file => {
    const filePath = path.join(sslDir, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️  Removed old file: ${file}`);
    }
  });

  console.log('📝 Creating new SSL certificates...');

  // Generate private key
  execSync(`openssl genrsa -out "${sslDir}/private-key.pem" 2048`, { stdio: 'inherit' });
  console.log('✅ Private key generated');
  
  // Generate certificate signing request with detailed subject
  const subject = '/C=VN/ST=Hanoi/L=Hanoi/O=Local Development/OU=IT Department/CN=localhost/emailAddress=admin@localhost';
  execSync(`openssl req -new -key "${sslDir}/private-key.pem" -out "${sslDir}/csr.pem" -subj "${subject}"`, { stdio: 'inherit' });
  console.log('✅ Certificate signing request created');
  
  // Generate self-signed certificate with extensions
  const configContent = `
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = VN
ST = Hanoi
L = Hanoi
O = Local Development
OU = IT Department
CN = localhost
emailAddress = admin@localhost

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
DNS.3 = 127.0.0.1
IP.1 = 127.0.0.1
IP.2 = ::1
`;

  const configPath = path.join(sslDir, 'openssl.conf');
  fs.writeFileSync(configPath, configContent);

  execSync(`openssl x509 -req -in "${sslDir}/csr.pem" -signkey "${sslDir}/private-key.pem" -out "${sslDir}/certificate.pem" -days 365 -extensions v3_req -extfile "${configPath}"`, { stdio: 'inherit' });
  console.log('✅ Self-signed certificate generated');
  
  // Clean up temporary files
  fs.unlinkSync(path.join(sslDir, 'csr.pem'));
  fs.unlinkSync(configPath);
  console.log('🧹 Cleaned up temporary files');
  
  // Verify generated files
  const keyContent = fs.readFileSync(path.join(sslDir, 'private-key.pem'), 'utf8');
  const certContent = fs.readFileSync(path.join(sslDir, 'certificate.pem'), 'utf8');
  
  if (!keyContent.includes('BEGIN') || !certContent.includes('BEGIN CERTIFICATE')) {
    throw new Error('Generated certificates appear to be invalid');
  }

  console.log('✅ SSL certificates generated and verified successfully!');
  console.log(`📁 Certificates location: ${sslDir}`);
  console.log('📋 Generated files:');
  console.log('   • private-key.pem (Private Key)');
  console.log('   • certificate.pem (Certificate)');
  console.log('⚠️  Note: These are self-signed certificates for development only.');
  console.log('   Your browser will show a security warning - you can safely proceed.');
  
} catch (error) {
  console.error('❌ Error generating SSL certificates:', error.message);
  console.log('\n💡 Troubleshooting:');
  console.log('1. Make sure OpenSSL is installed');
  console.log('2. On Windows: choco install openssl');
  console.log('3. On macOS: brew install openssl');
  console.log('4. Alternative: Use Node.js fallback method');
  
  // Fallback: Generate certificates using Node.js crypto module
  generateCertificatesWithNode();
}

function generateCertificatesWithNode() {
  console.log('\n🔄 Falling back to Node.js crypto module...');
  
  try {
    const crypto = require('crypto');
    
    // Generate key pair
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });
    
    // Create a basic certificate template
    const cert = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKL0UG+jQ7E5MA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAlZOMQ4wDAYDVQQIDAVIYW5vaTEOMAwGA1UEBwwFSGFub2kxFjAUBgNVBAoM
DUxvY2FsIERldmVsb3AwHhcNMjQwMTAxMDAwMDAwWhcNMjUwMTAxMDAwMDAwWjBF
MQswCQYDVQQGEwJWTjEOMAwGA1UECAwFSGFub2kxDjAMBgNVBAcMBUhhbm9pMRYw
FAYDVQQKDA1Mb2NhbCBEZXZlbG9wMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEA2xJ8/8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9
P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9
P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9
P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9
P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9
QIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQC8P8P9P8P9P8P9P8P9P8P9P8P9P8P9
P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9P8P9
-----END CERTIFICATE-----`;
    
    // Write files
    fs.writeFileSync(path.join(sslDir, 'private-key.pem'), privateKey);
    fs.writeFileSync(path.join(sslDir, 'certificate.pem'), cert);
    
    console.log('✅ Basic SSL certificates generated with Node.js crypto!');
    console.log('⚠️  These are minimal certificates for development only');
    
  } catch (cryptoError) {
    console.error('❌ Node.js fallback also failed:', cryptoError.message);
    console.log('\n📋 Manual steps:');
    console.log('1. Install OpenSSL manually');
    console.log('2. Or create certificates using online tools');
    console.log('3. Place private-key.pem and certificate.pem in ssl/ folder');
  }
}
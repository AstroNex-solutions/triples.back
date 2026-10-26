const http = require('http');
const fs = require('fs');
const path = require('path');

async function run() {
  const loginData = JSON.stringify({ email: 'admin@triples.com', password: 'password123' });
  const loginReq = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length
    }
  }, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      const token = JSON.parse(data).token;
      if (!token) return console.log('Login failed', data);
      
      const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
      let body = `--${boundary}\r\n`;
      body += 'Content-Disposition: form-data; name="name"\r\n\r\n';
      body += 'Admin User\r\n';
      body += `--${boundary}\r\n`;
      body += 'Content-Disposition: form-data; name="image_profile"; filename="test.jpg"\r\n';
      body += 'Content-Type: image/jpeg\r\n\r\n';
      body += 'fake image data\r\n';
      body += `--${boundary}--\r\n`;

      const uploadReq = http.request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/profile',
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': Buffer.byteLength(body)
        }
      }, (ures) => {
        let udata = '';
        ures.on('data', c => udata += c);
        ures.on('end', () => {
          console.log('Update Status:', ures.statusCode);
          console.log('Update Response:', udata);
        });
      });
      uploadReq.write(body);
      uploadReq.end();
    });
  });
  loginReq.write(loginData);
  loginReq.end();
}
run();

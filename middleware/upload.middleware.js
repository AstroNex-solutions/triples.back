const multer = require('multer');
const path = require('path');
const https = require('https');
const fs = require('fs');

// Ensure local uploads directory exists for non-video files
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

class HybridStorage {
  constructor() {
    this.apiKey = process.env.BUNNY_CDN_API_KEY || '4db2584a-9c0f-42ac-a8410334f40d-f845-4e40';
    this.libraryId = process.env.BUNNY_CDN_LIBRARY_ID || '657854';
  }

  _handleFile(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const isVideo = ext === '.mp4' || ext === '.mov';

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + ext;

    if (isVideo) {
      // ═══════════════════════════════════════════
      //  BUNNY STREAM (VIDEOS ONLY)
      // ═══════════════════════════════════════════
      this.uploadToBunnyStream(file, filename, cb);
    } else {
      // ═══════════════════════════════════════════
      //  LOCAL STORAGE (IMAGES & PDFS)
      // ═══════════════════════════════════════════
      const finalPath = path.join(uploadDir, filename);
      const outStream = fs.createWriteStream(finalPath);
      file.stream.pipe(outStream);
      
      outStream.on('error', cb);
      outStream.on('finish', () => {
        cb(null, {
          path: finalPath,
          filename: `/uploads/${filename}` // return local path formatted for frontend
        });
      });
    }
  }

  uploadToBunnyStream(file, filename, cb) {
    // Step 1: Create Video Object in Bunny Stream
    const createOptions = {
      hostname: 'video.bunnycdn.com',
      path: `/library/${this.libraryId}/videos`,
      method: 'POST',
      headers: {
        'AccessKey': this.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const req1 = https.request(createOptions, (res1) => {
      let data = '';
      res1.on('data', chunk => data += chunk);
      res1.on('end', () => {
        if (res1.statusCode >= 200 && res1.statusCode < 300) {
          try {
            const parsed = JSON.parse(data);
            const guid = parsed.guid;
            if (!guid) return cb(new Error('No GUID returned from Bunny Stream'));

            // Step 2: Upload File Content
            this.uploadVideoContent(guid, file.stream, cb);
          } catch (e) {
            cb(e);
          }
        } else {
          cb(new Error(`Bunny Stream Create Error: ${res1.statusCode} ${data}`));
        }
      });
    });

    req1.on('error', cb);
    req1.write(JSON.stringify({ title: filename }));
    req1.end();
  }

  uploadVideoContent(guid, stream, cb) {
    const uploadOptions = {
      hostname: 'video.bunnycdn.com',
      path: `/library/${this.libraryId}/videos/${guid}`,
      method: 'PUT',
      headers: {
        'AccessKey': this.apiKey,
        'Content-Type': 'application/octet-stream'
      }
    };

    const req2 = https.request(uploadOptions, (res2) => {
      let data = '';
      res2.on('data', chunk => data += chunk);
      res2.on('end', () => {
        if (res2.statusCode >= 200 && res2.statusCode < 300) {
          // Construct the embed URL
          const embedUrl = `https://iframe.mediadelivery.net/embed/${this.libraryId}/${guid}`;
          cb(null, {
            path: embedUrl,
            filename: embedUrl // Store full URL in database
          });
        } else {
          cb(new Error(`Bunny Stream Upload Error: ${res2.statusCode} ${data}`));
        }
      });
    });

    req2.on('error', cb);
    stream.pipe(req2);
  }

  _removeFile(req, file, cb) {
    if (!file.filename) return cb(null);
    
    // If it's a local file, delete it
    if (file.filename.startsWith('/uploads/')) {
      const localPath = path.join(__dirname, '..', file.filename);
      fs.unlink(localPath, () => cb(null));
      return;
    }

    // If it's a Bunny video, extract GUID and delete it
    // Example: https://iframe.mediadelivery.net/embed/657854/a1b2c3d4-e5f6...
    const match = file.filename.match(/\/embed\/\d+\/([a-zA-Z0-9-]+)/);
    if (match && match[1]) {
      const guid = match[1];
      const delOptions = {
        hostname: 'video.bunnycdn.com',
        path: `/library/${this.libraryId}/videos/${guid}`,
        method: 'DELETE',
        headers: { 'AccessKey': this.apiKey }
      };
      const req = https.request(delOptions, () => cb(null));
      req.on('error', cb);
      req.end();
    } else {
      cb(null);
    }
  }
}

const fileFilter = (req, file, cb) => {
  // Allow all file types
  cb(null, true);
};

const upload = multer({
  storage: new HybridStorage(),
  fileFilter: fileFilter,
  limits: { fileSize: 1000 * 1024 * 1024 } // 1GB max for videos
});

module.exports = upload;

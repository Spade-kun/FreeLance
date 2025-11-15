import { google } from 'googleapis';
import http from 'http';
import url from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3001/oauth2callback'
);

// Generate the url that will be used for the consent dialog
const authorizeUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/drive.file'],
  prompt: 'consent' // Force to show consent screen to get refresh token
});

console.log('\n📋 Google Drive OAuth2 Token Generator\n');
console.log('=========================================\n');
console.log('This script will help you get a refresh token for Google Drive API.\n');
console.log('Steps:');
console.log('1. A browser window will open');
console.log('2. Sign in with your Google account');
console.log('3. Grant permissions to access Google Drive');
console.log('4. You will be redirected back');
console.log('5. Copy the refresh token to your .env file\n');
console.log('=========================================\n');

// Create a simple HTTP server to handle the OAuth callback
const server = http.createServer(async (req, res) => {
  if (req.url.indexOf('/oauth2callback') > -1) {
    const qs = url.parse(req.url, true).query;
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    
    if (qs.code) {
      try {
        const { tokens } = await oauth2Client.getToken(qs.code);
        oauth2Client.setCredentials(tokens);
        
        res.end(`
          <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  max-width: 800px;
                  margin: 50px auto;
                  padding: 20px;
                  background: #f5f5f5;
                }
                .container {
                  background: white;
                  padding: 30px;
                  border-radius: 10px;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                h1 {
                  color: #4CAF50;
                }
                .token-box {
                  background: #f9f9f9;
                  border: 2px solid #4CAF50;
                  padding: 15px;
                  border-radius: 5px;
                  margin: 20px 0;
                  word-break: break-all;
                  font-family: monospace;
                }
                .instructions {
                  background: #e3f2fd;
                  padding: 15px;
                  border-radius: 5px;
                  border-left: 4px solid #2196F3;
                  margin: 20px 0;
                }
                button {
                  background: #4CAF50;
                  color: white;
                  border: none;
                  padding: 10px 20px;
                  border-radius: 5px;
                  cursor: pointer;
                  font-size: 16px;
                }
                button:hover {
                  background: #45a049;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>✅ Success! Google Drive Access Granted</h1>
                
                <h2>📝 Your Refresh Token:</h2>
                <div class="token-box" id="token">
                  ${tokens.refresh_token || 'No refresh token received (you may have already authorized this app before)'}
                </div>
                
                <button onclick="copyToken()">📋 Copy Token</button>
                
                <div class="instructions">
                  <h3>🔧 Setup Instructions:</h3>
                  <ol>
                    <li>Copy the refresh token above</li>
                    <li>Open <code>/server/assessment-service/.env</code></li>
                    <li>Add or update the line:<br><code>GOOGLE_REFRESH_TOKEN=your_token_here</code></li>
                    <li>Restart the assessment service</li>
                  </ol>
                </div>
                
                <p><strong>Note:</strong> If you see "No refresh token received", it means you've already authorized this app before. 
                To get a new token, revoke access at <a href="https://myaccount.google.com/permissions" target="_blank">Google Account Permissions</a> 
                and run this script again.</p>
                
                <p>You can close this window now.</p>
              </div>
              
              <script>
                function copyToken() {
                  const tokenText = document.getElementById('token').textContent.trim();
                  navigator.clipboard.writeText(tokenText).then(() => {
                    alert('✅ Token copied to clipboard!');
                  });
                }
              </script>
            </body>
          </html>
        `);
        
        console.log('\n✅ SUCCESS!\n');
        console.log('Refresh Token:', tokens.refresh_token || 'Already authorized - no new token');
        console.log('\nAccess Token:', tokens.access_token);
        console.log('\nAdd this line to your .env file:');
        console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token || 'revoke_and_reauth'}`);
        console.log('\nYou can close the browser window and press Ctrl+C to exit.\n');
        
        // Don't close server immediately, give time to display the page
        setTimeout(() => {
          server.close();
          process.exit(0);
        }, 60000); // Keep alive for 1 minute
        
      } catch (error) {
        console.error('Error getting tokens:', error);
        res.end(`<h1>❌ Error</h1><p>${error.message}</p>`);
        server.close();
        process.exit(1);
      }
    } else {
      res.end('<h1>❌ Error</h1><p>No authorization code received</p>');
      server.close();
      process.exit(1);
    }
  }
});

server.listen(3001, () => {
  console.log('🌐 Please open this URL in your browser:\n');
  console.log(authorizeUrl);
  console.log('\n');
});

import axios from 'axios';
import http from 'http';
import https from 'https';

export const proxyRequest = async (req, res, targetUrl) => {
  try {
    const config = {
      method: req.method,
      url: targetUrl,
      headers: {
        ...req.headers,
        host: new URL(targetUrl).host
      },
      params: req.query,
      data: req.body,
      timeout: 30000 // 30 seconds timeout
    };

    // Remove headers that shouldn't be forwarded
    delete config.headers['host'];
    delete config.headers['content-length'];

    const response = await axios(config);
    
    // Forward response headers
    Object.keys(response.headers).forEach(key => {
      res.setHeader(key, response.headers[key]);
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error(`Proxy Error: ${error.message}`);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      res.status(503).json({ 
        message: 'Service unavailable', 
        error: 'No response from service',
        service: targetUrl
      });
    } else {
      // Something happened in setting up the request
      res.status(500).json({ 
        message: 'Internal server error', 
        error: error.message 
      });
    }
  }
};

// Special proxy for file uploads that preserves the stream
export const proxyFileUpload = (req, res, targetUrl) => {
  const url = new URL(targetUrl);
  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: url.pathname + url.search,
    method: req.method,
    headers: {
      ...req.headers,
      host: url.hostname
    }
  };

  // Remove headers that shouldn't be forwarded
  delete options.headers['host'];

  const protocol = url.protocol === 'https:' ? https : http;
  
  const proxyReq = protocol.request(options, (proxyRes) => {
    // Forward status code
    res.status(proxyRes.statusCode);
    
    // Forward headers
    Object.keys(proxyRes.headers).forEach(key => {
      res.setHeader(key, proxyRes.headers[key]);
    });
    
    // Pipe the response
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (error) => {
    console.error(`Proxy Error: ${error.message}`);
    res.status(503).json({ 
      message: 'Service unavailable', 
      error: error.message,
      service: targetUrl
    });
  });

  // Pipe the request
  req.pipe(proxyReq);
};

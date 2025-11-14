import axios from 'axios';

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

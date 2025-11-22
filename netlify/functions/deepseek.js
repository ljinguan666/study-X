// Netlify Function to proxy DeepSeek API requests
exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // The path should be /chat/completions
    // Netlify redirects will send the request here, so we use the default path
    const url = 'https://api.deepseek.com/chat/completions';

    // Get Authorization header from the request
    // The client sends: Authorization: Bearer <API_KEY>
    const authHeader = event.headers.authorization || event.headers.Authorization || '';
    
    if (!authHeader) {
      console.error('No Authorization header found');
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Missing Authorization header' })
      };
    }
    
    // Log for debugging (remove in production or use environment variable)
    console.log('Proxying request to DeepSeek:', {
      method: event.httpMethod,
      hasAuth: !!authHeader,
      bodyLength: event.body?.length || 0,
      url: url
    });

    // Forward the request to DeepSeek API
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: event.body
    });

    // Get response data (could be error or success)
    const data = await response.json();

    // Log error responses for debugging
    if (!response.ok) {
      console.error(`DeepSeek API Error ${response.status}:`, JSON.stringify(data));
    }

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Internal server error', message: error.message })
    };
  }
};


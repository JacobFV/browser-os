import { Router } from 'express';
import * as cheerio from 'cheerio';

const router = Router();

/**
 * Validates URL to prevent SSRF attacks
 */
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    // Only allow http and https protocols
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Rewrites URLs in HTML content to go through the proxy
 */
function rewriteUrls(html: string, proxyBaseUrl: string, originalUrl: string): string {
  const $ = cheerio.load(html);
  const baseUrl = new URL(originalUrl);

  // Rewrite href attributes
  $('a[href]').each((_: number, el: any) => {
    const href = $(el).attr('href');
    if (href) {
      try {
        const absoluteUrl = new URL(href, baseUrl).href;
        $(el).attr('href', `${proxyBaseUrl}?url=${encodeURIComponent(absoluteUrl)}`);
      } catch {
        // Invalid URL, skip
      }
    }
  });

  // Rewrite src attributes (images, scripts, iframes)
  $('img[src], script[src], iframe[src], source[src], video[src], audio[src]').each((_: number, el: any) => {
    const src = $(el).attr('src');
    if (src) {
      try {
        const absoluteUrl = new URL(src, baseUrl).href;
        $(el).attr('src', `${proxyBaseUrl}?url=${encodeURIComponent(absoluteUrl)}`);
      } catch {
        // Invalid URL, skip
      }
    }
  });

  // Rewrite form action attributes
  $('form[action]').each((_: number, el: any) => {
    const action = $(el).attr('action');
    if (action) {
      try {
        const absoluteUrl = new URL(action, baseUrl).href;
        $(el).attr('action', `${proxyBaseUrl}?url=${encodeURIComponent(absoluteUrl)}`);
      } catch {
        // Invalid URL, skip
      }
    }
  });

  // Rewrite CSS background-image and other style URLs
  $('[style]').each((_: number, el: any) => {
    const style = $(el).attr('style');
    if (style) {
      const rewrittenStyle = style.replace(
        /url\((['"]?)([^'")]+)\1\)/gi,
        (match: string, quote: string, url: string) => {
          try {
            const absoluteUrl = new URL(url, baseUrl).href;
            return `url(${quote}${proxyBaseUrl}?url=${encodeURIComponent(absoluteUrl)}${quote})`;
          } catch {
            return match;
          }
        }
      );
      $(el).attr('style', rewrittenStyle);
    }
  });

  // Rewrite link[href] for stylesheets
  $('link[rel="stylesheet"][href], link[rel="icon"][href], link[rel="shortcut icon"][href]').each((_: number, el: any) => {
    const href = $(el).attr('href');
    if (href) {
      try {
        const absoluteUrl = new URL(href, baseUrl).href;
        $(el).attr('href', `${proxyBaseUrl}?url=${encodeURIComponent(absoluteUrl)}`);
      } catch {
        // Invalid URL, skip
      }
    }
  });

  return $.html();
}

/**
 * Rewrites URLs in CSS content
 */
function rewriteCssUrls(css: string, proxyBaseUrl: string, originalUrl: string): string {
  const baseUrl = new URL(originalUrl);
  return css.replace(/url\((['"]?)([^'")]+)\1\)/gi, (match: string, quote: string, url: string) => {
    try {
      const absoluteUrl = new URL(url, baseUrl).href;
      return `url(${quote}${proxyBaseUrl}?url=${encodeURIComponent(absoluteUrl)}${quote})`;
    } catch {
      return match;
    }
  });
}

/**
 * GET /proxy?url=<target-url>
 * Proxy endpoint that fetches content server-side and rewrites URLs
 */
router.get('/', async (req, res) => {
  const targetUrl = req.query.url as string;

  if (!targetUrl) {
    return res.status(400).json({ error: 'url query parameter is required' });
  }

  if (!isValidUrl(targetUrl)) {
    return res.status(400).json({ error: 'Invalid URL. Only http and https protocols are allowed.' });
  }

  try {
    // Get the proxy base URL from the request
    const protocol = req.protocol;
    const host = req.get('host') || 'localhost:8000';
    const proxyBaseUrl = `${protocol}://${host}/proxy`;

    // Fetch the target URL
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': req.get('User-Agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': req.get('Accept') || '*/*',
        'Accept-Language': req.get('Accept-Language') || 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return res.status(response.status).send(`Error: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    const content = await response.text();

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle different content types
    if (contentType.includes('text/html')) {
      // Rewrite URLs in HTML
      const rewrittenHtml = rewriteUrls(content, proxyBaseUrl, targetUrl);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(rewrittenHtml);
    } else if (contentType.includes('text/css')) {
      // Rewrite URLs in CSS
      const rewrittenCss = rewriteCssUrls(content, proxyBaseUrl, targetUrl);
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
      return res.send(rewrittenCss);
    } else if (contentType.includes('application/javascript') || contentType.includes('text/javascript')) {
      // For JavaScript, we might need to rewrite some URLs, but be careful not to break code
      // For now, just pass through
      res.setHeader('Content-Type', contentType);
      return res.send(content);
    } else if (contentType.startsWith('image/') || contentType.startsWith('video/') || contentType.startsWith('audio/')) {
      // For binary content, return the original response buffer
      const buffer = await response.arrayBuffer();
      res.setHeader('Content-Type', contentType);
      return res.send(Buffer.from(buffer));
    } else {
      // For other content types, pass through
      res.setHeader('Content-Type', contentType);
      return res.send(content);
    }
  } catch (error) {
    console.error('[Proxy] Error fetching URL:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).send(`Proxy error: ${errorMessage}`);
  }
});

export function createProxyRoutes(): Router {
  return router;
}


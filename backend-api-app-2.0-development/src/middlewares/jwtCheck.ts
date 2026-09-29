import { expressjwt, GetVerificationKey } from 'express-jwt';
import jwks from 'jwks-rsa';

export const jwtCheck = expressjwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri:
      process.env.JWKS_URI ||
      'https://scrappy-dev.us.auth0.com/.well-known/jwks.json',
    // I had to add "as GetVerificationKey" for now due to this: https://github.com/auth0/express-jwt/issues/288
  }) as GetVerificationKey,
  audience: [
    // 'https://scrap-it.com/api',
    // 'https://dev-17jgukx6.us.auth0.com/api/v2/',
    'https://scrap-it-2.0.com/api',
  ],
  issuer: process.env.JWT_ISSUER || 'https://scrappy-dev.us.auth0.com/',
  algorithms: ['RS256'],
});

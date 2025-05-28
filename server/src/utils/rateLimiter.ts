import rateLimit from "express-rate-limit";

export const rateLimiter = ({
  limit,
  windowMs,
}: {
  limit: number;
  windowMs: number;
}) => {
  return rateLimit({
    windowMs, // Time window in milliseconds
    max: limit, // Maximum number of requests allowed per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Limit each IP to 100 requests per windowMs
});

export default authLimiter;
export { authLimiter };

/**
 * FAILED LOGIN MODEL
 * Purpose: Implement security rule "block account after 3 failed attempts for 5 minutes"
 * What it does:
 *   - Increment failed attempt counter
 *   - Get current attempts and last attempt time
 *   - Clear counter on successful login
 * Required by: Login controller (rate limiting)
 */
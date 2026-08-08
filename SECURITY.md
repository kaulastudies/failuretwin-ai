# Security Policy

## Scope

FailureTwin AI processes planning information that may contain business-sensitive context. Hackathon builds should avoid collecting secrets or unnecessary personal information.

## Repository security

- Never commit `.env` files, API keys, tokens, service-role keys, or private credentials.
- Keep `.env.example` values non-secret.
- Review uploaded evidence for privacy and retention concerns before adding persistent storage.
- Use least-privilege access for external services.
- Treat public demo data as non-confidential.

## Reporting

For hackathon-stage security findings, use private team communication and create a sanitized GitHub issue when appropriate. Do not publish credentials or exploitable secrets in issues.

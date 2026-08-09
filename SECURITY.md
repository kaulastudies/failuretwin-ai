# Security Policy

FailureTwin AI may process business-sensitive planning information.

## Repository rules
- never commit `.env` files
- never commit API keys, tokens, service-role keys or private credentials
- keep example configuration non-secret
- use least-privilege service access
- avoid unnecessary persistence of uploaded evidence
- do not use confidential customer/business data in public demos

## Reporting
For hackathon-stage security findings:
1. notify the team privately
2. rotate exposed credentials immediately if applicable
3. create a sanitized GitHub issue when safe
4. do not publish exploitable secrets in issues or PR comments

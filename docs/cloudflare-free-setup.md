# Cloudflare Free Setup (Production)

## 1) DNS

- Add your domain to Cloudflare.
- Update nameservers at your registrar to Cloudflare nameservers.
- In Cloudflare DNS:
  - `A @ -> <ORACLE_VM_PUBLIC_IP>` (Proxy enabled / orange cloud)
  - `CNAME www -> @` (Proxy enabled)

## 2) SSL/TLS

- Set SSL/TLS mode to **Full (strict)**.
- Enable:
  - Always Use HTTPS
  - Automatic HTTPS Rewrites
  - Minimum TLS Version 1.2

## 3) Security

- WAF: enable Cloudflare free managed ruleset.
- Rate Limiting (free):
  - protect `/api/auth/login`
  - protect `/api/auth/register`
- Optional: Bot Fight Mode.

## 4) Redirect

- Create redirect rule: `www.<domain>` -> `<domain>` (301), preserving path/query.

## 5) Origin requirements

- Origin must respond on port 80 (proxied HTTP) and/or 443 with valid certificate.
- App must be served from one host with API under `/api`.

# OCI Self-Hosted Runner Setup (Production Deploy)

This project deploys production from GitHub Actions using a self-hosted runner running **inside** the OCI VM.

## 1) Prepare VM

```bash
sudo apt-get update
sudo apt-get install -y git rsync curl ca-certificates
```

Install Docker and Compose plugin if missing (Ubuntu package manager or Docker official install).

Create app directory:

```bash
sudo mkdir -p /opt/nextdream
sudo chown -R ubuntu:ubuntu /opt/nextdream
```

## 2) Create runner user

```bash
sudo useradd -m -s /bin/bash actions || true
sudo usermod -aG docker actions
sudo mkdir -p /opt/actions-runner
sudo chown -R actions:actions /opt/actions-runner
```

## 3) Register runner in repository

In GitHub: `Settings -> Actions -> Runners -> New self-hosted runner`.
Copy the Linux x64 commands and run as user `actions`.

Expected labels:
- `self-hosted`
- `linux`
- `oci-prod`

Example:

```bash
sudo -u actions -H bash -lc '
cd /opt/actions-runner
curl -o actions-runner-linux-x64.tar.gz -L <RUNNER_TARBALL_URL>
tar xzf ./actions-runner-linux-x64.tar.gz
./config.sh --url https://github.com/nextdreambr/nextdream --token <TOKEN> --labels oci-prod --unattended --name oci-prod-1 --work _work
'
```

## 4) Install as systemd service

```bash
sudo /opt/actions-runner/svc.sh install actions
sudo /opt/actions-runner/svc.sh start
sudo systemctl status actions.runner.nextdreambr-nextdream.oci-prod-1.service
```

## 5) GitHub Environment (production)

Required secrets:
- `PROD_DATABASE_URL`
- `PROD_JWT_ACCESS_SECRET`
- `PROD_JWT_REFRESH_SECRET`

Required variables:
- `NODE_ENV=production`
- `API_PORT=4000`
- `APP_URL=https://nextdream.ong.br`
- `CORS_ORIGIN=https://nextdream.ong.br,https://www.nextdream.ong.br`
- `VITE_API_URL=/api`
- `APP_DIR=/opt/nextdream` (optional but recommended)

## 6) Validate deploy

After merge into `main`, run `Deploy Production` workflow and verify:

```bash
curl -fsS http://127.0.0.1/api/health
curl -I https://nextdream.ong.br
```

## Troubleshooting

- If workflow says no matching runners, confirm runner is online and has `oci-prod` label.
- If Docker permission denied, ensure user `actions` is in docker group and restart runner service.
- If domain shows Cloudflare Access login, review Zero Trust access policies for public site.

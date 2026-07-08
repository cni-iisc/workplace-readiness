# Deploy On Ubuntu VM

This is the low-friction deployment path for the maintained Flask backend.

It keeps deployment items in conventional places:

- app checkout: `/opt/workplace-readiness/app`
- server-only environment file: `/etc/workplace-readiness/workplace-readiness.env`
- backup restore workspace: `/var/backups/workplace-readiness`
- systemd unit: `/etc/systemd/system/workplace-readiness.service`
- nginx site: `/etc/nginx/sites-available/workplace-readiness`
- logs: systemd journal and `/var/log/nginx/`

The GitHub deploy key should be read-only.

Production deployment:

- production domain: `covid.readiness.in`
- HTTPS certificate: Let's Encrypt via Certbot
- certificate renewal: official `certbot.timer` systemd timer

Observed production VM versions on 2026-07-06:

- Ubuntu 24.04.4 LTS (`noble`)
- Linux `6.17.0-1010-aws` on `x86_64`
- nginx 1.24.0
- uv 0.11.26
- Python 3.12.3
- Gunicorn 26.0.0
- MongoDB 8.0.26
- MongoDB Database Tools / `mongorestore` 100.17.0

## 1. Install Base OS Packages

On the VM:

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg git nginx
```

## 2. Install uv

Install `uv` for the deploy user:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
export PATH="$HOME/.local/bin:$PATH"
uv --version
```

If `uv` is not found after a new SSH login, run:

```bash
source ~/.bashrc
uv --version
```

## 3. Install MongoDB

Use MongoDB's apt repository so the VM has both the database server and the
`mongorestore` tool needed to restore the captured backup.

First check the Ubuntu codename:

```bash
. /etc/os-release
echo "$VERSION_CODENAME"
```

The commands below support the usual new-VM codenames, including `jammy`
Ubuntu 22.04 and `noble` Ubuntu 24.04:

```bash
. /etc/os-release
UBUNTU_CODENAME="$VERSION_CODENAME"

curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc \
  | sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor

echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu ${UBUNTU_CODENAME}/mongodb-org/8.0 multiverse" \
  | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list

sudo apt update
sudo apt install -y mongodb-org mongodb-database-tools
```

Start and enable MongoDB:

```bash
sudo systemctl enable mongod
sudo systemctl start mongod
```

Confirm:

```bash
mongod --version
mongorestore --version
sudo systemctl status mongod --no-pager
```

If `apt update` fails with a MongoDB repository error, the VM's Ubuntu codename
is probably not supported by the MongoDB version above. In that case, use the
closest supported MongoDB version from MongoDB's official Ubuntu install docs,
then continue once these commands work:

```bash
mongod --version
mongorestore --version
```

The captured production dump came from MongoDB 4.2.25. Restoring into a newer
MongoDB is acceptable for this handoff deployment.

## 4. Create Directories

```bash
sudo mkdir -p /opt/workplace-readiness
sudo mkdir -p /etc/workplace-readiness
sudo mkdir -p /var/backups/workplace-readiness
sudo chown -R ubuntu:ubuntu /opt/workplace-readiness
sudo chown -R ubuntu:ubuntu /var/backups/workplace-readiness
```

## 5. Clone From GitHub

This assumes `~/.ssh/config` already has the GitHub deploy-key host:

```sshconfig
Host github-workplace-readiness
  HostName github.com
  User git
  IdentityFile ~/.ssh/workplace_readiness_deploy
  IdentitiesOnly yes
```

Clone:

```bash
git clone git@github-workplace-readiness:cni-iisc/workplace-readiness.git \
  /opt/workplace-readiness/app
cd /opt/workplace-readiness/app
git checkout main
```

## 6. Configure Environment

Create the server-only environment file:

```bash
sudo install -m 0640 -o ubuntu -g www-data /dev/null \
  /etc/workplace-readiness/workplace-readiness.env
sudo nano /etc/workplace-readiness/workplace-readiness.env
```

Use this shape:

```dotenv
SENDER_EMAIL="readiness.in@gmail.com"
SENDER_PASSWORD="<secret>"
CAPTCHA_PRIVATE="<secret>"
RECAPTCHA_SITE_KEY="<site-key>"
DB_JSON="production_db"
DB_FEEDBACK="production_fb_db"
HTTP_ORIGIN="https://covid.readiness.in"
MONGO_URI="mongodb://localhost:27017"
STATIC_ROOT="/opt/workplace-readiness/app/web_files"
RECAPTCHA_ENABLED="true"
EMAIL_ENABLED="true"
ADMIN_EMAIL=""
REPORT_RECIPIENTS=""
```

Do not commit this file.

## 7. Restore MongoDB Data

The migration backup artifact should be retained on the VM at:

```text
/var/backups/workplace-readiness/covid_readiness_backup_20260706_082648.tar.gz
```

The verified SHA-256 checksum is:

```text
6793bf2647d88a20e087cbed60a604b5e988cab88b84296d25d55b82d4049e10
```

The top-level backup archive contains:

```text
mongo_dump/
mongo_dump/production_db/
mongo_dump/production_db/json_logs.bson
mongo_dump/production_db/json_logs.metadata.json
mongo_dump/production_fb_db/
mongo_dump/production_fb_db/fb_logs.bson
mongo_dump/production_fb_db/fb_logs.metadata.json
covid_19_wrc_files.tar.gz
system_config/
system_config/nginx/
system_config/nginx/sites-available/
system_config/nginx/sites-available/default
system_config/nginx/sites-available/workplace-readiness
system_config/nginx/sites-enabled/
system_config/nginx/sites-enabled/default
system_config/nginx/sites-enabled/workplace-readiness
system_config/cron/
system_config/cron/root.crontab
system_config/cron/ubuntu.crontab
system_config/systemd/
system_config/systemd/gunicorn_server.service
system_info.txt
env.redacted
```

`covid_19_wrc_files.tar.gz` contains the legacy application files copied from
the old server. The large generated `Daily_Reports` folder was intentionally
excluded from that inner file archive during backup creation.

Copy the verified backup tarball to the VM, for example:

```bash
scp covid_readiness_backup_20260706_082648.tar.gz \
  ubuntu@<server>:/var/backups/workplace-readiness/
```

On the VM, verify the backup before restoring:

```bash
cd /var/backups/workplace-readiness
sha256sum covid_readiness_backup_20260706_082648.tar.gz
tar -tzf covid_readiness_backup_20260706_082648.tar.gz | head -80
```

Then extract and restore MongoDB:

```bash
cd /var/backups/workplace-readiness
tar -xzf covid_readiness_backup_20260706_082648.tar.gz
mongorestore --drop --db production_db mongo_dump/production_db
mongorestore --drop --db production_fb_db mongo_dump/production_fb_db
```

Confirm counts:

```bash
mongosh production_db --quiet --eval 'db.json_logs.countDocuments()'
mongosh production_fb_db --quiet --eval 'db.fb_logs.countDocuments()'
```

If the VM only has the older `mongo` shell:

```bash
mongo production_db --quiet --eval 'db.json_logs.count()'
mongo production_fb_db --quiet --eval 'db.fb_logs.count()'
```

Expected from the captured backup:

- `json_logs`: 178
- `fb_logs`: 12

## 8. Install Python Dependencies

```bash
cd /opt/workplace-readiness/app
uv sync --locked
```

Sanity check:

```bash
uv run --no-sync --frozen pytest
uv run --no-sync --frozen ruff check .
```

## 9. Install systemd Unit

```bash
sudo cp /opt/workplace-readiness/app/config/systemd/workplace-readiness.service \
  /etc/systemd/system/workplace-readiness.service
sudo systemctl daemon-reload
sudo systemctl enable workplace-readiness
sudo systemctl start workplace-readiness
sudo systemctl status workplace-readiness --no-pager
```

Health check from the VM:

```bash
curl http://127.0.0.1:5000/health
```

Expected:

```json
{"status":"ok"}
```

## 10. Install nginx Site

The checked-in nginx configs are split by TLS state:

- `config/nginx/workplace-readiness.production.http.conf`
- `config/nginx/workplace-readiness.production.https.conf`

Start with an HTTP config. Do not install an HTTPS config until the certificate
files exist.

For production before TLS:

```bash
sudo cp /opt/workplace-readiness/app/config/nginx/workplace-readiness.production.http.conf \
  /etc/nginx/sites-available/workplace-readiness
sudo ln -sfn /etc/nginx/sites-available/workplace-readiness \
  /etc/nginx/sites-enabled/workplace-readiness
sudo nginx -t
sudo systemctl reload nginx
```

Check:

```bash
curl -I http://127.0.0.1/
curl http://127.0.0.1/health
```

For production, after DNS points at the VM and certbot has issued certs:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --webroot -w /var/www/html -d covid.readiness.in
sudo cp /opt/workplace-readiness/app/config/nginx/workplace-readiness.production.https.conf \
  /etc/nginx/sites-available/workplace-readiness
sudo nginx -t
sudo systemctl reload nginx
```

Certbot installs an official systemd timer on Ubuntu. Confirm it is present:

```bash
systemctl list-timers | grep certbot
```

Expected shape:

```text
certbot.timer                  certbot.service
```

Test renewal without changing the active certificate:

```bash
sudo certbot renew --dry-run
```

Then:

```bash
curl https://covid.readiness.in/health
```

Production cutover needs:

- DNS for `covid.readiness.in` points to the new VM.
- AWS security group allows inbound TCP `80` and `443`.
- Production reCAPTCHA site key and secret are available and allow
  `covid.readiness.in`.
- Gmail/app-password credentials are available if production email should be
  enabled.
- `HTTP_ORIGIN` is set to `https://covid.readiness.in`.
- `RECAPTCHA_ENABLED` and `EMAIL_ENABLED` are explicitly set for production.
- The restored MongoDB counts match the captured backup before cutover.

## 11. Pull-Based Deploy

The deploy script is intentionally boring:

```bash
/opt/workplace-readiness/app/scripts/deploy_vm.sh
```

It runs:

```bash
git fetch
git reset --hard origin/<branch>
uv sync --locked
systemctl restart workplace-readiness
```

Use a different branch:

```bash
BRANCH=<branch-name> /opt/workplace-readiness/app/scripts/deploy_vm.sh
```

## 12. Useful Operations

View app logs:

```bash
sudo journalctl -u workplace-readiness -f
```

Restart app:

```bash
sudo systemctl restart workplace-readiness
```

Check the deployed environment values without printing secrets:

```bash
sudo grep -E 'HTTP_ORIGIN|RECAPTCHA_ENABLED|EMAIL_ENABLED|DB_JSON|DB_FEEDBACK|MONGO_URI|STATIC_ROOT' \
  /etc/workplace-readiness/workplace-readiness.env
```

Collect VM version details for the deployment notes:

```bash
lsb_release -a
uname -a
nginx -v
uv --version
/opt/workplace-readiness/app/.venv/bin/python --version
/opt/workplace-readiness/app/.venv/bin/gunicorn --version
mongod --version
mongorestore --version
git -C /opt/workplace-readiness/app rev-parse --abbrev-ref HEAD
git -C /opt/workplace-readiness/app rev-parse --short HEAD
```

Check nginx:

```bash
sudo nginx -t
sudo systemctl status nginx --no-pager
```

Check Mongo:

```bash
sudo systemctl status mongod --no-pager
```

## Notes To Update During Deployment

- Confirm Ubuntu version.
- Confirm whether MongoDB is local or external.
- Confirm installed `uv` path.
- Confirm DNS and TLS/certbot steps.

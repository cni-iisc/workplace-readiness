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

The staging deployment used during handoff is:

- staging domain: `wp-readiness-staging.artpark.ai`
- staging mode: HTTPS, reCAPTCHA disabled, email disabled
- production domain: `covid.readiness.in`

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
git checkout modernize-maintainable-flask
```

After the PR is merged, switch the branch in `scripts/deploy_vm.sh` or run it
with `BRANCH=master`.

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

For staging at `wp-readiness-staging.artpark.ai`, use:

```dotenv
SENDER_EMAIL="readiness.in@gmail.com"
SENDER_PASSWORD="<secret-or-empty>"
CAPTCHA_PRIVATE=""
RECAPTCHA_SITE_KEY=""
DB_JSON="production_db"
DB_FEEDBACK="production_fb_db"
HTTP_ORIGIN="https://wp-readiness-staging.artpark.ai"
MONGO_URI="mongodb://localhost:27017"
STATIC_ROOT="/opt/workplace-readiness/app/web_files"
RECAPTCHA_ENABLED="false"
EMAIL_ENABLED="false"
ADMIN_EMAIL=""
REPORT_RECIPIENTS=""
```

The staging config disables reCAPTCHA in both the backend and frontend, and
disables email so session creation does not depend on Gmail SMTP. This avoids
failures from the production reCAPTCHA site key being restricted to
`covid.readiness.in` and keeps staging safe for test submissions.

Do not commit this file.

## 7. Restore MongoDB Data

Copy the verified backup tarball to the VM, for example:

```bash
scp covid_readiness_backup_20260706_082648.tar.gz \
  ubuntu@<server>:/var/backups/workplace-readiness/
```

On the VM:

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
uv sync --frozen
```

Sanity check:

```bash
uv run pytest
uv run ruff check .
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

The checked-in nginx configs are split by environment:

- `config/nginx/workplace-readiness.staging.http.conf`
- `config/nginx/workplace-readiness.production.http.conf`
- `config/nginx/workplace-readiness.production.https.conf`

Start with an HTTP config. Do not install an HTTPS config until the certificate
files exist.

For staging:

```bash
sudo cp /opt/workplace-readiness/app/config/nginx/workplace-readiness.staging.http.conf \
  /etc/nginx/sites-available/workplace-readiness
sudo ln -sfn /etc/nginx/sites-available/workplace-readiness \
  /etc/nginx/sites-enabled/workplace-readiness
sudo nginx -t
sudo systemctl reload nginx
```

After DNS points at the VM, issue a staging certificate:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d wp-readiness-staging.artpark.ai
sudo nginx -t
sudo systemctl reload nginx
```

When prompted by Certbot, choose the redirect-to-HTTPS option.

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

For staging:

```bash
curl -I https://wp-readiness-staging.artpark.ai/
curl https://wp-readiness-staging.artpark.ai/health
```

Staging validation checklist:

- The homepage loads over HTTPS.
- A new session can be created without reCAPTCHA.
- The generated submission ID appears in the form.
- Inputs can be saved against the submission ID.
- A saved submission ID can be retrieved.
- A score can be calculated.
- No errors appear in `sudo journalctl -u workplace-readiness -n 80 --no-pager`.

For production, after DNS points at the VM and certbot has issued certs:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --webroot -w /var/www/html -d covid.readiness.in
sudo cp /opt/workplace-readiness/app/config/nginx/workplace-readiness.production.https.conf \
  /etc/nginx/sites-available/workplace-readiness
sudo nginx -t
sudo systemctl reload nginx
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
uv sync --frozen
systemctl restart workplace-readiness
```

Use a different branch:

```bash
BRANCH=master /opt/workplace-readiness/app/scripts/deploy_vm.sh
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
- Confirm final branch name after merge.

---
title: Phishing Campaign with GoPhish
description: Phishing Campaign with GoPhish
date: 2024-04-04
---

# [WIP] Phishing Campaign with GoPhish

## Objective

Quick reference document on how spin a GoPhish server with a reverse proxy handling getting the certificate.



## Requirements

**Packages**

- unzip
- screen

## TLDR



```bash
cd /srv
curl -o gophish.zip -L https://github.com/gophish/gophish/releases/download/v0.12.1/gophish-v0.12.1-linux-64bit.zip
unzip gophish.zip
```

Replace **localhost** with the VPS IP.

```json
 "phish_server": {
                "listen_url": "localhost:8000",
```



**Sending Profiles**

- SendGrid -> smtp.sendgrid.net:587 -> apikey:<API_KEY>

**Email Templates**

https://docs.getgophish.com/user-guide/template-reference



## Configuration

Download the latest binary at https://github.com/gophish/gophish/releases

Configuration that I used for my last campaign

```json
# /srv/config.json
{
        "admin_server": {
                "listen_url": "127.0.0.1:3333",
                "use_tls": true,
                "cert_path": "gophish_admin.crt",
                "key_path": "gophish_admin.key",
                "trusted_origins": []
        },
        "phish_server": {
                "listen_url": "localhost:8000",
                "use_tls": false,
                "cert_path": "example.crt",
                "key_path": "example.key"
        },
        "db_name": "sqlite3",
        "db_path": "gophish.db",
        "migrations_prefix": "db/db_",
        "contact_address": "",
        "logging": {
                "filename": "",
                "level": ""
        }
}
```

Create the Systemd service

```bash
$ systemctl edit --force --full gophish
```

```ini
# /etc/systemd/system/gophish.service
[Unit]
Name=gophish

[Service]
Type=Simple
ExecStart=/srv/gophish
WorkingDirectory=/srv/
```

I used Caddy as a reverse proxy. Caddy also fetched a TLS certificate  from Let's Encrypt automatically.

```nginx
# /etc/caddy/Caddyfile
:80 {
	respond 418
}

# HTTP to HTTPS redirect
http://<fqdn> {
        redir https://<fqdn>
}

https://<fqdn> {
        # $ caddy hash-password
    	# phish:Passw0rd!
        #basicauth {
        #       phish $2a$14$dNgUtsrrgtMFq18WGMxL3eySH9EZSHo95M4rZCNkWcg3SEebtGvh2
        #}
        reverse_proxy {
                to localhost:8000
        }
}
```







# Evilgophish!

https://github.com/kgretzky/gophish/

https://github.com/kgretzky/evilginx2





## Evilginx

### TLDR

For a typical O365 scenario, if `example.com` is your base domaine.

On launch ->

- `config domain example.com`
- `config ipv4 external <external_ip>`

**Lures**

Configure `path`, `phishlet`, and `redirect_url` only.

Given past campaigns:

- `lures create o365`
- `lures edit 0 path /login`
- `lures edit 0 redirect_url https://example.com/postphish`

/postphish may be a simple page to let the user know it was a phishing campaign.

**Phishlets**

Set the hostname to match the base domain

- `phishlets hostname o365 example.com`
- 

https://github.com/axllent/mailpit

**Tracking pixel 1x1 white**

```bash
base64 -d <<< "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAD0lEQVR4AQEEAPv/AP///wX+Av5JZm4rAAAAAElFTkSuQmCC" > pixel.png
```

https://www.optiv.com/insights/source-zero/blog/spear-phishing-modern-platforms

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



Use the "all providers" list to deny Cloud IPs

https://github.com/rezmoss/cloud-provider-ip-addresses



## Nginx example

```bash
#/etc/nginx/conf.d/vhost.conf
server {

    listen 80;
    listen [::]:80;
    server_name www.REDACTED.ca REDACTED.ca;

    location / {
        return 301 https://$host$request_uri;
    }

}

map $query_string $valid_param_found {
    default 0;
    "~(?:^|&)[A-Za-z0-9]{1,4}=[A-Za-z0-9\-]{104}(?:&|$)" 1;
}

map $uri $is_static_asset {
    default 0;
    "~*\.(css|js|woff|woff2|ttf|eot|otf|ico|png|jpg|jpeg|gif|svg|webp|map)$" 1;
}

server {

    listen 443 ssl;
    listen [::]:443 ssl;

    server_name www.REDACTED.ca REDACTED.ca;
    ssl_certificate /etc/letsencrypt/live/REDACTED.ca/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/REDACTED.ca/privkey.pem;

    access_log /var/log/nginx/REDACTED_access.log;
    error_log /var/log/nginx/REDACTED_error.log;

    auth_basic "Login";
    auth_basic_user_file /etc/nginx/.htpasswd;

    add_header Strict-Transport-Security "max-age=63072000" always;
    
    root /var/www/html;

    location ~ /.* {
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_ssl_name $host;
            proxy_ssl_server_name on;
            proxy_ssl_verify off;
            proxy_read_timeout 90;


        if ($is_static_asset = 1) {
            #return 410;
            proxy_pass https://10.157.134.9$request_uri;
            break;
        }

        if ($valid_param_found = 1) {
            #return 411;
            proxy_pass https://10.157.134.9$request_uri;
            break;
        }

        return 418;

    }

    location ^~ /fr/customer/ {
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_ssl_name $host;
            proxy_ssl_server_name on;
            proxy_ssl_verify off;
            proxy_read_timeout 90;
            proxy_pass https://10.157.134.9$request_uri;
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

## Nftables configuration

Configuration file at /etc/nftables.conf

```bash
#!/usr/sbin/nft -f

flush ruleset

table inet filter {
    chain input {
        type filter hook input priority 0; policy drop;

        # Allow established/related connections
        ct state established,related accept

        # Allow loopback
        iif lo accept

        # Allow ping (icmp + icmpv6)
        ip  protocol icmp   accept
        ip6 nexthdr  icmpv6 accept

        # Allow specific TCP ports
        tcp dport { 22, 25, 80, 443 } accept
        #tcp dport { 22 } accept

        # Drop invalid packets
        ct state invalid drop
    }

    chain forward {
        type filter hook forward priority 0; policy drop;
    }

    chain output {
        type filter hook output priority 0; policy accept;
    }
}

```



## Mailpit



https://github.com/axllent/mailpit

systemd unit

```ini
# /etc/systemd/system/mailpit.service
[Unit]
Description=Mailpit server

[Service]
ExecStart=/usr/local/bin/mailpit -d /srv/mailpit/mailpit.db  --smtp-allowed-recipients '.*@REDACTED.ca'
Restart=always
# Restart service after 10 seconds if service crashes
RestartSec=10
#SyslogIdentifier=mailpit
User=mailpit
Group=mailpit

[Install]
WantedBy=multi-user.target

```

Add a port forward from host to incus container

```bash
incus config device add mailpit port-25 proxy listen=tcp:0.0.0.0:25 connect=tcp:127.0.0.1:1025
```


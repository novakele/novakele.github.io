---
title: TLS Wrapper on SSH
description: Wrap SSH in TLS to bypass protocol restriction
date: 2026-01-16
---

```
# /etc/nginx/nginx.conf

stream {
    tcp_nodelay on;
    resolver 8.8.8.8;
    resolver_timeout 5 s;


    upstream ssh_proxy {
        server localhost:22;
    }
    
    map $ssl_server_name $hostname_ssh {
         ssh.breakme.ca ssh_proxy;
    }

    server {
        listen 443 ssl;

        ssl_certificate /etc/nginx/tls/ssh_cert.pem;
        ssl_certificate_key /etc/nginx/tls/ssh_key.pem;
        ssl_preread on;

        proxy_ssl off;
        proxy_pass $hostname_ssh;

    }
}
```

```
Host ssh.breakme.ca
     ProxyCommand openssl s_client -quiet -servername ssh.breakme.ca -connect ssh.breakme.ca:443
     User root
     IdentityFile ~/.ssh/id_ed25519
```

```
frontend https
     mode tcp
     # le fichier .pem doit contenir le cert et la clef priv
     bind *:443 ssl alpn h2 strict-sni crt /etc/haproxy/ssh.breakme.ca.pem

     tcp-request inspect-delay 5s
     tcp-request content accept if { req_ssl_hello_type 1 }
     # remplacer ssh.breakme.ca par ton domaine
     use_backend ssh0 if { ssl_fc_sni ssh.breakme.ca }

 backend ssh0
     mode tcp
     server ssh0 localhost:22
```


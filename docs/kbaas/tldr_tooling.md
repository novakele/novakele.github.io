---
atitle: TL;DR Tooling
description: Quick reference for tools
date: 2023-08-07
---

# TL;DR Tooling

## Objective

Provide a quick reference for running dayly and not-so-common tools.

## Tooling

### Active Directory Certificate Authority (ADCS)

**ESC8 fuzzer**

https://gist.githubusercontent.com/zblurx/99fe1971562593fd1211931bdc979fbb/raw/6e18ba3b0694303d6eca3fda8505cf800ef83540/esc8fuzzer.py



### Apache

Boilerplate for reverse HTTP proxy
```apache
<virtualhost *:80>

    ServerName <SERVER NAME>

    ErrorLog ${APACHE_LOG_DIR}/${SERVER_NAME}.error.log
    CustomLog ${APACHE_LOG_DIR}/${SERVER_NAME}.access.log combined

    ProxyPass /  http://localhost:8080/ nocanon
    ProxyPassReverse /  http://localhost:8080/
    ProxyRequests Off
    AllowEncodedSlashes NoDecode
</virtualhost>
```

### AWS

Session Manager CLI plugin

```bash
$ aws ssm start-session --profile $PROFILE --target $INSTANCE_ID
```

### Caddy



HTTP reverse proxy

```ini
http://rss.incus {
	reverse_proxy 127.0.0.1:7070
}
```

### Certipy

```bash
export KRB5CCNAME=/root/username.ccache
certipy-ad find -u username@domain.tld -p 'password' -k
```





### Cisco VoIP (Should write this as an article)



Get the CUCM info -> https://github.com/trustedsec/SeeYouCM-Thief -> unauth userenum -> password spray

Get the TFTP Server info -> download the config file -> could be free creds

```bash
# tftp IP
tftp> get SPDefault.cnf.xml
tftp> get SEP<MAC>.cnf.xml
```



- http://CUCM_IP:6970/ConfigFileCacheList.txt
- http://CUCM_IP:6970/SEP[MAC].cnf.xml.sgn
- ciscophones.tgz

Check for the following keywords:

- user
- pass
- profile
- cred



**Nested `xargs` to fetch configuration files on multiple CUCM**

```bash
xargs -a hosts/cucm.list -I{} bash -c "xargs -a hosts/phones.list -I [] curl --connect-timeout 0.5 http://{}:6970/[].cnf.xml.sgn -o []_{}.cnf.xml.sgn
```



**Quick script to pull configuration files from multiple CUCM**

Try each CUCM as they might not all be reachable.

```bash
#!/usr/bin/env bash

#set -ex

phone="${1}"

if [[ -z "${phone}" ]]
then
    echo "missing phone http[s]://IP as first argument"
fi


config_page="/CGI/Java/Serviceability?adapter=device.statistics.configuration"




content=$(curl --connect-timeout 10 -k "${phone}/CGI/Java/Serviceability?adapter=device.statistics.configuration" 2>/dev/null)

if [[ -z "${content}" ]]
then
    echo -e "[!] Failed to pull configuration page content\n Try increasing the timeout"
    exit 1
fi

echo "[+] Got device configuration page"

device=$(grep -Eo -m1 'SEP[0-9A-Fa-f]{1,20}' <<< ${content})

if [[ -z "${device}" ]]
then
    echo "[!] Failed to extract device name from configuration page"
    exit 1
fi

echo "[+] Got device name from configuration page"


mapfile -t cucm_ips < <(grep -oE 'Unified CM.*Information' <<< ${content} | grep -oE '([0-9]{1,3}.){3}[0-9]{1,3}')

if [[ ${#cucm_ips[@]} -eq 0 ]]
then
    echo "[!] Failed to obtain at least 1 CUCM IP address"
    exit 1
fi

echo "[+] Got ${#cucm_ips[@]} CUCM IP(s)"


ext1=".cnf.xml"
ext2=".cnf.xml.sgn"
default1="SPDefault"
default2="ConfigFileCacheList.txt"


mkdir -pv ./tmp

for cucm in "${cucm_ips[@]}"; do
    filename1="${cucm}_${device}${ext1}" # SEPDEADBEEF.cnf.xml
    filename2="${cucm}_${device}${ext2}" # SEPDEADBEEF.cnf.xml.sgn

    defaultfile1="${cucm}_${default1}${ext1}" # SEPDefault.cnf.xml
    defaultfile2="${cucm}_${default1}${ext2}" # SEPDefault.cnf.xml.sgn

    defaultfile3="${cucm}_${default2}" # ConfigFileCacheList.txt
    defaultfile4="${cucm}_${default2}.sgn" # ConfigFileCacheList.txt.sgn


    curl -k --connect-timeout 10 "http://${cucm}:6970/${device}${ext1}" -o "./tmp/${filename1}" 2>/dev/null
    if [[ -f "./tmp/${filename1}" && ! -s "./tmp/${filename1}" ]]
    then
        rm "./tmp/${filename1}"
    else
        echo "[+] Pulled ./tmp/${filename1}"
    fi

    curl -k --connect-timeout 10 "http://${cucm}:6970/${device}${ext2}" -o "./tmp/${filename2}" 2>/dev/null
    if [[ -f "./tmp/${filename2}" && ! -s "./tmp/${filename2}" ]]
    then
        rm "./tmp/${filename2}"
    else
        echo "[+] Pulled "./tmp/${filename2}""
    fi


    curl -k --connect-timeout 10 "http://${cucm}:6970/${default1}${ext1}" -o "./tmp/${defaultfile1}" 2>/dev/null
    if [[ -f "./tmp/${defaultfile1}" && ! -s "./tmp/${defaultfile1}" ]]
    then
        rm "./tmp/${defaultfile1}"
    else
        echo "[+] Pulled "./tmp/${defaultfile1}""
    fi

    curl -k --connect-timeout 10 "http://${cucm}:6970/${default1}${ext2}" -o "./tmp/${defaultfile2}" 2>/dev/null
    if [[ -f "./tmp/${defaultfile2}" && ! -s "./tmp/${defaultfile2}" ]]
    then
        rm "./tmp/${defaultfile2}"
    else
        echo "[+] Pulled "./tmp/${defaultfile2}""
    fi

    curl -k --connect-timeout 10 "http://${cucm}:6970/$default2" -o "./tmp/${defaultfile3}" 2>/dev/null
    if [[ -f "./tmp/${defaultfile3}" && ! -s "./tmp/${defaultfile3}" ]]
    then
        rm "./tmp/${defaultfile3}" 
    else
        echo "[+] Pulled "./tmp/${defaultfile3}" "
    fi
    curl -k --connect-timeout 10 "http://${cucm}:6970/$default2.sgn" -o "./tmp/${defaultfile4}" 2>/dev/null
    if [[ -f "./tmp/${defaultfile4}" && ! -s "./tmp/${defaultfile4}" ]]
    then
        rm "./tmp/${defaultfile4}"
    else
        echo "[+] Pulled "./tmp/${defaultfile4}""
    fi

done

```

**Parsing Configuration files**

```bash
find . -type f -name 'SP*.cnf.xml' -exec xq --raw-output '.serviceProfile.Directory | .DN + ":" + .Password' "{}" \;
```





**References:**

- https://www.cisco.com/c/en/us/support/docs/unified-communications/unified-communications-manager-callmanager/200408-Retrieve-Phone-Configuration-File-from-T.html
- https://trustedsec.com/blog/seeyoucm-thief-exploiting-common-misconfigurations-in-cisco-phone-systems
- https://github.com/trustedsec/SeeYouCM-Thief/
- https://www.uccollabing.com/how-to-download-list-of-sep-cnf-xml-files-in-cucm/



### Database

#### Postgresql

**create admin user**

```postgresql
CREATE USER ladmin WITH ENCRYPTED PASSWORD '1318f5f7b9f0bb3375de191e4457fbb237028fca9a9c47ab0fd841dd681012da';
ALTER USER ladmin WITH SUPERUSER;
```

**Create new DB and provide all privileges to a user**

```postgresql
CREATE DATABASE zitadel;
CREATE USER zitadel WITH ENCRYPTED PASSWORD '1895b32fa94cedbbd1414bc40f35addae9aa9fe8f5fa2cdd0db668a7ec264eb9';
GRANT ALL PRIVILEGES on DATABASE zitadel to zitadel;
```

**Show all DBs**

```postgresql
\l
```cra

**Show all users and their privileges**

```postgresql
\du
```

**Allow network connection**

```bash
# /etc/postgresql/17/main/pg_hba.conf
host    zitadel zitadel 10.1.194.0/24   scram-sha-256
host    all     ladmin  0.0.0.0/0       scram-sha-256
```

### Dig

**Finding Domain Controllers**

```bash
# LDAP
dig +noall +answer any _ldap._tcp.dc._msdcs.example.com

Kerberos
dig +noall +answer any _kerberos._tcp.example.com
```

### Desktop shortcuts (rofi drun)

- ~/.local/share/applications/vscode-kbaas.desktop
- /usr/share/appplications/vscode-kbass.desktop

```ini
[Desktop Entry]
Type=Application
Name=KBaaS (blog)
Comment=Open novakele.github.io/docs/kbaas in VS Code over SSH
Exec=/usr/bin/code --folder-uri vscode-remote://ssh-remote+blog/var/www/novakele.github.io/docs/kbaas/
Icon=code
Terminal=false
Categories=Development;
StartupWMClass=Code
```

```ini
[Desktop Entry]
Version=1.0
Type=Application
Name=RDP to QA.incus
Comment=Remote Desktop connection to qa.incus
Exec=/usr/bin/xfreerdp3 /v:"qa.incus" /u:admin /dynamic-resolution /p:changeme /drive:share,/home/luser/Documents/mandates/rdp_share /sec:tls /cert:ignore /log-level:off
Terminal=false
Categories=Utility;Development;

```


### Git

Clone a repo with a specific SSH key

```bash
$ git clone --config core.sshCommand='ssh -i ~/.ssh/<ssh_private_key>' git@<git_server>:<git repo>
```

### Google Cloup Platform (GCP)

**Query the metadata endpoint**

```bash
curl -s http://metadata.google.internal/computeMetadata/v1/?recursive=true

curl "http://metadata.google.internal/computeMetadata/v1/instance/image" -H "Metadata-Flavor: Google"
```



**Get the credentials for the account running the compute instance**

```bash
curl -s -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token
```



### Impacket

Check the state of RDP sessions

```shell
$ getTGT.py -hashes 'NT hash' <domain>/<user>
$ KRB5CCNAME=<ccache> atexec.py -k <fqdn> qwinsta
```

Enable RestrictedAdmin for PTH RDP

```bash
$ impacket-reg -k -no-pass <domain>/<user>@<host>  add -keyName 'HKLM\System\CurrentControlSet\Control\Lsa' -v 'DisableRestrictedAdmin' -vd 1 -vt REG_DWORD
```

**getTGT**

```bash
impacket-getTGT domain.tld/username:'password'
# make sure that DNS is working
```

### Incus

#### Quick install

```bash
$ curl -fsSL https://pkgs.zabbly.com/get/incus-stable | sudo sh
$ apt-get --install-recommends install curl python3 xorriso spice-client-gtk
```



#### Share a folder with a container

```bash
$ incus config device add <instance_name> <device_name> disk source=<path_on_host> path=<path_in_instance>
```

#### Blog init

```yaml
config:
  raw.idmap: both 1000 0
  user.user-data: |
    #cloud-config
    package_update: true
    packages:
      - vim
      - curl
      - git
      - screen
    runcmd:
      - mkdir -pv /etc/vim
      - curl -o /etc/vim/vimrc.local https://raw.githubusercontent.com/amix/vimrc/master/vimrcs/basic.vim
      - echo 'alias ll="ls -l"' >> /root/.bashrc
      - curl -Lo /root/nvm_install.sh https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh
      - bash /root/nvm_install.sh
      - nvm install node --lts
description: blog profile
devices:
  eth0:
    network: incusbr0
    type: nic
  gosecure:
    path: /blog
    source: /home/luser/personnal/novakele.github.io
    type: disk
  root:
    path: /
    pool: default
    type: disk
name: blog
used_by:
- /1.0/instances/blog
project: default
```

```bash
$ cd /blog
$ npm run docs:build
```

#### Windows VM with TPM

```yaml
config:
  limits.cpu: "4"
  limits.memory: 4GiB
  security.secureboot: "false"
description: Windows profile (4 vcpu, 4G RAM, no secureboot, tpm)
devices:
  eth0:
    name: eth0
    network: incusbr0
    type: nic
  root:
    path: /
    pool: default
    type: disk
  vtpm:
    path: /dev/tpm0
    type: tpm
name: windows
project: default

```

#### Pentest profile

```yaml
config:
  raw.idmap: |-
    uid 1000 0
    gid 1000 0
  user.user-data: |
    #cloud-config
    package_update: true
    packages:
      - vim
      - curl
      - git
      - screen
    runcmd:
      - mkdir -pv /etc/vim
      - curl -o /etc/vim/vimrc.local https://raw.githubusercontent.com/amix/vimrc/master/vimrcs/basic.vim
      - echo 'alias ll="ls -l"' >> /root/.bashrc
      - mkdir -pv /root/.nxc
      - echo 'W254Y10Kd29ya3NwYWNlID0gZGVmYXVsdApsYXN0X3VzZWRfZGIgPSBzbWIKcHduM2RfbGFiZWwgPSBhZG1pbmlzdHJhdG9yX3ByaXZpbGVnZXMKYXVkaXRfbW9kZSA9ICoKcmV2ZWFsX2NoYXJzX29mX3B3ZCA9IDAKbG9nX21vZGUgPSBUcnVlCmlnbm9yZV9vcHNlYyA9IFRydWUKaG9zdF9pbmZvX2NvbG9ycyA9IFsiZ3JlZW4iLCAicmVkIiwgInllbGxvdyIsICJjeWFuIl0KCltCbG9vZEhvdW5kXQpiaF9lbmFibGVkID0gRmFsc2UKYmhfdXJpID0gMTI3LjAuMC4xCmJoX3BvcnQgPSA3Njg3CmJoX3VzZXIgPSBuZW80agpiaF9wYXNzID0gbmVvNGoKCltFbXBpcmVdCmFwaV9ob3N0ID0gMTI3LjAuMC4xCmFwaV9wb3J0ID0gMTMzNwp1c2VybmFtZSA9IGVtcGlyZWFkbWluCnBhc3N3b3JkID0gcGFzc3dvcmQxMjMKCltNZXRhc3Bsb2l0XQpycGNfaG9zdCA9IDEyNy4wLjAuMQpycGNfcG9ydCA9IDU1NTUyCnBhc3N3b3JkID0gYWJjMTIzCgo=' | base64 -d > /root/.nxc/nxc.conf
description: pentest
devices:
  eth0:
    network: incusbr0
    type: nic
  gosecure:
    path: /work
    source: /home/luser/work
    type: disk
  root:
    path: /
    pool: default
    type: disk
name: gosecure
project: default

```

#### Adding DNS records to a network

```bash
$ incus network edit incusbr0
```

```yaml
config:
  raw.dnsmasq: |
    srv-host=_VLMCS._tcp.incus,kms.incus,1688,0,5

```

#### Create L2 profile for Responder

```bash
# incus profile device add ${profile_name} ${name_of_the_nic_inside_container} nic nictype=macvlan parent=${physical_lan_nic}
$ incus profile device add l2 eth0 nic nictype=macvlan parent=eno1
```

#### Pass USB device to VM or Container

```bash
incus config device add <VM/Container name> <arbitrary name> usb vendorid=05ac productid=1209
```

#### Add a port forward (expose port on the host  to a container)

```bash
incus config device add ebook port-5000 proxy listen=tcp:192.0.2.250:5000 connect=tcp:127.0.0.1:5000
incus config device remove ebook port-5000
```

#### Share Wayland socket with container for eazy copy/paste
```yaml
config:
  raw.idmap: |-
    uid 1000 0
    gid 1000 0
  user.user-data: |
    #cloud-config
    package_update: true
    packages:
      - curl
      - unzip
      - git
      - screen
      - vim
      - wl-clipboard
    runcmd:
      - mkdir -pv /etc/vim
      - curl -o /etc/vim/vimrc.local https://raw.githubusercontent.com/amix/vimrc/master/vimrcs/basic.vim
      - echo 'alias ll="ls -l"' >> /root/.bashrc
      - echo 'PROMPT_COMMAND="history -a;history -r;echo"' >> /root/.bashrc
      - /usr/bin/bash -c "cd /tmp/;curl -L https://github.com/homeport/termshot/releases/download/v0.6.1/termshot_0.6.1_linux_amd64.tar.gz --silent | tar xz;mv termshot /usr/sbin"
      - bash -c "base64 -d <<< 'ZnVuY3Rpb24gLHNjcmVlbnNob3QoKSB7CiAgICBsb2NhbCBydW5uaW5nX2NvbW1hbmQ9IiR7QH0iCiAgICBsb2NhbCBzb2Z0d2FyZT0iJHtydW5uaW5nX2NvbW1hbmQlJSAqfSIKICAgIGxvY2FsIG91dHB1dGZpbGU9IiR7c29mdHdhcmV9XyQoZGF0ZSArJyVZLSVtLSVkXyVILSVNLSVTJykucG5nIgogICAgL3Vzci9zYmluL3Rlcm1zaG90IC1jIC1DIDEyMCAtLW5vLWRlY29yYXRpb24gLS1uby1zaGFkb3cgLXMgLWYgIiR7b3V0cHV0ZmlsZX0iICIke3J1bm5pbmdfY29tbWFuZH0iCiAgICB3bC1jb3B5IDwgIiR7b3V0cHV0ZmlsZX0iCiAgICAjeGNsaXAgLXNlbGVjdGlvbiBjbGlwYm9hcmQgLXQgaW1hZ2UvcG5nIC1pICIke291dHB1dGZpbGV9IgoKCn0KCmZ1bmN0aW9uICxzY3JlZW5zaG90X2xvZ3MoKSB7CiAgICBsb2NhbCBydW5uaW5nX2NvbW1hbmQ9IiR7QH0iCiAgICBsb2NhbCBzb2Z0d2FyZT0iJHtydW5uaW5nX2NvbW1hbmQlJSAqfSIKICAgIGxvY2FsIG91dHB1dGZpbGU9IiR7c29mdHdhcmV9XyQoZGF0ZSArJyVZLSVtLSVkXyVILSVNLSVTJykucG5nIgogICAgL3Vzci9zYmluL3Rlcm1zaG90IC1DIDEyMCAtLW5vLWRlY29yYXRpb24gLS1uby1zaGFkb3cgLXMgLWYgIiR7b3V0cHV0ZmlsZX0iIC0tICIke3J1bm5pbmdfY29tbWFuZH0iCiAgICB3bC1jb3B5IDwgIiR7b3V0cHV0ZmlsZX0iCiAgICAjeGNsaXAgLXNlbGVjdGlvbiBjbGlwYm9hcmQgLXQgaW1hZ2UvcG5nIC1pICIke291dHB1dGZpbGV9IgoKCn0KCg==' | tee -a /root/.bashrc"
      - echo "export XDG_RUNTIME_DIR=/run" >> /root/.bashrc
      - echo "export WAYLAND_DISPLAY=wayland-1" >> /root/.bashrc
description: Wayland socket sharing and termshot config
devices:
  eth0:
    name: eth0
    network: incusbr0
    type: nic
  root:
    path: /
    pool: default
    type: disk
  wayland:
    bind: instance
    connect: unix:/run/user/1000/wayland-1
    gid: "1000"
    listen: unix:/run/wayland-1
    mode: "0660"
    type: proxy
    uid: "1000"
name: screenshot
used_by:
  - /1.0/instances/testytototo
project: default

```

#### Building an image from an ISO

```bash
incus storage volume import default ~/Downloads/ubuntu-18.04.6-live-server-amd64.iso ubuntu-iso-volume --type=iso
incus init ubuntu-iso-vm --empty --vm -c limits.cpu=4 -c limits.memory=8GiB -d root,size=50GiB
incus config device add ubuntu-iso-vm iso-volume disk pool=default source=ubuntu-iso-volume boot.priority=10
incus start ubuntu-iso-vm
incus config device add ubuntu-iso-vm agent disk source=agent:config
$ sudo mount /dev/cdrom /mnt
$ bash /mnt/install.sh

incus publish ubuntu-iso-vm
incus image alias create ubuntu1804 'image hash'
```




### Manual Windows Reconnaissance

> Most of these are really bad OPSEC

List remote shares

```cmd
net view \\<FQDN || IP>
```

Spawn process as domain user on non domain computer

```cmd
runas /user:<user>@<domain> /netonly <process>
```

### Markdown

https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts

> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.


### NetExec

#### Query JSON output of spider_plus for partial string match
```
jq '.[] | keys | to_entries[] | select(.value | test("config";"i"))' nxc/spider_plus/*.json
```


#### LDAP query to look for Computers created with Pre-Windows 2000

```bash
netexec ldap <DC_IP> -u <user> -p <pass> --query '(&(objectClass=computer)(userAccountControl=4128)(logonCount=0))' 'cn'
```

https://github.com/garrettfoster13/pre2k

### NFS

When you need to change euid et egid on the fly, use `setpriv`. 
Check Ippsec "Fries": https://www.youtube.com/watch?v=GZf2Dj6pb0I&t=33s
```bash
setpriv --reuid=1000 --regid=1000 --clear-groups
```

### NGINX

**Get snakeoil certificates**

```
apt install ssl-cert

# /etc/ssl/certs/ssl-cert-snakeoil.pem
# /etc/ssl/private/ssl-cert-snakeoil.key
```



**Packages to install for phishing campaign**

- libnginx-mod-http-js
- nginx-full
- certbot
- apache2-utils
- ssl-cert # for snakepol



**Default nginx.conf**

Sane defaults provided by Mozilla TLS generator.

I added the default behavior to return HTTP 418 if there is no matching `server_name`.

Additional `server` block should be added in `/etc/nginx/conf.d/`

```bash
sudo openssl dhparam -out /etc/nginx/dhparam 4096
```





```
user www-data;
worker_processes auto;
worker_cpu_affinity auto;
pid /run/nginx.pid;
error_log /var/log/nginx/error.log;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 768;
    # multi_accept on;
}



http {

	log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    sendfile on;
    tcp_nopush on;
    types_hash_max_size 2048;
    server_tokens off; # Recommended practice is to turn this off
    
    client_max_body_size 1024M;

    server_names_hash_bucket_size 64;
    server_name_in_redirect off;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    access_log /var/log/nginx/access.log main;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ecdh_curve X25519:prime256v1:secp384r1;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:DHE-RSA-CHACHA20-POLY1305;
    ssl_prefer_server_ciphers off;

    ssl_session_timeout 1d;
    ssl_session_cache shared:MozSSL:10m;  # about 40000 sessions

    # curl https://ssl-config.mozilla.org/ffdhe2048.txt -o /etc/nginx/dhparam
    ssl_dhparam "/etc/nginx/dhparam";


    resolver 127.0.0.1;

    gzip on;

    include /etc/nginx/conf.d/*.conf;


    # default matching HTTP
    server {
        listen 80 default_server;
        listen [::]:80 default_server;
        server_name _;

        return 418;

    }
    
    
    # default matching HTTPS
    server {
        listen 443 ssl default_server;
        listen [::]:443 ssl default_server;
        ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;
        ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;

        # HSTS (ngx_http_headers_module is required) (63072000 seconds)
        add_header Strict-Transport-Security "max-age=63072000" always;

        return 418;
    }

}

```



**Boilerplate for vhost**



```
#/etc/nginx/conf.d/vhost.conf
server {

    listen 80;
    listen [::]:80;
    server_name VHOST;

    location / {
        return 301 https://$host$request_uri;
    }

}

server {

    listen 443 ssl;
    listen [::]:443 ssl;

    server_name VHOST;
    ssl_certificate /etc/letsencrypt/live/VHOST/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/VHOST/privkey.pem;

    access_log /var/log/nginx/VHOST_access.log;
    error_log /var/log/nginx/VHOST_error.log;

    #auth_basic "Login";
    #auth_basic_user_file /etc/nginx/.htpasswd;

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

        proxy_pass http://localhost$request_uri;
    }
 }
```



### Nmap

**Private IP ranges gateway scan**

```
# ./possible /24 gateways
10.0-255.0-255.1
172.16-31.0-255.1
192.168.0-255.1
```

```bash
nmap -iL ./gateways.list -sn -oA ./nmap/possible_gateways --min-rate 10000
```

**Best ports to find Windows hosts**



### NodeJS

When developing a Caido plugin, you need `pnpm` and `nvm`

```bash
nvm install 20 --lts
pnpm create @caido-community/plugin
```



### O365

- Download the fat clients @ [My account](https://portal.office.com/account/?ref=Harmony)

- Admin Panel https://admin.microsoft.com/

**Find all Sharepoint Sites with dork**

```
contentclass:STS_Site
```




### OpenSSL

**Generate secure strings for passwords**

```bash
openssl rand -hex 32
```

**Generate self-signed certificates for local services**

```bash
openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:P-521 -out ./tls.key
openssl req -new -key tls.key -out tls.csr
openssl x509 -req -days 3650 -in tls.csr -signkey tls.key -out tls.crt

```

### Ping Castle

#### Running the binary from a non-domain joined computer

```powershell
runas /user:user@domain.tld /netonly cmd.exe
PingCastle.exe

```

### PowerShell

#### Disable AV and Security tools

```powershell
# Define the script to run with admin privileges
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    throw "Script must be run as Administrator."
}

Write-Host "Starting Windows Hardening/Disabling Script..." -ForegroundColor Cyan

# 1. Microsoft Defender (Microsoft Security Center)
Write-Host "Configuring Microsoft Defender..." -ForegroundColor Yellow
$defenderPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows Defender"
$mpPath = "HKLM:\SOFTWARE\Microsoft\Windows Defender"

# Ensure Policy Key Exists
New-Item -Path $defenderPath -Force | Out-Null

# Disable Tamper Protection (Prevents Defender from re-enabling itself)
Set-ItemProperty -Path $defenderPath -Name "TamperProtection" -Value "Off" -Type String

# Disable Real-Time Protection
Set-MpPreference -DisableRealtimeMonitoring $true

# Disable Cloud-Delivered Protection
Set-MpPreference -DisableCloudProtection $true

# Disable Automatic Sample Submission
Set-MpPreference -SubmitSamplesConsent DONT_SUBMIT

# Disable Behavioral Monitoring
Set-MpPreference -EnableControlledFolderAccess Disabled

# Disable Scan On Access
Set-MpPreference -EnableScanOnAccess $false

# Disable Map Scanning
Set-MpPreference -DisableMapScanning $true

# Disable Archive Scanning
Set-MpPreference -DisableArchiveScanning $true

# Disable IO Protection
Set-MpPreference -EnableIOProtection $false

# Disable Network Inspection System
Set-MpPreference -EnableNetworkInspectionSystem $false

# Disable Potential Quality Issues
Set-MpPreference -PUAProtection Disabled

# Add Exclusions for C:\ and \\tsclient
# Note: Excluding the root drive C:\ is aggressive and may interfere with system files if not careful, 
# but for a dev/test image, this ensures no background scanning.
Write-Host "Adding Exclusions..." -ForegroundColor Yellow
# Clear existing exclusions to avoid duplicates on re-run
Remove-ItemProperty -Path $mpPath -Name "ExclusionPaths" -ErrorAction SilentlyContinue
Remove-ItemProperty -Path $mpPath -Name "ExclusionPaths" -ErrorAction SilentlyContinue

# Set Exclusions
# \\tsclient is the UNC path for RDP drives, but for local mapping, we usually exclude the mapped drive letters.
# However, the user specifically asked for \\tsclient. 
# We will add C:\ and \\tsclient\* (wildcard for contents)
Set-MpPreference -ExclusionPath "C:\", "\\tsclient\*"

# Verify Exclusions
$exclusions = Get-MpPreference | Select-Object -ExpandProperty ExclusionPaths
Write-Host "Current Exclusions: $($exclusions -join ', ')" -ForegroundColor Green

# 2. Windows Defender Application Control (WDAC)
Write-Host "Disabling WDAC..." -ForegroundColor Yellow
# Remove any existing WDAC policies
Remove-Item -Path "HKLM:\SYSTEM\CurrentControlSet\Control\CodeIntegrity" -Recurse -Force -ErrorAction SilentlyContinue

# 3. Credential Guard & HVCI (Memory Integrity)
Write-Host "Disabling Credential Guard and HVCI..." -ForegroundColor Yellow
$deviceGuardPath = "HKLM:\SYSTEM\CurrentControlSet\Control\DeviceGuard"
New-Item -Path $deviceGuardPath -Force | Out-Null

# Disable VBS
Set-ItemProperty -Path $deviceGuardPath -Name "EnableVirtualizationBasedSecurity" -Value 0 -Type DWord
# Disable HVCI
Set-ItemProperty -Path $deviceGuardPath -Name "HVCISupportType" -Value 0 -Type DWord
# Disable Credential Guard
Set-ItemProperty -Path $deviceGuardPath -Name "CredentialGuardEnabled" -Value 0 -Type DWord

# 4. Windows Firewall
Write-Host "Disabling Windows Firewall..." -ForegroundColor Yellow
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False

# 5. Windows Update
Write-Host "Disabling Windows Update..." -ForegroundColor Yellow
$wuPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate"
New-Item -Path $wuPath -Force | Out-Null
Set-ItemProperty -Path $wuPath -Name "SetDisableWUAccess" -Value 1 -Type DWord
Set-ItemProperty -Path $wuPath -Name "ExcludeWUDriversInQualityUpdate" -Value 1 -Type DWord

# Disable Automatic Updates via AU
$auPath = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\WindowsUpdate\Auto Update"
New-Item -Path $auPath -Force | Out-Null
Set-ItemProperty -Path $auPath -Name "AUOptions" -Value 1 -Type DWord # 1 = Never check

# 6. Telemetry & Diagnostics
Write-Host "Disabling Telemetry..." -ForegroundColor Yellow
$telemetryPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection"
New-Item -Path $telemetryPath -Force | Out-Null
Set-ItemProperty -Path $telemetryPath -Name "AllowTelemetry" -Value 1 -Type DWord # 1 = Security

# Disable Activity Feed
$systemPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\System"
New-Item -Path $systemPath -Force | Out-Null
Set-ItemProperty -Path $systemPath -Name "EnableActivityFeed" -Value 0 -Type DWord
Set-ItemProperty -Path $systemPath -Name "PublishUserActivities" -Value 0 -Type DWord
Set-ItemProperty -Path $systemPath -Name "UploadUserActivities" -Value 0 -Type DWord

# Disable App Diagnostics
$appDiagnosticsPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\AppDiagnostics"
New-Item -Path $appDiagnosticsPath -Force | Out-Null
Set-ItemProperty -Path $appDiagnosticsPath -Name "State" -Value 0 -Type DWord

# 7. SmartScreen (All Browsers/Explorer)
Write-Host "Disabling SmartScreen..." -ForegroundColor Yellow
$smartScreenPaths = @(
    "HKLM:\SOFTWARE\Policies\Microsoft\Windows\System",
    "HKLM:\SOFTWARE\Policies\Microsoft\Edge",
    "HKLM:\SOFTWARE\Policies\Microsoft\Internet Explorer\Main",
    "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer"
)

# System-wide SmartScreen
New-Item -Path $smartScreenPaths[0] -Force | Out-Null
Set-ItemProperty -Path $smartScreenPaths[0] -Name "EnableSmartScreen" -Value 0 -Type DWord

# Edge
New-Item -Path $smartScreenPaths[1] -Force | Out-Null
Set-ItemProperty -Path $smartScreenPaths[1] -Name "SmartScreenEnabled" -Value "Off" -Type String

# Internet Explorer
New-Item -Path $smartScreenPaths[2] -Force | Out-Null
Set-ItemProperty -Path $smartScreenPaths[2] -Name "SmartScreenEnabled" -Value "Off" -Type String

# Explorer
New-Item -Path $smartScreenPaths[3] -Force | Out-Null
Set-ItemProperty -Path $smartScreenPaths[3] -Name "SmartScreenEnabled" -Value "Off" -Type String

# 8. Fast Startup & Hibernation
Write-Host "Disabling Fast Startup and Hibernation..." -ForegroundColor Yellow
powercfg /h off
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Power" -Name "HibernateEnabled" -Value 0 -Type DWord

# 9. Windows Error Reporting
Write-Host "Disabling Windows Error Reporting..." -ForegroundColor Yellow
$werPath = "HKLM:\SOFTWARE\Microsoft\Windows\Windows Error Reporting"
New-Item -Path $werPath -Force | Out-Null
Set-ItemProperty -Path $werPath -Name "Disabled" -Value 1 -Type DWord

# 10. Disable User Account Control (Optional, but often desired in dev VMs)
Write-Host "Configuring UAC..." -ForegroundColor Yellow
$uacPath = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System"
Set-ItemProperty -Path $uacPath -Name "EnableLUA" -Value 0 -Type DWord
Set-ItemProperty -Path $uacPath -Name "ConsentPromptBehaviorAdmin" -Value 0 -Type DWord
Set-ItemProperty -Path $uacPath -Name "ConsentPromptBehaviorUser" -Value 0 -Type DWord
Set-ItemProperty -Path $uacPath -Name "EnableUIA" -Value 0 -Type DWord

# 11. Disable Windows Defender SmartScreen for Microsoft Store
$storePath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\CurrentVersion\WindowsUpdate"
Set-ItemProperty -Path $storePath -Name "SmartScreenEnabled" -Value "Off" -Type String -ErrorAction SilentlyContinue

# 12. Disable Windows Defender SmartScreen for Microsoft Edge (All Channels)
$edgeChannels = @("Edge", "Edge Dev", "Edge Beta", "Edge Insiders")
foreach ($channel in $edgeChannels) {
    $path = "HKLM:\SOFTWARE\Policies\Microsoft\$channel"
    New-Item -Path $path -Force | Out-Null
    Set-ItemProperty -Path $path -Name "SmartScreenEnabled" -Value "Off" -Type String
}

# 13. Disable Windows Defender SmartScreen for Microsoft Edge (All Users)
$edgeUsers = @("HKLM:\SOFTWARE\Policies\Microsoft\Edge", "HKCU:\Software\Microsoft\Edge")
foreach ($path in $edgeUsers) {
    New-Item -Path $path -Force | Out-Null
    Set-ItemProperty -Path $path -Name "SmartScreenEnabled" -Value "Off" -Type String
}

# 14. Disable Windows Defender SmartScreen for Microsoft Edge (All Machines)
$edgeMachines = @("HKLM:\SOFTWARE\Policies\Microsoft\Edge", "HKLM:\SOFTWARE\WOW6432Node\Policies\Microsoft\Edge")
foreach ($path in $edgeMachines) {
    New-Item -Path $path -Force | Out-Null
    Set-ItemProperty -Path $path -Name "SmartScreenEnabled" -Value "Off" -Type String
}

# 15. Disable Windows Defender SmartScreen for Microsoft Edge (All Profiles)
$edgeProfiles = @("HKCU:\Software\Microsoft\Edge", "HKCU:\Software\Classes\Software\Microsoft\Edge")
foreach ($path in $edgeProfiles) {
    New-Item -Path $path -Force | Out-Null
    Set-ItemProperty -Path $path -Name "SmartScreenEnabled" -Value "Off" -Type String
}

# 16. Disable Windows Defender SmartScreen for Microsoft Edge (All Devices)
$edgeDevices = @("HKLM:\SOFTWARE\Policies\Microsoft\Edge", "HKLM:\SOFTWARE\WOW6432Node\Policies\Microsoft\Edge")
foreach ($path in $edgeDevices) {
    New-Item -Path $path -Force | Out-Null
    Set-ItemProperty -Path $path -Name "SmartScreenEnabled" -Value "Off" -Type String
}

# 17. Disable Windows Defender SmartScreen for Microsoft Edge (All Browsers)
$edgeBrowsers = @("HKLM:\SOFTWARE\Policies\Microsoft\Edge", "HKLM:\SOFTWARE\WOW6432Node\Policies\Microsoft\Edge")
foreach ($path in $edgeBrowsers) {
    New-Item -Path $path -Force | Out-Null
    Set-ItemProperty -Path $path -Name "SmartScreenEnabled" -Value "Off" -Type String
}

# 18. Disable Windows Defender SmartScreen for Microsoft Edge (All Users/Machines/Profiles/Devices/Browsers)
$edgeAll = @("HKLM:\SOFTWARE\Policies\Microsoft\Edge", "HKLM:\SOFTWARE\WOW6432Node\Policies\Microsoft\Edge", "HKCU:\Software\Microsoft\Edge", "HKCU:\Software\Classes\Software\Microsoft\Edge")
foreach ($path in $edgeAll) {
    New-Item -Path $path -Force | Out-Null
    Set-ItemProperty -Path $path -Name "SmartScreenEnabled" -Value "Off" -Type String
}

Write-Host "Script completed. Reboot the VM to apply changes." -ForegroundColor Green
Write-Host "Note: Some changes (like Tamper Protection) require a reboot to fully take effect." -ForegroundColor Yellow
```


### Rubeus

Load TGT from NT || AES256 hash

> Useful when trying to use built-in Windows tools

```cmd
Rubeus.exe asktgt /rc4:<NT hash> /user:<user> /domain:<domain> /ptt
Rubeus.exe asktgt /aes256:<aes256-cts-hmac-sha1-96> /user:<user> /domain:<domain> /ptt
```

Load ticket from Kirbi file (ccache converted to kirbi)

```cmd
.\Rubeus.exe ptt /ticket:"C:\Users\admin\Desktop\ticket.kirbi"
```

Kerberoasting # Useful when there are Kerberoast errors with impacket or Rubeus `ptt`

```
.\Rubeus.exe kerberoast /outfile:kerberoast.txt /domain:DOMAIN /creduser:'DOMAIN\USER' /credpassword:'PASSWORD'
```





**Finding Active Directory controllers**

```bash
dig _ldap._tcp.dc._msdcs.EXAMPLE.COM -t any
dig _ldap._tcp.dc._msdcs.EXAMPLE.COM -t srv
dig _kerberos._tcp.EXAMPLE.COM -t any
```


### Screen

Bring back the **ctrl+a** behavior. 
Rebinds command prefix of `screen` from **ctrl+a** to **ctrl+`**
```
# ~/.screenrc
escape ``
```


### SSH

#### Common SSH block options

```
host *
	addkeystoagent yes
    ControlMaster auto
    # Make sure to create the control directory
    # mkdir -pv ~/.ssh/control
    ControlPath ~/.ssh/control/%h_%p_%r
    ControlPersist 10m
	
host reverse
	forwardagent yes

host engagement
        proxyjump jump
        port 40219
        identityfile ~/.ssh/main
        userknownhostsfile /dev/null
        user user@domain.tld
        hostname localhost
        ServerAliveCountMax 99
        ServerAliveInterval 0
        TCPKeepAlive no
        RemoteForward 9000
        dynamicforward 1338
        # bad idea
        StrictHostKeyChecking no
        TunnelDevice 1337:1337
        Tunnel point-to-point
        remoteforward localhost:2222 192.0.2.250:2222
        LocalForward 192.0.2.250:8998 127.0.0.1:8998

```

#### ~/.ssh/authorized_keys

https://manpages.debian.org/unstable/openssh-server/authorized_keys.5.en.html

```bash
 ,
#expiry-time="20250822",no-pty,port-forwarding,permitlisten="localhost:3389",command="/usr/sbin/nologin" ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGe0Ryfm9hgYoCb9tJxKOEuYrVlBHh8o3dYUHbMWUD6o
```

#### Bad way of bulk checking callbacks

```bash
ss -tulpn | grep 127.0.0.1 | awk '{print $5}' | cut -d ':' -f2 | sort -uV | tail -n 14 | xargs -I{} bash -c "ssh localhost -oStrictHostKeyChecking=no -ouserknownhostsfile=/dev/null -p {} 'ip -br a | grep '10.10.1' && echo {}' || echo no"
```

#### ssh-agent on Sway (Wayland)

```
systemctl edit --full --force ssh-agent --user
```


```
# /home/luser/.config/systemd/user/ssh-agent.service
[Unit]
ConditionEnvironment=!SSH_AGENT_PID
Description=OpenSSH key agent
Documentation=man:ssh-agent(1) man:ssh-add(1) man:ssh(1)

[Service]
Environment=SSH_AUTH_SOCK=%t/ssh-agent.socket
ExecStart=/usr/bin/ssh-agent -D -a ${SSH_AUTH_SOCK}
SuccessExitStatus=2
Type=simple

[Install]
WantedBy=default.target

```

Add to `~/.bashrc`
```
export SSH_AUTH_SOCK="${XDG_RUNTIME_DIR}/ssh-agent.socket"
```





### Systemd

#### Run command at boot
Using bloodhound CE CLI, start it on boot (it runs in an Incus container)

```ini
# /etc/systemd/system/bloodhound.service
[Unit]
Description=Run Bloodhound
After=network.target

[Service]
Type=oneshot
ExecStart=/root/bloodhound-cli up
RemainAfterExit=yes
Environment=HOME=/root

[Install]
WantedBy=multi-user.target

```



#### networkd

Adding route blocks based off a list of networks

```bash
xargs -a networks/possible_gateways.list -I{} echo -e "[Route]\nGateway=192.0.2.254\nDestination={}\n" | tee -a /etc/systemd/network/ssh_ptp.network
```



### TMUX

<= 2.0

```
setw -g mode-mouse on
set -g mouse-select-pane on
set -g mouse-resize-pane on
set -g mouse-select-window off
```

=> 2.1

```
set-option -g mouse on
```

Reload configuration file

```
CTRL-a source ~/.tmux.conf
```

### User management

Create a group
```shell
$ sudo groupadd <name>
```

Create a system user
```shell
$ sudo useradd -c "system user" --gid <name> --no-create-home --no-user-group -s /usr/sbin/nologin --system
```

### Windows
#### Packet Forward

```powershell
PS> Get-NetIPInterface | select ifIndex,InterfaceAlias,AddressFamily,ConnectionState,Forwarding | Sort-Object -Property IfIndex | Format-Table
PS> Set-NetIPInterface -ifindex <required interface index from table> -Forwarding Enabled
# Set-NetIPInterface -Forwarding Enabled

PS> Set-Service RemoteAccess -StartupType Automatic; Start-Service RemoteAccess

```

#### Edge preset annoying stuff
```powershell
# Define the Edge Policy Path
$edgePolicyPath = "HKLM:\SOFTWARE\Policies\Microsoft\Edge"
New-Item -Path $edgePolicyPath -Force | Out-Null

# 1. Skip First Run Experience (FRE)
# This prevents the "Welcome to Edge" screen and account sign-in prompt
Set-ItemProperty -Path $edgePolicyPath -Name "FirstRunExperienceEnabled" -Value 0 -Type DWord

# 2. Set Default Search Engine (Optional: Prevents search engine selection screen)
# Sets Bing as default (Value 1), Google (2), etc. Or use "SearchEngineChoice" for specific URL
# For a clean dev image, Bing is standard, but you can set it to Google if preferred.
# 1 = Bing, 2 = Google, 3 = Yahoo, 4 = DuckDuckGo
Set-ItemProperty -Path $edgePolicyPath -Name "DefaultSearchProviderEnabled" -Value 1 -Type DWord
Set-ItemProperty -Path $edgePolicyPath -Name "DefaultSearchProvider" -Value "Bing" -Type String

# 3. Disable "Make Edge Your Default Browser" Prompt
# This prevents the nag screen asking to set Edge as default
Set-ItemProperty -Path $edgePolicyPath -Name "DefaultBrowserPromptEnabled" -Value 0 -Type DWord

# 4. Disable "Join Microsoft 365" / Work/School Account Join Prompt
# Prevents the "Connect to your organization" screen
Set-ItemProperty -Path $edgePolicyPath -Name "SignoutWithWindows" -Value 0 -Type DWord
Set-ItemProperty -Path $edgePolicyPath -Name "CloudPolicyDataSyncEnabled" -Value 0 -Type DWord

# 5. Set Start Page (Optional: Prevents "Choose your start page" screen)
# Sets the new tab page to a specific URL or default
# "default" = Edge's default new tab page
# "about:blank" = Blank page
# "https://example.com" = Custom URL
Set-ItemProperty -Path $edgePolicyPath -Name "HomepageList" -Value '["default"]' -Type String

# 6. Disable "Restore Pages" Prompt
# Prevents the "Restore your tabs?" prompt on launch
Set-ItemProperty -Path $edgePolicyPath -Name "SessionRestoreEnabled" -Value 0 -Type DWord

# 7. Disable "What's New" Popups
Set-ItemProperty -Path $edgePolicyPath -Name "WhatsNewEnabled" -Value 0 -Type DWord

# 8. Disable "Tip of the Day"
Set-ItemProperty -Path $edgePolicyPath -Name "TipsEnabled" -Value 0 -Type DWord

# 9. Disable "Sync" Prompt
# Prevents the "Keep your items synced" prompt
Set-ItemProperty -Path $edgePolicyPath -Name "SyncDisabled" -Value 1 -Type DWord

# 10. Disable "Profile Selection" (If using multiple profiles)
# Forces a single default profile
Set-ItemProperty -Path $edgePolicyPath -Name "ProfileMarkup" -Value 'Default' -Type String

Write-Host "Edge First-Run Experience settings applied." -ForegroundColor Green
```

#### RDP

Connect to a AAD joined PC with a AAD account:

`AzureAD\username@domain.tld`

### WSL2

**Build a custom kernel**

Check the official instructions at https://github.com/microsoft/WSL2-Linux-Kernel.git.

Here is a TL;DR

```bash
$ sudo apt install build-essential flex bison dwarves libssl-dev libelf-dev cpio qemu-utils curl wget vim git python3 bc
$ git clone https://github.com/microsoft/WSL2-Linux-Kernel.git
$ cd WSL2-Linux-Kernel/
$ make -j $(nproc) KCONFIG_CONFIG=Microsoft/config-wsl && make INSTALL_MOD_PATH="$PWD/modules" modules_install
$ sudo bash ./Microsoft/scripts/gen_modules_vhdx.sh "$PWD/modules" $(make -s kernelrelease) modules.vhdx
$ mkdir /mnt/c/wsl
$ cp vmlinux /mnt/c/wsl/
$ sudo ./Microsoft/scripts/gen_modules_vhdx.sh "$PWD/modules" $(make -s kernelrelease) modules.vhdx
$ cp modules.vhdx /mnt/c/wsl/
$ cat << EOF | sudo tee /etc/modules-load.d/incus.conf
kvm
vhost-net
bridge
tun
tpm
EOF

```

**Global Configuration %USERPROFILE/.wslconfig%**

```ini
[wsl2]
networkingMode=mirrored
kernel=c:\\wsl\vmlinux
kernelModule=c:\\wsl\modules.vhdx # requires version 2.5+

```

### xinetd

Simple TCP forward

```bash 
$ cat /etc/xinetd.d/smb 
service smdb_forward
{
    disable         = no
    type            = UNLISTED
    socket_type     = stream
    protocol        = tcp
    user            = nobody
    wait            = no
    redirect        = 10.55.141.26 445
    port            = 445
}
```

### yt-dlp

**for music**
```bash
yt-dlp -x --audio-format mp3 --download-archive archive.txt -o "%(playlist_index)s - %(title)s.%(ext)s" "URL"
```

### ~/.bashrc

#### Check if a string is in PATH if not, add it
```bash
HOME_BIN="/home/luser/bin"
[[ ":$PATH:" != *":$HOME_BIN:"* ]] && export PATH="$PATH:$HOME_BIN"
```

#### Enable logging and save command history at runtime

```
# Configure `history` to have timestamps in ISO8601 format
HISTTIMEFORMAT="%FT%T "
# append each command to ~/.bash_history when executed
PROMPT_COMMAND="history -a; history -r; echo"

# Add new line before command prompt for cleaner screen captures (GH issue #42)
PS1="${PS1::-3}\n\$ "

# Logging toggle
export LOGGING_ENABLED=1

# Log all commands per interactive session
if [[ $- == *i* ]] && [[ -z "$SCRIPT_LOGGED" ]] && [[ "$LOGGING_ENABLED" == "1" ]]; then
    export SCRIPT_LOGGED=1
    LOGFILE="$HOME/bash_logs/$(date +%F_%H-%M).log"
    mkdir -p "$HOME/bash_logs"
    exec script -q -f -a "$LOGFILE"
fi

# Log all screen
if [[ "$LOGGING_ENABLED" == "1" ]]; then
  alias screen='/usr/bin/screen -L -Logfile $HOME/bash_logs/screen_$(date +%F_%H-%M-%S).log'
fi

```

#### Terminal screen captures on Sway/Wayland

```bash
function ,screenshot() {
    local running_command="${@}"
    local software="${running_command%% *}"
    local outputfile="${software}_$(date +'%Y-%m-%d_%H-%M-%S').png"
    /usr/sbin/termshot -c -C 120 --no-decoration --no-shadow -s -f "${outputfile}" "${running_command}"
    wl-copy < "${outputfile}"
    #xclip -selection clipboard -t image/png -i "${outputfile}"


}

# Generates a screenshot of a text file
# Usage ",screenshot_logs cat icmp_scan.nmap"
function ,screenshot_logs() {
    local running_command="${@}"
    local software="${running_command%% *}"
    local outputfile="${software}_$(date +'%Y-%m-%d_%H-%M-%S').png"
    /usr/sbin/termshot -C 120 --no-decoration --no-shadow -s -f "${outputfile}" -- "${running_command}"
    wl-copy < "${outputfile}"
    #xclip -selection clipboard -t image/png -i "${outputfile}"
}

```
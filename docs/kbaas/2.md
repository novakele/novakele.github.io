---
title: Samba share with sane defaults
description: Samba share with sane defaults
date: 2022-09-29
---

# Samba share with sane defaults

## Objective
Provide a quick configuration for a network share using Samba with sane defaults.

## Configuration

### smbd

In my use case, the share is used to share a folder from my host to certain containers. This is why the service is restricted to only listen on **incusbr0** and it only accepts connections from the network range associated with Incus (**10.157.204.0/24**).

```ini
# /etc/samba/smb.conf
[global]

bind interfaces only = yes
interfaces = incusbr0

server role = standalone
netbios name = C4504EX
workgroup = WORKGROUP
server string = Samba Server

security = user

server min protocol = SMB2
null passwords = No
client signing = required
client protection = default
server signing = mandatory
server smb encrypt = required
client ipc signing = required

log file = /var/log/samba/%m

[KBaaS]
    comment = KBaaS
    path = /home/user/kbaas
    read only = no
    browsable = yes
    valid users = user
    hosts allow = 10.157.204.0/24
```

If your host system did not include a systemd-unit to run the service, here is one.
```ini
# /etc/systemd/system/smbd.service
[Unit]
Description=Samba SMB Daemon
Documentation=man:smbd(8) man:samba(7) man:smb.conf(5)
Wants=network-online.target
After=network.target network-online.target nmbd.service winbind.service

[Service]
Type=notify
PIDFile=/run/samba/smbd.pid
LimitNOFILE=16384
EnvironmentFile=-/etc/conf.d/samba
ExecStart=/usr/sbin/smbd --foreground --no-process-group $SMBDOPTIONS
ExecReload=/bin/kill -HUP $MAINPID
LimitCORE=infinity

[Install]
WantedBy=multi-user.target
```

> The service file can be created with `sudo systemctl edit --force --full smbd.service`

### Windows client

The one downside of the above configuration is that hosts running Windows 10 and older required additionnal configuration to handle SMB signing.

The following registry keys solve this.
```powershell
reg add "HKLM\System\CurrentControlSet\services\LanmanServer\Parameters" /v "RequireSecuritySignature" /t REG_DWORD /d 1 /f
reg add "HKLM\System\CurrentControlSet\services\LanmanServer\Parameters" /v "EnableSecuritySignature" /t REG_DWORD /d 1 /f
reg add "HKLM\System\CurrentControlSet\services\LanManWorkstation\Parameters" /v "RequireSecuritySignature" /t REG_DWORD /d 1 /f
reg add "HKLM\System\CurrentControlSet\services\LanManWorkstation\Parameters" /v "EnableSecuritySignature" /t REG_DWORD /d 1 /f
```

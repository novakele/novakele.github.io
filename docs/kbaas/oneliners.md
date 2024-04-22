---
title: One-liners
description: One-liners
date: 2022-06-21
---

# One-liners

## Objective

One stop shop for all the one-liners that I find useful, but have to used a search engine every time.

### Remove leading and trailing white spaces

```shell
$ awk '{$1=$1};1' <file>
```

### Make dig use /etc/resolv.conf

```shell
$ dig +search +noall +answer <fqdn>
```

### Find Active Directory domain controllers by querying DNS server for LDAP SRV record

```shell
$ dig +search +noall +answer -t SRV _ldap._tcp.dc._msdcs.<domain>
```

### Generate systemd-networkd route blocks for /32

> Given a list of unique IPs.

```shell
xargs -a <IPs.list> -I{} echo -e "[Route]\nGateway=192.0.2.254\nDestination={}/32\n"
```

### Create a port forward to Incus container

```bash
$ incus config device add CONTAINER_NAME DEVICE_NAME proxy listen=tcp:HOST_IP:HOST_PORT connect=tcp:CONTAINER_IP:CONTAINER_PORT
```

The following example is used to expose a rogue pyRDP service running in a container to the host LAN

```bash
$ incus config device add pyrdp pyrdp-3389 proxy listen=tcp:0.0.0.0:3389 connect=tcp:0.0.0.0:3389
```

### Generate SSH key without a passphrase

> The same command works on Windows also

```shell
$ ssh-keygen -t ed25519 -f ./unprotected -q -N '""'
```

### SCP file to a host in an non-interactive shell

```powershell
PS > scp -o StrictHostKeyChecking=no -i <ssh private key> -P <remote port> <path to file> <username>@<fqdn>:[remote path]
```

### Map share drive through Remote Desktop session

```shell 
/usr/bin/xfreerdp /v:<host> /u:<username> /dynamic-resolution /p:<password> /drive:<share name>,<local share path> /sec:[tls,nla]
```

### Handle Microsoft Defender

```powershell
PS > Add-MpPreference -ExclusionPath 'C:\' 
PS > Add-MpPreference -ExclusionPath '\\tsclient\'
PS > Set-MpPreference -DisableRealtimeMonitoring $true
```

### Get SoftPerfect Network Scanner

Commands to execute one line at a time

```powershell
PS > $tmp = New-TemporaryFile | Rename-Item -NewName { $_ -replace 'tmp$', 'zip' } -PassThru
PS > (New-Object Net.WebClient).DownloadFile("https://www.softperfect.com/download/files/netscan_portable.zip",$tmp.FullName)
PS > $tmp | Expand-Archive -DestinationPath . -Force
PS > remove-item $tmp

PS > https://www.softperfect.com/download/files/netscan_portable.zip
PS > Expand-Archive -Path Draftv2.zip -DestinationPath C:\Reference
```

One liner

```powershell
PS > $tmp = New-TemporaryFile | Rename-Item -NewName { $_ -replace 'tmp$', 'zip' } -PassThru; (New-Object Net.WebClient).DownloadFile('https://www.softperfect.com/download/files/netscan_portable.zip',$tmp); $tmp | Expand-Archive -DestinationPath . -Force; remove-item $tmp
```

Encode the one liner

```powershell
PS > $command = "$tmp = New-TemporaryFile | Rename-Item -NewName { $_ -replace 'tmp$', 'zip' } -PassThru;(New-Object Net.WebClient).DownloadFile('https://www.softperfect.com/download/files/netscan_portable.zip',$tmp);$tmp | Expand-Archive -DestinationPath . -Force;remove-item $tmp"
PS > $bytes = [System.Text.Encoding]::Unicode.GetBytes($command)
PS > $encodedCommand = [Convert]::ToBase64String($bytes)
```




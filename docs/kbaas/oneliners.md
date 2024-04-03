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




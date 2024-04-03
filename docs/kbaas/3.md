---
title: Dummy interface to share resources
description: Dummy interface to share resources
date: 2023-05-28
---

# Dummy interface to share resources

## Objective
The goal of the dummy interface is to bind services to it instead of local host. Bound services will be available from other resources on the host; such as container or VM.

## Configuration

The creation and the configuration of the dummy interface can be accomplished with systemd-networkd.

Start by creating the dummy interface, which we'll call **jump0**.

```ini
# /etc/systemd/networkd/jumpbox.netdev
[NetDev]
Name=jump0
Kind=dummy
```

Then, configure and IP address and disable IPv6 link-local.

```ini
# /etc/systemd/networkd/jumpbox.network
[Match]
Name=jump0

[Address]
DHCP=none
Address=192.0.2.250/30

[Network]
LinkLocalAddressing=ipv4
```

The most common way that I use this interface is when I'm local fowarding ports with `ssh`.
```ssh-config
# ~/.ssh/config
host jump
    hostname HOST
    port PORT
    User USER
    LocalForward 192.0.2.250:LOCAL_PORT REMOTE_IP:REMOTE_PORT
    SessionType none
```

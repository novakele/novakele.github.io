---
title: Dnsmasq for penetration testing
description: Dnsmasq for penetration testing
date: 2024-04-24
---
# [WIP] Dnsmasq for penetration testing

## Objective

Provide information on how to use dnsmasq for penetration tester. 

The bellow configuration will allow split DNS resolution.

## Configuration

```
# /etc/dnsmasq.conf
except-interface=incusbr0
bind-interfaces
listen-address=127.0.0.1,192.0.2.250

#default upstream resolver
server=94.140.14.14
server=94.140.15.15

server=/incus/10.55.141.1
server=/141.55.10.in-addr.arpa/10.55.141.1

server=/int.breakme.ca/192.168.0.1
server=/0.168.192.in-addr.arpa/192.168.0.1

address=/pwndoc.int.breakme.ca/192.0.2.250

```


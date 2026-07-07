---
title: Running AI with Incus
description: Isolate AI tools using Incus. Creating network and DNS zones
date: 2026-06-10
---

## Objective

Avoid running AI tools on the host. I also want to further isolate the tools in a dedicated network with ACLs and DNS zone.

## Configuration

**Incus network**

```bash
incus network create aibr0  ipv4.address=198.18.0.1/24 ipv4.nat=true ipv6.address=none ipv6.nat=false
incus network set aibr0 dns.domain=ai.incus

incus network create agentbr0 ipv4.address=198.18.1.1/24 ipv4.nat=true ipv6.address=none ipv6.nat=false
incus network set agentbr0 dns.domain=agent.ai.incus
```

**Create the ACLs to limit the traffic**

```bash
incus network acl create egress-deny-local-networks
incus network acl edit egress-deny-local-networks
```

```yaml
# egress-deny-local-networks
name: egress-deny-local-networks
description: ""
egress:
  - action: reject
    destination: 10.0.0.0/8,172.16.0.0/12,192.168.0.0/16
    description: deny local egress
    state: enabled
  - action: reject
    destination: 169.254.0.0/16
    description: block link-local
    state: enabled
ingress: []
config: {}
used_by: []
project: default

```

```bash
incus network set agentbr0 security.acls="egress-deny-local-networks"
incus network set agentbr0 security.acls.default.egress.action=allow
incus network set agentbr0 security.acls.default.ingress.action=drop
```





**Split-DNS with dnsmasq**

``` bash
server=/ai.incus/198.18.0.1
server=/0.18.198.in-addr.arpa/198.18.0.1
server=/agent.ai.incus/198.18.1.1
server=/1.18.198.in-addr.arpa/198.18.1.1
```



## References

- https://weisser-zwerg.dev/posts/incus-codex-jail/

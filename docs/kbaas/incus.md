---
title: Incus configuration
description: My various Incus configuration
date: 2026-11-04
---

## Objective

Save somewhere all my configuration. It could help someone doing something similar.

## Configuration

### Oneliners

#### Set static IP address
```bash
incus config device override ai-proxy eth0 ipv4.address=10.46.184.68
```


### Profiles

The goal with these profiles is to allow combining them without conflicts. For example, `incus launch -p default -p ansible -p luser2root images:debian/13/cloud <name>` 

#### Ansible pull

```yaml
config:
  cloud-init.user-data: |
    #cloud-config
    package_update: true
    packages:
      - ansible-core
    runcmd:
      - /usr/bin/ansible-playbook -i localhost, /ansible/playbooks/baseline.yml
description: "Ansible pull baseline"
devices:
  ansible:
    path: /ansible
    readonly: "true"
    source: /home/luser/ansible
    type: disk
name: ansible

```

#### L2 bridge (Responder)

```yaml
config:
description: L2 bridge for Responder
devices:
  eth1:
    nictype: macvlan
    parent: enx0050b6f08797
    type: nic
name: l2

```

#### Map root to local user

```yaml
config:
  raw.idmap: both 1000 0
description: Map host uid/gid 1000 to container root
devices: {}
name: luser2root

```

#### Music

```bash
incus launch -p default -p ansible -p music -p luser2root images:debian/13/cloud music
```

```yaml
config:
description: Music
devices:
  music:
    path: /music
    source: /home/luser/Music
    type: disk
name: music

```


#### Wayland screenshots

```bash
incus launch -p default -p ansible -p screenshots images:debian/13/cloud <name>
```

```yaml
config:
description: Forward host Wayland socket for screenshots
devices:
  wayland:
    bind: instance
    connect: unix:/run/user/1000/wayland-1
    gid: "1000"
    listen: unix:/var/lib/wayland-1
    mode: "0660"
    type: proxy
    uid: "1000"
name: screenshot

```

#### SSH-Agent

```bash
incus launch -p default -p ansible -p screenshot -p ssh-agent images:debian/13/cloud <name>

```

```yaml
config:
description: Share ssh-agent socket with the container
devices:
  ssh-agent:
    bind: container
    connect: unix:/run/user/1000/ssh-agent.socket
    gid: "0"
    listen: unix:/var/lib/ssh-agent.sock
    mode: "0600"
    security.gid: "1000"
    security.uid: "1000"
    type: proxy
    uid: "0"
name: ssh-agent

```

#### Windows

```yaml
config:
  limits.cpu: "4"
  limits.memory: 4GiB
  security.secureboot: "false"
description: Windows profile (4 vcpu, 4G RAM, no secureboot, tpm)
devices:
  iso-agent:
    source: agent:config
    type: disk
  root:
    path: /
    pool: default
    size: 60GiB
    type: disk
  vtpm:
    path: /dev/tpm0
    type: tpm
name: windows

```
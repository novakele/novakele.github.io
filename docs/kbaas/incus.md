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


### Backup



```bash
#!/bin/bash
# /usr/local/sbin/incus-config-backup
set -euo pipefail
umask 077   # configs can contain secrets (cloud-init, OIDC, ACLs)

DEST=/etc/incus
STAGE=$(mktemp -d)
trap 'rm -rf "$STAGE"' EXIT

# dump <outfile> <cmd...>  : write command output to file, creating dirs
dump() { local out=$1; shift; mkdir -p "$(dirname "$out")"; "$@" > "$out"; }

# feat <project> <key> <default> : is a project feature enabled?
feat() { local v; v=$(incus project get "$1" "$2" 2>/dev/null || true); [ "${v:-$3}" = true ]; }

# ---------- server-wide ----------
S="$STAGE/server"
dump "$S/server.yaml" incus config show

# ---------- per project ----------
for project in $(incus project list -f csv -c n | sed 's/ (current)//'); do
    P="$STAGE/projects/$project"
    inc() { incus "$@" --project "$project"; }

    dump "$P/project.yaml" incus project show "$project"

    # Profiles (skip if the project shares the default project's profiles)
    if [ "$project" = default ] || feat "$project" features.profiles true; then
        for p in $(inc profile list -f csv -c n); do
            dump "$P/profiles/$p.yaml" inc profile show "$p"
        done
    fi

    # Instances (containers + VMs)
    for i in $(inc list -f csv -c n); do
        dump "$P/instances/$i.yaml" inc config show "$i"
    done

    # Image aliases
    if [ "$project" = default ] || feat "$project" features.images true; then
        dump "$P/image-aliases.yaml" inc image alias list -f yaml
    fi

    # Networks, ACLs, forwards, load balancers, peers
    if [ "$project" = default ] || feat "$project" features.networks false; then
        for n in $(inc network list -f csv -c nm | awk -F, '$2=="YES"{print $1}'); do
            dump "$P/networks/$n/network.yaml" inc network show "$n"

            for a in $(inc network forward list "$n" -f json 2>/dev/null | jq -r '.[].listen_address'); do
                dump "$P/networks/$n/forwards/$a.yaml" inc network forward show "$n" "$a"
            done
            for a in $(inc network load-balancer list "$n" -f json 2>/dev/null | jq -r '.[].listen_address'); do
                dump "$P/networks/$n/load-balancers/$a.yaml" inc network load-balancer show "$n" "$a"
            done
            for peer in $(inc network peer list "$n" -f json 2>/dev/null | jq -r '.[].name'); do
                dump "$P/networks/$n/peers/$peer.yaml" inc network peer show "$n" "$peer"
            done
        done

        for a in $(inc network acl list -f json | jq -r '.[].name'); do
            dump "$P/network-acls/$a.yaml" inc network acl show "$a"
        done
    fi

    # Network zones and their records
    if [ "$project" = default ] || feat "$project" features.networks.zones false; then
        for z in $(inc network zone list -f csv -c n); do
            dump "$P/network-zones/$z/zone.yaml" inc network zone show "$z"
            for r in $(inc network zone record list "$z" -f json 2>/dev/null | jq -r '.[].name'); do
                dump "$P/network-zones/$z/records/$r.yaml" inc network zone record show "$z" "$r"
            done
        done
    fi
done

# ---------- swap into place (removes files for deleted objects) ----------
mkdir -p "$DEST"
rm -rf "$DEST/server" "$DEST/projects"
cp -a "$STAGE/server" "$STAGE/projects" "$DEST/"

# Optional: commit now instead of waiting for etckeeper's own daily run
if command -v etckeeper >/dev/null; then
    etckeeper vcs add -A /etc/incus >/dev/null 2>&1 || true
    etckeeper commit "incus config backup" >/dev/null 2>&1 || true
fi
```

#### Timer

```ini
[Unit]
Description=Dump Incus profiles and instance configs to /etc/incus
After=incus.service

[Service]
Type=oneshot
ExecStart=/usr/local/sbin/incus-config-backup
```

#### Service
```ini
[Unit]
Description=Daily Incus config backup

[Timer]
OnCalendar=daily
RandomizedDelaySec=15m
Persistent=true

[Install]
WantedBy=timers.target
```
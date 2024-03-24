## One-liners

### Objective

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




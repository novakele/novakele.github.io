---
title: Port Forwarding with nftable
description: Using nftable to port forward (DNAT)
date: 2026-05-30
---

## Objective

Use nftable to forward TCP traffic to incus containers.

## Configuration

### Enable IP Forwarding
```bash
echo "net.ipv4.ip_forward = 1"|sudo tee /etc/sysctl.d/99-ipforward.conf
sudo sysctl -p /etc/sysctl.d/99-ipforward.conf
```

### Adding the tables and chains

**NAT**

```bash
nft add table nat
```
**NAT POSTROUTING**
```bash
nft 'add chain nat postrouting { type nat hook postrouting priority 100 ; }'
nft add rule nat postrouting masquerade
```

**NAT PREROUTING**
```bash
nft 'add chain nat prerouting { type nat hook prerouting priority -100; }'
```

### Adding DNAT rule
```bash
# nft 'add rule nat prerouting ip daddr IP_HOST_RUNNING_NFTABLE tcp dport { PORT_HOST_RUNNING_NFTABLE } dnat IP_DESTINATION_HOST:PORT_DESTINATION_HOST'
nft 'add rule nat prerouting ip daddr 10.186.71.179 tcp dport { 8001 } dnat 10.186.71.32:80'
nft 'add rule ip nat prerouting iifname "eth0" tcp dport 8001 dnat to 10.186.71.32:80'
```

### Saving the running-config
```bash
nft list ruleset | sudo tee /etc/nftables.conf
```

### Enable nftables at boot
```bash
systemctl enable --now nftables
```

## Configuration files
### [OPTIONAL] Whole config of DNAT
```
--# /etc/nftables.conf
flush ruleset

table ip nat {
	chain prerouting {
		type nat hook prerouting priority dstnat; policy accept;
		iifname "eth0" tcp dport 8001 dnat to 10.186.71.32:80
		ip daddr 10.186.71.179 tcp dport 8002 dnat to 10.186.71.43:80
	}
	
	chain postrouting {
		type nat hook postrouting priority srcnat; policy accept;
		masquerade
	}
}

```

### [OPTIONAL] Forwarding a whole interface

```
--# /etc/nftables.conf

table ip nat {
	chain prerouting {
		type nat hook prerouting priority dstnat; policy accept;
		iifname "eth0" dnat to 10.186.71.32
	}

	chain postrouting {
		type nat hook postrouting priority srcnat; policy accept;
		oifname "eth0" masquerade
	}
}

```

### [OPTIONAL] Sane firewall config with DNAT
```
--# /etc/nftables.conf
flush ruleset                                                                    
                                                                                
table ip firewall {
	chain inbound_ipv4 {
		icmp type echo-request limit rate 5/second burst 5 packets accept
	}

	chain prerouting {
		type nat hook prerouting priority dstnat; policy accept;
		iifname "eth0" tcp dport 8001 dnat to 10.186.71.32:80
	}

	chain postrouting {
		type nat hook postrouting priority srcnat; policy accept;
		masquerade
	}

	chain inbound {
		type filter hook input priority filter; policy drop;
		ct state vmap { invalid : drop, established : accept, related : accept }
		iifname "lo" accept
		meta protocol vmap { ip : jump inbound_ipv4 }
	}

	chain forward {
		type filter hook forward priority 100; policy drop;
		ct state { established, related } accept
		ip daddr 10.186.71.0/24 accept
	}
}
```

## Troubleshooting

### Show existing rule set
```bash
nft list ruleset
```

## Resources
- https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/7/html/security_guide/sec-configuring_port_forwarding_using_nftables
- https://jensd.be/343/linux/forward-a-tcp-port-to-another-ip-or-port-using-nat-with-iptables
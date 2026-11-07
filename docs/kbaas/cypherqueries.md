---
title: Cypher queries
description: Cypher queries
date: 2022-06-26
---

# Cypher queries

## Objective

Keeping all the custom cypher query that I use during Active Directory assessments in one place.

### Neo4j default creds for Bloodhound CE

neo4j:bloodhoundcommunityedition

### Find DA with SPN

```cypher
MATCH (u:User)-[:MemberOf]->(g:Group)
WHERE g.objectid ENDS
WITH '-512' AND u.hasspn
RETURN u.name;
```

### Find high value or tier 0 accounts with SPN
```cypher
MATCH (u:User)
  WHERE u.hasspn = true
    AND u.enabled
    AND (
      u.highvalue = true
      OR toLower(toString(u.system_tags)) CONTAINS 'admin_tier_0'
      OR toLower(toString(u.system_tags)) CONTAINS 'tier_zero'
    )
  OPTIONAL MATCH (u)-[:MemberOf*1..]->(g:Group)
  WITH u, collect(DISTINCT g.name) AS groups
  RETURN u.name AS user,
         u.hasspn AS has_spn,
         u.highvalue AS high_value,
         u.system_tags AS system_tags,
         groups
  ORDER BY user
```

### Find service accounts with passwords older than 3 years

We define service accounts as user accounts with a defined Service Principal Name (SPN)

```cypher
MATCH (u:User)
WHERE u.hasspn= true AND u.pwdlastset < (datetime().epochseconds - (1095 * 86400)) AND NOT u.pwdlastset IN [-1.0, 0.0]
RETURN u.name AS `Account Name`, datetime({ epochSeconds:toInteger(u.pwdlastset)}) AS `Password Last SET ` ORDER BY u.pwdlastset;
```


### Find users with last password change in a specific date range (Months)
```cypher
MATCH (u:User)
WHERE u.pwdlastset >= datetime('2026-10-01T00:00:00Z').epochSeconds
  AND u.pwdlastset <= datetime('2026-10-30T23:59:59Z').epochSeconds
  AND NOT u.pwdlastset IN [-1.0, 0.0]
RETURN u.name AS `Account Name`, datetime({ epochSeconds:toInteger(u.pwdlastset)}) AS `Password Last SET`
ORDER BY u.pwdlastset;
```

### Days since the last time KRBTGT account password was changed

```cypher
MATCH (u:User)
WHERE u.samaccountname = "krbtgt"
RETURN u.name AS `Account Name`, duration.inDays(datetime({ epochSeconds: toInteger(u.pwdlastset) }), datetime()).days AS `Days since last password change`;
```

### Find group names that match all individual strings

```cypher
MATCH (g:Group)
WHERE all (word IN ["VMWARE", "ADMINS"]
WHERE g.name CONTAINS word)
RETURN g.name;
```

### Find users that are in groups matching at least  one of the words

```cypher
MATCH (u:User)-[:MemberOf]->(g:Group)
WHERE any (word IN ['SAGE', 'SQL']
WHERE toLower(g.name) CONTAINS toLower(word))
RETURN u.samaccountname, g.name;
```

### Find users that are in groups matching all the words

```cypher
MATCH (u:User)-[:MemberOf]->(g:Group)
WHERE all (word IN ['SAGE', "SQL"]
WHERE toLower(g.name) CONTAINS toLower(word))
RETURN u.samaccountname, g.name;
```

### Find if a DA is DA in another domain

```cypher
// Query 1: Domain admins who are members of another domain's admin groups
MATCH (da:Group {admincount: true})-[:HasMember*1..]->(u:User)
WHERE da.domain <> u.domain
RETURN da.name as AdminGroup, da.domain as AdminDomain, u.name as User, u.domain as UserDomain
ORDER BY da.domain, u.domain;
```

### Find all Computers member of a Group
```cypher
match (c:Computer)-[:MemberOf]->(g:Group) where g.name contains "DOMAIN CONTROL" return c.name;
```

### Find all the computers that are not Domain Controllers with DA sessions
```cypher
MATCH (u:User)-[:MemberOf]->(g:Group {name:"DOMAIN ADMINS@DOMAIN.COM"})
WITH u
MATCH (u)-[r:HasSession]-(c:Computer)
with u,c
match (c)-[:MemberOf*1..]->(g)
where g.name <> "DOMAIN CONTROLLERS@DOMAIN.COM"
return distinct u.name as User, collect(distinct c.name) as Computers
order by u.name
```

### Find all permissions that a specific user has on all objects
```cypher
MATCH (u:User {name: "PACKADMIN@DOMAIN.COM"})-[r:GenericAll|GenericWrite|WriteDacl|WriteOwner|AllExtendedRights|Owns|SPN|ForceChangePassword]->(target)
RETURN u.name AS User, collect(distinct type(r)), target.name AS TargetObject
order by TargetObject
```
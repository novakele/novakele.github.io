---
title: Cypher queries
description: Cypher queries
date: 2022-06-26
---

# Cypher queries

## Objective

Keeping all the custom cypher query that I use during Active Directory assessments in one place.

### Find DA with SPN

```cypher
MATCH (u:User)-[:MemberOf]->(g:Group)
WHERE g.objectid ENDS
WITH '-512' AND u.hasspn
RETURN u.name;
```

### Find service accounts with passwords older than 3 years

We define service accounts as user accounts with a defined Service Principal Name (SPN)

```cypher
MATCH (u:User)
WHERE u.hasspn= true AND u.pwdlastset < (datetime().epochseconds - (1095 * 86400)) AND NOT u.pwdlastset IN [-1.0, 0.0]
RETURN u.name AS `Account Name`, datetime({ epochSeconds:toInteger(u.pwdlastset)}) AS `Password Last SET ` ORDER BY u.pwdlastset;
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


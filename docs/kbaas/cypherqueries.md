# Cypher queries

## Objective

Keeping all the custom cypher query that I use during Active Directory assessments in one place.

### Find DA with SPN

```cypher
MATCH (u:User)-[:MemberOf]->(g:Group) WHERE g.objectid ENDS WITH '-512' and u.hasspn return u.name;
```

### Find service accounts with passwords older than 3 years

We define service accounts as user accounts with a defined Service Principal Name (SPN)

```cypher
MATCH (u:User) WHERE u.hasspn=true AND u.pwdlastset < (datetime().epochseconds - (1095 * 86400)) AND NOT u.pwdlastset IN [-1.0, 0.0] RETURN u.name AS `Account Name`, datetime({ epochSeconds:toInteger(u.pwdlastset)}) AS `Password Last Set` order by u.pwdlastset;
```

### Days since the last time KRBTGT account password was changed

```cypher
match (u:User) where u.samaccountname = "krbtgt" return u.name AS `Account Name`, duration.inDays(datetime({ epochSeconds: toInteger(u.pwdlastset) }),datetime()).days AS `Days since last password change`;
```

### Find group names that match all individual strings

```cypher
match (g:Group) where all (word in ["VMWARE","ADMINS"] where g.name contains word) return g.name;
```


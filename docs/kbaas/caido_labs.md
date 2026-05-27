---
title: Caido Labs
description: Working on the labs!
date: 2026-05-27
---

## Objective
Getting to know Caido through their labs at https://labs.cai.do

## Labs

### Match and Replace

Not much to say, the functionality is pretty easy to use and test.

### IDOR Vulnerability
I used Automate to iterate over the user IDs from 0 to 100.

Filtering the non-existant users was easy with an HTTPQL query:
```sql
resp.raw.ncont:"User not found"
```

![image-20260527154448697](./assets/image-20260527154448697.png)



And the super admin API key!

![image-20260527154538027](./assets/image-20260527154538027.png)


### Autorize IDOR Testing
The authentication and authorization is done with an Authorization HTTP header.
I used Authorized to create two new users.

![image-20260527160527893](./assets/image-20260527160527893.png)



And two mutations for each users.

![image-20260527160610428](./assets/image-20260527160610428.png)

**/autorize.php?action=messages** had sensitive messages and were accessible to all authenticated users.

![image-20260527160713931](./assets/image-20260527160713931.png)

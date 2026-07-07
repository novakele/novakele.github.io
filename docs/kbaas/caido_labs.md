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



### Too Many Requests
The lab asks to find the secret value in a 100 requests.
Using HTTPQL:
```sql
resp.raw.ncont:"Try again"
```

### ShaSigned

Following up in the previous IDOR lab, the request how has a **hash** data field passed in the POST request.

The **hash** value is the SHA256 or the **user_id={id}**.

To automate this, I used a Convert workflow.

![image-20260527180608475](./assets/image-20260527180608475.png)



The workflow could have been applied automatically to Automate but it is not available on the free tier.



### CSRF via Content-Type



I'll have to read up on this one.

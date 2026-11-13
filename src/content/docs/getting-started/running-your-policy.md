---
title: Running your first Policy
description: Learn how to run the policy you created using the exec command
---

Now that you've created your first policy in the [Writing your first Policy](/getting-started/writing-your-first-policy/) guide, let's run it using the `sentrie exec` command.

## Your Policy

Assuming you followed the previous guide, you should have a policy file `first-policy.sentrie` that looks like this:

```sentrie
// first-policy.sentrie
namespace user_management

shape User {
  role: string
  status: string
}

policy user_access {

  fact user: User

  rule allow_admin = {
    yield user.role == "admin"
  }

  rule allow_user = {
    yield allow_admin or (user.role == "user" and user.status == "active")
  }

  export decision of allow_admin
  export decision of allow_user

}
```

## Running the Policy

Use the `sentrie exec` command to run your policy against test data:

```bash
sentrie exec user_management/user_access/allow_user --facts '{"user": {"role": "user", "status": "active"}}'
```

:::note
If no rule name is provided, the executor will evaluate all exported rules and return the results.
:::

**Expected Output:**

```
Namespace: user_management
Policy:    user_access

Rules:
  ✓ allow_admin: ⨯ False
  ✓ allow_user: ✓ True

Values:
  ✓ allow_admin: false
  ✓ allow_user: true
```

## Understanding the Output

The `exec` command shows you:

1. **Namespace**: The namespace of the policy
2. **Policy**: The policy name
3. **Rules**: Which rules matched (✓) or didn't match (✗)
4. **Values**: The final results of exported rules
5. **Attachments**: The attachments of the exported rules

## Providing Required Facts

Since the `user` fact is required (no `?` modifier), you must provide it when executing:

```bash
sentrie exec user_management/user_access --facts '{"user": {"role": "admin", "status": "active"}}'
```

:::note[Note]
If a required fact is not provided, execution will fail with an error. Only optional facts (marked with `?`) can have default values and can be omitted.
:::

**Expected Output:**

```
Namespace: user_management
Policy:    user_access

Rules:
  ✓ allow_user: ✓ True
  ✓ allow_admin: ✓ True

Values:
  ✓ allow_user: true
  ✓ allow_admin: true
```

## Next Steps

Now that you can run policies, explore the [CLI Reference](/cli-reference/) to learn about all available commands and options.

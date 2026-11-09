---
title: "bench Command"
description: "Measure how long Sentrie takes to evaluate a policy or rule."
---

# bench Command

The `bench` command evaluates a policy or rule over and over and reports how long each evaluation takes, along with how much memory it allocates. Use it to measure the cost of a policy and to compare that cost before and after a change.

## Syntax

```bash
sentrie bench <FQN> [OPTIONS]
```

## Description

The `bench` command loads a policy pack, checks that the target evaluates once, and then times repeated evaluations of it with the facts you provide. It prints results in the Go benchmark format, so the output can be compared with [`benchstat`](https://pkg.go.dev/golang.org/x/perf/cmd/benchstat).

The pack is loaded, indexed and validated once, before any timing starts. The measurement is of a warm executor, the same long-lived executor [`serve`](/cli-reference/serve) uses to answer requests: before the timed loop, one untimed evaluation warms it up, and the call-memoization cache and loaded modules then stay in place across iterations. The numbers describe the cost of evaluating a decision in a running server, not the cost of starting the process or loading the pack.

## Arguments

### `FQN` (required)

The Fully Qualified Name of the rule or policy to measure, in the same format as [`exec`](/cli-reference/exec).

**Format:** `namespace/policy/rule` or `namespace/policy`

- **`namespace/policy`** - Measure evaluating all exported rules in the policy
- **`namespace/policy/rule`** - Measure evaluating only the specific rule

## Options

### `--pack-location`

Specifies the directory containing the policy pack to load.

```bash
sentrie bench user_management/user_access/allow_admin --pack-location ./my-policy-pack
```

**Default:** `.` (current directory)

### `--facts`

Provides facts directly as a JSON string.

```bash
sentrie bench user_management/user_access/allow_admin \
  --facts '{"user":{"role":"admin","status":"active"}}'
```

**Default:** `{}` (empty object)

### `--fact-file`

Specifies a JSON file containing facts to use for evaluation. The file must contain a top-level JSON object.

```bash
sentrie bench user_management/user_access --fact-file ./facts.json
```

**Default:** (empty - no file)

Facts are merged the same way as for [`exec`](/cli-reference/exec): facts from `--fact-file` are loaded first, then each top-level key in `--facts` replaces the same key from the file. The replacement is of the whole top-level value, so a `user` object in `--facts` replaces the entire `user` object from the file rather than being merged into it.

### `--benchtime`

Sets how long to measure, with the same meaning as `-benchtime` in `go test`.

```bash
sentrie bench user_management/user_access/allow_admin --benchtime 3s
sentrie bench user_management/user_access/allow_admin --benchtime 200x
```

**Default:** `1s`

**Valid values:**

- A Go duration such as `500ms`, `1s` or `2m` - Keep evaluating, in larger and larger batches, until a run lasts at least that long. The reported line is the last of those runs.
- A count followed by `x`, such as `200x` - Run exactly that many evaluations. This gives output that is cheap to produce and repeatable in size, and is the form to use in tests and scripts.

A value that is neither a positive duration nor a positive count followed by `x` (for example `5`, `0x` or `-1s`) is an error.

### `--count`

Repeats the whole measurement this many times, printing one result line per run.

```bash
sentrie bench user_management/user_access/allow_admin --benchtime 200x --count 5
```

**Default:** `1`

Several lines for the same target are what `benchstat` needs to estimate the spread of a measurement. A value below `1` is an error.

### `--eval-timeout`

Sets the deadline for evaluating one decision, as a Go duration. `0` disables the deadline.

```bash
sentrie bench user_management/user_access --eval-timeout 500ms
```

**Default:** `10s`

### `--capabilities`

Path to a capabilities file that limits the builtins and modules the pack may use. When it is omitted, everything is allowed. This is the same option that [`exec`](/cli-reference/exec) and [`serve`](/cli-reference/serve) accept.

```bash
sentrie bench user_management/user_access --capabilities ./capabilities.json
```

**Default:** (empty - allow everything)

## Output

The output starts with two configuration lines naming the operating system and architecture, followed by one result line per measurement run:

```text
goos: darwin
goarch: arm64
BenchmarkExec/user_management/user_access/allow_admin-12	     200	     3302.09 ns/op	      6144 B/op	        69 allocs/op
BenchmarkExec/user_management/user_access/allow_admin-12	     200	     2839.17 ns/op	      6144 B/op	        69 allocs/op
BenchmarkExec/user_management/user_access/allow_admin-12	     200	     2832.92 ns/op	      6144 B/op	        69 allocs/op
```

That output comes from this command:

```bash
sentrie bench user_management/user_access/allow_admin \
  --facts '{"user":{"role":"admin","status":"active"}}' \
  --benchtime 200x --count 3
```

Each result line has these fields, separated by tabs:

| Field                        | Meaning                                                                                              |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| `BenchmarkExec/<FQN>[-N]`    | The benchmark name: the target you passed, with a `-N` suffix giving the value of `GOMAXPROCS`. The suffix is omitted when `GOMAXPROCS` is 1, as in Go's own output. |
| iterations                   | How many evaluations the run performed.                                                              |
| `ns/op`                      | Average time of one evaluation, in nanoseconds.                                                      |
| `B/op`                       | Average heap memory allocated per evaluation, in bytes.                                              |
| `allocs/op`                  | Average number of heap allocations per evaluation.                                                   |

The numbers depend on your machine, so expect different values from the ones above. Evaluating a whole policy (`namespace/policy`) does more work per iteration than evaluating a single rule, so compare like with like.

Timing covers only the evaluations. `B/op` and `allocs/op` are measured from the Go runtime across the whole process during the run, so they include anything else the process allocates at that time.

## Comparing Runs with benchstat

Because the output is in the Go benchmark format, you can save the results of two builds or two versions of a policy and compare them with `benchstat`:

```bash
sentrie bench user_management/user_access/allow_admin \
  --facts '{"user":{"role":"admin","status":"active"}}' \
  --benchtime 1000x --count 6 > old.txt

# change the policy or upgrade Sentrie, then measure again
sentrie bench user_management/user_access/allow_admin \
  --facts '{"user":{"role":"admin","status":"active"}}' \
  --benchtime 1000x --count 6 > new.txt

benchstat old.txt new.txt
```

Use the same target, facts and `--benchtime` for both files, and a `--count` of at least 5 so `benchstat` can tell a real change from noise.

## Examples

### Measure a single rule

```bash
sentrie bench user_management/user_access/allow_admin \
  --facts '{"user":{"role":"admin","status":"active"}}'
```

### Measure every exported rule in a policy

```bash
sentrie bench user_management/user_access \
  --fact-file ./facts.json \
  --benchtime 500ms
```

### Measure an exact number of evaluations, five times

```bash
sentrie bench user_management/user_access/allow_admin \
  --facts '{"user":{"role":"admin","status":"active"}}' \
  --benchtime 200x --count 5
```

### Measure a pack in another directory

```bash
sentrie bench user_management/user_access/allow_admin \
  --pack-location ./policy-pack \
  --fact-file ./facts.json
```

## Exit Status

`bench` exits with status `0` when every run completes, and with status `1` after printing a message starting with `Error:` otherwise. When the failure happens before the first measurement, no result lines are printed, not even `goos:` and `goarch:`, so the only output is the error message.

These cases exit non-zero:

- **Missing or invalid FQN**: no argument, or a namespace, policy or rule that does not exist or is not exported
- **Failing evaluation**: the target cannot be evaluated with the facts given, for example because a required fact is missing or does not match its shape. The target is evaluated once before timing starts, so this is reported before any result line is printed.
- **Invalid flags**: an unparseable `--benchtime`, a `--count` below `1`, an invalid `--eval-timeout`, or invalid JSON in `--facts`
- **File errors**: `--fact-file` or `--capabilities` cannot be read or parsed, or the pack cannot be loaded

For example, a rule that needs a fact you did not provide:

```bash
sentrie bench user_management/user_access/allow_admin --benchtime 10x
```

```text
Error: benchmark target "user_management/user_access/allow_admin" failed to evaluate: required fact not found: user: invalid invocation
```

## Output Destination

Results and error messages are both written to **stdout**, as for [`exec`](/cli-reference/exec). If you redirect output to a file, a failed command leaves its error message in that file, so check the exit status in scripts before comparing results.

## See Also

- [exec Command](/cli-reference/exec) - Run a policy once and see its decision
- [serve Command](/cli-reference/serve) - Run the long-lived server whose evaluation cost `bench` measures
- [CLI Reference](/cli-reference) - Complete CLI documentation

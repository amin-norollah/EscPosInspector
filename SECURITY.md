# Security Policy

## Supported Versions

Security fixes are applied to the latest released version on the `main` branch.

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |
| older   | :x:                |

## Scope

EscPosInspector is a **fully client-side** tool. It has no backend and no data
leaves the browser ; loaded files, hex, and Base64 input are processed locally.
As a result, the most relevant security concerns are client-side issues such as:

- cross-site scripting (XSS) via decoded command content or rendered output
- denial of service through malformed or oversized ESC/POS streams
- unsafe handling of pasted or loaded input

## Reporting a Vulnerability

Please **do not** open a public issue for security vulnerabilities.

Instead, report them privately by either:

- using GitHub's [private vulnerability reporting](https://github.com/amin-norollah/EscPosInspector/security/advisories/new),
  or
- emailing **an-dev@cntxts.com**

Please include:

- a description of the vulnerability and its impact
- steps to reproduce (a sample ESC/POS stream or input is very helpful)
- any suggested remediation

## Response

- We aim to acknowledge reports within **7 days**.
- We will keep you informed of progress toward a fix.
- Once resolved, we are happy to credit you in the release notes unless you
  prefer to remain anonymous.

Thank you for helping keep EscPosInspector and its users safe.

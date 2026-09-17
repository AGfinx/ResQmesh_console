Security Policy
Project status
ResQMesh is currently a browser-only frontend prototype. It uses seeded mock data and local Zustand state and is not intended for real emergency-response operations or production security-sensitive data.
The repository currently has no backend API, production authentication system, database, remote synchronization, device integration, or automated security-testing pipeline. Vulnerability reports are still welcome for the code, build configuration, dependencies, and documentation.
Supported versions
This project is currently in active prototype development. Security fixes are applied to the latest `main` branch rather than to a formal release branch.
Version / branch	Supported
`main`	:white_check_mark:
`1.0.x` prototype snapshots	:white_check_mark: on a best-effort basis
Older commits and unmaintained forks	:x:
Because the project has not established a formal release policy, support status may change as versioned releases are introduced.
Reporting a vulnerability
Please do not report security vulnerabilities in public GitHub issues, pull requests, or discussions.
Report vulnerabilities privately through one of these channels:
Use GitHub’s Private vulnerability reporting feature on the repository’s Security tab, if enabled.
If private reporting is unavailable, contact the repository maintainers through the private contact method configured for the organization or repository.
When reporting a vulnerability, include:
A concise description of the issue and its potential impact
The affected version, commit, branch, or file path
Clear reproduction steps or a minimal proof of concept
Any required configuration, browser, or runtime details
Suggested mitigation, if known
Whether the issue is publicly known or has already been disclosed elsewhere
Please avoid including real personal information, emergency reports, credentials, private keys, production data, or other sensitive material in the report. Use synthetic example data wherever possible.
Response expectations
We will acknowledge receipt when practical, normally within 7 calendar days.
We will investigate the report, request clarification if needed, and communicate the assessment through the private reporting channel.
If the issue is accepted, we will work toward a fix or mitigation and coordinate disclosure timing with the reporter when appropriate.
If the issue is declined, we will provide an explanation when practical.
Response and remediation timelines may vary because this is an open-source prototype maintained on a best-effort basis.
Scope
Reports are especially useful for:
Cross-site scripting, injection, or unsafe rendering issues
Authentication, authorization, or route-protection flaws
Sensitive data exposure or unsafe browser storage
Dependency vulnerabilities that affect the application
Supply-chain or build-pipeline risks
Insecure configuration or deployment behavior
Documentation that could cause the prototype to be mistaken for a production emergency system
The following are known limitations rather than undiscovered vulnerabilities:
Demo persona selection is not real authentication.
Domain state is primarily in memory and is not a secure persistence layer.
SOS, mesh, AI, alert-distribution, and robotics behavior is simulated or represented by mock data.
External fonts and map tiles require runtime network access.
Safe-harbor expectations
Security research is welcome when it is conducted responsibly. Please:
Test only against your own local clone or an explicitly authorized environment.
Do not access, modify, delete, or exfiltrate data belonging to other users.
Do not conduct denial-of-service, destructive, social-engineering, or physical-world tests.
Do not publish a vulnerability before allowing reasonable time for assessment and mitigation.
Stop testing and report immediately if you encounter real personal data, credentials, or production systems.
Thank you for helping improve ResQMesh responsibly.

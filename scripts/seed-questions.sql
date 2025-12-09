-- Seed 10 sample CISSP questions

INSERT INTO questions (question_text, choice_a, choice_b, choice_c, choice_d, correct_answer, explanation, domain) VALUES
(
  'A security architect is designing authentication for a globally distributed workforce with inconsistent device hygiene. Which approach BEST balances security and user experience?',
  'Enforce certificate-based authentication only',
  'Require FIDO2 tokens for all users at all times',
  'Implement risk-based adaptive MFA with behavioral analytics',
  'Use geofencing to allow login only from approved countries',
  'C',
  'Adaptive MFA dynamically adjusts authentication requirements based on risk and behavior, reducing friction while maintaining security across varied devices.',
  'Identity and Access Management'
),
(
  'A critical system must maintain confidentiality even if attackers gain full administrator access to the OS. Which control BEST satisfies this requirement?',
  'Full-disk encryption with TPM',
  'Application-layer encryption with key material on a remote HSM',
  'Kernel-mode anti-malware hooks',
  'Role-based access control with separation of duties',
  'B',
  'Encrypting data at the application layer with keys stored remotely ensures that even a compromised OS cannot decrypt sensitive information.',
  'Security Architecture and Engineering'
),
(
  'A SOC identifies continuous lateral movement attempts that evade signature-based tools. Which defensive approach BEST reduces this threat?',
  'Increasing firewall ACL strictness',
  'Implementing microsegmentation with identity-based policy',
  'Performing weekly vulnerability scans',
  'Deploying host-based intrusion detection only',
  'B',
  'Microsegmentation limits lateral movement by enforcing strict, identity-based network boundaries, reducing attacker spread inside the network.',
  'Communication and Network Security'
),
(
  'During a disaster, a company restores operations at a warm site. Payroll systems come online, but timekeeping data is 48 hours out of date. What failed?',
  'RPO',
  'RTO',
  'MTBF',
  'MTTR',
  'A',
  'Recovery Point Objective (RPO) defines the maximum acceptable data loss. Missing 48 hours of data indicates the RPO was exceeded.',
  'Security Operations'
),
(
  'Which risk response method is MOST appropriate when the cost of a control exceeds the asset value?',
  'Mitigate',
  'Transfer',
  'Avoid',
  'Accept',
  'D',
  'When control costs outweigh the value of the asset, risk acceptance is the most practical approach.',
  'Risk Management'
),
(
  'A company uses a CASB to enforce DLP in a multi-cloud environment. Which capability is MOST essential for protecting against data exfiltration through unsanctioned SaaS apps?',
  'Inline proxy inspection',
  'API-based malware scanning',
  'Virtual private cloud peering',
  'Single sign-on federation',
  'A',
  'Inline proxy inspection enables real-time enforcement of DLP policies on cloud traffic, including unsanctioned SaaS applications.',
  'Security Architecture and Engineering'
),
(
  'A cryptographic module fails open during a memory corruption event, revealing plaintext credentials in RAM. Which property was violated?',
  'Confidentiality only',
  'Non-repudiation',
  'Complete mediation',
  'Fail-safe design',
  'D',
  'Secure systems must fail safely. Revealing sensitive data on failure violates the fail-safe design principle.',
  'Security Architecture and Engineering'
),
(
  'A company needs legally defensible evidence handling for an insider investigation. Which action is MOST critical?',
  'Making two copies of the evidence',
  'Storing evidence in a secure cabinet',
  'Maintaining unbroken chain-of-custody documentation',
  'Hashing files with SHA-256',
  'C',
  'Chain-of-custody documentation is required to prove that evidence was handled correctly and is legally defensible.',
  'Security Operations'
),
(
  'A penetration test reveals the organization performs no input validation on internal APIs. Which risk is MOST significant?',
  'Increased brute-force attempts',
  'Reflected XSS on internal dashboards',
  'Injection leading to privilege escalation or data corruption',
  'Slower API performance during peak periods',
  'C',
  'Lack of input validation exposes APIs to injection attacks that can escalate privileges or corrupt data.',
  'Security Assessment and Testing'
),
(
  'A multinational firm must ensure that customer data stored in multiple jurisdictions complies with local privacy laws while minimizing operational overhead. Which approach is BEST?',
  'Centralize data in one country to simplify compliance',
  'Replicate all customer data globally for resilience',
  'Implement data localization with policy-driven regional processing',
  'Encrypt all customer data with a single global key',
  'C',
  'Regional processing ensures compliance with local data sovereignty laws while minimizing operational risk.',
  'Security and Risk Management'
);


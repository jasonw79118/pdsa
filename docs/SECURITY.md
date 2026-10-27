# Security, youth safeguarding and privacy requirements

This is a public **fictional-only demonstration**. Do NOT put real youth data into it. There is no production authentication or data security in this prototype.

## Before using real information

1. Obtain written PDSA/Techform governance and data responsibility agreements; identify accountable administrators and policy owners.
2. Implement verified authentication, password reset/MFA (mandatory for administrators), session expiry, secure HTTP-only cookies where appropriate, and user deprovisioning.
3. Implement and test server-side role+organization+team authorization and DB RLS. UI hiding alone is insufficient.
4. Verify guardian relationships and permissions, collect required registration consent, enforce youth protection safeguards and prevent private one-on-one adult-to-minor contact.
5. Minimize personal fields; allow only assignment-essential details to coaches, referees and volunteers; strictly protect evaluations, health/medical data, payment status and screening records.
6. Use a trusted payment processor's hosted/tokenized flow. Do not store card numbers or CVVs.
7. For criminal background screening, store only eligibility/confirmation metadata when appropriate; avoid storing screening reports.
8. Set retention, deletion/export, secure backup, incident response, vendor contracts, audit retention and privacy-policy procedures.
9. Add request rate limits, abuse detection, email/domain verification, secure logging (without secrets/PII), spam controls and malware/file-upload scanning if uploads are added.
10. Restrict data exports; watermarks/version logs are not a substitute for data access policy. Prevent CSV formula injection when any user-supplied value could be exported.

## Security regression tests (automate)

- Coach A accessing Coach B's private team roster → 403/no rows, including guessed IDs and direct API requests.
- Coach A sending to team B guardians → denied even if UI payload contains team B ID or recipient addresses.
- Revoked coach grant → immediate loss of access and send permission.
- Techform role reading PDSA registrations, evaluations or family contacts → denied.
- Techform role attempting to post to PDSA public feed or PDSA Page without board approval → denied.
- Board approver approving own Techform submission (where separation-of-duties applies) → denied.
- Changes to approved promotion content/audience/channel → prior approval becomes invalid.
- Parent sees unrelated child → denied.
- Volunteer sees association-wide personnel private contacts → denied.
- API failure, City lightning feed unavailable or stale → no false 'safe to play' status.
- Safety officer may issue verified emergency warning only for authorized facilities; audit and notify, never impersonate City feed.

## Weather safety disclaimer

NWS forecasts and lightning alert systems provide different information. Forecast does not replace the official field warning/safety protocol. The City of Canyon system's interface and authority must be verified with the City and equipment provider. **The prototype is NOT a safety device and cannot certify clearance to play.**

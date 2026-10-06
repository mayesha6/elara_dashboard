# Security corrections

This corrected review copy preserves the submitted Dashboard 11 archive separately.

- Predictable default passwords were removed.
- All user-creation requests now enforce the backend-aligned strong-password policy.
- Manual logout paths now request backend session termination before clearing local state.
- Production dependencies were updated to remove the identified source-map-js advisory.
- The production CSP now uses a per-request nonce and excludes development-only localhost connections.
- Dependency audit, lint, TypeScript, 8 tests, and production build were rerun successfully.

The authorized development team must test the nonce-based CSP, authentication flows, and external service integration in staging before production use.

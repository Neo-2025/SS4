# API Development Prompt

## Context
You are developing an API endpoint for the MVP. The endpoint should follow established patterns and maintain consistency with the existing codebase.

## API Requirements
```yaml
endpoint:
  path: "/api/[path]"
  methods:
    - "[List supported methods]"
  authentication:
    - "[Auth requirements]"
  validation:
    - "[Validation rules]"
  rate_limiting:
    - "[Rate limit rules]"
```

## Implementation Guidelines
1. **API Structure**
   - Use TypeScript
   - Follow REST best practices
   - Implement proper validation
   - Add comprehensive documentation

2. **Security**
   - Authentication
   - Authorization
   - Input validation
   - Rate limiting

3. **Testing**
   - Unit tests
   - Integration tests
   - Load tests
   - Security tests

4. **Documentation**
   - Endpoint description
   - Request/Response formats
   - Error handling
   - Rate limits

## Example Output
```typescript
// API implementation
// Documentation
// Tests
```

## Quality Checklist
- [ ] TypeScript compliance
- [ ] Test coverage
- [ ] Documentation
- [ ] Security
- [ ] Performance
- [ ] Error handling
- [ ] Rate limiting
- [ ] Validation 
# Vercel Deployment Guide for SS4

## Overview
This guide documents the Vercel deployment setup for SmartStack v4 (SS4), including safeguards against common issues and best practices for deployment management.

## Project Structure
- Main project: `smart-scale/p1.1_nbp`
- Deployment URL: https://p1-1-nbp.vercel.app
- GitHub repository: https://github.com/Neo-2025/p1.1_nbp

## Historical Issues and Solutions
### Duplicate Project Creation
Previously, an issue occurred where a duplicate project (`p1-nextjs-saas`) was created alongside the main project. This happened due to:
- Automatic project creation during deployment
- Missing project linking
- Incorrect environment variables

### Prevention Measures
1. **Project Linking**
   ```bash
   vercel link --token=$VERCEL_TOKEN --yes
   ```
   Always verify project linking before deployment.

2. **Environment Variables**
   Required variables:
   ```
   VERCEL_TOKEN=xxx
   VERCEL_ORG_ID=xxx
   VERCEL_PROJECT_ID=xxx
   NEXT_PUBLIC_SUPABASE_URL=xxx
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
   NEXT_PUBLIC_WEBSITE_URL=xxx
   ```

3. **GitHub Actions Workflow**
   - Includes project verification
   - Prevents automatic project creation
   - Handles both production and preview deployments

## Deployment Process
### Production Deployment
1. Push to main branch
2. GitHub Actions automatically:
   - Verifies project linking
   - Builds the project
   - Deploys to production

### Preview Deployments
1. Create pull request
2. GitHub Actions creates preview deployment
3. Preview URL available in PR comments

## Branch Management
Current branches:
- `main`: Production branch
- `feat/us-001-github-auth`: GitHub OAuth implementation
- Additional branches will follow SS4-B1 naming convention (e.g., `feat/us-002-protected-landing`)

## Troubleshooting
### Common Issues
1. **Project Linking Failed**
   ```bash
   vercel inspect
   vercel link --token=$VERCEL_TOKEN
   ```

2. **Environment Variables Missing**
   - Check GitHub repository secrets
   - Verify Vercel project settings

3. **Build Failures**
   - Check build logs: `vercel logs <deployment-url>`
   - Verify dependencies in package.json

## Best Practices
1. Version Control
   - Keep `.vercel/project.json` in repository
   - Document environment variables
   - Use branch protection rules

2. Deployment Protection
   - Enable deployment protection for production
   - Use preview deployments for testing
   - Implement required status checks

3. Monitoring
   - Regular check of deployment status
   - Monitor build times and performance
   - Review deployment logs

## Security Considerations
1. Token Management
   - Rotate VERCEL_TOKEN periodically
   - Use environment-specific tokens
   - Never expose tokens in logs

2. Access Control
   - Limit deployment permissions
   - Use team-based access
   - Enable 2FA for all team members

## Maintenance
1. Regular Tasks
   - Clean up old preview deployments
   - Update dependencies
   - Review environment variables

2. Monitoring
   - Check deployment status
   - Review performance metrics
   - Monitor build times

## Support and Resources
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- Internal Support: Contact Neo for assistance 
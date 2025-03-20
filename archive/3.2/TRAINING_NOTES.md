# Training Notes for New Development Sessions

## Initial Setup

### 1. GitHub Authentication Setup
```bash
# Configure GitHub CLI
gh auth login
# Choose: GitHub.com > HTTPS > Y to authenticate with your GitHub credentials
# Select: Login with a web browser
# Copy the one-time code and complete authentication in browser

# Verify authentication
gh auth status
```

### 2. Vercel CLI Setup
```bash
# Always start in the project directory
cd /home/neo/SS4/p1

# Link to Vercel project
vercel link
# Select: smart-scale/p1

# Pull environment variables
vercel env pull .env.local

# Verify Vercel connection
vercel ls
```

## Development Workflow

### 1. Working Directory
```bash
# ALWAYS start work from:
cd /home/neo/SS4/p1

# Current shell path should show:
neo@A-AA-9FNSHM2:~/SS4/p1
```

### 2. Branch Management
```bash
# Create new feature branch
git checkout -b feat/feature-name

# Keep branch up to date
git pull origin main
git rebase main  # if needed
```

### 3. Common Issues & Solutions

#### Vercel Deployment Issues
- Check BOOTSTRAP.md for common solutions
- Use the fix scripts in `/scripts`:
  ```bash
  ./scripts/fix-json-files.sh  # For JSON issues
  ./scripts/fix-vercel-env.sh  # For environment variables
  ```

#### Build Issues
```bash
# Clean build artifacts
rm -rf .next node_modules package-lock.json

# Fresh install
npm install

# Verify build
npm run build
```

### 4. Essential Commands

#### Project Status
```bash
# Check Vercel deployments
vercel ls

# View deployment logs
vercel logs [deployment-url]

# Check GitHub PR status
gh pr list
```

#### Environment Management
```bash
# Update environment variables
vercel env pull .env.local

# Link to different environment
vercel link
```

## Best Practices

1. **Always Check BOOTSTRAP.md First**
   - Contains solutions to common issues
   - Documents successful fixes
   - Lists required dependencies

2. **Verify Local Before Deploy**
   ```bash
   npm run build  # Must succeed locally
   npm run lint   # Check for issues
   ```

3. **Commit Messages**
   ```bash
   # Format:
   git commit -m "type: description"
   
   # Types:
   # feat:     New feature
   # fix:      Bug fix
   # docs:     Documentation
   # style:    Formatting
   # refactor: Code restructure
   # test:     Testing
   ```

4. **Environment Variables**
   - Never commit .env files
   - Use Vercel UI for production vars
   - Use .env.local for development

## Troubleshooting

### Common Issues

1. **Vercel CLI Not Responding**
   ```bash
   # Relink project
   vercel link --relink
   ```

2. **GitHub Auth Issues**
   ```bash
   # Refresh auth
   gh auth refresh
   ```

3. **Build Failures**
   - Check BOOTSTRAP.md
   - Verify all dependencies
   - Check for JSON syntax issues

### Getting Help

1. **Documentation**
   - BOOTSTRAP.md in project root
   - Vercel Docs: https://vercel.com/docs
   - Next.js Docs: https://nextjs.org/docs

2. **Logs**
   ```bash
   # Vercel deployment logs
   vercel logs [url]

   # Local build logs
   npm run build
   ```

## Project Structure

```
/SS4
  /p1                 # Main project directory
    /scripts          # Utility scripts
    /src             # Source code
    BOOTSTRAP.md     # Setup & troubleshooting
    vercel.json      # Vercel configuration
```

## Remember

1. Always start in `/home/neo/SS4/p1`
2. Check BOOTSTRAP.md for solutions
3. Verify local build before deploying
4. Use proper commit message format
5. Keep environment variables in Vercel

## Next Steps

1. Review BOOTSTRAP.md
2. Test local development setup
3. Create new feature branch
4. Follow deployment checklist 
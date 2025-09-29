# NPM Package Publishing Guide

## Pre-Publishing Checklist

✅ **Package Configuration**
- [x] `package.json` created with proper metadata
- [x] Binary executable configured (`bin` field)
- [x] Files properly configured (only necessary files included)
- [x] `.npmignore` created to exclude development files
- [x] `LICENSE` file added
- [x] `README.md` updated with npm installation instructions

✅ **Testing**
- [x] Local package test completed
- [x] `npm pack --dry-run` successful
- [x] `npm link` test successful
- [x] Global command `appium-installer` works

## Publishing Steps

### 1. Login to NPM
```bash
npm login
```

### 2. Verify Package
```bash
# Check package contents
npm pack --dry-run

# Test package locally
npm link
appium-installer
npm unlink appium-installer
```

### 3. Publish to NPM
```bash
# Publish to NPM registry
npm publish

# For scoped packages (if using @username/appium-installer)
npm publish --access public
```

### 4. Verify Publication
```bash
# Check package on NPM
npm view appium-installer

# Test installation
npm install -g appium-installer
appium-installer --version
```

## Package Information

- **Name**: `appium-installer`
- **Version**: `3.0.0`
- **Size**: ~15KB (compressed)
- **Files**: 4 files (appium-installer.js, README.md, LICENSE, package.json)
- **Global Command**: `appium-installer`

## Post-Publishing

1. **Update GitHub Repository**: Add NPM badge to README
2. **Create Release**: Tag the version in Git
3. **Documentation**: Update any external documentation
4. **Community**: Share in relevant communities

## Maintenance

- **Version Updates**: Use `npm version patch/minor/major`
- **Dependencies**: Keep peer dependencies updated
- **Security**: Regular security audits with `npm audit`
- **Compatibility**: Test with new Node.js versions

## Troubleshooting

### Common Issues

1. **Name Conflict**: If `appium-installer` is taken, use scoped name `@username/appium-installer`
2. **Permission Issues**: Ensure you have publish rights
3. **Version Conflicts**: Check existing versions with `npm view appium-installer versions`

### Useful Commands

```bash
# Check package status
npm view appium-installer

# Update package
npm version patch
npm publish

# Deprecate version
npm deprecate appium-installer@1.0.0 "Use version 3.0.0 instead"

# Unpublish (within 24 hours)
npm unpublish appium-installer@3.0.0
```

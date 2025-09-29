# Appium Installation Application v3.0

This application is an interactive terminal application developed to simplify [Appium 3.0](https://appium.io/docs/en/3.0/) installation. It supports all new features of Appium 3.0.

## Features

- 🔍 **Platform Detection**: Automatically detects Windows, macOS, Linux platforms
- 📦 **Node.js LTS Installation**: Platform-specific Node.js installation instructions
- 🚀 **Appium 3.0 Support**: Latest Appium versions and LTS support
- 📡 **Dynamic Version Fetching**: Real-time version information from NPM registry
- 🔧 **Advanced Driver Installation**: Appium 3.0 compatible drivers
- 🔌 **Plugin System**: Appium 3.0 plugin ecosystem
- ✅ **System Requirements**: Node.js 16+ check and validation
- 🎯 **Next Steps**: Post-installation guidance
- ⚠️ **Advanced Error Management**: Detailed error reporting and solution suggestions

## Installation

### NPM Package (Recommended)

```bash
# Install globally
npm install -g @erdncyz/appium-installer

# Run the application
appium-installer
```

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/erdincyilmaz/appium-installer.git
cd appium-installer

# Make file executable
chmod +x appium-installer.js

# Run the application
node appium-installer.js
```

## Usage

### 1. Running the Application

```bash
# If installed via npm
appium-installer

# If running manually
node appium-installer.js
```

### 2. Installation Steps

1. **Platform Selection**: Choose Windows, macOS, or Linux
2. **Node.js Check**: Current Node.js installation is checked
3. **Node.js Installation**: Platform-specific installation instructions if needed
4. **Appium Version Selection**: Choose your desired Appium version
5. **Driver Selection**: Select the Appium drivers you need
6. **Plugin Selection**: Choose the plugins you want
7. **Installation**: All selected components are installed automatically
8. **Verification**: Check if installations were successful

## Supported Platforms

### Windows
- Node.js: Download LTS version from https://nodejs.org
- PowerShell/CMD support

### macOS
- Automatic installation with Homebrew
- Manual installation instructions

### Linux
- Ubuntu/Debian: `sudo apt install nodejs npm`
- CentOS/RHEL: `sudo yum install nodejs npm`

## Supported Appium Versions

- **latest** (most recent - Appium 3.0+)
- **LTS** (recommended - Appium 3.0)
- **Dynamic versions**: Fetched in real-time from NPM registry
- **Backward compatibility**: Appium 2.x and 1.x versions

## Supported Drivers

### 🏢 **Official Appium Drivers**
- **chromium** (Chromium - Chrome, Edge)
- **espresso** (Espresso - Android Native)
- **gecko** (Gecko - Firefox)
- **mac2** (Mac2 - macOS Native)
- **safari** (Safari - Safari Browser)
- **uiautomator2** (UiAutomator2 - Android, TV, Wear)
- **windows** (Windows - Windows Native)
- **xcuitest** (XCUITest - iOS, iPadOS, tvOS)

### 🔌 **Third-party Drivers**
- **appium-flutter-driver** (Flutter - iOS/Android)
- **appium-flutter-integration-driver** (Flutter Integration)
- **appium-lg-webos-driver** (LG WebOS - LG TV)
- **appium-novawindows-driver** (NovaWindows - Windows)
- **@headspinio/appium-roku-driver** (Roku - Roku Channels)
- **appium-tizen-tv-driver** (TizenTV - Tizen TV)

### ⚠️ **Legacy Drivers** (Warning: Appium 1 only)
- **appium-tizen-driver** (Tizen - Legacy)
- **appium-youiengine-driver** (You.i Engine - Legacy)

### 📡 **Dynamic Driver System**
- **Real-time driver list**: Automatically fetched from Appium 3.0
- **Smart installation**: Correct installation command based on driver type
- **Detailed info**: [Appium Driver Documentation](https://appium.io/docs/en/3.0/ecosystem/drivers/)

## Supported Plugins

### 🏢 **Official Appium Plugins**
- **execute-driver** (Execute Driver - Batch command execution)
- **images** (Images - Image matching)
- **inspector** (Inspector - Appium Inspector integration)
- **relaxed-caps** (Relaxed Caps - Vendor prefix flexibility)
- **storage** (Storage - Server-side storage)
- **universal-xml** (Universal XML - Common XML format)

### 🔌 **Third-party Plugins**
- **appium-altunity-plugin** (AltUnity - Unity games)
- **appium-device-farm** (Device Farm - Device management)
- **appium-gestures-plugin** (Gestures - W3C Actions)
- **appium-interceptor** (Interceptor - API mocking)
- **appium-ocr-plugin** (OCR - Text recognition)
- **appium-reporter-plugin** (Reporter - HTML reports)
- **appium-wait-plugin** (Wait - Timeout management)

### 📚 **Client Libraries**
- **appium-dotnet-client** (.NET)
- **appium-python-client** (Python)
- **appium-java-client** (Java)
- **appium-javascript-client** (JavaScript)
- **appium-ruby-client** (Ruby)
- **appium-php-client** (PHP)
- **appium-csharp-client** (C#)
- **appium-go-client** (Go)

### 🛠️ **Tools**

#### 🏢 **Official Tools**
- **appium-inspector** (Appium Inspector - Graphical test development tool)

#### 🔧 **Extension Tools**
- **appium-doctor** (Appium Doctor - Environment validation tool)

#### 🔌 **Other Tools**
- **appium-installer** (Appium Installer - Setup tool)
- **appium-selenium-ide** (Selenium IDE)

### 📡 **Dynamic Plugin System**
- **Real-time plugin list**: Automatically fetched from Appium 3.0
- **Smart installation**: Correct installation command based on plugin type
- **Detailed info**: [Appium Plugin Documentation](https://appium.io/docs/en/3.0/ecosystem/plugins/)
- **Tools**: [Appium Tools Documentation](https://appium.io/docs/en/3.0/ecosystem/tools/)

### 🤖 **Platform-Specific Requirements**
- **Android Automation**: Android SDK, Java JDK, ADB device check
- **iOS Automation**: Xcode, xcrun simctl, iOS Simulator, WebDriverAgent, Carthage check
- **Automatic Validation**: Platform requirements checked after installation
- **Detailed Instructions**: Step-by-step installation guide for missing requirements
- **XCUITest Driver**: [Appium XCUITest Driver](https://appium.github.io/appium-xcuitest-driver/latest/installation/) specific requirements

## Error Management

The application detects failed installations and provides manual installation instructions to users:

### 🚀 **Appium Installation**
- Failed Appium installation: `npm install -g appium@[version]`

### 🔧 **Driver Installation**
- **Official drivers**: `appium driver install [driver-name]`
- **Third-party drivers**: `appium driver install --source=npm [driver-name]`
- **Legacy drivers**: `npm install [driver-name]` (⚠️ Appium 1 only)

### 🔌 **Plugin Installation**
- **Official plugins**: `appium plugin install [plugin-name]`
- **Third-party plugins**: `appium plugin install --source=npm [plugin-name]`
- **Client libraries**: `npm install -g [plugin-name]`

### 🛠️ **Tool Installation**
- **Official tools**: `npm install -g [tool-name]`
- **Extension tools**: Integrated with Appium CLI (usage: `appium doctor [driver|plugin] <extension-name>`)
- **Other tools**: `npm install -g [tool-name]`

### 📋 **Installation Verification**
- Appium version: `appium --version`
- Driver list: `appium driver list`
- Plugin list: `appium plugin list`

## Requirements

- **Node.js 16.0.0+** (recommended for Appium 3.0)
- **npm 8.0.0+** (comes with Node.js)
- **Internet connection** (for installations)
- **Platform-specific requirements**:
  - **Windows**: PowerShell or CMD
  - **macOS**: Homebrew (optional)
  - **Linux**: sudo privileges

## NPM Package Information

- **Package Name**: `@erdncyz/appium-installer`
- **Version**: 3.0.0
- **Global Command**: `appium-installer`
- **Repository**: https://github.com/erdncyz/appium-installer
- **NPM**: https://www.npmjs.com/package/@erdncyz/appium-installer

## License

MIT License

## Contributing

This project is open source. We welcome your contributions!

## Support

If you encounter any issues, please report them in the GitHub Issues section.
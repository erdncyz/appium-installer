#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');

class AppiumInstaller {
    constructor() {
        this.platform = null;
        this.appiumVersion = null;
        this.selectedDrivers = [];
        this.selectedPlugins = [];
        this.failedInstallations = [];
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async question(prompt) {
        return new Promise((resolve) => {
            this.rl.question(prompt, resolve);
        });
    }

    async selectFromList(items, prompt) {
        console.log(`\n${prompt}`);
        items.forEach((item, index) => {
            console.log(`${index + 1}. ${item}`);
        });
        
        while (true) {
            const answer = await this.question('\nMake your selection (number): ');
            const choice = parseInt(answer) - 1;
            if (choice >= 0 && choice < items.length) {
                return items[choice];
            }
            console.log('Invalid selection. Please try again.');
        }
    }

    async selectMultipleFromList(items, prompt) {
        console.log(`\n${prompt}`);
        items.forEach((item, index) => {
            console.log(`${index + 1}. ${item}`);
        });
        
        const answer = await this.question('\nMake your selections (comma-separated, e.g. 1,3,5): ');
        const choices = answer.split(',').map(c => parseInt(c.trim()) - 1);
        return choices.filter(c => c >= 0 && c < items.length).map(c => items[c]);
    }

    detectPlatform() {
        const platform = process.platform;
        if (platform === 'win32') return 'Windows';
        if (platform === 'darwin') return 'macOS';
        if (platform === 'linux') return 'Linux';
        return 'Unknown';
    }

    async selectPlatform() {
        const detectedPlatform = this.detectPlatform();
        console.log(`\n🔍 Detected platform: ${detectedPlatform}`);
        
        const platforms = ['Windows', 'macOS', 'Linux'];
        this.platform = await this.selectFromList(platforms, 'Which platform are you using?');
        console.log(`✅ Selected platform: ${this.platform}`);
    }

    async checkNodeInstallation() {
        try {
            const version = execSync('node --version', { encoding: 'utf8' }).trim();
            console.log(`✅ Node.js already installed: ${version}`);
            return true;
        } catch (error) {
            console.log('❌ Node.js not installed');
            return false;
        }
    }

    async installNode() {
        console.log('\n📦 Starting Node.js LTS installation...');
        
        if (this.platform === 'Windows') {
            console.log('Node.js installation for Windows:');
            console.log('1. Download LTS version from https://nodejs.org');
            console.log('2. Run the downloaded .msi file');
            console.log('3. Restart terminal after installation');
            await this.question('Press Enter after installation is complete...');
        } else if (this.platform === 'macOS') {
            try {
                console.log('Installing Node.js with Homebrew...');
                execSync('brew install node', { stdio: 'inherit' });
            } catch (error) {
                console.log('Homebrew not found. Manual installation required:');
                console.log('Download LTS version from https://nodejs.org');
                await this.question('Press Enter after installation is complete...');
            }
        } else {
            console.log('Node.js installation for Linux:');
            console.log('Ubuntu/Debian: sudo apt update && sudo apt install nodejs npm');
            console.log('CentOS/RHEL: sudo yum install nodejs npm');
            await this.question('Press Enter after installation is complete...');
        }
    }

    async fetchAppiumVersions() {
        try {
            console.log('📡 Fetching Appium versions...');
            const response = execSync('npm view appium versions --json', { encoding: 'utf8' });
            const versions = JSON.parse(response);
            
            // Get last 10 versions and reverse order (newest first)
            const recentVersions = versions.slice(-10).reverse();
            
            // Highlight LTS and latest versions
            const versionOptions = [
                'latest (most recent)',
                'LTS (recommended)',
                ...recentVersions.slice(0, 8).map(v => v)
            ];
            
            return versionOptions;
        } catch (error) {
            console.log('⚠️  Could not fetch versions, using default list...');
            return [
                'latest (most recent)',
                '3.0.0 (LTS)',
                '2.0.0',
                '1.22.3',
                '1.22.2',
                '1.22.1',
                '1.22.0'
            ];
        }
    }

    async selectAppiumVersion() {
        const versions = await this.fetchAppiumVersions();
        
        this.appiumVersion = await this.selectFromList(versions, 'Which Appium version would you like to install?');
        
        // Clean version selection
        if (this.appiumVersion.includes('(most recent)')) {
            this.appiumVersion = 'latest';
        } else if (this.appiumVersion.includes('(LTS)')) {
            this.appiumVersion = '3.0.0';
        }
        
        console.log(`✅ Selected Appium version: ${this.appiumVersion}`);
    }

    async installAppium() {
        console.log('\n🚀 Starting Appium installation...');
        
        try {
            const installCommand = this.appiumVersion === 'latest' 
                ? 'npm install -g appium@latest'
                : `npm install -g appium@${this.appiumVersion}`;
            
            console.log(`Running command: ${installCommand}`);
            execSync(installCommand, { stdio: 'inherit' });
            console.log('✅ Appium installed successfully');
        } catch (error) {
            console.log('❌ Appium installation failed');
            this.failedInstallations.push(`Appium ${this.appiumVersion}`);
        }
    }

    async fetchAvailableDrivers() {
        try {
            console.log('📡 Fetching available drivers...');
            const response = execSync('appium driver list --installed=false', { encoding: 'utf8' });
            const drivers = response.split('\n')
                .filter(line => line.includes('@'))
                .map(line => line.trim().split(' ')[0])
                .filter(driver => driver && driver.startsWith('appium-'));
            
            return drivers.length > 0 ? drivers : this.getDefaultDrivers();
        } catch (error) {
            console.log('⚠️  Could not fetch driver list, using default list...');
            return this.getDefaultDrivers();
        }
    }

    getDefaultDrivers() {
        return [
            // Official Appium Drivers
            'chromium (Chromium - Chrome, Edge)',
            'espresso (Espresso - Android Native)',
            'gecko (Gecko - Firefox)',
            'mac2 (Mac2 - macOS Native)',
            'safari (Safari - Safari Browser)',
            'uiautomator2 (UiAutomator2 - Android, TV, Wear)',
            'windows (Windows - Windows Native)',
            'xcuitest (XCUITest - iOS, iPadOS, tvOS)',
            
            // Other Drivers
            'appium-flutter-driver (Flutter - iOS/Android)',
            'appium-flutter-integration-driver (Flutter Integration)',
            'appium-lg-webos-driver (LG WebOS - LG TV)',
            'appium-novawindows-driver (NovaWindows - Windows)',
            '@headspinio/appium-roku-driver (Roku - Roku Channels)',
            'appium-tizen-tv-driver (TizenTV - Tizen TV)',
            
            // Legacy Drivers (Warning)
            'appium-tizen-driver (Tizen - Legacy, Appium 1 only)',
            'appium-youiengine-driver (You.i Engine - Legacy, Appium 1 only)'
        ];
    }

    async selectDrivers() {
        const drivers = await this.fetchAvailableDrivers();
        
        this.selectedDrivers = await this.selectMultipleFromList(drivers, 'Which Appium drivers would you like to install?');
        
        // Clean driver names (remove descriptions)
        this.selectedDrivers = this.selectedDrivers.map(driver => 
            driver.includes('(') ? driver.split('(')[0].trim() : driver
        );
        
        console.log(`✅ Selected drivers: ${this.selectedDrivers.join(', ')}`);
    }

    async installDrivers() {
        console.log('\n🔧 Installing Appium drivers...');
        
        for (const driver of this.selectedDrivers) {
            try {
                console.log(`\n📦 Installing ${driver}...`);
                
                // Official drivers use appium driver install command
                if (this.isOfficialDriver(driver)) {
                    const driverName = this.getDriverInstallName(driver);
                    execSync(`appium driver install ${driverName}`, { stdio: 'inherit' });
                } 
                // Third-party drivers use npm install
                else if (this.isThirdPartyDriver(driver)) {
                    const driverName = this.getDriverInstallName(driver);
                    execSync(`appium driver install --source=npm ${driverName}`, { stdio: 'inherit' });
                }
                // Legacy drivers use npm install
                else if (this.isLegacyDriver(driver)) {
                    const driverName = this.getDriverInstallName(driver);
                    console.log(`⚠️  ${driverName} is a legacy driver and only compatible with Appium 1!`);
                    execSync(`npm install ${driverName}`, { stdio: 'inherit' });
                }
                
                console.log(`✅ ${driver} installed successfully`);
            } catch (error) {
                console.log(`❌ ${driver} installation failed`);
                this.failedInstallations.push(driver);
            }
        }
    }

    isOfficialDriver(driver) {
        const officialDrivers = ['chromium', 'espresso', 'gecko', 'mac2', 'safari', 'uiautomator2', 'windows', 'xcuitest'];
        return officialDrivers.some(offDriver => driver.includes(offDriver));
    }

    isThirdPartyDriver(driver) {
        const thirdPartyDrivers = ['appium-flutter-driver', 'appium-flutter-integration-driver', 'appium-lg-webos-driver', 'appium-novawindows-driver', '@headspinio/appium-roku-driver', 'appium-tizen-tv-driver'];
        return thirdPartyDrivers.some(thirdDriver => driver.includes(thirdDriver));
    }

    isLegacyDriver(driver) {
        const legacyDrivers = ['appium-tizen-driver', 'appium-youiengine-driver'];
        return legacyDrivers.some(legacyDriver => driver.includes(legacyDriver));
    }

    getDriverInstallName(driver) {
        // Remove descriptions and get only driver name
        return driver.split('(')[0].trim();
    }

    async fetchAvailablePlugins() {
        try {
            console.log('📡 Fetching available plugins...');
            const response = execSync('appium plugin list --installed=false', { encoding: 'utf8' });
            const plugins = response.split('\n')
                .filter(line => line.includes('@'))
                .map(line => line.trim().split(' ')[0])
                .filter(plugin => plugin && plugin.startsWith('appium-'));
            
            return plugins.length > 0 ? plugins : this.getDefaultPlugins();
        } catch (error) {
            console.log('⚠️  Could not fetch plugin list, using default list...');
            return this.getDefaultPlugins();
        }
    }

    getDefaultPlugins() {
        return [
            // Official Appium Plugins
            'execute-driver (Execute Driver - Official)',
            'images (Images - Official)',
            'inspector (Inspector - Official)',
            'relaxed-caps (Relaxed Caps - Official)',
            'storage (Storage - Official)',
            'universal-xml (Universal XML - Official)',
            
            // Third-party Plugins
            'appium-altunity-plugin (AltUnity - Unity Games)',
            'appium-device-farm (Device Farm - Device Management)',
            'appium-gestures-plugin (Gestures - W3C Actions)',
            'appium-interceptor (Interceptor - API Mocking)',
            'appium-ocr-plugin (OCR - Text Recognition)',
            'appium-reporter-plugin (Reporter - HTML Reports)',
            'appium-wait-plugin (Wait - Timeout Management)',
            
            // Client Libraries
            'appium-dotnet-client (.NET)',
            'appium-python-client (Python)',
            'appium-java-client (Java)',
            'appium-javascript-client (JavaScript)',
            'appium-ruby-client (Ruby)',
            'appium-php-client (PHP)',
            'appium-csharp-client (C#)',
            'appium-go-client (Go)',
            
            // Tools
            'appium-selenium-ide (Selenium IDE)',
            'appium-inspector (Appium Inspector)',
            
            // Official Tools
            'appium-inspector (Appium Inspector - Official)',
            
            // Extension Tools
            'appium-doctor (Appium Doctor - Environment Validation)',
            
            // Other Tools
            'appium-installer (Appium Installer - Setup Tool)'
        ];
    }

    async selectPlugins() {
        const plugins = await this.fetchAvailablePlugins();
        
        this.selectedPlugins = await this.selectMultipleFromList(plugins, 'Which Appium plugins would you like to install?');
        
        // Clean plugin names (remove descriptions)
        this.selectedPlugins = this.selectedPlugins.map(plugin => 
            plugin.includes('(') ? plugin.split('(')[0].trim() : plugin
        );
        
        console.log(`✅ Selected plugins: ${this.selectedPlugins.join(', ')}`);
    }

    async installPlugins() {
        console.log('\n🔌 Installing Appium plugins...');
        
        for (const plugin of this.selectedPlugins) {
            try {
                console.log(`\n📦 Installing ${plugin}...`);
                
                // Official plugins use appium plugin install command
                if (this.isOfficialPlugin(plugin)) {
                    const pluginName = this.getPluginInstallName(plugin);
                    execSync(`appium plugin install ${pluginName}`, { stdio: 'inherit' });
                } 
                // Third-party plugins use npm install
                else if (this.isThirdPartyPlugin(plugin)) {
                    const pluginName = this.getPluginInstallName(plugin);
                    execSync(`appium plugin install --source=npm ${pluginName}`, { stdio: 'inherit' });
                }
                // Official tools use npm install
                else if (this.isOfficialTool(plugin)) {
                    const toolName = this.getPluginInstallName(plugin);
                    execSync(`npm install -g ${toolName}`, { stdio: 'inherit' });
                }
                // Extension tools use appium doctor command
                else if (this.isExtensionTool(plugin)) {
                    const toolName = this.getPluginInstallName(plugin);
                    console.log(`ℹ️  ${toolName} is integrated with Appium CLI`);
                    console.log(`   Usage: appium doctor [driver|plugin] <extension-name>`);
                }
                // Other tools use npm install
                else if (this.isOtherTool(plugin)) {
                    const toolName = this.getPluginInstallName(plugin);
                    execSync(`npm install -g ${toolName}`, { stdio: 'inherit' });
                }
                // Client libraries use npm install
                else {
                    const pluginName = this.getPluginInstallName(plugin);
                    execSync(`npm install -g ${pluginName}`, { stdio: 'inherit' });
                }
                
                console.log(`✅ ${plugin} installed successfully`);
            } catch (error) {
                console.log(`❌ ${plugin} installation failed`);
                this.failedInstallations.push(plugin);
            }
        }
    }

    isOfficialPlugin(plugin) {
        const officialPlugins = ['execute-driver', 'images', 'inspector', 'relaxed-caps', 'storage', 'universal-xml'];
        return officialPlugins.some(offPlugin => plugin.includes(offPlugin));
    }

    isThirdPartyPlugin(plugin) {
        const thirdPartyPlugins = ['appium-altunity-plugin', 'appium-device-farm', 'appium-gestures-plugin', 'appium-interceptor', 'appium-ocr-plugin', 'appium-reporter-plugin', 'appium-wait-plugin'];
        return thirdPartyPlugins.some(thirdPlugin => plugin.includes(thirdPlugin));
    }

    isOfficialTool(tool) {
        const officialTools = ['appium-inspector'];
        return officialTools.some(offTool => tool.includes(offTool));
    }

    isExtensionTool(tool) {
        const extensionTools = ['appium-doctor'];
        return extensionTools.some(extTool => tool.includes(extTool));
    }

    isOtherTool(tool) {
        const otherTools = ['appium-installer'];
        return otherTools.some(otherTool => tool.includes(otherTool));
    }

    getPluginInstallName(plugin) {
        // Remove descriptions and get only plugin name
        return plugin.split('(')[0].trim();
    }

    async verifyInstallation() {
        console.log('\n🔍 Verifying installation...');
        
        try {
            const appiumVersion = execSync('appium --version', { encoding: 'utf8' }).trim();
            console.log(`✅ Appium version: ${appiumVersion}`);
        } catch (error) {
            console.log('❌ Could not verify Appium installation');
        }

        try {
            const drivers = execSync('appium driver list', { encoding: 'utf8' });
            console.log('\n📋 Installed drivers:');
            console.log(drivers);
        } catch (error) {
            console.log('❌ Could not get driver list');
        }
    }

    async showFailedInstallations() {
        if (this.failedInstallations.length > 0) {
            console.log('\n⚠️  Failed installations:');
            this.failedInstallations.forEach(item => {
                console.log(`❌ ${item}`);
            });
            
            console.log('\n🔧 Manual installation instructions:');
            this.failedInstallations.forEach(item => {
                if (item.startsWith('Appium')) {
                    console.log(`- Appium: npm install -g appium@${this.appiumVersion}`);
                } else if (item.includes('driver')) {
                    console.log(`- ${item}: appium driver install ${item}`);
                } else {
                    console.log(`- ${item}: npm install -g ${item}`);
                }
            });
        } else {
            console.log('\n🎉 All installations completed successfully!');
        }
    }

    async checkSystemRequirements() {
        console.log('\n🔍 Checking system requirements...');
        
        // Node.js version check
        try {
            const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
            const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
            
            if (majorVersion < 16) {
                console.log('⚠️  Node.js 16+ recommended. Current version:', nodeVersion);
                const continueInstall = await this.question('Do you want to continue? (y/n): ');
                if (continueInstall.toLowerCase() !== 'y') {
                    return false;
                }
            } else {
                console.log(`✅ Node.js version suitable: ${nodeVersion}`);
            }
        } catch (error) {
            console.log('❌ Node.js not found');
            return false;
        }

        // NPM version check
        try {
            const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
            console.log(`✅ NPM version: ${npmVersion}`);
        } catch (error) {
            console.log('❌ NPM not found');
            return false;
        }

        return true;
    }

    async showAppiumInfo() {
        console.log('\n📚 About Appium 3.0:');
        console.log('• Appium 3.0 is the latest version');
        console.log('• WebDriver BiDi protocol support');
        console.log('• Advanced plugin system');
        console.log('• Better performance and security');
        console.log('• Detailed info: https://appium.io/docs/en/3.0/');
    }

    async checkAndroidRequirements() {
        console.log('\n🤖 Checking Android automation requirements...');
        
        const requirements = {
            androidSdk: false,
            javaJdk: false,
            adbDevices: false
        };

        // Android SDK check
        try {
            const androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
            if (androidHome) {
                console.log(`✅ ANDROID_HOME: ${androidHome}`);
                requirements.androidSdk = true;
            } else {
                console.log('❌ ANDROID_HOME environment variable not set');
            }
        } catch (error) {
            console.log('❌ Android SDK not found');
        }

        // Java JDK check
        try {
            const javaHome = process.env.JAVA_HOME;
            if (javaHome) {
                console.log(`✅ JAVA_HOME: ${javaHome}`);
                requirements.javaJdk = true;
            } else {
                console.log('❌ JAVA_HOME environment variable not set');
            }
        } catch (error) {
            console.log('❌ Java JDK not found');
        }

        // ADB device check
        try {
            const adbOutput = execSync('adb devices', { encoding: 'utf8' });
            if (adbOutput.includes('device') && !adbOutput.includes('List of devices attached')) {
                console.log('✅ ADB devices found');
                requirements.adbDevices = true;
            } else {
                console.log('⚠️  No ADB devices found (emulator or real device required)');
            }
        } catch (error) {
            console.log('❌ ADB command could not be executed');
        }

        return requirements;
    }

    async showAndroidSetupInstructions() {
        console.log('\n📱 Android Automation Setup Instructions:');
        console.log('==========================================');
        
        console.log('\n🔧 Android SDK Installation:');
        console.log('1. Download Android Studio: https://developer.android.com/studio');
        console.log('2. Open Android Studio and go to SDK Manager');
        console.log('3. Settings -> Languages & Frameworks -> Android SDK');
        console.log('4. Download Android SDK Platform (API level 30+)');
        console.log('5. Download Android SDK Platform-Tools');
        console.log('6. Set ANDROID_HOME environment variable');
        
        console.log('\n☕ Java JDK Installation:');
        console.log('1. Download Java JDK 8+: https://adoptium.net/');
        console.log('2. Set JAVA_HOME environment variable');
        
        console.log('\n📱 Device Preparation:');
        console.log('1. Android Emulator: Create with Android Studio AVD Manager');
        console.log('2. Real Device: Enable USB Debugging');
        console.log('3. Test device connection: adb devices');
        
        console.log('\n🔍 Installation Verification:');
        console.log('1. appium driver doctor uiautomator2');
        console.log('2. appium server (check that driver is listed)');
    }

    async checkiOSRequirements() {
        console.log('\n🍎 Checking iOS automation requirements...');
        
        const requirements = {
            xcode: false,
            xcrun: false,
            simctl: false,
            webdriveragent: false,
            carthage: false
        };

        // Xcode check
        try {
            const xcodeVersion = execSync('xcodebuild -version', { encoding: 'utf8' });
            console.log(`✅ Xcode: ${xcodeVersion.split('\n')[0]}`);
            requirements.xcode = true;
        } catch (error) {
            console.log('❌ Xcode not found (required only on macOS)');
        }

        // xcrun check
        try {
            execSync('xcrun simctl list', { encoding: 'utf8' });
            console.log('✅ xcrun simctl available');
            requirements.xcrun = true;
        } catch (error) {
            console.log('❌ xcrun simctl not found');
        }

        // Simulator check
        try {
            const simOutput = execSync('xcrun simctl list devices', { encoding: 'utf8' });
            if (simOutput.includes('iPhone') || simOutput.includes('iPad')) {
                console.log('✅ iOS Simulators found');
                requirements.simctl = true;
            } else {
                console.log('⚠️  No iOS Simulator found');
            }
        } catch (error) {
            console.log('❌ iOS Simulator could not be checked');
        }

        // WebDriverAgent check
        try {
            const wdaPath = execSync('find /Applications/Xcode.app -name "WebDriverAgentRunner.app" 2>/dev/null', { encoding: 'utf8' });
            if (wdaPath.trim()) {
                console.log('✅ WebDriverAgent found');
                requirements.webdriveragent = true;
            } else {
                console.log('⚠️  WebDriverAgent not found (required for XCUITest driver)');
            }
        } catch (error) {
            console.log('❌ WebDriverAgent could not be checked');
        }

        // Carthage check
        try {
            const carthageVersion = execSync('carthage version', { encoding: 'utf8' });
            console.log(`✅ Carthage: ${carthageVersion.trim()}`);
            requirements.carthage = true;
        } catch (error) {
            console.log('❌ Carthage not found (required for WebDriverAgent)');
        }

        return requirements;
    }

    async showiOSSetupInstructions() {
        console.log('\n🍎 iOS Automation Setup Instructions:');
        console.log('=====================================');
        
        console.log('\n🔧 Xcode Installation:');
        console.log('1. Download Xcode from Mac App Store');
        console.log('2. Install Xcode Command Line Tools: xcode-select --install');
        console.log('3. Open Xcode and accept license');
        console.log('4. Open Xcode at least once and accept Developer Tools');
        
        console.log('\n📱 iOS Simulator Setup:');
        console.log('1. Xcode -> Window -> Devices and Simulators');
        console.log('2. Click + button in Simulators tab');
        console.log('3. Create iPhone/iPad simulator');
        console.log('4. Start simulator and test');
        
        console.log('\n🔧 Carthage Installation (for WebDriverAgent):');
        console.log('1. Install with Homebrew: brew install carthage');
        console.log('2. Alternative: https://github.com/Carthage/Carthage/releases');
        console.log('3. Verify installation: carthage version');
        
        console.log('\n🤖 WebDriverAgent Installation:');
        console.log('1. Install XCUITest driver: appium driver install xcuitest');
        console.log('2. WebDriverAgent will be installed automatically');
        console.log('3. WebDriverAgent will be compiled on first run');
        console.log('4. This process may take several minutes');
        
        console.log('\n🔍 Installation Verification:');
        console.log('1. appium driver doctor xcuitest');
        console.log('2. appium server (check that driver is listed)');
        console.log('3. Check WebDriverAgentRunner.app file existence');
        
        console.log('\n📚 Detailed Information:');
        console.log('- XCUITest Driver: https://appium.github.io/appium-xcuitest-driver/');
        console.log('- WebDriverAgent: https://github.com/appium/WebDriverAgent');
    }

    async showNextSteps() {
        console.log('\n🎯 Next Steps:');
        console.log('1. Start Appium server: appium server');
        console.log('2. Start writing tests: https://appium.io/docs/en/3.0/quickstart/');
        console.log('3. Use Appium Inspector: appium inspector');
        console.log('4. Documentation: https://appium.io/docs/en/3.0/');
        
        // Check platform-specific requirements
        if (this.platform === 'macOS') {
            const iosReqs = await this.checkiOSRequirements();
            const androidReqs = await this.checkAndroidRequirements();
            
            if (iosReqs.xcode && iosReqs.xcrun && iosReqs.simctl && iosReqs.webdriveragent && iosReqs.carthage) {
                console.log('\n🎉 iOS automation environment ready!');
            } else {
                console.log('\n⚠️  Additional setup required for iOS automation');
                await this.showiOSSetupInstructions();
            }
            
            if (androidReqs.androidSdk && androidReqs.javaJdk && androidReqs.adbDevices) {
                console.log('\n🎉 Android automation environment ready!');
            } else {
                console.log('\n⚠️  Additional setup required for Android automation');
                await this.showAndroidSetupInstructions();
            }
        } else {
            // Windows/Linux - Android only
            const androidReqs = await this.checkAndroidRequirements();
            
            if (androidReqs.androidSdk && androidReqs.javaJdk && androidReqs.adbDevices) {
                console.log('\n🎉 Android automation environment ready!');
            } else {
                console.log('\n⚠️  Additional setup required for Android automation');
                await this.showAndroidSetupInstructions();
            }
        }
    }

    async showMainMenu() {
        console.log('\n📋 Main Menu:');
        const menuOptions = [
            'Start Installation Process',
            'View Detailed Installation Documentation',
            'Exit'
        ];
        
        const choice = await this.selectFromList(menuOptions, 'What would you like to do?');
        return choice;
    }

    async showDetailedDocumentation() {
        console.log('\n📚 Detailed Installation Documentation');
        console.log('=====================================');
        
        const docSections = [
            'Appium 3.0 Overview',
            'System Requirements',
            'Node.js Installation',
            'Appium Installation',
            'Driver Installation',
            'Plugin Installation',
            'Platform-Specific Setup',
            'Configuration Management',
            'System Information',
            'Troubleshooting',
            'Back to Main Menu'
        ];
        
        while (true) {
            const section = await this.selectFromList(docSections, 'Select documentation section:');
            
            if (section === 'Back to Main Menu') {
                break;
            }
            
            await this.showDocumentationSection(section);
        }
    }

    async showDocumentationSection(section) {
        console.log(`\n📖 ${section}`);
        console.log('='.repeat(section.length + 4));
        
        switch (section) {
            case 'Appium 3.0 Overview':
                this.showAppiumOverview();
                break;
            case 'System Requirements':
                this.showSystemRequirements();
                break;
            case 'Node.js Installation':
                this.showNodeJSInstallation();
                break;
            case 'Appium Installation':
                this.showAppiumInstallation();
                break;
            case 'Driver Installation':
                this.showDriverInstallation();
                break;
            case 'Plugin Installation':
                this.showPluginInstallation();
                break;
            case 'Platform-Specific Setup':
                this.showPlatformSpecificSetup();
                break;
            case 'Configuration Management':
                this.showConfigurationManagement();
                break;
            case 'System Information':
                await this.showSystemInformation();
                break;
            case 'Troubleshooting':
                this.showTroubleshooting();
                break;
        }
        
        await this.question('\nPress Enter to continue...');
    }

    showAppiumOverview() {
        console.log(`
🚀 Appium 3.0 Overview
=====================

Appium 3.0 is the latest version of the open-source mobile automation framework.

Key Features:
• WebDriver BiDi protocol support
• Advanced plugin system
• Better performance and security
• Cross-platform support (iOS, Android, Windows, macOS)
• Multiple programming language support

Supported Platforms:
• Mobile: iOS, Android, Tizen
• Desktop: Windows, macOS, Linux
• Web: Chrome, Firefox, Safari
• TV: Roku, Android TV, Samsung TV

Documentation: https://appium.io/docs/en/3.0/
        `);
    }

    showSystemRequirements() {
        console.log(`
🔧 System Requirements
=====================

Minimum Requirements:
• Node.js 16.0.0 or higher
• npm (comes with Node.js)
• Internet connection
• Platform-specific tools

Platform-Specific Requirements:

Windows:
• PowerShell or CMD
• Administrator privileges (for some installations)
• Windows 10 or higher

macOS:
• Xcode (for iOS automation)
• Homebrew (recommended)
• macOS 10.15 or higher

Linux:
• sudo privileges
• Ubuntu 18.04+ or CentOS 7+
• Development tools

Mobile Automation Requirements:

Android:
• Android SDK
• Java JDK 8+
• Android device or emulator
• ANDROID_HOME environment variable

iOS (macOS only):
• Xcode
• iOS Simulator or device
• Carthage (for WebDriverAgent)
• Apple Developer account (for real devices)
        `);
    }

    showNodeJSInstallation() {
        console.log(`
📦 Node.js Installation Guide
============================

Method 1: Official Website (Recommended)
1. Visit https://nodejs.org
2. Download LTS version (Long Term Support)
3. Run the installer
4. Follow installation wizard
5. Restart terminal/command prompt
6. Verify: node --version

Method 2: Package Managers

Windows (Chocolatey):
1. Install Chocolatey: https://chocolatey.org/install
2. Run: choco install nodejs

macOS (Homebrew):
1. Install Homebrew: /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
2. Run: brew install node

Linux (Ubuntu/Debian):
1. Update package list: sudo apt update
2. Install Node.js: sudo apt install nodejs npm

Linux (CentOS/RHEL):
1. Install Node.js: sudo yum install nodejs npm

Verification:
• node --version (should show v16+)
• npm --version (should show 8+)
        `);
    }

    showAppiumInstallation() {
        console.log(`
🚀 Appium Installation Guide
===========================

Step 1: Install Appium
npm install -g appium@latest

Step 2: Verify Installation
appium --version

Step 3: Install Drivers
appium driver install uiautomator2  # Android
appium driver install xcuitest     # iOS (macOS only)

Step 4: Verify Drivers
appium driver list

Step 5: Start Appium Server
appium server

Alternative Installation Methods:

Using npm in project:
npm init -y
npm install appium
npx appium driver install uiautomator2

Using yarn:
yarn global add appium
yarn global add appium-uiautomator2-driver

Troubleshooting:
• Permission errors: Use sudo (Linux/macOS) or run as Administrator (Windows)
• Network issues: Check firewall and proxy settings
• Version conflicts: Use nvm to manage Node.js versions
        `);
    }

    showDriverInstallation() {
        console.log(`
🔧 Driver Installation Guide
============================

Official Drivers:
• chromium: appium driver install chromium
• espresso: appium driver install espresso
• gecko: appium driver install gecko
• mac2: appium driver install mac2
• safari: appium driver install safari
• uiautomator2: appium driver install uiautomator2
• windows: appium driver install windows
• xcuitest: appium driver install xcuitest

Third-party Drivers:
• appium-flutter-driver: appium driver install --source=npm appium-flutter-driver
• appium-device-farm: appium driver install --source=npm appium-device-farm
• appium-lg-webos-driver: appium driver install --source=npm appium-lg-webos-driver

Driver Selection Guide:

For Android:
• uiautomator2: Modern Android apps
• espresso: Android native apps
• flutter: Flutter apps

For iOS:
• xcuitest: iOS native apps
• flutter: Flutter apps

For Web:
• chromium: Chrome, Edge
• gecko: Firefox
• safari: Safari

For Desktop:
• windows: Windows apps
• mac2: macOS apps

Verification:
appium driver list
appium driver doctor [driver-name]
        `);
    }

    showPluginInstallation() {
        console.log(`
🔌 Plugin Installation Guide
===========================

Official Plugins:
• execute-driver: appium plugin install execute-driver
• images: appium plugin install images
• inspector: appium plugin install inspector
• relaxed-caps: appium plugin install relaxed-caps
• storage: appium plugin install storage
• universal-xml: appium plugin install universal-xml

Third-party Plugins:
• appium-altunity-plugin: appium plugin install --source=npm appium-altunity-plugin
• appium-device-farm: appium plugin install --source=npm appium-device-farm
• appium-gestures-plugin: appium plugin install --source=npm appium-gestures-plugin

Client Libraries:
• appium-python-client: pip install Appium-Python-Client
• appium-java-client: Add to Maven/Gradle dependencies
• appium-javascript-client: npm install appium-javascript-client
• appium-dotnet-client: dotnet add package Appium.WebDriver

Tools:
• appium-inspector: npm install -g appium-inspector
• appium-doctor: Integrated with Appium CLI

Plugin Management:
• List plugins: appium plugin list
• Uninstall plugin: appium plugin uninstall [plugin-name]
• Update plugin: appium plugin update [plugin-name]
        `);
    }

    showPlatformSpecificSetup() {
        console.log(`
🤖 Platform-Specific Setup
==========================

Android Setup:

1. Install Android Studio:
   • Download from https://developer.android.com/studio
   • Install with default settings
   • Open SDK Manager

2. Install Android SDK:
   • Android SDK Platform (API 30+)
   • Android SDK Platform-Tools
   • Android SDK Build-Tools

3. Set Environment Variables:
   • ANDROID_HOME: Path to Android SDK
   • Add to PATH: $ANDROID_HOME/platform-tools

4. Install Java JDK:
   • Download from https://adoptium.net/
   • Set JAVA_HOME environment variable

5. Setup Device/Emulator:
   • Create AVD in Android Studio
   • Or connect real device with USB Debugging

iOS Setup (macOS only):

1. Install Xcode:
   • Download from Mac App Store
   • Open Xcode and accept license
   • Install Command Line Tools: xcode-select --install

2. Install Carthage:
   • brew install carthage
   • Or download from GitHub releases

3. Setup Simulator:
   • Xcode → Window → Devices and Simulators
   • Create iPhone/iPad simulator
   • Test simulator functionality

4. WebDriverAgent:
   • Automatically installed with XCUITest driver
   • First run will compile (takes several minutes)

Verification Commands:
• Android: adb devices
• iOS: xcrun simctl list devices
• Appium: appium driver doctor [driver-name]
        `);
    }

    showConfigurationManagement() {
        console.log(`
⚙️ Configuration Management
===========================

1. Appium Configuration File (.appiumrc.json):

Basic Configuration:
{
  "server": {
    "port": 4723,
    "host": "0.0.0.0",
    "log-level": "info"
  },
  "plugins": {
    "images": {
      "enabled": true
    },
    "relaxed-caps": {
      "enabled": true
    }
  }
}

Advanced Configuration:
{
  "server": {
    "port": 4723,
    "host": "0.0.0.0",
    "log-level": "debug",
    "session-override": true,
    "relaxed-security": true,
    "allow-cors": true,
    "allow-insecure": ["chromedriver_autodownload"]
  },
  "plugins": {
    "images": {
      "enabled": true,
      "threshold": 0.4
    },
    "relaxed-caps": {
      "enabled": true
    },
    "execute-driver": {
      "enabled": true
    }
  }
}

2. Capability Templates:

Android (UiAutomator2):
{
  "platformName": "Android",
  "automationName": "UiAutomator2",
  "deviceName": "Android Emulator",
  "app": "/path/to/app.apk",
  "appPackage": "com.example.app",
  "appActivity": ".MainActivity",
  "noReset": true,
  "fullReset": false
}

iOS (XCUITest):
{
  "platformName": "iOS",
  "automationName": "XCUITest",
  "deviceName": "iPhone 14",
  "app": "/path/to/app.app",
  "bundleId": "com.example.app",
  "noReset": true,
  "fullReset": false
}

Web (Chrome):
{
  "platformName": "Android",
  "automationName": "UiAutomator2",
  "deviceName": "Android Emulator",
  "browserName": "Chrome",
  "chromedriverExecutable": "/path/to/chromedriver"
}

3. Server Settings:

Start Appium Server:
appium server --port 4723 --host 0.0.0.0

With Configuration File:
appium server --config .appiumrc.json

With Custom Settings:
appium server --port 4724 --log-level debug --relaxed-security

4. Environment Variables:

APPIUM_HOME=/usr/local/lib/node_modules/appium
ANDROID_HOME=/Users/username/Library/Android/sdk
JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-11.jdk/Contents/Home

5. Driver Configuration:

UiAutomator2 Driver:
{
  "server": {
    "port": 4723
  },
  "uiautomator2": {
    "skipServerInstallation": false,
    "enforceXPath1": true
  }
}

XCUITest Driver:
{
  "server": {
    "port": 4723
  },
  "xcuitest": {
    "skipServerInstallation": false,
    "useNewWDA": false,
    "wdaStartupRetries": 3
  }
}

6. Plugin Configuration:

Images Plugin:
{
  "images": {
    "enabled": true,
    "threshold": 0.4,
    "matchTemplate": true
  }
}

Relaxed Caps Plugin:
{
  "relaxed-caps": {
    "enabled": true,
    "allowInsecure": ["chromedriver_autodownload"]
  }
}

7. Logging Configuration:

Log Levels:
• error: Only error messages
• warn: Warning and error messages
• info: General information (default)
• debug: Detailed debugging information
• verbose: Very detailed information

Log Output:
appium server --log-level debug --log-timestamp

8. Security Settings:

Relaxed Security:
appium server --relaxed-security

Allow CORS:
appium server --allow-cors

Allow Insecure:
appium server --allow-insecure chromedriver_autodownload

9. Performance Optimization:

Session Override:
appium server --session-override

Keep Alive:
appium server --keep-alive-timeout 600

10. Configuration Examples:

Development Environment:
{
  "server": {
    "port": 4723,
    "log-level": "debug",
    "relaxed-security": true
  }
}

Production Environment:
{
  "server": {
    "port": 4723,
    "log-level": "info",
    "session-override": false
  }
}

CI/CD Environment:
{
  "server": {
    "port": 4723,
    "log-level": "warn",
    "keep-alive-timeout": 300
  }
}
        `);
    }

    async showSystemInformation() {
        console.log('\n📊 System Information');
        console.log('=====================');
        
        try {
            // System Information
            console.log('\n🖥️  System Information:');
            console.log(`Platform: ${process.platform}`);
            console.log(`Architecture: ${process.arch}`);
            console.log(`Node.js Version: ${process.version}`);
            console.log(`NPM Version: ${await this.getNPMVersion()}`);
            
            // Memory Information
            console.log('\n💾 Memory Information:');
            const memUsage = process.memoryUsage();
            console.log(`RSS: ${Math.round(memUsage.rss / 1024 / 1024)} MB`);
            console.log(`Heap Total: ${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`);
            console.log(`Heap Used: ${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`);
            console.log(`External: ${Math.round(memUsage.external / 1024 / 1024)} MB`);
            
            // Disk Space
            console.log('\n💿 Disk Space:');
            await this.showDiskSpace();
            
            // Installed Versions
            console.log('\n📦 Installed Versions:');
            await this.showInstalledVersions();
            
            // Environment Variables
            console.log('\n🌍 Environment Variables:');
            this.showEnvironmentVariables();
            
            // Network Information
            console.log('\n🌐 Network Information:');
            await this.showNetworkInfo();
            
        } catch (error) {
            console.log(`❌ Error getting system information: ${error.message}`);
        }
    }

    async getNPMVersion() {
        try {
            return execSync('npm --version', { encoding: 'utf8' }).trim();
        } catch (error) {
            return 'Not available';
        }
    }

    async showDiskSpace() {
        try {
            if (process.platform === 'win32') {
                const output = execSync('wmic logicaldisk get size,freespace,caption', { encoding: 'utf8' });
                console.log('Windows Disk Space:');
                console.log(output);
            } else {
                const output = execSync('df -h', { encoding: 'utf8' });
                console.log('Disk Space:');
                console.log(output);
            }
        } catch (error) {
            console.log('❌ Could not get disk space information');
        }
    }

    async showInstalledVersions() {
        try {
            // Node.js and NPM
            console.log(`Node.js: ${process.version}`);
            console.log(`NPM: ${await this.getNPMVersion()}`);
            
            // Appium
            try {
                const appiumVersion = execSync('appium --version', { encoding: 'utf8' }).trim();
                console.log(`Appium: ${appiumVersion}`);
            } catch (error) {
                console.log('Appium: Not installed');
            }
            
            // Java (for Android)
            try {
                const javaVersion = execSync('java -version 2>&1', { encoding: 'utf8' });
                const versionLine = javaVersion.split('\n')[0];
                console.log(`Java: ${versionLine}`);
            } catch (error) {
                console.log('Java: Not installed');
            }
            
            // Python
            try {
                const pythonVersion = execSync('python --version', { encoding: 'utf8' }).trim();
                console.log(`Python: ${pythonVersion}`);
            } catch (error) {
                console.log('Python: Not installed');
            }
            
            // Git
            try {
                const gitVersion = execSync('git --version', { encoding: 'utf8' }).trim();
                console.log(`Git: ${gitVersion}`);
            } catch (error) {
                console.log('Git: Not installed');
            }
            
            // Platform-specific tools
            if (process.platform === 'darwin') {
                // Xcode
                try {
                    const xcodeVersion = execSync('xcodebuild -version', { encoding: 'utf8' }).trim();
                    console.log(`Xcode: ${xcodeVersion.split('\n')[0]}`);
                } catch (error) {
                    console.log('Xcode: Not installed');
                }
                
                // Homebrew
                try {
                    const brewVersion = execSync('brew --version', { encoding: 'utf8' }).trim();
                    console.log(`Homebrew: ${brewVersion.split('\n')[0]}`);
                } catch (error) {
                    console.log('Homebrew: Not installed');
                }
            }
            
            // Android tools
            try {
                const adbVersion = execSync('adb version', { encoding: 'utf8' }).trim();
                console.log(`ADB: ${adbVersion.split('\n')[0]}`);
            } catch (error) {
                console.log('ADB: Not installed');
            }
            
        } catch (error) {
            console.log('❌ Could not get installed versions');
        }
    }

    showEnvironmentVariables() {
        const importantVars = [
            'NODE_PATH',
            'NPM_CONFIG_PREFIX',
            'ANDROID_HOME',
            'ANDROID_SDK_ROOT',
            'JAVA_HOME',
            'PATH'
        ];
        
        importantVars.forEach(varName => {
            const value = process.env[varName];
            if (value) {
                console.log(`${varName}: ${value}`);
            } else {
                console.log(`${varName}: Not set`);
            }
        });
    }

    async showNetworkInfo() {
        try {
            const os = require('os');
            const networkInterfaces = os.networkInterfaces();
            
            console.log('Network Interfaces:');
            Object.keys(networkInterfaces).forEach(interfaceName => {
                const interfaces = networkInterfaces[interfaceName];
                interfaces.forEach(interfaceInfo => {
                    if (interfaceInfo.family === 'IPv4' && !interfaceInfo.internal) {
                        console.log(`${interfaceName}: ${interfaceInfo.address}`);
                    }
                });
            });
        } catch (error) {
            console.log('❌ Could not get network information');
        }
    }

    showTroubleshooting() {
        console.log(`
🔧 Troubleshooting Guide
=======================

Common Issues:

1. Node.js Issues:
   • Permission denied: Use sudo (Linux/macOS) or run as Administrator (Windows)
   • Version conflicts: Use nvm to manage versions
   • PATH issues: Restart terminal after installation

2. Appium Installation Issues:
   • Network errors: Check internet connection and proxy settings
   • Permission errors: Use --unsafe-perm flag
   • Version conflicts: Clear npm cache: npm cache clean --force

3. Driver Issues:
   • Driver not found: Check driver installation with appium driver list
   • Permission errors: Run with appropriate privileges
   • Version mismatches: Update drivers to latest versions

4. Platform-Specific Issues:

Android:
• ADB not found: Check ANDROID_HOME and PATH
• Device not detected: Enable USB Debugging
• Emulator issues: Check AVD configuration

iOS:
• Xcode issues: Update Xcode and Command Line Tools
• Simulator issues: Reset simulator or create new one
• WebDriverAgent issues: Check Carthage installation

5. Network Issues:
• Firewall: Allow Node.js and Appium through firewall
• Proxy: Configure npm proxy settings
• Corporate networks: Contact IT for assistance

Debug Commands:
• appium --version
• appium driver list
• appium plugin list
• appium driver doctor [driver-name]
• node --version
• npm --version

Getting Help:
• Appium Documentation: https://appium.io/docs/
• GitHub Issues: https://github.com/appium/appium/issues
• Community Forum: https://discuss.appium.io/
        `);
    }

    async run() {
        console.log('🚀 Appium Installation Application v3.0');
        console.log('======================================');
        
        try {
            // Show Appium 3.0 information
            await this.showAppiumInfo();
            
            // Main menu
            const menuChoice = await this.showMainMenu();
            
            if (menuChoice === 'Start Installation Process') {
                // Platform selection
                await this.selectPlatform();
                
                // Check system requirements
                const systemOk = await this.checkSystemRequirements();
                if (!systemOk) {
                    console.log('❌ System requirements not met.');
                    return;
                }
                
                // Node.js check and installation
                const nodeInstalled = await this.checkNodeInstallation();
                if (!nodeInstalled) {
                    await this.installNode();
                    const nodeCheck = await this.checkNodeInstallation();
                    if (!nodeCheck) {
                        console.log('❌ Node.js installation failed. Please install manually.');
                        return;
                    }
                }
                
                // Appium version selection
                await this.selectAppiumVersion();
                
                // Appium installation
                await this.installAppium();
                
                // Driver selection and installation
                await this.selectDrivers();
                await this.installDrivers();
                
                // Plugin selection and installation
                await this.selectPlugins();
                await this.installPlugins();
                
                // Installation verification
                await this.verifyInstallation();
                
                // Show failed installations
                await this.showFailedInstallations();
                
                // Next steps
                await this.showNextSteps();
                
            } else if (menuChoice === 'View Detailed Installation Documentation') {
                await this.showDetailedDocumentation();
                // Return to main menu after documentation
                await this.run();
            } else if (menuChoice === 'Exit') {
                console.log('\n👋 Thank you for using Appium Installation Application!');
                return;
            }
            
        } catch (error) {
            console.log(`\n❌ Error: ${error.message}`);
        } finally {
            this.rl.close();
        }
    }
}

// Start the application
const installer = new AppiumInstaller();
installer.run().catch(console.error);
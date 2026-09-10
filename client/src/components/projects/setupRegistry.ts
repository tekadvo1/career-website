export type OS = 'windows' | 'macos' | 'linux';

export interface SetupRequirement {
  id: string;
  name: string;
  why: string;
  version: string;
  link: string;
  instructions: Record<OS, string>;
  verifyCmd: string;
  verifyPattern: string;
  troubleshooting: string[];
}

export const SETUP_REGISTRY: Record<string, SetupRequirement> = {
  nodejs: {
    id: 'nodejs',
    name: 'Node.js',
    why: 'Required to run the JavaScript runtime and manage packages via npm.',
    version: '>= 18.0.0',
    link: 'https://nodejs.org/en/download/',
    instructions: {
      windows: 'Download the Windows Installer (.msi) from the official site and run it. Ensure "Add to PATH" is checked.',
      macos: 'Use Homebrew: `brew install node` or download the pkg installer from the official site.',
      linux: 'Use NodeSource or your package manager: `sudo apt install nodejs npm` (Ubuntu/Debian).'
    },
    verifyCmd: 'node -v && npm -v',
    verifyPattern: 'v18... or higher',
    troubleshooting: [
      'If command is not found, restart your terminal.',
      'Ensure Node.js is added to your system PATH.'
    ]
  },
  python: {
    id: 'python',
    name: 'Python',
    why: 'Required to run Python scripts and manage dependencies.',
    version: '>= 3.9.0',
    link: 'https://www.python.org/downloads/',
    instructions: {
      windows: 'Download the installer. CRITICAL: Check the box "Add Python to PATH" at the bottom before clicking Install.',
      macos: 'Use Homebrew: `brew install python`',
      linux: 'Use package manager: `sudo apt install python3 python3-pip`'
    },
    verifyCmd: 'python --version || python3 --version',
    verifyPattern: 'Python 3.9... or higher',
    troubleshooting: [
      'On macOS/Linux, you might need to use `python3` instead of `python`.',
      'If not found on Windows, reinstall and ensure "Add to PATH" is checked.'
    ]
  },
  java: {
    id: 'java',
    name: 'Java Development Kit (JDK)',
    why: 'Required to compile and run Java applications.',
    version: '>= 17',
    link: 'https://adoptium.net/',
    instructions: {
      windows: 'Download the MSI installer from Adoptium. Let it set the JAVA_HOME variable during installation.',
      macos: 'Use Homebrew: `brew install --cask temurin`',
      linux: 'Use package manager: `sudo apt install openjdk-17-jdk`'
    },
    verifyCmd: 'java -version && javac -version',
    verifyPattern: 'openjdk version "17..." or higher',
    troubleshooting: [
      'Ensure JAVA_HOME environment variable is set properly.',
      'Restart your terminal after installation.'
    ]
  },
  git: {
    id: 'git',
    name: 'Git',
    why: 'Version control system to manage your code and push it to a repository.',
    version: 'Any recent',
    link: 'https://git-scm.com/downloads',
    instructions: {
      windows: 'Download the Windows setup and run it. The default options are safe.',
      macos: 'Use Homebrew: `brew install git` or install Xcode Command Line Tools: `xcode-select --install`',
      linux: 'Use package manager: `sudo apt install git`'
    },
    verifyCmd: 'git --version',
    verifyPattern: 'git version 2...',
    troubleshooting: [
      'If terminal says "command not found", restart the terminal.',
      'Configure your user: `git config --global user.name "Your Name"`'
    ]
  },
  postgresql: {
    id: 'postgresql',
    name: 'PostgreSQL',
    why: 'Relational database used for local development.',
    version: '>= 14',
    link: 'https://www.postgresql.org/download/',
    instructions: {
      windows: 'Download the Windows installer from EnterpriseDB. Remember the password you set for the postgres user.',
      macos: 'Use Homebrew: `brew install postgresql@14` and start the service.',
      linux: 'Use package manager: `sudo apt install postgresql postgresql-contrib`'
    },
    verifyCmd: 'psql -V',
    verifyPattern: 'psql (PostgreSQL) 14... or higher',
    troubleshooting: [
      'If psql is not recognized, add its bin folder to your PATH.',
      'Ensure the postgres service is running.'
    ]
  },
  editor: {
    id: 'editor',
    name: 'Code Editor',
    why: 'A professional code editor for writing your code.',
    version: 'Latest',
    link: 'https://code.visualstudio.com/',
    instructions: {
      windows: 'Download VS Code and run the installer. Check "Add to PATH".',
      macos: 'Download VS Code for macOS. Unzip and drag to Applications.',
      linux: 'Download the .deb or .rpm from the official site.'
    },
    verifyCmd: 'code --version',
    verifyPattern: '1.x.x',
    troubleshooting: [
      'On macOS, open VS Code, open the Command Palette (Cmd+Shift+P) and type "Install \'code\' command in PATH".'
    ]
  }
};

export function deriveSetupRequirements(project: any): SetupRequirement[] {
  const reqs = new Map<string, SetupRequirement>();
  
  // Everyone needs an editor and git
  reqs.set('editor', SETUP_REGISTRY['editor']);
  reqs.set('git', SETUP_REGISTRY['git']);

  const stackStr = (project?.tags?.join(' ') + ' ' + (project?.tools?.join(' ') || '') + ' ' + (project?.languages?.join(' ') || '')).toLowerCase();

  if (stackStr.includes('node') || stackStr.includes('react') || stackStr.includes('javascript') || stackStr.includes('typescript') || stackStr.includes('express') || stackStr.includes('next')) {
    reqs.set('nodejs', SETUP_REGISTRY['nodejs']);
  }
  
  if (stackStr.includes('python') || stackStr.includes('django') || stackStr.includes('flask') || stackStr.includes('fastapi')) {
    reqs.set('python', SETUP_REGISTRY['python']);
  }
  
  if (stackStr.includes('java') || stackStr.includes('spring')) {
    reqs.set('java', SETUP_REGISTRY['java']);
  }

  if (stackStr.includes('postgres') || stackStr.includes('sql')) {
    reqs.set('postgresql', SETUP_REGISTRY['postgresql']);
  }

  return Array.from(reqs.values());
}

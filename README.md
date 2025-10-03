# GitVault 🗂️

A modern web-based file explorer and storage solution for GitHub repositories built with Nuxt 3. GitVault transforms your GitHub repositories into unlimited cloud storage with an intuitive interface to browse, preview, and manage files without leaving your browser.

**🚀 Unlimited Storage Powered by GitHub** - Store any amount of data across multiple repositories, limited only by GitHub's generous per-file and repository size limits (100MB per file, soft limit of 1GB per repository).

## ✨ Features

- ☁️ **Limitless Cloud Storage** - Transform GitHub repositories into unlimited storage space for your files
- 💾 **Smart Storage Management** - Automatically organize files across multiple repositories to maximize storage efficiency
- 🔐 **GitHub OAuth Authentication** - Secure login with your GitHub account
- 📂 **Repository Explorer** - Browse through your GitHub repositories with a clean, folder-like interface
- 👁️ **File Preview** - Preview various file types including:
  - Images (PNG, JPG, GIF, etc.)
  - Code files with syntax highlighting
  - PDF documents
  - Text files
  - Video files
- 🎨 **Modern UI** - Built with Nuxt UI for a sleek, responsive design
- 🌍 **Internationalization** - Multi-language support (i18n)
- 📱 **Mobile Responsive** - Works seamlessly on desktop and mobile devices
- 🚀 **Fast Performance** - Client-side rendering for optimal user experience
- 📈 **Scalable Storage** - No monthly fees or storage limits beyond GitHub's generous constraints

## 💡 Why GitVault?

### Unlimited Storage at Zero Cost

GitVault leverages GitHub's infrastructure to provide you with virtually unlimited storage space:

- **No Storage Fees** - Use GitHub's free tier for unlimited public repositories or paid plans for private storage
- **Massive Capacity** - Store up to 100MB per file with soft repository limits of 1GB (expandable)
- **Multiple Repositories** - Distribute your files across unlimited repositories for maximum storage
- **Version Control** - Every file change is tracked with Git's powerful versioning system
- **Global CDN** - Your files are delivered through GitHub's worldwide content delivery network
- **Enterprise Reliability** - Built on GitHub's 99.9% uptime infrastructure

### Perfect for

- 📸 Photo and media backup
- 📄 Document storage and organization
- 🎵 Audio file libraries
- 📹 Video content management
- 💼 Business file archiving
- 🎨 Creative asset storage

## 🛠️ Tech Stack

- **Frontend**: [Nuxt 3](https://nuxt.com/) + Vue 3 + TypeScript
- **UI Library**: [Nuxt UI](https://ui.nuxt.com/) + Tailwind CSS
- **Authentication**: [nuxt-auth-utils](https://github.com/Atinux/nuxt-auth-utils) with GitHub OAuth
- **API Integration**: GitHub REST API
- **Testing**: Vitest + Vue Test Utils
- **Linting**: ESLint with Nuxt ESLint config
- **Package Manager**: pnpm

## 📋 Prerequisites

- Node.js 18+
- pnpm (managed via corepack)
- GitHub OAuth App (for authentication)

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd GitVault
```

### 2. Install dependencies

Make sure to use corepack to enable the correct pnpm version:

```bash
corepack enable
pnpm install
```

### 3. Environment Setup

Create a `.env` file in the root directory and configure your GitHub OAuth app:

```env
NUXT_OAUTH_GITHUB_CLIENT_ID=your_github_client_id
NUXT_OAUTH_GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 4. GitHub OAuth App Setup

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App with:
   - Application name: `GitVault` (or your preferred name)
   - Homepage URL: `http://localhost:3000` (for development)
   - Authorization callback URL: `http://localhost:3000/auth/github`

### 5. Start Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## 📜 Available Scripts

```bash
# Development
pnpm dev                 # Start development server
pnpm build              # Build for production
pnpm preview           # Preview production build
pnpm generate          # Generate static site

# Code Quality
pnpm lint              # Run ESLint
pnpm lint:fix          # Fix ESLint issues automatically
pnpm typecheck         # Run TypeScript type checking

# Testing
pnpm unit              # Run unit tests
pnpm unit:watch        # Run tests in watch mode
```

## 🏗️ Project Structure

```text
├── src/
│   ├── components/          # Vue components
│   │   ├── FileCard/       # File display components
│   │   ├── FilePreview/    # File preview components
│   │   └── ...
│   ├── composables/        # Vue composables
│   ├── layouts/           # Nuxt layouts
│   ├── middleware/        # Route middleware
│   ├── pages/            # Application pages
│   ├── resources/        # API resource handlers
│   └── utils/           # Utility functions
├── server/
│   ├── routes/          # API routes
│   └── resources/       # Server-side resources
└── public/             # Static assets
```

## 🔧 Configuration

### Runtime Configuration

Key configuration options in `nuxt.config.ts`:

- **SSR**: Disabled for optimal GitHub API integration
- **Authentication**: GitHub OAuth via nuxt-auth-utils
- **UI**: Nuxt UI with Tailwind CSS
- **Internationalization**: Multi-language support

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NUXT_OAUTH_GITHUB_CLIENT_ID` | GitHub OAuth App Client ID | Yes |
| `NUXT_OAUTH_GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret | Yes |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Nuxt 3](https://nuxt.com/) for the amazing framework
- [GitHub API](https://docs.github.com/en/rest) for repository access
- [Nuxt UI](https://ui.nuxt.com/) for the beautiful components

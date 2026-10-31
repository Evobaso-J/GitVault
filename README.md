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

- **Frontend**: [Nuxt 4](https://nuxt.com/) + Vue 3 + TypeScript
- **UI Library**: [Nuxt UI 4](https://ui.nuxt.com/) + Tailwind CSS 4
- **Authentication**: [nuxt-auth-utils](https://github.com/Atinux/nuxt-auth-utils) with GitHub OAuth
- **API Integration**: GitHub REST API
- **Testing**: Vitest + Vue Test Utils
- **Linting**: ESLint with Nuxt ESLint config
- **Package Manager**: pnpm

## 📋 Prerequisites

- Node.js 22.22.3+ or 24.15+
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
│   ├── utils/           # GitHub proxy, upload keys, ingest
│   └── resources/       # Server-side resources
├── shared/
│   └── utils/           # Pure logic used by app and server (phone backup rules)
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

## 📱 Phone backup

Open a vault → **Phone backup** (sidebar). Both modes put photos in `Photos/YYYY/MM/` of that vault, never store the same content twice (git blob sha checked against the repo tree, so renames and moves don't matter), save a name clash with different content as `name (1).ext`, and skip files over 4 MiB (`MAX_UPLOAD_BYTES` in `shared/utils/backup.ts`: the proxy receives files base64-encoded in one request and Netlify functions drop bodies over 6 MB).

- **Back up now**: pick photos in the browser; only the new ones upload. Keep the page open until the queue finishes.
- **Automatic daily backup**: a shortcut on the phone posts photos to `POST /ingest` with an **upload key** (`Authorization: Bearer <key>`), one file per request as a multipart `file` part, plus an optional `taken` text field (ISO 8601 date of the photo, which picks the month folder; without it, the server's current month). The response is `{ uploaded, skipped, tooLarge }` with the paths. Keys show on the page as connected devices, where they are revoked.

Test from a computer:

```sh
curl -F file=@photo.jpg -F taken=2026-10-31T23:30:00+01:00 -H "Authorization: Bearer $KEY" https://<your-gitvault>/ingest
```

A body over 4 MiB + 16 KiB gets a 413 from GitVault; Netlify answers 502 to anything over 6 MB before GitVault sees it.

### iPhone: the "GitVault Backup" shortcut

On the page, "Add the shortcut" opens the iCloud link in `IOS_SHORTCUT_URL` (`src/config.ts`) and "Connect this iPhone" issues a key and runs the shortcut with `{ "url": "<ingest url>", "key": "<key>" }` as text input. Build it once in the Shortcuts app, named exactly `GitVault Backup` (`IOS_SHORTCUT_NAME`):

1. **If** `Shortcut Input` *has any value* → **Get Dictionary** from Shortcut Input → **Save File** (Shortcuts folder) at `GitVault/config.json`, *Overwrite If File Exists* on → **Show Notification** "GitVault connected". **End If**.
2. **Get File** `GitVault/config.json` from the Shortcuts folder (*Error If Not Found* off) → **Get Dictionary** from File → **Get Dictionary Value** `url` → variable `url`; **Get Dictionary Value** `key` → variable `key`. **If** `key` *does not have any value* → **Show Alert** "Open GitVault on this iPhone → Phone backup → Connect this iPhone" → **Stop Shortcut**. **End If**.
3. **Find Photos** where *Date Taken* is in the last 2 days and *Media Type* is Image, sorted by Date Taken, no limit. Two days, so a night the phone was off is caught up on the next run; re-sent photos are skipped by content.
4. **Repeat with Each** item in Photos, one request per photo:
   1. **Get Details of Images** → *File Size* of Repeat Item. **If** it is greater than 4 MB → **Calculate** `tooLarge` + 1 → set variable `tooLarge`. **Otherwise**:
   2. **Get Details of Images** → *Date Taken* → **Format Date** (ISO 8601, include time) → variable `taken`.
   3. **Get Contents of URL**: URL `url`, Method POST, Headers `Authorization` = `Bearer <key>`, Request Body **Form**: `file` = Repeat Item (File), `taken` = `taken` (Text).
   4. **Get Dictionary from Input** → **Count** the `uploaded` and `skipped` lists, add them to variables `uploaded` and `skipped`.
   5. **End If**.
5. **Show Notification** "GitVault: `uploaded` uploaded, `skipped` already there, `tooLarge` too large".

Run it by hand once after connecting: that is when iOS asks for Photos access and whether to allow the host. Then **Automation → + → Time of Day → 02:00, Daily → Run Immediately → GitVault Backup**. Publish with **Share → Copy iCloud Link** and put the link in `IOS_SHORTCUT_URL`. iCloud links are snapshots: every edit of the shortcut needs a new link.

The key is stored in plain text in iCloud Drive (`Shortcuts/GitVault/config.json`) and syncs to every device on that Apple ID. It can only add photos to that vault, and Revoke on the page cuts it off.

### Android: HTTP Shortcuts

On the page, "Import the GitVault shortcut" hands the zip in `ANDROID_SHORTCUT_ZIP` (`src/config.ts`, served from `public/`) to the [HTTP Shortcuts](https://http-shortcuts.rmy.ch) import deep link. Export it once:

1. New shortcut "GitVault": Method `POST`, URL `{gitvault_url}/ingest`, header `Authorization` = `Bearer {gitvault_key}`, Request Body *Form data* with a parameter of type *File* named `file` that accepts shared files.
2. Variables: `gitvault_url` = Static with the production URL; `gitvault_key` = Static, empty.
3. Settings → Import/Export → Export, leaving variable values out; commit the zip under `public/` and set `ANDROID_SHORTCUT_ZIP` to its path.

Users then generate a key on the page, paste it in Variables → `gitvault_key`, and share photos from the gallery to the shortcut. If sharing several photos sends them in one request, the 413 explains the one-per-request rule. A nightly run needs Tasker or MacroDroid to list the camera folder and share each new file to the shortcut; "Back up now" is the supported daily habit on Android.

### Security

An upload key is `{ kid, login, GitHub token, repo }` encrypted with AES-256-GCM under a key HKDF-derived from `NUXT_SESSION_PASSWORD` (`server/utils/uploadKey.ts`); the server only uses it to read the tree of the bound vault and write under its `Photos/`. Issuing a key writes `.gitvault/keys/<kid>.json` to the vault and `/ingest` rejects a key whose file is gone, so **Revoke** on the page (which deletes the file) stops a device at its next request. Keys don't expire. To cut everything at once, revoke GitVault under GitHub Settings → Applications (also signs you out) or rotate `NUXT_SESSION_PASSWORD` (also every session of every user). `.gitvault/` is hidden from listings and search; it is not protected.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Nuxt 4](https://nuxt.com/) for the amazing framework
- [GitHub API](https://docs.github.com/en/rest) for repository access
- [Nuxt UI](https://ui.nuxt.com/) for the beautiful components

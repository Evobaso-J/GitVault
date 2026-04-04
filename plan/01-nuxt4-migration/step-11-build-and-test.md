# Step 11: Build and test

## 11.1 Full install

```bash
pnpm install
pnpm run postinstall   # nuxt prepare
```

## 11.2 Static checks

```bash
pnpm run typecheck
pnpm run lint
```

## 11.3 Production build

```bash
pnpm run build
```

## 11.4 Dev server smoke test

```bash
pnpm run dev
```

## 11.5 Manual smoke test checklist

- [ ] Login via GitHub OAuth works
- [ ] Repo list loads correctly
- [ ] Can navigate into a repo and browse files/folders
- [ ] File preview works (image, code, PDF)
- [ ] File upload works
- [ ] Folder creation works
- [ ] Repo creation works
- [ ] Page transitions work
- [ ] i18n translations load correctly

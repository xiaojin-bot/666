# 部署到固定网址

这个项目已经配置成可以部署的 Vite 静态网页。构建命令是 `npm run build`，输出目录是 `dist`。

## 推荐方式：Vercel

1. 把当前项目上传到 GitHub 仓库。
2. 打开 Vercel，选择 `Add New Project`。
3. 导入这个 GitHub 仓库。
4. 保持默认配置即可：
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. 点击 Deploy，完成后会得到一个固定网址。

## 备选方式：Netlify

1. 把当前项目上传到 GitHub 仓库。
2. 打开 Netlify，选择 `Add new site`。
3. 导入这个 GitHub 仓库。
4. Netlify 会读取 `netlify.toml`，自动使用：
   - Build command: `npm run build`
   - Publish directory: `dist`
5. 点击 Deploy，完成后会得到一个固定网址。

## 备选方式：GitHub Pages

1. 把当前项目上传到 GitHub 仓库，默认分支使用 `main`。
2. 进入仓库的 `Settings` -> `Pages`。
3. Source 选择 `GitHub Actions`。
4. 推送代码到 `main` 后，`.github/workflows/deploy-github-pages.yml` 会自动构建并发布。
5. Actions 成功后，Pages 页面会显示固定网址。

## 手机使用

部署完成后，用手机浏览器打开固定网址，然后选择“添加到主屏幕”。

当前版本的数据保存在手机浏览器本地，所以同一台手机会保留打卡记录；如果换手机、换浏览器或清理浏览器数据，记录不会自动同步。

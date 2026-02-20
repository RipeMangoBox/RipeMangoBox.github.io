# ReactDance 项目页面制作与部署指南

> 本文档记录了ReactDance项目页面的完整制作流程和部署步骤，供前端学习者参考使用。

---

## 📋 目录

1. [项目页面制作流程](#项目页面制作流程)
2. [本地测试与验证](#本地测试与验证)
3. [域名与服务器部署流程](#域名与服务器部署流程)
4. [常见问题](#常见问题)

---

## 🎨 项目页面制作流程

### 第一步：分析参考模板

**目标**：理解现有项目页面的结构，以作为新项目的参考。

**操作**：
1. 打开参考项目 `3DGS-Avatar/index.html`
2. 分析以下核心结构：
   - **Navigation Bar**（导航栏）：固定顶部导航，支持平滑滚动
   - **Header 区域**：项目标题、副标题、作者信息、会议/期刊信息
   - **内容部分**：按照逻辑分成多个Section，每个Section包含标题 + 媒体 + 描述文字
   - **Footer**：页脚版权信息

3. 查看CSS文件 `3DGS-Avatar/css/scrolling-nav.css`，了解样式来源
4. 查看JS文件 `3DGS-Avatar/js/` 中的功能实现

**关键概念**：
- 使用Bootstrap框架实现响应式设计
- 利用Bootstrap Tabs实现标签页切换功能
- 媒体（视频/图片）采用相对路径引用

---

### 第二步：创建项目文件夹结构

**目标**：为新项目创建标准化的目录结构。

**操作步骤**：

```bash
ReactDance/
├── index.html          # 主项目页面
├── css/                # 样式文件夹
│   ├── scrolling-nav.css
│   └── scrolling-nav-old.css
├── js/                 # JavaScript文件夹
│   ├── index.js
│   └── scrolling-nav.js
├── vendor/             # 第三方依赖库
│   ├── bootstrap/      # Bootstrap CSS/JS
│   ├── jquery/         # jQuery库
│   └── jquery-easing/  # jQuery动画库
├── images/             # 图片文件夹（备用）
└── videos/             # 视频文件夹（备用）
```

**创建命令**（Windows PowerShell）：

```powershell
New-Item -ItemType Directory -Path "ReactDance\css" -Force
New-Item -ItemType Directory -Path "ReactDance\js" -Force
New-Item -ItemType Directory -Path "ReactDance\vendor" -Force
New-Item -ItemType Directory -Path "ReactDance\images" -Force
New-Item -ItemType Directory -Path "ReactDance\videos" -Force
```

---

### 第三步：复制支持文件

**目标**：将CSS、JS和依赖库从参考项目复制到新项目。

**操作步骤**：

```powershell
# 从3DGS-Avatar复制相关文件
Copy-Item "3DGS-Avatar\css\*" "ReactDance\css\" -Recurse
Copy-Item "3DGS-Avatar\js\*" "ReactDance\js\"
Copy-Item "3DGS-Avatar\vendor\*" "ReactDance\vendor\" -Recurse
```

**说明**：
- `scrolling-nav.css`：定义了项目页面的核心样式（字体、间距、颜色等）
- `scrolling-nav.js`：实现平滑滚动和导航栏激活效果
- `index.js`：处理交互功能（如视频比较、鼠标跟踪等）
- `vendor/` 文件夹包含Bootstrap和jQuery等必要的第三方库

---

### 第四步：创建项目主页面（index.html）

**目标**：根据项目内容创建定制化的项目页面。

**核心步骤**：

#### 4.1 创建HTML基础结构

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Meta信息和样式引入 -->
</head>
<body>
    <!-- Navigation -->
    <nav>...</nav>
    
    <!-- Header -->
    <header>...</header>
    
    <!-- Content Sections -->
    <section id="section1">...</section>
    <section id="section2">...</section>
    
    <!-- Footer -->
    <footer>...</footer>
</body>
</html>
```

#### 4.2 配置Head部分

包含以下关键信息：
- Meta标签（字符集、视口、描述、作者）
- 页面标题
- CSS文件链接
- Bootstrap CDN链接

```html
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ReactDance: Reactive Dance Generation</title>
<link href="css/scrolling-nav.css" rel="stylesheet">
```

#### 4.3 创建导航栏

在navbar中添加指向各section的链接：

```html
<nav class="navbar navbar-dark bg-dark fixed-top">
    <a class="navbar-brand" href="#page-top">ReactDance</a>
    <ul class="navbar-nav ms-auto">
        <li><a class="nav-link js-scroll-trigger" href="#about">About</a></li>
        <li><a class="nav-link js-scroll-trigger" href="#method">Method</a></li>
        <li><a class="nav-link js-scroll-trigger" href="#results">Results</a></li>
    </ul>
</nav>
```

#### 4.4 创建内容sections

每个section采用统一的结构：

```html
<section id="section_name">
    <div class="container">
        <div class="row">
            <div class="col-lg-10 mx-auto">
                <h2 class="section-title-tc">Section Title</h2>
                <p class="lead">描述文字</p>
                
                <!-- 媒体内容 -->
                <div class="video-container">
                    <video width="100%" controls>
                        <source src="../resources/path/video.mp4" type="video/mp4">
                    </video>
                </div>
            </div>
        </div>
    </div>
</section>
```

#### 4.5 实现标签页功能（以OOD为例）

对于需要多选项的内容，使用Bootstrap Tabs：

```html
<!-- Tab Navigation -->
<nav>
    <div class="nav nav-tabs" role="tablist">
        <button class="nav-item nav-link active" id="tab1" 
                data-bs-toggle="tab" data-bs-target="#content1">Tab 1</button>
        <button class="nav-item nav-link" id="tab2" 
                data-bs-toggle="tab" data-bs-target="#content2">Tab 2</button>
    </div>
</nav>

<!-- Tab Content -->
<div class="tab-content">
    <div class="tab-pane fade show active" id="content1">
        <video width="100%" controls>
            <source src="../resources/video1.mp4" type="video/mp4">
        </video>
        <p>描述文字</p>
    </div>
    <div class="tab-pane fade" id="content2">
        <video width="100%" controls>
            <source src="../resources/video2.mp4" type="video/mp4">
        </video>
        <p>描述文字</p>
    </div>
</div>
```

#### 4.6 添加脚本和jQuery库

在</body>前添加：

```html
<script src="vendor/jquery/jquery.min.js"></script>
<script src="vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="vendor/jquery-easing/jquery.easing.min.js"></script>
<script src="js/scrolling-nav.js"></script>
<script src="js/index.js"></script>
```

---

### 第五步：验证资源路径

**目标**：确保所有视频和图片路径正确引用。

**操作步骤**：

1. 检查资源文件夹结构：

```powershell
Get-ChildItem -Recurse resources/ -File | Where-Object { $_.Extension -match "\.(mp4|png|jpg)" }
```

2. 在HTML中使用相对路径引用：

```html
<!-- 从ReactDance/index.html出发，向上一层到根目录，再进入resources -->
<source src="../resources/Method/HFSQ_Method.mp4" type="video/mp4">
<img src="../resources/Method/ReactDance Pipeline.png" alt="Pipeline">
```

3. 确保文件名中的特殊字符正确转义：
   - 空格 → `%20`
   - 括号 `()` → `%28%29`
   - 例：`OOD3_Rhythmic Accompaniment.mp4` → `OOD3_Rhythmic%20Accompaniment.mp4`

---

## 🧪 本地测试与验证

### 启动本地服务器

**为什么需要本地服务器？**
- 某些功能（如视频加载、AJAX请求）在`file://`协议下不工作
- 需要通过HTTP/HTTPS协议正确测试

**操作步骤**：

1. **使用Python启动HTTP服务器**（推荐）：

```bash
# 在项目根目录（包含ReactDance、resources等文件夹的目录）
cd "d:\Life Me\For-Study\Evatar\jz\ReactDance\ICLR\Project Page"
python -m http.server 8000
```

2. **在浏览器中访问**：

```
http://localhost:8000/ReactDance/index.html
```

### 验证检查清单

- [ ] 导航栏所有链接可以正常平滑滚动
- [ ] 所有视频正确加载并可播放
- [ ] 所有图片正确加载
- [ ] 标签页切换功能正常（OOD部分）
- [ ] 在手机浏览器上测试响应式设计
- [ ] 检查控制台（F12 → Console）是否有错误信息

---

## 🌐 域名与服务器部署流程

### 总体部署架构

```
┌─────────────────────────────────────────────────────────┐
│                    互联网用户                             │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ↓
        ┌──────────────────────────────────┐
        │        DNS解析服务器              │
        │    (将域名解析到服务器IP)         │
        └──────────────┬───────────────────┘
                       │
                       ↓
        ┌──────────────────────────────────┐
        │        Web服务器                  │
        │  (存放ReactDance项目页面)         │
        │  (配置SSL证书)                    │
        └──────────────────────────────────┘
```

---

### 步骤1：购买域名

**平台选择**：

| 平台 | 特点 | 价格 |
|------|------|------|
| 阿里云（Aliyun） | 国内主流，支持备案，中文界面 | ¥55-89/年 |
| 腾讯云（Tencent Cloud） | 国内主流，接入国内服务器快 | ¥55-118/年 |
| Namecheap | 国外平台，便宜，需要国际支付 | $0.88-8.88/年 |
| GoDaddy | 国外平台，知名度高 | $1.99-12.99/年 |
| 西部数码 | 国内平台，支持备案 | ¥69-180/年 |

**建议流程**（以阿里云为例）：

1. 访问 https://www.aliyun.com/
2. 点击"域名" → "域名注册"
3. 在搜索框输入想要的域名（例如`reactdance.com`）
4. 查看是否可用，选择购买时长
5. 加入购物车 → 结算 → 支付
6. 实名认证（中国法律要求所有域名必须实名认证）

**关键点**：
- 确保域名简洁易记
- 优先选择`.com`或`.org`等常见后缀
- 保存域名管理后台的登录信息

---

### 步骤2：选择并购买服务器

**服务器选择**：

| 类型 | 供应商示例 | 优点 | 缺点 |
|------|----------|------|------|
| 云服务器(ECS) | 阿里云、腾讯云、AWS | 弹性扩展、按需付费 | 配置相对复杂 |
| 虚拟主机 | 西部数码、万网 | 配置简单、即插即用 | 灵活性低、可定制性弱 |
| 独立服务器 | IDC厂商 | 完全控制、性能高 | 价格贵、需专业维护 |

**推荐配置**（小型项目）：

- **操作系统**：Linux（CentOS或Ubuntu）或Windows Server
- **CPU**：1核
- **内存**：1-2GB
- **带宽**：1-5Mbps
- **月费**：¥30-100

**购买步骤**（以阿里云为例）：

1. 访问 https://www.aliyun.com/product/ecs/
2. 选择"创建实例"
3. 配置参数：
   - 地域：选择距离用户最近的区域（例如华东）
   - 操作系统：选择Linux
   - 实例类型：选择1核1GB或1核2GB
4. 选择公网IP：勾选"分配公网IPv4地址"
5. 购买时长和数量
6. 支付订单

**关键信息保存**：
- 服务器IP地址
- 根用户密码/秘钥
- 远程登录工具（PuTTY、SecureCRT）

---

### 步骤3：配置DNS解析

**目标**：使域名能指向服务器IP地址。

**操作流程**：

#### 3.1 获取服务器IP地址

登录服务器管理后台，获取分配的公网IP（例如：`123.45.67.89`）

#### 3.2 在域名注册商处配置DNS

**以阿里云为例**：

1. 登录 https://dc.console.aliyun.com/
2. 找到购买的域名，点击"解析"
3. 添加解析记录：

| 记录类型 | 主机记录 | 记录值 | TTL |
|---------|---------|------|-----|
| A | @ | 123.45.67.89 | 10分钟 |
| A | www | 123.45.67.89 | 10分钟 |
| CNAME | (可选) | @ | 10分钟 |

4. 等待DNS生效（通常5分钟-24小时）

#### 3.3 验证DNS解析

```bash
# Windows CMD
nslookup reactdance.com

# Linux/Mac Terminal
dig reactdance.com
```

如果返回的IP地址与服务器公网IP匹配，说明DNS解析成功。

---

### 步骤4：在服务器上部署项目

**任务**：将制作好的ReactDance项目上传到服务器。

**方法A：使用FTP上传（适合初学者）**

1. 安装FTP客户端：FileZilla、CuteFTP等
2. 连接服务器：
   - 主机：服务器IP地址
   - 用户名：root
   - 密码：服务器管理员密码
   - 端口：21或22

3. 导航到Web根目录（通常是 `/var/www/html/` 或 `/home/www/`）

4. 上传项目文件夹和资源：
   ```
   /var/www/html/
   ├── ReactDance/          （项目文件夹）
   │   ├── index.html
   │   ├── css/
   │   ├── js/
   │   ├── vendor/
   │   └── ...
   └── resources/           （资源文件夹）
       ├── Method/
       ├── Results/
       ├── More Results/
       └── ...
   ```

**方法B：使用SSH命令上传（更灵活）**

1. 使用Git或rsync上传：

```bash
# 如果使用GitHub存储代码
ssh root@123.45.67.89
git clone https://github.com/yourname/reactdance-project.git /var/www/html/

# 或使用rsync
rsync -avz --delete "本地项目路径" root@123.45.67.89:/var/www/html/
```

2. 验证上传：

```bash
ssh root@123.45.67.89
ls -la /var/www/html/ReactDance/
```

---

### 步骤5：配置Web服务器

**任务**：使服务器能够正确提供项目页面。

**根据操作系统选择**：

#### 5.1 Linux + Nginx配置

1. 连接到服务器：

```bash
ssh root@123.45.67.89
```

2. 创建Nginx配置文件：

```bash
nano /etc/nginx/sites-available/reactdance.com
```

3. 添加以下配置：

```nginx
server {
    listen 80;
    server_name reactdance.com www.reactdance.com;

    root /var/www/html;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ =404;
    }

    # 处理SPA路由（如有必要）
    error_page 404 /index.html;
}
```

4. 启用配置并重启Nginx：

```bash
ln -s /etc/nginx/sites-available/reactdance.com /etc/nginx/sites-enabled/
systemctl restart nginx
```

#### 5.2 Linux + Apache配置

1. 启用必要模块：

```bash
a2enmod rewrite
```

2. 创建.htaccess文件：

```bash
cat > /var/www/html/.htaccess << EOF
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
EOF
```

3. 重启Apache：

```bash
systemctl restart apache2
```

#### 5.3 验证Web服务器

在浏览器中访问：

```
http://reactdance.com/ReactDance/index.html
```

如果能看到项目页面，说明Web服务器配置成功。

---

### 步骤6：配置SSL证书（HTTPS）

**为什么需要SSL证书？**
- 保护用户隐私和数据安全
- 搜索引擎优化（SEO）加分
- 浏览器显示"安全"标志，增加用户信任

**推荐方案：Let's Encrypt（免费）**

#### 6.1 安装Certbot

```bash
# 如果使用Nginx
apt-get install certbot python3-certbot-nginx

# 如果使用Apache
apt-get install certbot python3-certbot-apache
```

#### 6.2 申请证书

```bash
# 自动配置（推荐）
certbot --nginx -d reactdance.com -d www.reactdance.com
# 或
certbot --apache -d reactdance.com -d www.reactdance.com

# 或手动申请
certbot certonly --standalone -d reactdance.com -d www.reactdance.com
```

#### 6.3 自动续期

Let's Encrypt证书有效期为90天，需要自动续期：

```bash
certbot renew --dry-run  # 测试续期
# 添加到crontab自动执行
crontab -e
# 添加: 0 3 * * * /usr/bin/certbot renew --quiet
```

#### 6.4 验证HTTPS

在浏览器中访问：

```
https://reactdance.com/ReactDance/index.html
```

如果显示HTTPS绿色锁标志，说明SSL证书配置成功。

---

### 步骤7：配置域名重定向（可选但推荐）

**目标**：使所有流量自动重定向到主域

#### Nginx配置

```nginx
server {
    listen 80;
    server_name reactdance.com www.reactdance.com;
    
    # HTTP重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name reactdance.com;
    
    # 重定向www.reactdance.com到reactdance.com
    if ($host ~* ^www\.) {
        return 301 https://reactdance.com$request_uri;
    }
    
    # SSL证书配置
    ssl_certificate /etc/letsencrypt/live/reactdance.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/reactdance.com/privkey.pem;
}
```

---

### 步骤8：性能优化和监控

#### 启用Gzip压缩（Nginx）

```nginx
gzip on;
gzip_types text/html text/plain text/css text/javascript application/javascript;
gzip_min_length 1000;
```

#### 设置浏览器缓存

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

#### 监控服务器状态

```bash
# 查看CPU和内存使用
top

# 查看磁盘空间
df -h

# 查看带宽使用
nethogs
```

---

## 🔍 常见问题

### Q1：视频无法加载，提示404错误

**原因**：资源文件路径错误

**解决方案**：
1. 检查视频文件是否存在于resources文件夹
2. 验证HTML中的src路径与实际文件路径一致
3. 检查文件名大小写、特殊字符转义

### Q2：导航栏平滑滚动不工作

**原因**：jQuery或scrolling-nav.js未正确加载

**解决方案**：
1. 按F12打开开发者工具，检查Console是否有错误
2. 验证`<script src="js/scrolling-nav.js"></script>`在HTML中的位置
3. 检查jQuery是否成功加载

### Q3：域名解析正确，但网站仍无法访问

**原因**：
- 防火墙阻止了80/443端口
- Web服务器未启动
- 安全组规则未配置

**解决方案**：
1. 检查防火墙：`ufw status` (Linux)
2. 检查Web服务器运行状态：`systemctl status nginx`
3. 检查安全组规则：在云服务商后台配置入站规则（允许80/443端口）

### Q4：视频在PC上可播放，但在手机上不播放

**原因**：浏览器兼容性或格式问题

**解决方案**：
1. 确保视频格式为MP4（H.264编码）
2. 在`<video>`标签中添加`playsinline`属性
3. 测试不同浏览器（Chrome、Safari、Firefox）

### Q5：项目页面很快就变得很慢

**原因**：
- 视频文件太大
- 缺少缓存配置
- 服务器带宽不足

**解决方案**：
1. 压缩视频文件（使用FFmpeg或HandBrake）
2. 启用Gzip压缩和浏览器缓存
3. 使用CDN加速（阿里云CDN、Cloudflare等）

### Q6：如何更新项目内容？

**步骤**：
1. 在本地修改项目文件
2. 使用FTP或Git推送更新到服务器
3. 清除浏览器缓存（Ctrl+F5）重新加载
4. 验证新内容是否显示正确

---

## 📚 参考资源

- [Bootstrap官方文档](https://getbootstrap.com/docs/5.0/)
- [jQuery官方文档](https://jquery.com/)
- [MDN Web文档 - HTML/CSS/JS](https://developer.mozilla.org/zh-CN/)
- [Nginx官方文档](https://nginx.org/en/docs/)
- [Let's Encrypt证书](https://letsencrypt.org/zh-cn/)
- [阿里云服务器配置指南](https://www.aliyun.com/)

---

## 💡 进阶扩展（后续学习方向）

1. **静态网站生成器**：学习Hugo、Jekyll等工具简化静态网站管理
2. **自动化部署**：使用CI/CD工具（GitHub Actions、Jenkins）自动化部署流程
3. **性能优化**：学习CDN、HTTP缓存策略、图片优化等知识
4. **数据收集**：集成Google Analytics、百度统计等工具追踪用户行为
5. **SEO优化**：学习关键词研究、meta标签优化、Sitemap等

---

**文档版本**：v1.0  
**最后更新**：2024年2月20日  
**维护者**：ReactDance Team


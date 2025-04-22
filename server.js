const http = require('http');
const fs = require('fs');
const path = require('path');

// 定义MIME类型
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

// 尝试不同端口启动服务器
function startServer(port) {
  const server = http.createServer((req, res) => {
    // 获取请求的URL路径
    let filePath = '.' + req.url;
    
    // 如果是根路径，返回index.html
    if (filePath === './') {
      filePath = './index.html';
    } else if (!path.extname(filePath) && !filePath.includes('.')) {
      // 没有扩展名且不包含点的情况下（可能是前端路由路径），返回index.html
      filePath = './index.html';
    }

    // 获取文件扩展名
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    // 读取文件
    fs.readFile(filePath, (error, content) => {
      if (error) {
        if (error.code === 'ENOENT') {
          // 文件不存在
          console.log(`文件不存在: ${filePath}`);
          fs.readFile('./index.html', (err, content) => {
            if (err) {
              res.writeHead(500);
              res.end('服务器错误');
              return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          });
        } else {
          // 其他服务器错误
          res.writeHead(500);
          res.end(`服务器错误: ${error.code}`);
        }
      } else {
        // 成功返回文件
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });

  // 尝试监听指定端口
  server.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}/`);
    // 尝试自动打开浏览器（仅在主流平台上）
    const { platform } = process;
    const command = {
      darwin: `open http://localhost:${port}/`,
      win32: `start http://localhost:${port}/`,
      linux: `xdg-open http://localhost:${port}/`
    }[platform];
    
    if (command) {
      require('child_process').exec(command);
    }
  });

  // 处理端口占用错误
  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      console.log(`端口 ${port} 被占用，尝试端口 ${port + 1}`);
      startServer(port + 1);
    } else {
      console.error('服务器启动失败:', e);
    }
  });
}

// 从端口9999开始尝试
startServer(3000); 
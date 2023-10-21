<p align="center" style="text-align:center;">
<img style="width: 40px;margin-bottom:10px;" src="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22256%22 height=%22256%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%220%22 fill=%22%237d6ee7%22></rect><path fill=%22%23fff%22 d=%22M70.88 81.50L70.88 29.39L54.05 67.28L45.59 67.28L28.67 29.39L28.67 81.50L20.57 81.50L20.57 18.50L32.54 18.50L50.00 58.37L67.19 18.50L79.43 18.50L79.43 81.50L70.88 81.50Z%22></path></svg>"/> Oimi live
</p>

<p align="center">Oimi Live是一个rtmp/rtsp播放器。</p>
<p align="center">Oimi live is a rtmp/rtsp player.</p>
<p align="center">
    <a href="https://github.com/helson-lin/oimi-live">
          <img alt="release downloads" src="https://img.shields.io/github/downloads/helson-lin/oimi-live/total?color=brightgreen&label=release%20download"/>
    </a>
    <a href="https://github.com/helson-lin/oimi-live">
        <img alt="docker image size" src="https://img.shields.io/badge/platform-macos%7Clinux%7Cwin-brightgreen"/>
    </a>
     <a href="https://github.com/helson-lin/oimi-live">
        <img alt="docker image size" src="https://img.shields.io/github/last-commit/helson-lin/oimi-live"/>
    </a>
    <a href="/README.zh-CN.md">
        <img alt="lang" src="https://img.shields.io/badge/Lang-CN-brightgreen" />
    </a>
</p>



## 说明

服务启动之后，直接嵌入页面内使用即可：
地址为`http://${host}:${port}/index.html?uri=${url}`

- ${host} 本机的ip
- ${port} 服务的端口
- ${url}  需要播放的rtmp/rtsp地址

```html
<iframe src="http://localhost:8005/index.html?uri=$url"></iframe>
```


### 关于配置文件

port: 服务的端口
ffmpeg: 删除改配置默认会自动下载依赖/填写需要填写绝对的地址

### 测试地址

test url: http://localhost:8005/index.html?uri=rtmp://180.102.26.110/live/admin

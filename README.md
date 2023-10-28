<p align="center" style="text-align:center;">
<img style="width: 40px;margin-bottom:10px;" src="https://file.helson-lin.cn/picgooim-live.svg"/> Oimi live
</p>

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
    <a href="/README-ZH.md">
        <img alt="lang" src="https://img.shields.io/badge/Lang-CN-brightgreen" />
    </a>
</p>



## Instructions

After the service starts, embed the url using the iframe

embed url: `http://${host}:${port}/index.html?uri=${url}`

- ${host} Local address
- ${port} Server port
- ${url}  rtmp/rtsp url

```html
<iframe src="http://localhost:8005/index.html?uri=$url"></iframe>
```


### About Configuration

port: server port

ffmpeg: ffmpeg executable file /(Fill in the absolute address to be filled in) 


delete ffmpeg option, the server will auto download ffmpeg executable file, by default


### Example

test url: http://localhost:8005/index.html?uri=rtmp://180.102.26.110/live/admin

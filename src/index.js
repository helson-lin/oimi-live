const Helper = require('./helper')
const express = require("express");
const expressWebSocket = require("express-ws");
const ffmpeg = require("fluent-ffmpeg");
const webSocketStream = require("websocket-stream/stream");
const path = require("path");
const process = require("process");
const fse = require('fs-extra')
const moment = require("moment");
const logger = require('./log')
const ymlConfig = Helper.readYml()
const PORT = ymlConfig?.port || 8005;

const intervalCheckTime = () => {
  const startTime = moment();
  logger.warn('没有证书，试用时间为30分钟')
  setInterval(() => {
    const isOutLimit = moment().diff(startTime, "minutes");
    if (isOutLimit >= 30) {
      logger.info("试用时间已经到期！！！")
      process.exitCode = 1;
      process.nextTick(() => {
        process.exit()
      })
    }
  }, 6000)
}

const isOutAuth = async () => {
  const licenseInfo = await Helper.licenseCheck()
  if (!licenseInfo?.isPass) {
    logger.warn(licenseInfo.msg)
    intervalCheckTime()
  } else {
    // 当前证书是正常的
    setTimeout(() => { isOutAuth() }, 6000)
  }
};

const setFfmpegPath = async () => {
  if (ymlConfig?.ffmpeg) {
    console.log('[oimi live] set ffmpeg env by path:', ymlConfig.ffmpeg)
    ffmpeg.setFfmpegPath(ymlConfig.ffmpeg)
  } else {
    console.log('[oimi live] waiting for dependency install')
    await Helper.downloadDependency(['ffmpeg'])
  }
}

const setStaticPath = (context) => {
  const publicPaths = [path.join(__dirname, '../public'), path.join(process.cwd(),'public')]
  const publicPath = publicPaths.find(_path => fse.pathExistsSync(_path))
  if (publicPath) context.use(express.static(publicPath))
}
const bootstrap = async () => {
  await setFfmpegPath()
  let app = express();
  setStaticPath(app)
  expressWebSocket(app, null, {
    perMessageDeflate: true,
  });
  app.ws("/live/:id/", requestHandle);
  app.listen(PORT, async () => {
    console.log(`Server is running on port: ${PORT}`);
    const UUID = await Helper.getUUID()
    logger.info("UUID:" + UUID)
    isOutAuth()
  });
}

function requestHandle(ws, req) {
  const stream = webSocketStream(
    ws,
    {
      binary: true,
      browserBufferTimeout: 1000000,
    },
    {
      browserBufferTimeout: 1000000,
    }
  );
  let url = req.query.url;
  try {
    const isRTMP = url.startsWith("rtmp://");
    const isRTSP = url.startsWith("rtsp://")
    const rtspOptions = ["-rtsp_transport", "tcp", "-buffer_size", "102400"]
    const rtmpOptions = ["-rtmp_live", "live"]
    const options = isRTMP ? rtmpOptions : rtspOptions
    ffmpeg(url)
      .addInputOption(...options)
      .on("start", function (commandLine) {
        console.log(commandLine, "Stream started.");
      })
      .on("codecData", function () {
        console.log(url, "Stream codecData.");
        // 摄像机在线处理
      })
      .on("error", function (err) {
        console.log(url, "An error occured: ", err + '');
      })
      .on('stderr', function(stderrLine) {
        console.log('Stderr output: ' + stderrLine);
      })
      .on("end", function () {
        console.log(url, "Stream end!");
        // 摄像机断线的处理
      })
      .outputFormat("flv")
      .videoCodec("libx264")
      .audioCodec('aac')  
      .audioFrequency(11025)
      .pipe(stream);
  } catch (error) {
    console.log(error);
  }
}

module.exports = { bootstrap }
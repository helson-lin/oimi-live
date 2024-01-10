const Helper = require('./helper')
const express = require("express");
const expressWebSocket = require("express-ws");
const ffmpeg = require("fluent-ffmpeg");
const webSocketStream = require("websocket-stream/stream");
const path = require("path");
const process = require("process");
const fse = require('fs-extra')
const logger = require('./log')
const ymlConfig = Helper.readYml()
const PORT = ymlConfig?.port || 8005;

const setFfmpegPath = async () => {
  if (ymlConfig?.ffmpeg) {
    logger.info('Set ffmpeg Env by path:', ymlConfig.ffmpeg)
    ffmpeg.setFfmpegPath(ymlConfig.ffmpeg)
  } else {
    logger.info('waiting for dependency install')
    await Helper.downloadDependency(['ffmpeg'])
  }
}

const setStaticPath = (context) => {
  const publicPaths = [path.join(__dirname, '../public'), path.join(process.cwd(), 'public')]
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
    Helper.listenLog(PORT);
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
  url = Buffer.from(url, 'base64').toString('utf-8')
  try {
    const isRTMP = url.startsWith("rtmp://");
    const isRTSP = url.startsWith("rtsp://")
    const rtspOptions = ["-rtsp_transport", "tcp", "-buffer_size", "102400"]
    const rtmpOptions = ["-rtmp_live", "live"]
    const options = isRTMP ? rtmpOptions : rtspOptions
    ffmpeg(url)
      .addInputOption(...options)
      .on("start", function (commandLine) {
        logger.info(commandLine, "Stream started.");
      })
      .on("codecData", function () {
        logger.info("Stream codecData:" + url);
        // 摄像机在线处理
      })
      .on("error", function (err) {
        logger.error("An error occured: ", url + err);
      })
      .on('stderr', function (stderrLine) {
        logger.error('Stderr output: ' + stderrLine);
      })
      .on("end", function () {
        logger.info("Stream Closed! Url:" + url);
      })
      .outputFormat("flv")
      .videoCodec("libx264")
      .audioCodec('aac')
      .audioFrequency(11025)
      .pipe(stream);
  } catch (error) {
    logger.warn(error);
  }
}

module.exports = { bootstrap }
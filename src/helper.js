const YAML = require("yamljs");
const childProcess = require('child_process')
const fse = require('fs-extra')
const path = require('path')
const os = require('os')
const ip = require('ip')
const chalk = require('chalk')
const ffmpeg = require('fluent-ffmpeg')
const download = require('download')

const Helper = {
    version: '4.4.1',
    registryUrl: 'https://pic.kblue.site',
    registryMap: {
        github: 'https://nn.oimi.space/https://github.com/ffbinaries/ffbinaries-prebuilt/releases/download/v4.4.1',
        selfCdn: 'https://pic.kblue.site',
    },
    decencyList: ['ffmpeg', 'ffprobe'],
    /**
     * @description change ffmpeg dependency download registry
     * @param {string} nameOrBaseUrl
     */
    changeRegistry(nameOrBaseUrl) {
        if (!nameOrBaseUrl) throw new Error('nameOrBaseUrl cant be none')
        const isInnerRegistry = Object.keys(this.registryMap).includes(nameOrBaseUrl)
        if (isInnerRegistry) {
            this.registryUrl = this.registryMap[nameOrBaseUrl]
        } else {
            this.registryUrl = nameOrBaseUrl
        }
    },
    /**
    * @description: judge input path is a directory
    * @param {string} pathDir path
    * @return {boolean} true: path is a file
    */
    isExist(pathDir) { return fse.pathExistsSync(pathDir) },
    /**
     * @description exec command
     * @param {string} cmd
     * @returns {*}
     */
    execCmd(cmd) {
        return new Promise((resolve, reject) => {
            childProcess.exec(
                cmd,
                (error) => {
                    if (error) {
                        reject(error)
                    } else {
                        resolve()
                    }
                },
            )
        })
    },
    async chmod(file) {
        const supported = ['linux', 'darwin']
        return new Promise((resolve, reject) => {
            if (supported.indexOf(process.platform) === -1) {
                reject(new Error('the platform not support auto chmod, please do it by yourself'))
            } else {
                const cmd = `chmod +x ${file}`
                this.execCmd(cmd).then(() => {
                    resolve('chmod success')
                }).catch((e) => reject(e))
            }
        })
    },
    /**
     * @description: get lib path
     * @param {string} componentName path
     * @return {string} lib path
     */
    getLibPath(componentName = 'ffmpeg') {
        const executableFileSuffix = os.platform().startsWith('win') ? `${componentName}.exe` : componentName
        return path.join(process.cwd(), `lib/${executableFileSuffix}`)
    },
    /**
     * @description get current device platform
     * @returns {string|null} platform
     */
    detectPlatform() {
        let type = (os.type()).toLowerCase()
        let arch = (os.arch()).toLowerCase()
        if (type === 'darwin') {
            return 'osx-64'
        }
        if (type === 'windows_nt') {
            return arch === 'x64' ? 'windows-64' : 'windows-32'
        }
        if (type === 'linux') {
            if (arch === 'arm' || arch === 'arm64') {
                return 'linux-armel'
            }
            return arch === 'x64' ? 'linux-64' : 'linux-32'
        }
        return null
    },
    /**
     * get binaries download urls
     * @param {String} component ffmpeg ffprobe
     * @returns {String} download url
    */
    getDownloadUrl(component, version = '4.4.1') {
        return `${this.registryUrl}/${component}-${version}-${this.detectPlatform()}.zip`
    },
    setEnv(type, path) {
        if (type === 'ffmpeg') {
            ffmpeg.setFfmpegPath(path)
            console.log('[oimi live] ffmpeg: The environment variable is set successfully')
        }
        if (type === 'ffprobe') {
            ffmpeg.setFfprobePath(path)
            console.log('[oimi live] ffprobe: The environment variable is set successfully')
        }
    },
    /**
     * is need download
     * @param {String} type ffmpeg ffprobe
     * @returns {boolean} true: need to download ffmpeg
    */
    needDownload(type) {
        const libPath = this.getLibPath(type)
        const isExist = this.isExist(libPath)
        if (isExist) {
            this.setEnv(type, libPath)
            return false
        }
        return true
    },
    /**
    * @param {ffmpeg|ffprobe} type
    * @returns
    */
    getLibsStatus(type) {
        return {
            type,
            libPath: this.getLibPath(type),
            downloadURL: this.getDownloadUrl(type, '4.4.1'),
            download: this.needDownload(type),
        }
    },
    /**
     * @description
     * @param {string} url download url
     * @param {string} libPath lib path
     * @param {string} type 类型 ffmpeg/ffprobe
     * @return {void}
     */
    async downloadAndSetEnv(url, libPath, type) {
        try {
            console.log(chalk.cyanBright.bold('[oimi live] server is downloading ffmpeg dependency, it will auto start server after downloaded'))
            await download(url, 'lib', { extract: true })
            this.setEnv(type, libPath)
            await this.chmod(libPath)
        } catch (e) {
            console.warn(chalk.red('[oimi live] download and set env failed:' + String(e).trim()))
        }
    },
    /**
     * download ffbinary
     * @param {Array} libs
     * @returns
    */
    downloadDependency(libs = this.decencyList) {
        return new Promise((resolve, reject) => {
            const arr = libs
                .map(i => this.getLibsStatus(i))
                .filter(i => i.download)
                .map(i => this.downloadAndSetEnv(i.downloadURL, i.libPath, i.type))
            Promise.allSettled(arr).then(results => {
                const isFailed = results.filter(item => item.status === 'rejected')
                if (isFailed.length > 0) {
                    reject(isFailed.map(i => i.error).join('/n'))
                } else {
                    resolve('download binaries success')
                }
            })
        })
    },
    /**
     * @description: make sure directory exists
     * @param {string} _path configuration path
     * @return {string} real download directory
     */
    ensurePath(_path) {
        if (_path.startsWith('@')) {
            const relPath = _path.replace('@', '')
            fse.ensureDirSync(relPath)
            return relPath
        }
        const relPath = path.join(process.cwd(), _path)
        fse.ensureDirSync(relPath)
        return relPath
    },

    readYml() {
        const baseDir = path.join(process.cwd(), "config.yml");
        const isExist = fse.pathExistsSync(baseDir);
        if (isExist) {
            return YAML.load(baseDir);
        } else {
            return null;
        }
    },
    listenLog (port) {
        console.log(`\nServer running at: \n- Local: ${chalk.cyan(`http://localhost:${port}`)}\n- NetWork: ${chalk.cyan(`http://${ip.address()}:${port}`)}`)
    }
}



module.exports = Helper

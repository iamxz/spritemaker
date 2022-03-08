const Koa = require('koa');
const logger = require('koa-logger');
const serve = require('koa-static');
const onerror = require('koa-onerror');
const Router = require('koa-router');
const koaBody = require('koa-body');
const nunjucks = require('koa-nunjucks-async');
const decompress = require('decompress');
const fs = require("fs-extra");
const sprite = require("./lib/sprite");
const md5File = require('md5-file')
const path = require('path');

const app = new Koa();
const router = new Router();

app.use(koaBody({ multipart: true }));

// log requests
// serve files from ./public
app.use(serve(path.join(__dirname, '/public')));

app.use(logger());

// onerror(app);

app.use(nunjucks('views', {
    opts: {
        autoescape: true,
        throwOnUndefined: false,
        trimBlocks: false,
        lstripBlocks: false,
        watch: false,
        noCache: false
    },
    filters: {},
    globals: {},
    extensions: {},
    ext: '.html'
}))

router.get('/', async (ctx, next) => {
    // ctx.router available

    await ctx.render('index', {
        message: 'Hello World!'
    });
})

router.post('/upload', async (ctx,next) =>{
    let _file = ctx.request.files.file;
    if(!_file.size){
        ctx.body ="请上传文件"
        return ;
    }

    if(_file.name.lastIndexOf(".zip") == -1){
        ctx.body ="请上传zip文件"
        return ;
    }
    let _tmp = md5File.sync(_file.path);
    let _path = path.resolve(__dirname,"public","uploads",_tmp)
    let _filePath = path.resolve(_path,_file.name)
  
    await fs.move(_file.path,_filePath, { overwrite: true })

    let files =  await decompress(_filePath,_path)
        fs.removeSync(_filePath);
    let _files = [];
    files.forEach(item =>{
        if(~item.path.indexOf(".") ===0  || item.path.indexOf("__MACOSX") ===0){
           return
        }
        _files.push(path.resolve(_path,item.path))
    })


    let result = await sprite(_files,_path,{
        padding: ctx.request.body.padding,
        algorithm: ctx.request.body.algorithm,
        quality: ctx.request.body.quality
    })

    result.url = "/uploads/"+_tmp+"/sprite.png"

    await ctx.render('detail', result);
})

app.use(router.routes())
app.use(router.allowedMethods());

// listen
app.listen(3000);
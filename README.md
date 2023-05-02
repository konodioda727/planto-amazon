<<<<<<< HEAD

# 下载安装依赖
```
git clone https://github.com/jackchen0120/EC-Platform-Monitor.git
cd EC-Platform-Monitor
npm install 或 yarn
```


## 开发模式
```
npm run serve
```
运行之后，访问地址：http://localhost:8999

### 如果出现错误，请先检查node版本

在cmd中输入 `node -v`检查node版本

如果node版本在16以上，则需要将node删除并使用nvm下载16.13.0版本的node

以下是具体步骤：

0、先删除原有的node，不然会报错

1、下载nvm：
[nvm地址](https://github.com/coreybutler/nvm-windows/releases)

2、检查nvm是否安装完成并且应用到全局： 打开cmd，输入`nvm v`查看nvm版本。若安装完成，则会输出对应的版本号，若未输出，就重装

3、 安装完毕后，检查环境变量是否配置完成，在系统变量的path里应该
会有在nvm安装过程中你填写的node下载地址，没有就自己加上去

4、安装完毕后，使用`nvm i 16.13.0`下载node


5、使用 `nvm use 16.13.0` 使用16.13.0版本的node


## 生产环境打包
```
npm run build
```

=======
# planto-amazon
亚马逊数据展板
>>>>>>> 806808c11aaf6d36569f699e5ab10de107beb498

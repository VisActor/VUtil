#!/usr/bin/env bash
# SCM 仓库编译脚本，PSM: data/dp/chartspace4

set -e
#-- 准备环境
# 切换node版本 change node version
source /etc/profile

nvm use lts/fermium

echo 'node version is ' && node -v

#-- 定义变量
DIR=`pwd`
DIST="$DIR/packages/v-util/dist"
OUTPUT="$DIR/output" #该目录下文件会被打包上传到CDN
TARGET="$OUTPUT/$BUILD_VERSION"

mkdir -p $OUTPUT

npm i --global @microsoft/rush
rush update
rush build --to @visactor/vutils


# 这里目前是按需要只传了一个
mkdir -p $TARGET
cp -r $DIST/dp_v-util.js $TARGET/index.js

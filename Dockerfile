FROM electronuserland/builder:wine

# 设置工作目录
WORKDIR /app

# 复制项目文件
COPY . .

# 安装依赖
RUN yarn install

# 设置环境变量
ENV ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
ENV ELECTRON_BUILDER_BINARIES_MIRROR=https://npmmirror.com/mirrors/electron-builder-binaries/

# 构建 macOS 版本
CMD ["yarn", "build", "--mac"] 
#!/bin/bash
cp build/resources/logo.svg web/src/images/logo.svg
cp build/resources/logo.svg web/src/images/logo-icon.svg
#cp build/resources/logo.png web/src/images/logo.png
#cp build/resources/logo-with-name.png web/src/images/logo-with-name.png
cp build/resources/favicon.ico web/public/favicon.ico


rm -rf server/resource/build
rm -rf server/resource/dist
rm -rf server/resource/config.yml
cp -r config.yml server/resource/config.yml
echo "clean build history"

echo "build web..."
cd web || exit
yarn install || exit
yarn build || exit
cp -r build ../server/resource/dist
echo "build web success"


 
go clean -cache
echo "build api..."
cd ..
go mod tidy
#go env;CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags '-s -w' -o next-dbm main.go
# go env;CGO_ENABLED=0 GOOS=darwin GOARCH=arm64 go build -ldflags '-s -w' -o next-dbm main.go
# 获取操作系统类型
OS_TYPE=$(uname)

# 根据操作系统类型选择编译命令
if [ "$OS_TYPE" = "Linux" ]; then
    echo "#### Linux. Compiling for Linux..."
    go env;CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags '-s -w' -o next-dbm main.go
    go build -o next-dbm
    upx --version
    upx next-dbm
elif [ "$OS_TYPE" = "Darwin" ]; then
    echo "#### macOS. Compiling for macOS..."
    go env;CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build -ldflags '-s -w' -o next-dbm main.go
    go build -o next-dbm
    upx --force-macos next-dbm
else
    echo "Unsupported OS type: $OS_TYPE"
    exit 1
fi

rm -rf server/resource/build

echo "build api success"

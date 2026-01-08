package utils

import (
	"archive/zip"
	"bytes"
	"crypto/aes"
	"crypto/cipher"
	"crypto/md5"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"image"
	"image/png"
	"io"
	"io/fs"
	"io/ioutil"
	"log"
	"net"
	"os"
	"path/filepath"
	"reflect"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"go.uber.org/zap"
	"golang.org/x/crypto/ssh"
	"golang.org/x/text/encoding/simplifiedchinese"
	"golang.org/x/text/transform"

	"github.com/google/uuid"
	errors2 "github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"golang.org/x/crypto/pbkdf2"
)

func UUID() string {
	return uuid.New().String()
}
func DNToUUID(dn string) string {
	// 计算 MD5 哈希
	hash := md5.Sum([]byte(dn))
	hexHash := hex.EncodeToString(hash[:])

	// 格式化为 UUID 样式（d4d2040f-3ad7-4467-91af-e558ef0cdd44）
	uuid := fmt.Sprintf(
		"%s-%s-%s-%s-%s",
		hexHash[0:8],
		hexHash[8:12],
		hexHash[12:16],
		hexHash[16:20],
		hexHash[20:32],
	)
	return strings.ToLower(uuid)
}
func LongUUID() string {
	uuid.New()
	longUUID := strings.Join([]string{UUID(), UUID(), UUID(), UUID()}, "")
	return strings.ReplaceAll(longUUID, "-", "")
}

func Tcping(ip string, port int) (bool, error) {
	var (
		conn    net.Conn
		err     error
		address string
	)
	strPort := strconv.Itoa(port)
	if strings.HasPrefix(ip, "[") && strings.HasSuffix(ip, "]") {
		// 如果用户有填写中括号就不再拼接
		address = fmt.Sprintf("%s:%s", ip, strPort)
	} else {
		address = fmt.Sprintf("[%s]:%s", ip, strPort)
	}
	if conn, err = net.DialTimeout("tcp", address, 15*time.Second); err != nil {
		return false, err
	}
	defer func() {
		_ = conn.Close()
	}()
	return true, nil
}

func ImageToBase64Encode(img image.Image) (string, error) {
	var buf bytes.Buffer
	if err := png.Encode(&buf, img); err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(buf.Bytes()), nil
}

// 判断所给路径文件/文件夹是否存在
func FileExists(path string) bool {
	_, err := os.Stat(path) //os.Stat获取文件信息
	if err != nil {
		return os.IsExist(err)
	}
	return true
}

// 判断所给路径是否为文件夹
func IsDir(path string) bool {
	s, err := os.Stat(path)
	if err != nil {
		return false
	}
	return s.IsDir()
}

// 判断所给路径是否为文件
func IsFile(path string) bool {
	return !IsDir(path)
}

func GetParentDirectory(directory string) string {
	return filepath.Dir(directory)
}

func MkdirP(path string) error {
	if !FileExists(path) {
		if err := os.MkdirAll(path, os.ModePerm); err != nil {
			return err
		}
		fmt.Printf("创建文件夹: %v \n", path)
	}
	return nil
}

// 去除重复元素
func Distinct(a []string) []string {
	result := make([]string, 0, len(a))
	temp := map[string]struct{}{}
	for _, item := range a {
		if _, ok := temp[item]; !ok {
			temp[item] = struct{}{}
			result = append(result, item)
		}
	}
	return result
}

// Sign 排序+拼接+摘要
func Sign(a []string) string {
	sort.Strings(a)
	data := []byte(strings.Join(a, ""))
	has := md5.Sum(data)
	return fmt.Sprintf("%x", has)
}

func Md5(s string) string {
	has := md5.Sum([]byte(s))
	return fmt.Sprintf("%x", has)
}

func Contains(s []string, str string) bool {
	for _, v := range s {
		if v == str {
			return true
		}
	}
	return false
}

func StructToMap(obj interface{}) map[string]interface{} {
	t := reflect.TypeOf(obj)
	v := reflect.ValueOf(obj)
	if t.Kind() == reflect.Ptr {
		// 如果是指针，则获取其所指向的元素
		t = t.Elem()
		v = v.Elem()
	}

	var data = make(map[string]interface{})
	if t.Kind() == reflect.Struct {
		// 只有结构体可以获取其字段信息
		for i := 0; i < t.NumField(); i++ {
			jsonName := t.Field(i).Tag.Get("json")
			if jsonName != "" {
				data[jsonName] = v.Field(i).Interface()
			} else {
				data[t.Field(i).Name] = v.Field(i).Interface()
			}
		}
	}
	return data
}

func IpToInt(ip string) int64 {
	if len(ip) == 0 {
		return 0
	}
	bits := strings.Split(ip, ".")
	if len(bits) < 4 {
		return 0
	}
	b0 := StringToInt(bits[0])
	b1 := StringToInt(bits[1])
	b2 := StringToInt(bits[2])
	b3 := StringToInt(bits[3])

	var sum int64
	sum += int64(b0) << 24
	sum += int64(b1) << 16
	sum += int64(b2) << 8
	sum += int64(b3)

	return sum
}

func StringToInt(in string) (out int) {
	out, _ = strconv.Atoi(in)
	return
}

func Check(f func() error) {
	if err := f(); err != nil {
		logrus.Error("Received error:", err)
	}
}

func ParseNetReg(line string, reg *regexp.Regexp, shouldLen, index int) (int64, string, error) {
	rx1 := reg.FindStringSubmatch(line)
	if len(rx1) != shouldLen {
		return 0, "", errors.New("find string length error")
	}
	i64, err := strconv.ParseInt(rx1[index], 10, 64)
	total := rx1[2]
	if err != nil {
		return 0, "", errors2.Wrap(err, "ParseInt error")
	}
	return i64, total, nil
}

func PKCS5Padding(ciphertext []byte, blockSize int) []byte {
	padding := blockSize - len(ciphertext)%blockSize
	padText := bytes.Repeat([]byte{byte(padding)}, padding)
	return append(ciphertext, padText...)
}

func PKCS5UnPadding(origData []byte) []byte {
	length := len(origData)
	unPadding := int(origData[length-1])
	return origData[:(length - unPadding)]
}

// AesEncryptCBC /*
func AesEncryptCBC(origData, key []byte) ([]byte, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	blockSize := block.BlockSize()
	origData = PKCS5Padding(origData, blockSize)
	blockMode := cipher.NewCBCEncrypter(block, key[:blockSize])
	encrypted := make([]byte, len(origData))
	blockMode.CryptBlocks(encrypted, origData)
	return encrypted, nil
}

func AesDecryptCBC(encrypted, key []byte) ([]byte, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	blockSize := block.BlockSize()
	blockMode := cipher.NewCBCDecrypter(block, key[:blockSize])
	origData := make([]byte, len(encrypted))
	blockMode.CryptBlocks(origData, encrypted)
	origData = PKCS5UnPadding(origData)
	return origData, nil
}

func Pbkdf2(password string) ([]byte, error) {
	//生成随机盐
	salt := make([]byte, 32)
	_, err := rand.Read(salt)
	if err != nil {
		return nil, err
	}
	//生成密文
	dk := pbkdf2.Key([]byte(password), salt, 1, 32, sha256.New)
	return dk, nil
}

func DeCryptPassword(cryptPassword string, key []byte) (string, error) {
	origData, err := base64.StdEncoding.DecodeString(cryptPassword)
	if err != nil {
		return "", err
	}
	decryptedCBC, err := AesDecryptCBC(origData, key)
	if err != nil {
		return "", err
	}
	return string(decryptedCBC), nil
}

func RegexpFindSubString(text string, reg *regexp.Regexp) (ret string, err error) {
	findErr := errors.New("regexp find failed")
	res := reg.FindStringSubmatch(text)
	if len(res) != 2 {
		return "", findErr
	}
	return res[1], nil

}

func String2int(s string) (int, error) {
	i, err := strconv.Atoi(s)
	if err != nil {
		return 0, err
	}
	return i, nil
}

func RunCommand(client *ssh.Client, command string) (stdout string, err error) {
	session, err := client.NewSession()
	if err != nil {
		return "", err
	}
	defer session.Close()

	var buf bytes.Buffer
	session.Stdout = &buf
	err = session.Run(command)
	if err != nil {
		return "", err
	}
	stdout = buf.String()
	return
}

func TimeWatcher(name string) {
	start := time.Now()
	defer func() {
		cost := time.Since(start)
		fmt.Printf("%s: %v\n", name, cost)
	}()
}

func DirSize(path string) (int64, error) {
	var size int64
	err := filepath.Walk(path, func(_ string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() {
			size += info.Size()
		}
		return err
	})
	return size, err
}

func Utf8ToGbk(s []byte) ([]byte, error) {
	reader := transform.NewReader(bytes.NewReader(s), simplifiedchinese.GBK.NewEncoder())
	d, e := ioutil.ReadAll(reader)
	if e != nil {
		return nil, e
	}
	return d, nil
}

func Decimal(value float64) float64 {
	value, _ = strconv.ParseFloat(fmt.Sprintf("%.2f", value), 64)
	return value
}

// GetAvailablePort 获取可用端口
func GetAvailablePort() (int, error) {
	addr, err := net.ResolveTCPAddr("tcp", "localhost:0")
	if err != nil {
		return 0, err
	}

	l, err := net.ListenTCP("tcp", addr)
	if err != nil {
		return 0, err
	}

	defer func(l *net.TCPListener) {
		_ = l.Close()
	}(l)
	return l.Addr().(*net.TCPAddr).Port, nil
}

func InsertSlice(index int, new []rune, src []rune) (ns []rune) {
	ns = append(ns, src[:index]...)
	ns = append(ns, new...)
	ns = append(ns, src[index:]...)
	return ns
}

func GetLocalIp() (string, error) {
	addrs, err := net.InterfaceAddrs()

	if err != nil {
		return "", err
	}

	for _, address := range addrs {
		// 检查ip地址判断是否回环地址
		if ipNet, ok := address.(*net.IPNet); ok && !ipNet.IP.IsLoopback() {
			if ipNet.IP.To4() != nil {
				return ipNet.IP.String(), nil
			}
		}
	}

	return "", errors.New("获取本机IP地址失败")
}

// 解析时间字符串并转换为 time.Time 类型 time.Now().Format("20060102")
func parseLimitedTime(timeStr string) (time.Time, error) {
	return time.Parse("2006-01-02 00:00:00", timeStr)
}

// 假设这是您的自定义 utils 包中的 GetCurrentTime 函数
func GetCurrentTime() time.Time {
	return time.Now()
}

func ComparnCurrentTime(timeStr string) (bool, error) {
	currentTime := GetCurrentTime()
	limitedTime, err := parseLimitedTime(timeStr)
	if err != nil {

		return false, err
	}

	if currentTime.Before(limitedTime) {
		return false, nil
	}
	return true, nil
}

// 将目录打包成 ZIP 文件
func ZipDir(source, target string) error {
	// 创建 ZIP 文件
	zipFile, err := os.Create(target)
	if err != nil {
		return err
	}
	defer zipFile.Close()

	// 创建 ZIP writer
	zipWriter := zip.NewWriter(zipFile)
	defer zipWriter.Close()

	// 遍历源目录
	err = filepath.Walk(source, func(path string, info fs.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// 获取相对路径，排除源目录本身
		relPath := strings.TrimPrefix(path, filepath.Dir(source))

		// 如果是目录，忽略并继续
		if info.IsDir() {
			return nil
		}

		// 打开文件
		file, err := os.Open(path)
		if err != nil {
			return err
		}
		defer file.Close()

		// 创建 ZIP 文件头
		zipHeader, err := zip.FileInfoHeader(info)
		if err != nil {
			return err
		}
		zipHeader.Name = relPath
		zipHeader.Method = zip.Deflate // 使用 Deflate 压缩

		// 将文件添加到 ZIP 中
		writer, err := zipWriter.CreateHeader(zipHeader)
		if err != nil {
			return err
		}

		// 将文件内容写入到 ZIP 中
		_, err = io.Copy(writer, file)
		return err
	})

	return err
}

func Unzip(source, target string) error {
	// 打开 ZIP 文件
	zipReader, err := zip.OpenReader(source)
	if err != nil {
		return err
	}
	defer zipReader.Close()

	// 确保目标目录存在
	err = os.MkdirAll(target, 0755)
	if err != nil {
		return err
	}

	// 遍历 ZIP 文件中的每个文件
	for _, file := range zipReader.File {
		// 获取目标文件路径
		filePath := filepath.Join(target, file.Name)

		// 如果是目录，创建目录
		if file.FileInfo().IsDir() {
			err := os.MkdirAll(filePath, 0755) // 使用显式权限 0755
			if err != nil {
				return err
			}
			continue
		}

		// 创建包含文件的目录
		err = os.MkdirAll(filepath.Dir(filePath), 0755) // 也设置目录权限为 0755
		if err != nil {
			return err
		}

		// 打开文件内容
		fileReader, err := file.Open()
		if err != nil {
			return err
		}
		defer fileReader.Close()

		// 创建目标文件
		targetFile, err := os.OpenFile(filePath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0644) // 设置文件权限为 0644
		if err != nil {
			fileReader.Close() // 确保 fileReader 在出现错误时被关闭
			return err
		}

		// 将内容复制到目标文件
		_, err = io.Copy(targetFile, fileReader)
		fileReader.Close() // 手动关闭 fileReader
		targetFile.Close() // 手动关闭 targetFile
		if err != nil {
			return err
		}
	}

	return nil
}
func MoveFile(srcPath, dstDir string) error {
	// 获取源文件的文件名
	fileName := filepath.Base(srcPath)

	// 创建目标路径（目录 + 文件名）
	dstPath := filepath.Join(dstDir, fileName)

	// 移动文件（通过重命名实现）
	err := os.Rename(srcPath, dstPath)
	if err != nil {
		return fmt.Errorf("failed to move file: %v", err)
	}

	return nil
}

// RemoveDirectory 删除目录及其所有内容
func RemoveDirectory(dir string) error {
	// 检查目录是否存在
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		// 目录不存在，直接返回
		return nil
	}

	// 使用 os.RemoveAll 删除目录
	err := os.RemoveAll(dir)
	if err != nil {
		return fmt.Errorf("failed to remove directory: %v", err)
	}

	return nil
}

// ReadFile 读取指定路径的文件并返回其内容
func ReadFile(path string) (string, error) {
	// 使用 ioutil.ReadFile 读取文件
	data, err := ioutil.ReadFile(path)
	if err != nil {
		log.Fatal("读取文件时出错", zap.String("path", path), zap.Error(err))
		return "", err
	}

	// 将文件内容转换为字符串并返回
	return string(data), nil
}

// FindStructSQLFiles 遍历目录并匹配包含指定关键字的文件
func FindStructSQLFiles(dir, keyword string) ([]string, error) {
	var files []string

	// 遍历目录
	err := filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err // 如果遍历过程中出现错误，返回错误
		}

		// 检查是否为文件且文件名包含关键字
		if !info.IsDir() && strings.Contains(info.Name(), keyword) {
			files = append(files, path)
		}

		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to walk directory: %w", err)
	}

	return files, nil
}

// CompareVersions 比较两个语义化版本号
// 返回值：
//
//	-1：v1 < v2
//	 0：v1 == v2
//	 1：v1 > v2
func CompareVersions(v1, v2 string) int {
	// 去掉前缀 "v"（如果有）
	v1 = strings.TrimPrefix(v1, "v")
	v2 = strings.TrimPrefix(v2, "v")

	// 按 "." 分割版本号
	v1Parts := strings.Split(v1, ".")
	v2Parts := strings.Split(v2, ".")

	// 逐级比较
	for i := 0; i < len(v1Parts) || i < len(v2Parts); i++ {
		var v1Num, v2Num int

		// 获取 v1 的当前部分
		if i < len(v1Parts) {
			v1Num, _ = strconv.Atoi(v1Parts[i])
		}

		// 获取 v2 的当前部分
		if i < len(v2Parts) {
			v2Num, _ = strconv.Atoi(v2Parts[i])
		}

		// 比较当前部分
		if v1Num < v2Num {
			return -1
		} else if v1Num > v2Num {
			return 1
		}
	}

	// 如果所有部分都相等，则版本号相等
	return 0
}

/*
s1 := "a,b,c"
s2 := "a,d,e,f"

inter, only1, only2 := DiffCommaStrings(s1, s2)

fmt.Println("交集:", inter)
fmt.Println("只在 s1:", only1)
fmt.Println("只在 s2:", only2)
*/
func DiffCommaStrings(s1, s2 string) (intersection, only1, only2 []string) {
	// 切分
	arr1 := strings.Split(s1, ",")
	arr2 := strings.Split(s2, ",")

	// 集合
	set1 := make(map[string]bool)
	set2 := make(map[string]bool)

	for _, v := range arr1 {
		set1[strings.TrimSpace(v)] = true
	}
	for _, v := range arr2 {
		set2[strings.TrimSpace(v)] = true
	}

	// 交集 + s1 独有
	for v := range set1 {
		if set2[v] {
			intersection = append(intersection, v)
		} else {
			only1 = append(only1, v)
		}
	}

	// s2 独有
	for v := range set2 {
		if !set1[v] {
			only2 = append(only2, v)
		}
	}

	return
}

// SetFromCommaStrings 把逗号分隔字符串转成 set
func SetFromCommaStrings(s string) map[string]bool {
	set := make(map[string]bool)
	for _, v := range strings.Split(s, ",") {
		v = strings.TrimSpace(v)
		if v != "" {
			set[v] = true
		}
	}
	return set
}

// Union 并集
func Union(sets ...map[string]bool) map[string]bool {
	out := make(map[string]bool)
	for _, s := range sets {
		for k := range s {
			out[k] = true
		}
	}
	return out
}

// Difference 差集: base - remove
func Difference(base, remove map[string]bool) map[string]bool {
	out := make(map[string]bool)
	for k := range base {
		if !remove[k] {
			out[k] = true
		}
	}
	return out
}

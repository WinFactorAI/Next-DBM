package utils

import (
	"bytes"
	"crypto/aes"
	"crypto/cipher"
	"encoding/base64"
	"errors"
	"log"
)

var Passwder = Passwd{}

type Passwd struct{}

var SecretKey = "tmqKGvSwDkREcxdK"

func (pwd *Passwd) Encrypt(p string) (string, error) {

	if len(SecretKey) == 16 {
		// 转成字节数组
		origData := []byte(p)
		k := []byte(SecretKey)
		// 分组秘钥
		block, _ := aes.NewCipher(k)
		// 获取秘钥块的长度
		blockSize := block.BlockSize()
		// 补全码
		origData = PKCS7Padding(origData, blockSize)
		// 加密模式
		blockMode := cipher.NewCBCEncrypter(block, k[:blockSize])
		// 创建数组
		cryted := make([]byte, len(origData))
		// 加密
		blockMode.CryptBlocks(cryted, origData)

		password := base64.StdEncoding.EncodeToString(cryted)
		if password == "" {
			log.Println("加密失败")
			return "", errors.New("加密失败")
		}
		return password, nil
	}
	return "", errors.New("秘钥长度不正确")
}

func (pwd *Passwd) Decrypt(cryted string) (string, error) {
	// 转成字节数组
	crytedByte, _ := base64.StdEncoding.DecodeString(cryted)
	k := []byte(SecretKey)

	// 分组秘钥
	block, _ := aes.NewCipher(k)
	// 获取秘钥块的长度
	blockSize := block.BlockSize()
	// 加密模式
	blockMode := cipher.NewCBCDecrypter(block, k[:blockSize])
	// 创建数组
	orig := make([]byte, len(crytedByte))
	// 解密
	blockMode.CryptBlocks(orig, crytedByte)
	// 去补全码
	orig = PKCS7UnPadding(orig)
	if orig == nil {
		log.Println("无法获得传入密码")
		return "", errors.New("无法获得传入密码")
	}
	return string(orig), nil
}

// 去码
func PKCS7UnPadding(origData []byte) []byte {
	if len(origData) > 0 {
		length := len(origData)
		unpadding := int(origData[length-1])
		return origData[:(length - unpadding)]
	}
	return nil
}

// 补码
func PKCS7Padding(ciphertext []byte, blocksize int) []byte {
	padding := blocksize - len(ciphertext)%blocksize
	padtext := bytes.Repeat([]byte{byte(padding)}, padding)
	return append(ciphertext, padtext...)
}

package utils

import (
	"bytes"
	"fmt"
	"io"
	"net"
	"time"
)

func ParseProxyProtocol(conn net.Conn) (string, error) {
	// 设置非阻塞模式：1秒超时探测 PROXY 协议头
	conn.SetReadDeadline(time.Now().Add(1 * time.Second))
	defer conn.SetReadDeadline(time.Time{}) // 重置超时

	// 读取前 16 字节（PROXY v2 签名 + 地址信息）
	buf := make([]byte, 16)
	_, err := io.ReadFull(conn, buf)
	if err != nil {
		// 处理超时或无数据（非 PROXY 协议连接）
		if netErr, ok := err.(net.Error); ok && netErr.Timeout() {
			return "", fmt.Errorf("no PROXY header (normal connection)")
		}
		return "", err
	}

	// 检查 PROXY v2 签名
	if !bytes.Equal(buf[:12], []byte{0x0D, 0x0A, 0x0D, 0x0A, 0x00, 0x0D, 0x0A, 0x51, 0x55, 0x49, 0x54, 0x0A}) {
		return "", fmt.Errorf("invalid PROXY v2 signature")
	}

	// 解析地址类型（IPv4/IPv6）
	family := buf[12] >> 4
	var ipLen int
	switch family {
	case 0x11: // IPv4
		ipLen = 4
	case 0x21: // IPv6
		ipLen = 16
	default:
		return "", fmt.Errorf("unsupported address family")
	}

	// 读取剩余 IP 数据
	ipBuf := make([]byte, ipLen)
	if _, err := io.ReadFull(conn, ipBuf); err != nil {
		return "", err
	}

	return net.IP(ipBuf).String(), nil
}

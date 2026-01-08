package service

import (
	"context"
	"crypto/tls"
	"fmt"
	"net/smtp"
	"next-dbm/server/common/nd"

	"github.com/spf13/cast"

	"next-dbm/server/branding"
	"next-dbm/server/log"
	"next-dbm/server/repository"

	"github.com/jordan-wright/email"
)

var MailService = new(mailService)

type mailService struct {
}

func (r mailService) SendMail(to, subject, text string) {
	propertiesMap := repository.PropertyRepository.FindAllMap(context.TODO())
	host := propertiesMap[nd.MailHost]
	port := propertiesMap[nd.MailPort]
	username := propertiesMap[nd.MailUsername]
	password := propertiesMap[nd.MailPassword]

	if host == "" || port == "" || username == "" || password == "" {
		log.Warn("邮箱信息不完整，跳过发送邮件。")
		return
	}

	e := email.NewEmail()
	e.From = fmt.Sprintf("%s <%s>", branding.Name, username)
	e.To = []string{to}
	e.Subject = subject
	e.Text = []byte(text)
	emailServer := fmt.Sprintf("%s:%s", host, port)
	var err error
	if cast.ToInt(port) != 465 {
		err = e.Send(emailServer, smtp.PlainAuth("", username, password, host))
	} else {
		err = e.SendWithTLS(emailServer, smtp.PlainAuth("", username, password, host), &tls.Config{ServerName: host})
	}

	if err != nil {
		log.Error("邮件发送失败", log.String("err", err.Error()))
	}
}

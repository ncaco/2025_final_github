#!/bin/sh

# Let's Encrypt 인증서 초기 발급 스크립트
# 사용법: docker compose exec certbot sh /path/to/init-letsencrypt.sh

if ! [ -d "/etc/letsencrypt/live/$FRONTEND_DOMAIN" ]; then
    echo "인증서 발급 중: $FRONTEND_DOMAIN 및 $BACKEND_DOMAIN"
    
    certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email $CERTBOT_EMAIL \
        --agree-tos \
        --no-eff-email \
        -d $FRONTEND_DOMAIN \
        -d $BACKEND_DOMAIN
    
    echo "인증서 발급 완료"
else
    echo "인증서가 이미 존재합니다."
fi

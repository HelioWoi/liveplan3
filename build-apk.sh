#!/bin/bash

# Criar diretório para as chaves se não existir
mkdir -p /Users/heliowoi/Documents/VS\ Code/keys

# Gerar o keystore com os dados fornecidos
keytool -genkeypair \
  -dname "cn=Helio Camargo Woicichowski, ou=Development, o=LivePlan3 - Your Personal Finance App, l=Mooloolaba, st=Queensland, c=AU" \
  -alias "liveplan3" \
  -keypass "LivePlan3Ana@Helio@Caue" \
  -keystore "/Users/heliowoi/Documents/VS Code/keys/liveplan3.keystore" \
  -storepass "LivePlan3Ana@Helio@Caue" \
  -validity 9125 \
  -keyalg RSA

# Inicializar o projeto TWA com o manifest
bubblewrap init --manifest=https://liveplan3.netlify.app/manifest.webmanifest \
  --directory=twa-output \
  --chromeosEnabled=false \
  --host=liveplan3.netlify.app \
  --startUrl=/login \
  --name="LivePlan3" \
  --shortName="LivePlan" \
  --themeColor="#8e2de2" \
  --backgroundColor="#0a2647" \
  --display=standalone \
  --orientation=any \
  --packageId=com.liveplan3.app \
  --signingKeyPath="/Users/heliowoi/Documents/VS Code/keys/liveplan3.keystore" \
  --signingKeyAlias="liveplan3" \
  --appVersionName="1.0.0" \
  --appVersionCode=1 \
  --enableNotifications=true

# Navegar para o diretório do projeto TWA
cd twa-output

# Construir o APK
bubblewrap build

echo "APK gerado com sucesso!"

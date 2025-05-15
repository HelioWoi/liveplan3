#!/bin/bash

# Definir o caminho para o JDK instalado pelo Bubblewrap
JAVA_HOME=~/.bubblewrap/jdk/jdk-17.0.11+9/Contents/Home
PATH=$JAVA_HOME/bin:$PATH

echo "Usando Java em: $JAVA_HOME"

# Criar diretório para as chaves se não existir
mkdir -p /Users/heliowoi/Documents/VS\ Code/keys

# Gerar o keystore
echo "Gerando keystore..."
$JAVA_HOME/bin/keytool -genkeypair \
  -dname "CN=Helio Camargo Woicichowski, OU=Development, O=LivePlan3 - Your Personal Finance App, L=Mooloolaba, ST=Queensland, C=AU" \
  -alias "liveplan3" \
  -keypass "LivePlan3Ana@Helio@Caue" \
  -keystore "/Users/heliowoi/Documents/VS Code/keys/liveplan3.keystore" \
  -storepass "LivePlan3Ana@Helio@Caue" \
  -validity 9125 \
  -keyalg RSA

# Verificar se o keystore foi criado
if [ ! -f "/Users/heliowoi/Documents/VS Code/keys/liveplan3.keystore" ]; then
  echo "Erro: Keystore não foi criado!"
  exit 1
fi

echo "Keystore criado com sucesso!"

# Assinar o APK
echo "Assinando o APK..."
cd /Users/heliowoi/Documents/VS\ Code/twa-output

# Usar o zipalign do Android SDK
ANDROID_SDK=~/.bubblewrap/android_sdk
BUILD_TOOLS=$ANDROID_SDK/build-tools/34.0.0

# Verificar se o APK não assinado existe
if [ ! -f "./app-release-unsigned-aligned.apk" ]; then
  echo "APK não assinado não encontrado. Verificando outras localizações..."
  
  if [ -f "./app/build/outputs/apk/release/app-release-unsigned.apk" ]; then
    echo "Encontrado APK em ./app/build/outputs/apk/release/"
    
    # Alinhar o APK
    echo "Alinhando o APK..."
    $BUILD_TOOLS/zipalign -v -p 4 \
      ./app/build/outputs/apk/release/app-release-unsigned.apk \
      ./app-release-unsigned-aligned.apk
  else
    echo "Erro: APK não assinado não encontrado!"
    exit 1
  fi
fi

# Assinar o APK
echo "Assinando o APK alinhado..."
$BUILD_TOOLS/apksigner sign \
  --ks "/Users/heliowoi/Documents/VS Code/keys/liveplan3.keystore" \
  --ks-key-alias "liveplan3" \
  --ks-pass "pass:LivePlan3Ana@Helio@Caue" \
  --key-pass "pass:LivePlan3Ana@Helio@Caue" \
  --out ./app-release-signed.apk \
  ./app-release-unsigned-aligned.apk

# Verificar se o APK assinado foi criado
if [ -f "./app-release-signed.apk" ]; then
  echo "APK assinado com sucesso!"
  echo "APK disponível em: /Users/heliowoi/Documents/VS Code/twa-output/app-release-signed.apk"
else
  echo "Erro: Falha ao assinar o APK!"
fi

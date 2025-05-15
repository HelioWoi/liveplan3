#!/bin/bash

# Criar diretório para o projeto TWA
mkdir -p /Users/heliowoi/Documents/VS\ Code/twa-output

# Criar diretório para as chaves
mkdir -p /Users/heliowoi/Documents/VS\ Code/keys

# Gerar o keystore diretamente com keytool (sem perguntas interativas)
keytool -genkeypair \
  -dname "CN=Helio Camargo Woicichowski, OU=Development, O=LivePlan3 - Your Personal Finance App, L=Mooloolaba, ST=Queensland, C=AU" \
  -alias "liveplan3" \
  -keypass "LivePlan3Ana@Helio@Caue" \
  -keystore "/Users/heliowoi/Documents/VS Code/keys/liveplan3.keystore" \
  -storepass "LivePlan3Ana@Helio@Caue" \
  -validity 9125 \
  -keyalg RSA

echo "Keystore gerado com sucesso em: /Users/heliowoi/Documents/VS Code/keys/liveplan3.keystore"

# Criar arquivo de configuração TWA
cat > /Users/heliowoi/Documents/VS\ Code/twa-manifest.json << EOL
{
  "packageId": "com.liveplan3.app",
  "host": "liveplan3.netlify.app",
  "name": "LivePlan3",
  "launcherName": "LivePlan",
  "display": "standalone",
  "themeColor": "#8e2de2",
  "navigationColor": "#8e2de2",
  "backgroundColor": "#0a2647",
  "enableNotifications": true,
  "startUrl": "/login",
  "iconUrl": "https://liveplan3.netlify.app/icons/icon-512.png",
  "maskableIconUrl": "",
  "splashScreenFadeOutDuration": 300,
  "signingKey": {
    "path": "/Users/heliowoi/Documents/VS Code/keys/liveplan3.keystore",
    "alias": "liveplan3"
  },
  "appVersionCode": 1,
  "appVersionName": "1.0.0",
  "shortcuts": [
    {
      "name": "Add Transaction",
      "shortName": "Add",
      "url": "/transactions/new"
    },
    {
      "name": "Dashboard",
      "shortName": "Dashboard",
      "url": "/dashboard"
    }
  ],
  "generatorApp": "bubblewrap-cli",
  "webManifestUrl": "https://liveplan3.netlify.app/manifest.webmanifest",
  "fallbackType": "customtabs"
}
EOL

echo "Arquivo de configuração TWA criado com sucesso"

# Inicializar o projeto TWA com o arquivo de configuração
echo "Inicializando projeto TWA..."
bubblewrap init --directory=/Users/heliowoi/Documents/VS\ Code/twa-output --manifest=/Users/heliowoi/Documents/VS\ Code/twa-manifest.json

# Navegar para o diretório do projeto TWA
cd /Users/heliowoi/Documents/VS\ Code/twa-output

# Construir o APK
echo "Construindo o APK..."
bubblewrap build

echo "Processo concluído! O APK deve estar disponível em: /Users/heliowoi/Documents/VS Code/twa-output/app/build/outputs/apk/"

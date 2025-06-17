#!/bin/bash

# Definir variáveis de ambiente para UTF-8
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Preparando projeto LivePlan3 para iOS...${NC}"

# Verificar se o diretório dist existe
if [ ! -d "dist" ]; then
  echo -e "${YELLOW}Construindo o projeto web...${NC}"
  pnpm build
fi

# Verificar se o diretório ios existe
if [ ! -d "ios" ]; then
  echo -e "${YELLOW}Criando estrutura iOS...${NC}"
  npx cap add ios
else
  echo -e "${GREEN}Estrutura iOS já existe. Atualizando...${NC}"
  npx cap sync ios
fi

# Criar arquivo Info.plist personalizado se não existir
if [ ! -f "ios/App/App/Info.plist.custom" ]; then
  echo -e "${YELLOW}Criando arquivo Info.plist personalizado...${NC}"
  cat > ios/App/App/Info.plist.custom << EOL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleDevelopmentRegion</key>
	<string>en</string>
	<key>CFBundleDisplayName</key>
	<string>LivePlan³</string>
	<key>CFBundleExecutable</key>
	<string>$(EXECUTABLE_NAME)</string>
	<key>CFBundleIdentifier</key>
	<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
	<key>CFBundleInfoDictionaryVersion</key>
	<string>6.0</string>
	<key>CFBundleName</key>
	<string>$(PRODUCT_NAME)</string>
	<key>CFBundlePackageType</key>
	<string>APPL</string>
	<key>CFBundleShortVersionString</key>
	<string>1.0</string>
	<key>CFBundleVersion</key>
	<string>1</string>
	<key>LSRequiresIPhoneOS</key>
	<true/>
	<key>UILaunchStoryboardName</key>
	<string>LaunchScreen</string>
	<key>UIMainStoryboardFile</key>
	<string>Main</string>
	<key>UIRequiredDeviceCapabilities</key>
	<array>
		<string>armv7</string>
	</array>
	<key>UISupportedInterfaceOrientations</key>
	<array>
		<string>UIInterfaceOrientationPortrait</string>
	</array>
	<key>UISupportedInterfaceOrientations~ipad</key>
	<array>
		<string>UIInterfaceOrientationPortrait</string>
		<string>UIInterfaceOrientationPortraitUpsideDown</string>
	</array>
	<key>UIViewControllerBasedStatusBarAppearance</key>
	<true/>
	<key>NSAppTransportSecurity</key>
	<dict>
		<key>NSAllowsArbitraryLoads</key>
		<true/>
	</dict>
</dict>
</plist>
EOL
fi

# Copiar arquivos web para o diretório iOS
echo -e "${YELLOW}Copiando arquivos web para o diretório iOS...${NC}"
npx cap copy ios

echo -e "${GREEN}Preparação concluída! Agora você pode abrir o projeto no Xcode com o comando:${NC}"
echo -e "${YELLOW}open ios/App/App.xcworkspace${NC}"
echo -e "${GREEN}Ou simplesmente abrir o arquivo App.xcworkspace no Finder em:${NC}"
echo -e "${YELLOW}$(pwd)/ios/App/App.xcworkspace${NC}"

# Criar arquivo README-iOS.md com instruções
cat > README-iOS.md << EOL
# Instruções para iOS - LivePlan3

## Pré-requisitos
- Xcode instalado (versão 12 ou superior)
- Conta de desenvolvedor Apple (para publicação na App Store)

## Como abrir o projeto no Xcode
1. Execute o comando: \`open ios/App/App.xcworkspace\`
2. Ou abra manualmente o arquivo \`App.xcworkspace\` localizado em \`ios/App/\`

## Configuração do projeto no Xcode
1. Selecione o projeto "App" no navegador de projetos
2. Na aba "Signing & Capabilities", selecione sua equipe de desenvolvimento
3. Ajuste o Bundle Identifier se necessário (deve ser único, como "com.seudominio.liveplan3")
4. Verifique se a versão mínima do iOS está definida como 14.0

## Testando o aplicativo
1. Selecione um simulador iOS ou dispositivo conectado
2. Clique no botão "Play" para compilar e executar o aplicativo

## Preparando para publicação
1. Selecione "Product > Archive" no menu do Xcode
2. Siga as instruções do Xcode para validar e enviar seu aplicativo para a App Store

## Solução de problemas comuns
- Se encontrar erros de compilação relacionados a pods, tente executar \`pod install\` no diretório \`ios/App\`
- Para problemas de certificados, verifique suas configurações de conta de desenvolvedor no Xcode
- Se o aplicativo não carregar corretamente, verifique se o build web está atualizado executando \`pnpm build\` seguido de \`npx cap copy ios\`

## Recursos adicionais
- [Documentação do Capacitor para iOS](https://capacitorjs.com/docs/ios)
- [Guia de publicação na App Store](https://developer.apple.com/app-store/submissions/)
EOL

echo -e "${GREEN}Criado arquivo README-iOS.md com instruções detalhadas.${NC}"

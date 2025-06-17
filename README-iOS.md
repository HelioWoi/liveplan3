# Instruções para iOS - LivePlan3

## Pré-requisitos
- Xcode instalado (versão 12 ou superior)
- Conta de desenvolvedor Apple (para publicação na App Store)

## Como abrir o projeto no Xcode
1. Execute o comando: `open ios/App/App.xcworkspace`
2. Ou abra manualmente o arquivo `App.xcworkspace` localizado em `ios/App/`

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
- Se encontrar erros de compilação relacionados a pods, tente executar `pod install` no diretório `ios/App`
- Para problemas de certificados, verifique suas configurações de conta de desenvolvedor no Xcode
- Se o aplicativo não carregar corretamente, verifique se o build web está atualizado executando `pnpm build` seguido de `npx cap copy ios`

## Recursos adicionais
- [Documentação do Capacitor para iOS](https://capacitorjs.com/docs/ios)
- [Guia de publicação na App Store](https://developer.apple.com/app-store/submissions/)

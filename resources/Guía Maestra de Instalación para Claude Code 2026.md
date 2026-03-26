**Guía de instalación paso a paso para Claude Code (2026)**

## Notas relacionadas

* Para una guía paralela de instalación y configuración, ver [[Manual de Instalación y Configuración de Claude Code]].
* Después de instalar, continuar con [[Guía Maestra de Comandos y Hooks para Claude Code]].
* Para entender cómo encaja Claude Code dentro de la bóveda, ver [[Manual de Claude Code y Ecosistema de Desarrollo Obsidian]].

### Requisitos Mínimos del Sistema

Para poder instalar y ejecutar Claude Code, tu sistema debe cumplir con los siguientes requisitos previos 1:

* **Sistema Operativo:** macOS 13.0 (Ventura) o superior, Linux (Ubuntu 20.04+ o Debian 10+), o Windows 10 (versión 1809+) utilizando WSL 1\.  
* **Memoria RAM:** Al menos 4GB, aunque se recomiendan 8GB para bases de código más grandes 1\.  
* **Hardware:** No se necesita una GPU, ya que el procesamiento de inteligencia artificial se realiza en los servidores de Anthropic 1, 2\.  
* **Software:** Una terminal compatible (Bash, Zsh o PowerShell) y una conexión a internet activa 1\. Solo si eliges el método de instalación por npm, necesitarás Node.js en su versión 18 o superior 1\.

### Planes de Cuenta de Anthropic Necesarios

Claude Code no está disponible en el plan gratuito de Claude.ai. Para utilizarlo, debes contar con una de las siguientes suscripciones activas 1:

* Claude Pro ($20/mes)  
* Claude Max ($100-200/mes)  
* Planes Teams o Enterprise  
* Cuenta Console (API) facturada por token

### Paso 1: Instalación de Claude Code

Tienes dos opciones para instalar la herramienta. El instalador nativo es el recomendado oficialmente, ya que no depende de otras herramientas y se actualiza automáticamente en segundo plano 3\.  
**Opción A: Instalador Nativo (Recomendado)** 3No requiere tener Node.js ni npm instalados. Abre tu terminal y ejecuta el comando según tu sistema operativo:

* **Para macOS y Linux:**  
* curl \-fsSL https://claude.ai/install.sh | bash  
* **Para Windows (Ejecutando PowerShell como Administrador):**  
* iwr https://claude.ai/install.ps1 \-useb | iex

**Opción B: Instalación mediante npm** 3Si prefieres usar npm para fijar versiones específicas o porque se adapta mejor a tu flujo de trabajo, asegúrate de tener Node.js 18+ y ejecuta:  
npm install \-g @anthropic-ai/claude-code  
*Nota importante:* No utilices sudo con este comando. Si tienes errores de permisos, la guía recomienda usar nvm (Node Version Manager) para instalar Node.js en tu directorio personal en lugar de ejecutar npm como root 4\.

### Paso 2: Verificar la Instalación

Una vez que el proceso finalice, verifica que la herramienta se haya instalado correctamente comprobando su versión 4:  
claude \--version  
También puedes ejecutar una herramienta de diagnóstico integrada que revisará tu entorno y te avisará si hay algún problema de configuración 4:  
claude doctor

### Paso 3: Autenticación

Antes de poder interactuar con tu base de código, necesitas autorizar la CLI 4\. Ejecuta el siguiente comando en tu terminal:  
claude auth login  
La primera vez que ejecutes este comando, se abrirá tu navegador web predeterminado solicitando que inicies sesión en tu cuenta de Anthropic 4, 5\. Sigue las instrucciones en la pantalla; una vez autorizado, el CLI recibirá un token de autenticación automáticamente y estarás listo para programar 5\.  

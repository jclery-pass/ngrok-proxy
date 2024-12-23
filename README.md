# ngrok-proxy

## Installation

Clonez le dépôt

```bash
git clone git@github.com:jclery-pass/ngrok-proxy.git
```

Installez les dépendances

```bash
cd ngrok-proxy
pnpm install
```

Copiez le fichier `.env.example` en `.env`

```bash
cp .env.example .env
```

Placez votre Auth Token ngrok dans le fichier `.env` (vous pouvez aussi ajouter un domaine personnalisé si vous avez un compte ngrok payant)

Si vous n'avez pas de compte, créez-en un sur https://ngrok.com/ (gratuit) et récupérez votre token depuis votre dashboard : https://dashboard.ngrok.com/get-started/setup

## Liaison du programme

Afin de créer un lien symbolique vers le script en tant que programme NPM, exécutez la commande suivante :

```bash
npm link
```

Vous pouvez maintenant lancer le script depuis n'importe où sur votre machine.

Déplacez-vous dans le dossier `…/pass-culture-main/pro/` et exécutez la commande suivante :

```bash
ngrok-proxy
```

Cela va ouvrir un serveur HTTP sur le port `1337`

> [!NOTE]
> Par défaut, le port du proxy est `1337`. Vous pouvez le personnaliser :
>
> ```bash
> ngrok-proxy 9999
> ```
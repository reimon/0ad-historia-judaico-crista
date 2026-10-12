#!/usr/bin/env bash
#
# Liga a pasta do mod deste repositório à pasta de mods do 0 A.D.,
# para testar no jogo sem copiar arquivos a cada mudança.
#
# Uso: tools/instalar-local.sh
#
# Depois, no jogo: Configurações > Mods (Mod Selection), ative
# "História Judaico-Cristã" e reinicie o jogo.

set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MOD_NAME="historia_judaico_crista"

case "$(uname)" in
	Darwin) MODS="$HOME/Library/Application Support/0ad/mods" ;;
	Linux)  MODS="${XDG_DATA_HOME:-$HOME/.local/share}/0ad/mods" ;;
	*)
		echo "No Windows, copie a pasta $MOD_NAME para:"
		echo "  Documentos\\My Games\\0ad\\mods\\$MOD_NAME"
		exit 1
		;;
esac

mkdir -p "$MODS"
TARGET="$MODS/$MOD_NAME"

if [[ -L "$TARGET" ]]; then
	echo "Já instalado (link): $TARGET -> $(readlink "$TARGET")"
	exit 0
fi
if [[ -e "$TARGET" ]]; then
	echo "Já existe uma pasta em $TARGET. Remova ou renomeie antes de criar o link."
	exit 1
fi

ln -s "$REPO/$MOD_NAME" "$TARGET"
echo "Mod ligado: $TARGET -> $REPO/$MOD_NAME"

#!/usr/bin/env bash
#
# Roda o capítulo Neemias no motor real do 0 A.D. (R28), sem tela, e confere
# o caminho de vitória e o de derrota.
#
# Uso:
#   tests/headless/run.sh
#   PYROGENESIS="/caminho/para/pyrogenesis" tests/headless/run.sh
#
# Linux: usa pastas XDG temporárias, sem tocar na sua instalação.
# macOS: o jogo só lê mods de ~/Library/Application Support/0ad/mods, então
#        o script cria lá, temporariamente, o mod de teste "neemias_probe".
#
# O jogo se recusa a rodar como root; em CI, use um usuário comum.

set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MOD_NAME="historia_judaico_crista"
PROBE_NAME="neemias_probe"

if [[ -n "${PYROGENESIS:-}" ]]; then
	PYRO="$PYROGENESIS"
elif [[ "$(uname)" == "Darwin" ]]; then
	PYRO="/Applications/0 A.D..app/Contents/MacOS/pyrogenesis"
else
	PYRO="pyrogenesis"
fi

# macOS não traz "timeout"; o Homebrew instala como "gtimeout" (coreutils).
if command -v timeout > /dev/null; then
	TIMEOUT=(timeout 300)
elif command -v gtimeout > /dev/null; then
	TIMEOUT=(gtimeout 300)
else
	TIMEOUT=(env)
fi

WORK="$(mktemp -d)"
CREATED=()
cleanup()
{
	for path in "${CREATED[@]:-}"; do
		[[ -n "$path" ]] && rm -rf "$path"
	done
	rm -rf "$WORK"
}
trap cleanup EXIT

if [[ "$(uname)" == "Darwin" ]]; then
	MODS="$HOME/Library/Application Support/0ad/mods"
else
	export XDG_DATA_HOME="$WORK/data" XDG_CONFIG_HOME="$WORK/config"
	export XDG_CACHE_HOME="$WORK/cache" XDG_STATE_HOME="$WORK/state"
	MODS="$XDG_DATA_HOME/0ad/mods"
fi
export SDL_VIDEODRIVER=dummy SDL_AUDIODRIVER=dummy
mkdir -p "$MODS"

if [[ ! -e "$MODS/$MOD_NAME" ]]; then
	ln -s "$REPO/$MOD_NAME" "$MODS/$MOD_NAME"
	CREATED+=("$MODS/$MOD_NAME")
fi

PROBE="$MODS/$PROBE_NAME"
rm -rf "$PROBE"
mkdir -p "$PROBE/maps/random"
CREATED+=("$PROBE")

cat > "$PROBE/mod.json" <<EOF
{
	"name": "$PROBE_NAME",
	"version": "0.0.1",
	"label": "Neemias test probe",
	"url": "",
	"description": "Sonda de teste. Não distribuir.",
	"dependencies": ["$MOD_NAME"]
}
EOF

python3 - "$REPO/$MOD_NAME/maps/random/levante_neemias.json" "$PROBE/maps/random/levante_neemias.json" <<'EOF'
import json
import sys

source, target = sys.argv[1], sys.argv[2]
with open(source, encoding="utf-8") as f:
	data = json.load(f)
data["settings"]["TriggerScripts"].append("random/neemias_probe.js")
with open(target, "w", encoding="utf-8") as f:
	json.dump(data, f, ensure_ascii=False, indent="\t")
EOF

status=0
for mode in victory defeat; do
	sed "s/%MODE%/$mode/" "$REPO/tests/headless/neemias_probe.js" > "$PROBE/maps/random/neemias_probe.js"
	log="$WORK/$mode.log"
	echo "== modo: $mode"
	"${TIMEOUT[@]}" "$PYRO" \
		-mod=public -mod="$MOD_NAME" -mod="$PROBE_NAME" \
		-autostart=random/levante_neemias -autostart-nonvisual \
		-autostart-players=2 -autostart-civ=1:pers -autostart-civ=2:pers \
		-autostart-seed=11 -autostart-size=256 \
		-autostart-disable-replay -quickstart > "$log" 2>&1 || true

	grep -E "^PROBE" "$log" || true

	if grep -E "^ERROR" "$log"; then
		echo "FALHOU ($mode): o motor registrou erros."
		status=1
	fi
	if ! grep -qF "PROBE ruin restored: true" "$log"; then
		echo "FALHOU ($mode): a parte demolida do muro não voltou como ruína."
		status=1
	fi
	if [[ "$mode" == "victory" ]]; then
		expected='PROBE OnPlayerWon {"playerId":1}'
	else
		expected='PROBE OnPlayerDefeated {"playerId":1}'
	fi
	if grep -qF "$expected" "$log"; then
		echo "OK ($mode)"
	else
		echo "FALHOU ($mode): não encontrei '$expected'."
		tail -n 40 "$log"
		status=1
	fi
done

exit $status

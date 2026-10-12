# História Judaico-Cristã — campanha educativa para o 0 A.D.

Mod para o [0 A.D.](https://play0ad.com), jogo de estratégia histórica livre e de
código aberto da Wildfire Games. A proposta é ensinar a história judaico-cristã
com capítulos curtos: cada um traz o contexto, indica a fonte do relato e propõe
uma missão em que a mecânica do jogo representa o que aconteceu.

A campanha começa pelos períodos persa e helenístico (538 a 63 a.C.).

**Situação:** versão 0.1.0, com o capítulo piloto
*Neemias: os muros de Jerusalém (c. 445 a.C.)*. Testado de forma automática no
motor do 0 A.D. Release 28; ainda não foi testado com jogadores.

## Como jogar

1. Instale o **0 A.D. Release 28** (ou mais novo): <https://play0ad.com/download>.
2. Baixe o mod de um dos jeitos:
   - o arquivo `.pyromod` da página de
     [Releases](https://github.com/reimon/0ad-historia-judaico-crista/releases)
     ou dos artefatos da CI, e abra-o com o jogo; ou
   - copie a pasta `historia_judaico_crista` deste repositório para a pasta de
     mods do jogo:
     - **Windows:** `Documentos\My Games\0ad\mods\`
     - **macOS:** `~/Library/Application Support/0ad/mods/`
     - **Linux:** `~/.local/share/0ad/mods/`
3. No jogo, abra **Settings > Mod Selection** (Configurações > Seleção de mods),
   ative **História Judaico-Cristã**, salve e reinicie.
4. Vá em **Single Player > Campaigns** (Um jogador > Campanhas), crie uma
   campanha nova com **História Judaico-Cristã: do exílio aos hasmoneus** e
   escolha o capítulo 1.

O mapa também aparece na lista de mapas aleatórios como
*Neemias: os muros de Jerusalém*, para jogar fora da campanha.

## O capítulo piloto

Jerusalém está em ruínas e Neemias tem 52 dias para reconstruir os muros
(Neemias 6:15). O jogador repara cada trecho, torre e porta enquanto Sambalate,
Tobias, Gesém e os asdoditas mandam grupos de ataque. Metade trabalha, metade
vigia, como em Neemias 4:16.

Detalhes históricos, fontes fora da Bíblia, anacronismos conhecidos e
parâmetros de balanceamento: [docs/capitulo-01-neemias.md](docs/capitulo-01-neemias.md).
Próximos capítulos: [docs/roteiro-da-campanha.md](docs/roteiro-da-campanha.md).

## Estrutura

```
historia_judaico_crista/          o mod (é esta pasta que vai para a pasta de mods)
├── mod.json
├── campaigns/historia_judaico_crista.json
└── maps/random/
    ├── levante_neemias.json          configuração do mapa
    ├── levante_neemias.js            geração do mapa
    └── levante_neemias_triggers.js   roteiro, objetivos e ataques
docs/                             história, fontes e roteiro da campanha
tests/headless/                   teste automático no motor real, sem tela
tools/instalar-local.sh           liga o mod à pasta de mods do jogo (macOS e Linux)
```

## Desenvolvimento

**Testar no jogo.** `tools/instalar-local.sh` cria um link da pasta do mod na
pasta de mods do 0 A.D., então cada mudança no repositório aparece no jogo
depois de reiniciá-lo.

**Teste automático.** `tests/headless/run.sh` roda o capítulo no motor do 0 A.D.
sem tela e confere o caminho de vitória e o de derrota (cerca de 15 segundos):

```sh
# Linux ou macOS (no macOS, usa o app em /Applications por padrão)
tests/headless/run.sh
```

**CI.** A cada push, o GitHub Actions valida os JSON, checa a sintaxe dos
scripts, gera o `.pyromod` e roda o teste automático no 0 A.D. R28 do
Ubuntu 26.04. Tags `v*` publicam o `.pyromod` como release.

## Princípios de conteúdo

- Dizer sempre se a informação vem do relato bíblico ou de fontes históricas.
- Tratar a história judaica como trajetória própria, não só como prólogo do
  cristianismo.
- Evitar tropos antijudaicos e não transformar conflitos contemporâneos em
  batalha jogável.

## Licença e créditos

Código e textos deste repositório: GPL-2.0 (veja [LICENSE](LICENSE)), a mesma
licença do código do 0 A.D. O mod não inclui arte; usa a do jogo base, que é da
Wildfire Games sob CC BY-SA 3.0.

Este é um projeto independente, sem vínculo com a Wildfire Games.

---

## English summary

Educational campaign mod for 0 A.D. (Release 28+) about Jewish and Christian
history, starting with the Persian and Hellenistic periods (538–63 BC). Version
0.1.0 ships a pilot chapter, *Nehemiah: the walls of Jerusalem (c. 445 BC)*:
repair every wall piece within 52 "days" while raiders attack. Texts are in
Brazilian Portuguese. Install by copying `historia_judaico_crista/` into your
0 A.D. mods folder (or opening the `.pyromod`), enable it in Mod Selection, and
start the campaign from Single Player > Campaigns. A headless test
(`tests/headless/run.sh`) runs the chapter in the real engine. License: GPL-2.0.

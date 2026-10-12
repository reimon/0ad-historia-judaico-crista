# Capítulo 1 — Neemias: os muros de Jerusalém (c. 445 a.C.)

Capítulo piloto da campanha. Serve para validar a fórmula do projeto: contexto
histórico curto, fonte indicada e uma missão em que a mecânica do jogo
representa o que aconteceu.

## Contexto histórico

- **Período persa.** Depois do decreto de Ciro (538 a.C., Esdras 1), grupos de
  judeus voltaram do exílio na Babilônia. O Segundo Templo foi concluído em
  515 a.C. (Esdras 6:15). Judá era uma pequena província persa, chamada
  *Yehud* em aramaico.
- **Neemias.** Copeiro do rei Artaxerxes I, recebeu licença para reconstruir os
  muros de Jerusalém no vigésimo ano do reinado, por volta de 445 a.C.
  (Neemias 2:1-8), e foi nomeado governador.
- **A oposição.** Sambalate, o horonita, Tobias, o oficial amonita, e Gesém, o
  árabe (Neemias 2:10, 2:19), com árabes, amonitas e asdoditas (Neemias 4:7).
- **A obra.** Metade do povo trabalhava e metade ficava de guarda (Neemias 4:16);
  os construtores trabalhavam com a espada na cintura (Neemias 4:18). O muro foi
  concluído em 52 dias, no dia 25 de Elul (Neemias 6:15).

> **Numeração dos versículos.** O jogo segue a numeração das Bíblias protestantes
> em português (Almeida). Em edições que seguem o texto hebraico, como a Bíblia
> de Jerusalém, Neemias 4:1-8 corresponde a 3:33-4:2, e 4:16 corresponde a 4:10.

## O que dizem outras fontes

Separar o relato bíblico da evidência histórica faz parte da proposta educativa.

- **Sambalate** aparece fora da Bíblia: um papiro de Elefantina, no Egito
  (407 a.C.), menciona "os filhos de Sambalate, governador de Samaria".
- **Gesém** costuma ser associado a "Gashmu", pai de um rei de Quedar citado numa
  inscrição em tigela de prata de Tell el-Maskhuta (século V a.C.).
- **Tobias** costuma ser ligado à família dos tobíadas, da Transjordânia, que
  aparece em documentos dos séculos seguintes.
- **As memórias de Neemias**, escritas em primeira pessoa, são vistas por muitos
  historiadores como uma fonte antiga preservada dentro do livro, que foi
  editado depois junto com Esdras.
- **A arqueologia do muro é debatida.** Eilat Mazar anunciou em 2007 ter achado
  um trecho do muro de Neemias na Cidade de Davi; Israel Finkelstein contestou a
  datação e argumentou que a Jerusalém do período persa era bem pequena
  ("Jerusalem in the Persian (and Early Hellenistic) Period and the Wall of
  Nehemiah", *Journal for the Study of the Old Testament* 32, 2008).

## Como a história vira jogo

| Na história | No jogo |
|---|---|
| Muros derrubados e portas queimadas | O muro começa com 8% a 18% da vida |
| Reconstruir o muro | Reparar cada trecho, torre e porta (reparar não custa recursos) |
| 52 dias de obra | Prazo de 52 "dias" de 15 segundos (13 minutos) |
| Metade trabalha, metade vigia | Trabalhadores reparam enquanto soldados e torres defendem |
| Ameaças de Sambalate, Tobias, Gesém e Asdode | Ondas de ataque de quatro origens, alternadas |
| Brechas que voltam a abrir | Uma parte que desaba volta como ruína e precisa ser reparada de novo |

**Vitória:** todas as partes do muro com pelo menos 95% da vida antes do prazo.
**Derrota:** o prazo acaba antes, ou o jogador perde todas as unidades e construções.

## Aproximações visuais (anacronismos conhecidos)

- **Yehud usa a civilização persa** do jogo. Faz sentido administrativo (era uma
  província persa), mas as roupas e construções não são judaicas. A arte própria
  vem na Fase B.
- **Atacantes:** o "lanceiro árabe" vem do modelo selêucida e o "arqueiro em
  camelo" do modelo ptolomaico, que representa nabateus. Os nabateus só aparecem
  nas fontes no fim do século IV a.C.; aqui eles fazem as vezes das tribos árabes
  da época, como os quedaritas.
- **O mapa é gerado por script.** Jerusalém fica num planalto no centro, e há um
  monte com oliveiras a leste lembrando o Monte das Oliveiras, mas a geografia
  não é fiel.

## Parâmetros de balanceamento

Ficam no topo de `historia_judaico_crista/maps/random/levante_neemias_triggers.js`:

| Parâmetro | Valor | Efeito |
|---|---|---|
| `neemias_dayDuration` | 15 s | Duração de um "dia" |
| `neemias_initialHealthMin/Max` | 8% / 18% | Estado inicial do muro |
| `neemias_repairedFraction` | 95% | Quando uma parte conta como reparada |
| `neemias_firstRaidDelay` | 25 s | Primeiro ataque, depois do aviso |
| `neemias_raidInterval` | 95 s no médio | Intervalo entre ataques (cai 8 s por nível de dificuldade) |
| `neemias_raidSizeFactor` | 0,5 a 1,6 | Tamanho dos grupos por dificuldade |
| `neemias_startingResources` | 800/800/400/300 | Recursos para treinar reforços |

Esses valores ainda não foram testados com jogadores. O primeiro teste com uma
turma deve calibrar o prazo e o tamanho dos ataques.

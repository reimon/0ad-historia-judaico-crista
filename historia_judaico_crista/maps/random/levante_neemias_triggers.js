/**
 * Gatilhos do capítulo "Neemias: os muros de Jerusalém" (c. 445 a.C.).
 *
 * Fluxo:
 *  1. No início, o muro de Jerusalém fica em ruínas (8% a 18% da vida).
 *  2. O painel de tutorial conta a história e explica a missão.
 *  3. O prazo de 52 dias (Neemias 6:15) começa quando o jogador recebe a
 *     instrução de reparar o muro. Cada dia dura 15 segundos de jogo.
 *  4. Grupos de ataque de Sambalate, Tobias, Gesém e Asdode chegam em ondas.
 *  5. Se uma parte desaba (ataque ou demolição), ela volta como ruína no mesmo
 *     lugar. O objetivo nunca encolhe.
 *  6. Vitória: todas as partes do muro reparadas (>= 95% da vida).
 *     Derrota: o prazo acaba antes, ou a regra de conquista padrão.
 *
 * Os textos estão em português; quando o mod tiver traduções, eles devem
 * passar a usar markForTranslation.
 */

// ---------------------------------------------------------------------------
// Parâmetros de balanceamento (ajuste aqui depois dos testes de jogo).
// ---------------------------------------------------------------------------

var neemias_playerID = 1;
var neemias_enemyID = 2;

/** Um "dia" do relato em milissegundos de jogo. */
var neemias_dayDuration = 15 * 1000;
var neemias_totalDays = 52;

/** Vida inicial de cada parte do muro, como fração da vida máxima. */
var neemias_initialHealthMin = 0.08;
var neemias_initialHealthMax = 0.18;

/** Uma parte conta como reparada a partir desta fração da vida máxima. */
var neemias_repairedFraction = 0.95;

/**
 * Quando uma parte do muro desaba (ou é demolida pelo jogador), ela volta
 * como ruína depois deste atraso, com esta fração da vida. Assim o objetivo
 * nunca encolhe: toda parte original precisa terminar reparada.
 */
var neemias_ruinRestoreDelay = 3000;
var neemias_ruinHealth = 0.1;

/** Intervalo da checagem de progresso, em milissegundos. */
var neemias_checkInterval = 2000;

/** Atraso do primeiro ataque depois do aviso de ameaça. */
var neemias_firstRaidDelay = 25 * 1000;

/** Intervalo entre ataques por dificuldade (1 = muito fácil ... 5 = muito difícil). */
var neemias_raidInterval = difficulty => (95 - 8 * (difficulty - 3)) * 1000;

/** Multiplicador do tamanho dos grupos de ataque por dificuldade. */
var neemias_raidSizeFactor = [0.5, 0.75, 1, 1.3, 1.6];

/** Tamanho base da onda N (antes do multiplicador de dificuldade). */
var neemias_raidBaseSize = wave => 3 + 2 * (wave - 1);

/** Recursos iniciais. Reparar não custa nada; os recursos servem para treinar reforços. */
var neemias_startingResources = { "food": 800, "wood": 800, "stone": 400, "metal": 300 };

/**
 * Unidades dos atacantes.
 * - Lanceiro árabe: modelo selêucida "Arab Javelineer".
 * - Arqueiro em camelo: modelo ptolomaico "Nabataean Camel Archer".
 * São visuais aproximados (os nabateus são posteriores a 445 a.C.); veja docs/.
 */
var neemias_raiderInfantry = "units/sele/infantry_javelineer_b";
var neemias_raiderCamel = "units/ptol/cavalry_archer_b";

/**
 * Origens dos ataques, na ordem em que se alternam.
 * triggerPoint: letra do ponto de gatilho posto pelo script do mapa.
 * camelShare: fração de arqueiros em camelo no grupo.
 */
var neemias_raidOrigins = [
	{ "triggerPoint": "A", "name": "Sambalate (Samaria)", "camelShare": 0.2 },
	{ "triggerPoint": "C", "name": "Gesém (Arábia)", "camelShare": 0.7 },
	{ "triggerPoint": "B", "name": "Tobias (Amom)", "camelShare": 0.4 },
	{ "triggerPoint": "D", "name": "Asdode", "camelShare": 0.1 }
];

// ---------------------------------------------------------------------------
// Textos da narrativa.
// ---------------------------------------------------------------------------

var neemias_text = {
	"intro":
		"Jerusalém, por volta de 445 a.C. Judá, que os persas chamam de Yehud, é uma pequena província do Império Persa. " +
		"Os judeus voltaram do exílio na Babilônia depois do decreto de Ciro (538 a.C.) e reconstruíram o Templo (515 a.C.), " +
		"mas a cidade continua sem muros e com as portas queimadas.\n" +
		"Segundo o livro de Neemias (capítulos 1 e 2), Neemias, copeiro do rei Artaxerxes I, pediu licença para reconstruir os muros e foi nomeado governador.",
	"mission":
		"Missão: reparar todas as partes do muro (trechos, torres e portas) antes que terminem os 52 dias (Neemias 6:15). " +
		"Cada dia dura 15 segundos de jogo. Reparar não custa recursos, só tempo e trabalhadores.",
	"repair":
		"Selecione os trabalhadores e clique com o botão direito num trecho danificado do muro para repará-lo. " +
		"Vários trabalhadores no mesmo trecho terminam mais rápido. O prazo começa agora.",
	"threat":
		"Sambalate, governador de Samaria, Tobias, o amonita, e Gesém, o árabe, zombaram da obra e tramaram atacar Jerusalém (Neemias 4:1-8). " +
		"Neemias respondeu dividindo o povo: metade trabalhava e metade ficava de guarda, com lanças e escudos (Neemias 4:16).",
	"defend":
		"Faça como Neemias: deixe soldados nas brechas mais expostas e mantenha os trabalhadores reparando. " +
		"Os ataques vêm de Samaria, de Amom, da Arábia e de Asdode. Soldados dentro das torres do muro disparam flechas.",
	"milestone25": "Um quarto do muro já está de pé.",
	"milestone50": "Metade do muro está reparada. Segundo Neemias 4:6, o povo trabalhava com entusiasmo.",
	"milestone75": "Três quartos do muro estão reparados. Falta pouco.",
	"pieceDestroyed":
		"Uma parte do muro desabou. As pedras ficaram no lugar: repare essa parte de novo.",
	"victory":
		"O muro foi concluído em 52 dias, no dia 25 do mês de Elul (Neemias 6:15). " +
		"No relato, até os adversários reconheceram que a obra tinha sido feita com a ajuda de Deus (Neemias 6:16).\n" +
		"Para saber mais: muitos historiadores consideram as memórias de Neemias, escritas em primeira pessoa, uma fonte valiosa sobre o período persa, " +
		"embora o livro tenha sido editado depois. Próximo capítulo: Alexandre, o Grande, chega ao Levante (332 a.C.).",
	"defeat":
		"Os 52 dias terminaram e o muro não ficou pronto. No relato bíblico, a obra foi concluída a tempo. " +
		"Tente de novo, dividindo melhor o trabalho e a guarda.",
	"progress": "Muro de Jerusalém: %(repaired)s de %(total)s partes reparadas. Prazo dos 52 dias: %(time)s",
	"raid": "Ataque! %(count)s homens de %(origin)s se aproximam.",
	"nextRaid": "Próximo ataque em %(time)s",
	"anchorName": "Sambalate, governador de Samaria",
	"cityName": "Jerusalém (residência do governador)"
};

// ---------------------------------------------------------------------------
// Roteiro no painel de tutorial (usa maps/scripts/Tutorial.js).
// ---------------------------------------------------------------------------

Trigger.prototype.tutorialGoals = [
	{
		"instructions": neemias_text.intro
	},
	{
		"instructions": neemias_text.mission
	},
	{
		"instructions": neemias_text.repair,
		"Init": function()
		{
			this.Neemias_StartDeadline();
		},
		"OnPlayerCommand": function(msg)
		{
			if (msg.cmd.type == "repair" && msg.cmd.target &&
			    TriggerHelper.EntityMatchesClassList(msg.cmd.target, "Wall"))
				this.NextGoal();
		}
	},
	{
		"instructions": neemias_text.threat,
		"Init": function()
		{
			this.Neemias_StartRaids();
		},
		"delay": 20000
	},
	{
		"instructions": neemias_text.defend,
		// Um evento qualquer mantém o objetivo aberto (sem o botão "Pronto").
		// O fim da missão é decidido em Neemias_CheckProgress.
		"OnOwnershipChanged": function(msg)
		{
		}
	}
];

// ---------------------------------------------------------------------------
// Início da partida.
// ---------------------------------------------------------------------------

Trigger.prototype.Neemias_Init = function()
{
	this.neemias_finished = false;
	this.neemias_deadlineTime = undefined;
	this.neemias_deadlineTimer = undefined;
	this.neemias_raidTimer = undefined;
	this.neemias_progressNotification = undefined;
	this.neemias_lastRepaired = -1;
	this.neemias_milestones = [];
	this.neemias_wave = 0;
	this.neemias_raidsStarted = false;

	this.Neemias_SetupPlayers();
	this.Neemias_RuinWalls();

	this.RegisterTrigger("OnOwnershipChanged", "Neemias_OnOwnershipChanged", { "enabled": true });
	this.RegisterTrigger("OnEntityRenamed", "Neemias_OnEntityRenamed", { "enabled": true });
	this.neemias_progressTimer = this.DoRepeatedly(neemias_checkInterval, "Neemias_CheckProgress", {});

	this.InitTutorial();
};

Trigger.prototype.Neemias_SetupPlayers = function()
{
	const cmpPlayer = QueryPlayerIDInterface(neemias_playerID);
	if (cmpPlayer)
		cmpPlayer.SetResourceCounts(neemias_startingResources);

	// Muros e torres de pedra exigem a Fase da Cidade.
	const cmpTechnologyManager = QueryPlayerIDInterface(neemias_playerID, IID_TechnologyManager);
	if (cmpTechnologyManager)
		cmpTechnologyManager.ResearchTechnology("phase_town_pers");

	for (const ent of TriggerHelper.GetPlayerEntitiesByClass(neemias_playerID, "CivCentre"))
	{
		const cmpIdentity = Engine.QueryInterface(ent, IID_Identity);
		if (cmpIdentity)
			cmpIdentity.SetName(neemias_text.cityName);
	}

	// O capítulo foi feito para 2 jogadores; jogadores extras saem do jogo.
	for (let i = neemias_enemyID + 1; i < TriggerHelper.GetNumberOfPlayers(); ++i)
		TriggerHelper.DefeatPlayer(i, "%(player)s não participa deste capítulo.");

	if (!this.Neemias_HasEnemy())
		return;

	// O adversário não joga com economia: só comanda os ataques.
	QueryPlayerIDInterface(neemias_enemyID).SetResourceCounts({ "food": 0, "wood": 0, "stone": 0, "metal": 0 });

	// O cavaleiro no rochedo mantém o jogador 2 "vivo" para a regra de conquista.
	for (const ent of TriggerHelper.GetPlayerEntitiesByClass(neemias_enemyID, "Unit"))
	{
		const cmpResistance = Engine.QueryInterface(ent, IID_Resistance);
		if (cmpResistance)
			cmpResistance.SetInvulnerability(true);
		const cmpIdentity = Engine.QueryInterface(ent, IID_Identity);
		if (cmpIdentity)
			cmpIdentity.SetName(neemias_text.anchorName);
		TriggerHelper.SetUnitStance(ent, "passive");
	}
};

/**
 * Guarda cada parte do muro com modelo, posição e ângulo, para poder
 * restaurá-la como ruína se ela desabar.
 */
Trigger.prototype.Neemias_RuinWalls = function()
{
	const cmpTemplateManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_TemplateManager);
	this.neemias_wallPieces = [];
	for (const ent of TriggerHelper.GetPlayerEntitiesByClass(neemias_playerID, "Wall"))
	{
		const cmpHealth = Engine.QueryInterface(ent, IID_Health);
		const cmpPosition = Engine.QueryInterface(ent, IID_Position);
		if (!cmpHealth || !cmpPosition || !cmpPosition.IsInWorld())
			continue;

		const position = cmpPosition.GetPosition2D();
		this.neemias_wallPieces.push({
			"entity": ent,
			"template": cmpTemplateManager.GetCurrentTemplateName(ent),
			"x": position.x,
			"z": position.y,
			"angle": cmpPosition.GetRotation().y
		});

		const fraction = randFloat(neemias_initialHealthMin, neemias_initialHealthMax);
		cmpHealth.SetHitpoints(Math.max(1, Math.round(cmpHealth.GetMaxHitpoints() * fraction)));
	}

	if (!this.neemias_wallPieces.length)
		warn("Neemias: nenhuma parte de muro encontrada para o jogador " + neemias_playerID + ".");
};

Trigger.prototype.Neemias_FindPiece = function(ent)
{
	return this.neemias_wallPieces.findIndex(piece => piece.entity == ent);
};

/**
 * Recoloca uma parte que desabou, como ruína do mesmo modelo, no mesmo lugar.
 */
Trigger.prototype.Neemias_RestoreRuin = function(data)
{
	if (this.neemias_finished)
		return;

	const piece = this.neemias_wallPieces[data.index];
	if (!piece || piece.entity != INVALID_ENTITY)
		return;

	const ent = Engine.AddEntity(piece.template);
	if (ent == INVALID_ENTITY)
	{
		warn("Neemias: não foi possível restaurar a parte do muro '" + piece.template + "'.");
		return;
	}

	const cmpPosition = Engine.QueryInterface(ent, IID_Position);
	cmpPosition.JumpTo(piece.x, piece.z);
	cmpPosition.SetYRotation(piece.angle);
	Engine.QueryInterface(ent, IID_Ownership).SetOwner(neemias_playerID);

	const cmpHealth = Engine.QueryInterface(ent, IID_Health);
	cmpHealth.SetHitpoints(Math.max(1, Math.round(cmpHealth.GetMaxHitpoints() * neemias_ruinHealth)));

	piece.entity = ent;
	this.neemias_lastRepaired = -1;
};

// ---------------------------------------------------------------------------
// Prazo e progresso.
// ---------------------------------------------------------------------------

Trigger.prototype.Neemias_StartDeadline = function()
{
	if (this.neemias_finished || this.neemias_deadlineTime !== undefined)
		return;

	const duration = neemias_totalDays * neemias_dayDuration;
	this.neemias_deadlineTime = TriggerHelper.GetTime() + duration;
	this.neemias_deadlineTimer = this.DoAfterDelay(duration, "Neemias_Deadline", {});
	this.neemias_lastRepaired = -1;
	this.Neemias_CheckProgress();
};

Trigger.prototype.Neemias_CountRepaired = function()
{
	let repaired = 0;
	for (const piece of this.neemias_wallPieces)
	{
		if (piece.entity == INVALID_ENTITY)
			continue;
		const cmpHealth = Engine.QueryInterface(piece.entity, IID_Health);
		if (cmpHealth && cmpHealth.GetHitpoints() >= cmpHealth.GetMaxHitpoints() * neemias_repairedFraction)
			++repaired;
	}
	return repaired;
};

Trigger.prototype.Neemias_CheckProgress = function()
{
	if (this.neemias_finished)
		return;

	const total = this.neemias_wallPieces.length;
	const repaired = this.Neemias_CountRepaired();

	if (total && repaired == total)
	{
		this.Neemias_Victory();
		return;
	}

	if (repaired != this.neemias_lastRepaired)
	{
		this.neemias_lastRepaired = repaired;
		this.Neemias_UpdateProgressNotification(repaired, total);
		this.Neemias_CheckMilestones(total ? repaired / total : 0);
	}
};

Trigger.prototype.Neemias_UpdateProgressNotification = function(repaired, total)
{
	if (this.neemias_deadlineTime === undefined)
		return;

	const cmpGUIInterface = Engine.QueryInterface(SYSTEM_ENTITY, IID_GuiInterface);
	if (this.neemias_progressNotification !== undefined)
		cmpGUIInterface.DeleteTimeNotification(this.neemias_progressNotification);

	const remaining = this.neemias_deadlineTime - TriggerHelper.GetTime();
	if (remaining <= 0)
		return;

	this.neemias_progressNotification = cmpGUIInterface.AddTimeNotification({
		"message": neemias_text.progress,
		"players": [neemias_playerID],
		"parameters": { "repaired": repaired, "total": total },
		"translateMessage": false
	}, remaining);
};

Trigger.prototype.Neemias_CheckMilestones = function(fraction)
{
	for (const [threshold, key] of [[0.75, "milestone75"], [0.5, "milestone50"], [0.25, "milestone25"]])
		if (fraction >= threshold && this.neemias_milestones.indexOf(key) == -1)
		{
			this.neemias_milestones.push(key);
			this.WarningMessage(neemias_text[key]);
			return;
		}
};

Trigger.prototype.Neemias_OnOwnershipChanged = function(msg)
{
	if (this.neemias_finished || msg.to != INVALID_PLAYER)
		return;

	const index = this.Neemias_FindPiece(msg.entity);
	if (index == -1)
		return;

	this.neemias_wallPieces[index].entity = INVALID_ENTITY;
	this.neemias_lastRepaired = -1;
	this.WarningMessage(neemias_text.pieceDestroyed);
	this.DoAfterDelay(neemias_ruinRestoreDelay, "Neemias_RestoreRuin", { "index": index });
};

/** Mantém o registro certo se uma parte trocar de modelo (por exemplo, numa melhoria). */
Trigger.prototype.Neemias_OnEntityRenamed = function(msg)
{
	const index = this.Neemias_FindPiece(msg.entity);
	if (index != -1)
		this.neemias_wallPieces[index].entity = msg.newentity;
};

// ---------------------------------------------------------------------------
// Ataques.
// ---------------------------------------------------------------------------

/** GetNumberOfPlayers conta Gaia (0), então com 2 jogadores ele devolve 3. */
Trigger.prototype.Neemias_HasEnemy = function()
{
	return TriggerHelper.GetNumberOfPlayers() > neemias_enemyID;
};

Trigger.prototype.Neemias_GetDifficulty = function()
{
	const difficulty = this.GetDifficulty();
	return difficulty >= 1 && difficulty <= 5 ? difficulty : 3;
};

Trigger.prototype.Neemias_StartRaids = function()
{
	if (this.neemias_raidsStarted || this.neemias_finished || !this.Neemias_HasEnemy())
		return;
	this.neemias_raidsStarted = true;
	this.Neemias_ScheduleRaid(neemias_firstRaidDelay);
};

Trigger.prototype.Neemias_ScheduleRaid = function(delay)
{
	this.neemias_raidTimer = this.DoAfterDelay(delay, "Neemias_SpawnRaid", {});
	Engine.QueryInterface(SYSTEM_ENTITY, IID_GuiInterface).AddTimeNotification({
		"message": neemias_text.nextRaid,
		"players": [neemias_playerID],
		"translateMessage": false
	}, delay);
};

Trigger.prototype.Neemias_SpawnRaid = function()
{
	if (this.neemias_finished)
		return;

	const difficulty = this.Neemias_GetDifficulty();
	const wave = ++this.neemias_wave;
	const origin = neemias_raidOrigins[(wave - 1) % neemias_raidOrigins.length];
	const size = Math.max(1, Math.round(neemias_raidBaseSize(wave) * neemias_raidSizeFactor[difficulty - 1]));
	const camels = Math.round(size * origin.camelShare);
	const infantry = size - camels;

	const spawnPoints = this.GetTriggerPoints(origin.triggerPoint);
	const target = this.Neemias_GetRaidTarget();

	if (spawnPoints.length && target)
	{
		const spawnPoint = pickRandom(spawnPoints);
		const raiders = TriggerHelper.SpawnUnits(spawnPoint, neemias_raiderInfantry, infantry, neemias_enemyID).concat(
			TriggerHelper.SpawnUnits(spawnPoint, neemias_raiderCamel, camels, neemias_enemyID));

		if (raiders.length)
			ProcessCommand(neemias_enemyID, {
				"type": "attack-walk",
				"entities": raiders,
				"x": target.x,
				"z": target.y,
				"targetClasses": { "attack": ["Unit", "Structure"] },
				"allowCapture": false,
				"queued": false
			});

		Engine.QueryInterface(SYSTEM_ENTITY, IID_GuiInterface).AddTimeNotification({
			"message": neemias_text.raid,
			"players": [neemias_playerID],
			"parameters": { "count": raiders.length, "origin": origin.name },
			"translateMessage": false
		}, 10000);
	}
	else
		warn("Neemias: ataque " + wave + " sem ponto de origem ou alvo.");

	this.Neemias_ScheduleRaid(neemias_raidInterval(difficulty));
};

/**
 * O alvo é a sede do governador; se ela não existir mais, qualquer
 * construção do jogador.
 */
Trigger.prototype.Neemias_GetRaidTarget = function()
{
	const candidates = TriggerHelper.GetPlayerEntitiesByClass(neemias_playerID, "CivCentre").concat(
		TriggerHelper.GetPlayerEntitiesByClass(neemias_playerID, "Structure"));
	for (const ent of candidates)
	{
		const position = TriggerHelper.GetEntityPosition2D(ent);
		if (position)
			return position;
	}
	return undefined;
};

// ---------------------------------------------------------------------------
// Fim da missão.
// ---------------------------------------------------------------------------

Trigger.prototype.Neemias_StopTimers = function()
{
	const cmpTimer = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer);
	for (const timer of [this.neemias_progressTimer, this.neemias_raidTimer, this.neemias_deadlineTimer])
		if (timer)
			cmpTimer.CancelTimer(timer);

	if (this.neemias_progressNotification !== undefined)
		Engine.QueryInterface(SYSTEM_ENTITY, IID_GuiInterface).DeleteTimeNotification(this.neemias_progressNotification);
};

Trigger.prototype.Neemias_Victory = function()
{
	if (this.neemias_finished)
		return;
	this.neemias_finished = true;
	this.Neemias_StopTimers();

	this.GoalMessage(neemias_text.victory);
	TriggerHelper.SetPlayerWon(
		neemias_playerID,
		n => markForPluralTranslation(
			"%(lastPlayer)s reconstruiu os muros de Jerusalém.",
			"%(players)s e %(lastPlayer)s reconstruíram os muros de Jerusalém.",
			n),
		n => markForPluralTranslation(
			"%(lastPlayer)s não conseguiu impedir a obra.",
			"%(players)s e %(lastPlayer)s não conseguiram impedir a obra.",
			n));
};

Trigger.prototype.Neemias_Deadline = function()
{
	if (this.neemias_finished)
		return;

	if (this.neemias_wallPieces.length && this.Neemias_CountRepaired() == this.neemias_wallPieces.length)
	{
		this.Neemias_Victory();
		return;
	}

	this.neemias_finished = true;
	this.Neemias_StopTimers();
	this.GoalMessage(neemias_text.defeat);
	TriggerHelper.DefeatPlayer(neemias_playerID, "%(player)s não terminou o muro dentro dos 52 dias.");
};

{
	const cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);
	cmpTrigger.RegisterTrigger("OnInitGame", "Neemias_Init", { "enabled": true });
}

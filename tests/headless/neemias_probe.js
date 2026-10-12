/**
 * Sonda de teste do capítulo Neemias, para rodar o motor sem tela.
 * Não faz parte do mod distribuído: tests/headless/run.sh monta um mod
 * temporário "neemias_probe" que adiciona este script ao mapa.
 *
 * O que ela faz:
 *  - "clica" em Pronto nos dois primeiros passos do tutorial;
 *  - manda os trabalhadores repararem o muro (avança o passo 3);
 *  - demole uma parte do muro e confere se ela volta como ruína;
 *  - modo "victory": repara todo o muro aos 400 s e espera a vitória;
 *  - modo "defeat": não faz nada e espera a derrota pelo prazo.
 *
 * Tudo é impresso com o prefixo PROBE para o script de teste conferir.
 */
var NEEMIAS_TEST_MODE = "%MODE%";

Trigger.prototype.NeemiasProbe_Log = function(data)
{
	const t = Math.round(TriggerHelper.GetTime() / 1000);
	const pieces = this.neemias_wallPieces || [];
	print("PROBE t=" + t + "s" +
		" p1=" + QueryPlayerIDInterface(1).GetState() +
		" p2=" + QueryPlayerIDInterface(2).GetState() +
		" walls=" + pieces.length +
		" repaired=" + (pieces.length ? this.Neemias_CountRepaired() : 0) +
		" wave=" + this.neemias_wave +
		" enemyUnits=" + TriggerHelper.GetPlayerEntitiesByClass(2, "Unit").length +
		" p1Units=" + TriggerHelper.GetPlayerEntitiesByClass(1, "Unit").length +
		" goal=" + this.index +
		(data && data.tag ? " tag=" + data.tag : "") + "\n");
};

Trigger.prototype.NeemiasProbe_Ready = function()
{
	print("PROBE clicking Ready at goal " + this.index + "\n");
	this.NextGoal();
};

Trigger.prototype.NeemiasProbe_OrderRepair = function()
{
	const builders = TriggerHelper.GetPlayerEntitiesByClass(1, "Civilian");
	print("PROBE ordering " + builders.length + " builders to repair\n");
	ProcessCommand(1, {
		"type": "repair",
		"entities": builders,
		"target": this.neemias_wallPieces[0].entity,
		"autocontinue": true,
		"queued": false
	});
};

Trigger.prototype.NeemiasProbe_DeletePiece = function()
{
	const piece = this.neemias_wallPieces[1];
	this.neemiasProbe_deleted = piece.entity;
	print("PROBE deleting wall piece " + piece.entity + " (" + piece.template + ")\n");
	ProcessCommand(1, { "type": "delete-entities", "entities": [piece.entity] });
};

Trigger.prototype.NeemiasProbe_CheckRestored = function()
{
	const piece = this.neemias_wallPieces[1];
	const restored = piece.entity != INVALID_ENTITY && piece.entity != this.neemiasProbe_deleted &&
		TriggerHelper.GetOwner(piece.entity) == 1;
	print("PROBE ruin restored: " + restored + "\n");
};

Trigger.prototype.NeemiasProbe_HealAll = function()
{
	print("PROBE healing all wall pieces\n");
	for (const piece of this.neemias_wallPieces)
	{
		const cmpHealth = Engine.QueryInterface(piece.entity, IID_Health);
		if (cmpHealth)
			cmpHealth.SetHitpoints(cmpHealth.GetMaxHitpoints());
	}
};

Trigger.prototype.NeemiasProbe_Init = function()
{
	print("PROBE init, mode=" + NEEMIAS_TEST_MODE + "\n");
	this.NeemiasProbe_Log({ "tag": "after-init" });
	this.DoAfterDelay(3000, "NeemiasProbe_Ready", {});
	this.DoAfterDelay(6000, "NeemiasProbe_Ready", {});
	this.DoAfterDelay(9000, "NeemiasProbe_OrderRepair", {});
	this.DoAfterDelay(20000, "NeemiasProbe_DeletePiece", {});
	this.DoAfterDelay(30000, "NeemiasProbe_CheckRestored", {});
	this.DoRepeatedly(60000, "NeemiasProbe_Log", {}, 10000);
	if (NEEMIAS_TEST_MODE == "victory")
		this.DoAfterDelay(400000, "NeemiasProbe_HealAll", {});
};

Trigger.prototype.NeemiasProbe_OnPlayerWon = function(msg)
{
	print("PROBE OnPlayerWon " + JSON.stringify(msg) + "\n");
};

Trigger.prototype.NeemiasProbe_OnPlayerDefeated = function(msg)
{
	print("PROBE OnPlayerDefeated " + JSON.stringify(msg) + "\n");
};

{
	const cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);
	cmpTrigger.RegisterTrigger("OnInitGame", "NeemiasProbe_Init", { "enabled": true });
	cmpTrigger.RegisterTrigger("OnPlayerWon", "NeemiasProbe_OnPlayerWon", { "enabled": true });
	cmpTrigger.RegisterTrigger("OnPlayerDefeated", "NeemiasProbe_OnPlayerDefeated", { "enabled": true });
}

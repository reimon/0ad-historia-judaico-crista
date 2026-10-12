/**
 * Neemias: os muros de Jerusalém (c. 445 a.C.)
 * Capítulo piloto da campanha "História Judaico-Cristã".
 *
 * Mapa gerado por script. Jerusalém fica no centro, num planalto cercado por
 * um muro completo (torres, trechos e portas) do jogador 1. Os gatilhos
 * (levante_neemias_triggers.js) deixam o muro em ruínas no início da partida.
 *
 * Jogador 1: Yehud, província persa de Judá, sob o governador Neemias.
 * Jogador 2: Sambalate e aliados. Só existe para comandar os ataques; a
 *            presença dele no mapa é um único cavaleiro num rochedo
 *            inacessível, que os gatilhos tornam invulnerável.
 *
 * Pontos de gatilho usados pelos ataques (um por origem):
 *   A = Samaria (Sambalate), B = Amom (Tobias),
 *   C = Arábia (Gesém),      D = Asdode.
 */

Engine.LoadLibrary("rmgen");
Engine.LoadLibrary("rmgen-common");
Engine.LoadLibrary("rmbiome");

export function* generateMap(mapSettings)
{
	setBiome("generic/aegean");

	const tMain = g_Terrains.mainTerrain;
	const tForestFloor1 = g_Terrains.forestFloor1;
	const tForestFloor2 = g_Terrains.forestFloor2;
	const tCliff = g_Terrains.cliff;
	const tHill = g_Terrains.hill;
	const tDirt = g_Terrains.dirt;
	const tRoad = g_Terrains.road;
	const tRoadWild = g_Terrains.roadWild;
	const tTier1 = g_Terrains.tier1Terrain;
	const tTier2 = g_Terrains.tier2Terrain;

	const oOlive = "gaia/tree/olive";
	const oTree1 = g_Gaia.tree1;
	const oTree2 = g_Gaia.tree2;
	const oTree3 = g_Gaia.tree3;
	const oFruitBush = g_Gaia.fruitBush;
	const oGoat = "gaia/fauna_goat";
	const oStoneLarge = g_Gaia.stoneLarge;
	const oStoneSmall = g_Gaia.stoneSmall;
	const oMetalLarge = g_Gaia.metalLarge;

	const aBushMedium = g_Decoratives.bushMedium;
	const aBushSmall = g_Decoratives.bushSmall;
	const aRockMedium = g_Decoratives.rockMedium;

	const pForest1 = [tForestFloor2 + TERRAIN_SEPARATOR + oTree1, tForestFloor2 + TERRAIN_SEPARATOR + oTree2, tForestFloor2];
	const pForest2 = [tForestFloor1 + TERRAIN_SEPARATOR + oTree3, tForestFloor1];

	// Civilização e modelos de entidades.
	const civ = "pers";
	const templates = {
		"civicCentre": "structures/" + civ + "/civil_centre",
		"house": "structures/" + civ + "/house",
		"storehouse": "structures/" + civ + "/storehouse",
		"farmstead": "structures/" + civ + "/farmstead",
		"builder": "units/" + civ + "/support_civilian",
		"spearman": "units/" + civ + "/infantry_spearman_b",
		"archer": "units/" + civ + "/infantry_archer_b",
		"enemyAnchor": "units/" + civ + "/cavalry_javelineer_b"
	};
	const wallStyle = civ + "/stone";

	const playerID = 1;
	const enemyID = 2;

	const heightLand = 4;
	const heightCity = 12;

	globalThis.g_Map = new RandomMap(heightLand, tMain);

	const mapSize = g_Map.getSize();
	const mapCenter = g_Map.getCenter();
	const numPlayers = getNumPlayers();

	const clCity = g_Map.createTileClass();
	const clHill = g_Map.createTileClass();
	const clForest = g_Map.createTileClass();
	const clRock = g_Map.createTileClass();
	const clMetal = g_Map.createTileClass();
	const clFood = g_Map.createTileClass();
	const clEnemy = g_Map.createTileClass();
	const clSpawn = g_Map.createTileClass();

	// Raio do muro: proporcional ao mapa, mas com mínimo para caber a cidade.
	const wallRadius = Math.max(16, fractionToTiles(0.12));
	const plateauRadius = wallRadius + 6;

	g_Map.log("Criando o planalto de Jerusalém");
	createArea(
		new ClumpPlacer(diskArea(plateauRadius), 0.95, 0.6, Infinity, mapCenter),
		[
			new LayeredPainter([tHill, tDirt, tRoadWild], [2, 3]),
			new SmoothElevationPainter(ELEVATION_SET, heightCity, 6),
			new TileClassPainter(clCity)
		]);

	createArea(
		new DiskPlacer(wallRadius * 0.35, mapCenter),
		new TerrainPainter(tRoad));
	yield 15;

	g_Map.log("Criando o Monte das Oliveiras");
	const olivesCenter = new Vector2D(mapCenter.x + wallRadius * 2.1, mapCenter.y);
	createArea(
		new ClumpPlacer(diskArea(wallRadius * 0.7), 0.8, 0.4, Infinity, olivesCenter),
		[
			new LayeredPainter([tTier1, tTier2], [3]),
			new SmoothElevationPainter(ELEVATION_SET, heightCity + 4, 8),
			new TileClassPainter(clHill)
		],
		avoidClasses(clCity, 2));
	createObjectGroupsDeprecated(
		new SimpleGroup([new SimpleObject(oOlive, 1, 3, 1, 3)], true, clForest),
		0,
		[stayClasses(clHill, 1), avoidClasses(clForest, 2)],
		scaleByMapSize(25, 100),
		50);
	yield 25;

	g_Map.log("Erguendo o muro (ainda inteiro; os gatilhos o arruínam)");
	placeCircularWall(
		mapCenter,
		wallRadius,
		["tower", "long", "tower", "medium", "tower", "gate", "tower", "medium"],
		wallStyle,
		playerID,
		Math.PI / 8,
		2 * Math.PI);
	yield 40;

	g_Map.log("Povoando Jerusalém");
	g_Map.placeEntityPassable(templates.civicCentre, playerID, mapCenter, BUILDING_ORIENTATION);

	const housePositions = distributePointsOnCircle(6, Math.PI / 6, wallRadius * 0.6, mapCenter)[0];
	for (const position of housePositions)
		g_Map.placeEntityPassable(templates.house, playerID, position, BUILDING_ORIENTATION);

	g_Map.placeEntityPassable(templates.storehouse, playerID,
		new Vector2D(mapCenter.x - wallRadius * 0.45, mapCenter.y - wallRadius * 0.2), BUILDING_ORIENTATION);
	g_Map.placeEntityPassable(templates.farmstead, playerID,
		new Vector2D(mapCenter.x + wallRadius * 0.45, mapCenter.y - wallRadius * 0.2), BUILDING_ORIENTATION);

	const placeUnitRing = (template, count, radius, startAngle) => {
		const positions = distributePointsOnCircle(count, startAngle, radius, mapCenter)[0];
		for (const position of positions)
			g_Map.placeEntityPassable(template, playerID, position, randomAngle());
	};
	placeUnitRing(templates.builder, 12, wallRadius * 0.3, 0);
	placeUnitRing(templates.spearman, 8, wallRadius * 0.4, Math.PI / 8);
	placeUnitRing(templates.archer, 6, wallRadius * 0.42, Math.PI / 3);

	createObjectGroup(
		new SimpleGroup([new SimpleObject(oFruitBush, 5, 7, 0, 3)], true, clFood,
			new Vector2D(mapCenter.x, mapCenter.y + wallRadius * 0.5)),
		0);
	yield 50;

	g_Map.log("Posicionando as origens dos ataques");
	const spawnDistance = mapSize * 0.42;
	const spawns = [
		["trigger/trigger_point_A", new Vector2D(mapCenter.x, mapCenter.y + spawnDistance)],
		["trigger/trigger_point_B", new Vector2D(mapCenter.x + spawnDistance, mapCenter.y)],
		["trigger/trigger_point_C", new Vector2D(mapCenter.x, mapCenter.y - spawnDistance)],
		["trigger/trigger_point_D", new Vector2D(mapCenter.x - spawnDistance, mapCenter.y)]
	];
	for (const [template, position] of spawns)
	{
		g_Map.placeEntityPassable(template, 0, position, 0);
		createArea(new DiskPlacer(6, position), new TileClassPainter(clSpawn));
	}

	g_Map.log("Criando o rochedo de Sambalate (inacessível)");
	if (numPlayers >= enemyID)
	{
		const anchorPosition = new Vector2D(
			mapCenter.x - spawnDistance * 0.55,
			mapCenter.y + spawnDistance * 0.75);
		createArea(
			new ClumpPlacer(diskArea(5), 1, 1, Infinity, anchorPosition),
			[
				new LayeredPainter([tCliff, tHill], [2]),
				new SmoothElevationPainter(ELEVATION_SET, heightCity + 30, 1),
				new TileClassPainter(clEnemy)
			]);
		g_Map.placeEntityAnywhere(templates.enemyAnchor, enemyID, anchorPosition, Math.PI);
	}
	yield 60;

	g_Map.log("Criando colinas, matas e recursos");
	createBumps(avoidClasses(clCity, 6, clHill, 2, clEnemy, 4, clSpawn, 2));

	const [forestTrees, stragglerTrees] = getTreeCounts(400, 1200, 0.6);
	createDefaultForests(
		[tMain, tForestFloor1, tForestFloor2, pForest1, pForest2],
		avoidClasses(clCity, 10, clHill, 2, clForest, 15, clEnemy, 4, clSpawn, 6),
		clForest,
		forestTrees);
	yield 70;

	createObjectGroupsDeprecated(
		new SimpleGroup([new SimpleObject(oStoneSmall, 0, 2, 0, 4), new SimpleObject(oStoneLarge, 1, 1, 0, 4)], true, clRock),
		0,
		avoidClasses(clCity, 6, clForest, 2, clHill, 2, clRock, 15, clSpawn, 4, clEnemy, 4),
		scaleByMapSize(3, 8),
		100);
	createObjectGroupsDeprecated(
		new SimpleGroup([new SimpleObject(oMetalLarge, 1, 1, 0, 4)], true, clMetal),
		0,
		avoidClasses(clCity, 8, clForest, 2, clHill, 2, clRock, 10, clMetal, 20, clSpawn, 4, clEnemy, 4),
		scaleByMapSize(2, 6),
		100);
	createObjectGroupsDeprecated(
		new SimpleGroup([new SimpleObject(oGoat, 4, 6, 0, 3)], true, clFood),
		0,
		avoidClasses(clCity, 6, clForest, 1, clHill, 1, clFood, 15, clSpawn, 4, clEnemy, 4),
		scaleByMapSize(4, 12),
		50);
	yield 80;

	createDecoration(
		[
			[new SimpleObject(aRockMedium, 1, 3, 0, 1)],
			[new SimpleObject(aBushMedium, 1, 2, 0, 2), new SimpleObject(aBushSmall, 2, 4, 0, 2)]
		],
		[scaleByMapAreaAbsolute(14), scaleByMapAreaAbsolute(14)],
		avoidClasses(clCity, 2, clForest, 0, clEnemy, 2));

	createStragglerTrees(
		[oTree1, oTree2, oOlive],
		avoidClasses(clCity, 6, clForest, 6, clHill, 1, clRock, 4, clMetal, 4, clFood, 2, clSpawn, 4, clEnemy, 4),
		clForest,
		stragglerTrees);
	yield 95;

	return g_Map;
}

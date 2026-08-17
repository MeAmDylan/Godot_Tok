(function(){
  "use strict";

  const base=window.GodotTokLibraryExpansion;
  if(!base) throw new Error("library-expansion.js must load before library-expansion-2d.js");
  const S=base.sources;
  const dedent=value=>{
    const lines=String(value).replace(/^\n/,"").replace(/\n\s*$/,"").split("\n");
    const widths=lines.filter(line=>line.trim()).map(line=>(line.match(/^\s*/)||[""])[0].length);
    const width=widths.length?Math.min(...widths):0;
    return lines.map(line=>line.slice(width)).join("\n");
  };
  const file=(path,attachTo,purpose,content,connections=[])=>Object.freeze({path,language:"gdscript",attachTo,purpose,connections:Object.freeze(connections),code:dedent(content)});
  const recipe=value=>Object.freeze({...value,version:base.version,inputActions:Object.freeze(value.inputActions||[]),signals:Object.freeze(value.signals||[]),visuals:Object.freeze(value.visuals||[]),files:Object.freeze(value.files),sources:Object.freeze(value.sources)});

  const recipes=[
    recipe({
      id:"2d-crop-grid",section:"2d",category:"Farming",title:"Plant, water, grow, and harvest crops",
      purpose:"Build data-driven crop plots whose growth advances once per in-game day and whose finished produce enters the shared inventory.",difficulty:"intermediate",
      tags:["farming","crops","watering","harvest","Resource","day cycle"],
      nodeTree:["CropPlot (Node2D)","  Soil (Sprite2D)","  CropSprite (Sprite2D)","  InteractionArea (Area2D)","    CollisionShape2D"],
      inputActions:[{name:"interact",bindings:"E, controller south, touch button"}],
      inspector:["Create one CropDefinition .tres per crop and assign every stage texture in chronological order.","Keep the plot origin at the centre of one tile.","Connect GameClock.day_started to every active plot."],
      visuals:["Draw dry and watered soil plus at least three crop stages.","Attach CropSprite below CropPlot, drag the seedling PNG into Texture, and align it before writing interaction code."],
      signals:[{from:"GameClock",signal:"day_started(day)",to:"CropPlot",method:"advance_day",why:"Advance at most once per completed day."},{from:"CropPlot",signal:"harvested(item, amount)",to:"Inventory HUD",method:"show_pickup",why:"Confirm the collected produce."}],
      files:[
        file("crop_definition.gd","CropDefinition resource script","Stores crop timing, stage art, and harvest output.",`
          class_name CropDefinition
          extends Resource

          @export var id: StringName
          @export var display_name: String
          @export_range(1, 30, 1) var days_to_grow: int = 4
          @export var stage_textures: Array[Texture2D] = []
          @export var harvest_item: ItemDefinition
          @export_range(1, 99, 1) var harvest_count: int = 1
        `),
        file("crop_plot.gd","CropPlot (Node2D)","Owns one planted crop and updates its sprite stage.",`
          class_name CropPlot
          extends Node2D

          signal planted(definition: CropDefinition)
          signal watered
          signal harvested(item: ItemDefinition, amount: int)

          @onready var soil: Sprite2D = $Soil
          @onready var crop_sprite: Sprite2D = $CropSprite
          var crop: CropDefinition
          var age_days: int = 0
          var is_watered: bool = false

          func plant(definition: CropDefinition) -> bool:
              if crop != null or definition == null:
                  return false
              crop = definition
              age_days = 0
              _refresh_visual()
              planted.emit(crop)
              return true

          func water() -> bool:
              if crop == null or is_watered:
                  return false
              is_watered = true
              soil.modulate = Color(0.65, 0.75, 1.0)
              watered.emit()
              return true

          func advance_day(_day: int = 0) -> void:
              if crop == null:
                  return
              if is_watered:
                  age_days = mini(age_days + 1, crop.days_to_grow)
              is_watered = false
              soil.modulate = Color.WHITE
              _refresh_visual()

          func harvest(inventory: Inventory) -> bool:
              if crop == null or age_days < crop.days_to_grow or inventory == null or crop.harvest_item == null:
                  return false
              var current := inventory.quantity(crop.harvest_item.id)
              if current + crop.harvest_count > crop.harvest_item.max_stack:
                  return false
              if current == 0 and inventory.stacks.size() >= inventory.capacity:
                  return false
              if inventory.add(crop.harvest_item, crop.harvest_count) > 0:
                  return false
              var item := crop.harvest_item
              var amount := crop.harvest_count
              crop = null
              age_days = 0
              crop_sprite.texture = null
              harvested.emit(item, amount)
              return true

          func _refresh_visual() -> void:
              if crop == null or crop.stage_textures.is_empty():
                  crop_sprite.texture = null
                  return
              var ratio := float(age_days) / float(crop.days_to_grow)
              var index := mini(floori(ratio * crop.stage_textures.size()), crop.stage_textures.size() - 1)
              crop_sprite.texture = crop.stage_textures[index]
        `)
      ],
      steps:["Create the harvested ItemDefinition first.","Create CropDefinition .tres resources and fill Stage Textures from seedling to mature crop.","Build the exact node tree, attach crop_plot.gd, and align Soil, CropSprite, and CollisionShape2D.","Your interaction system calls plant, water, or harvest according to the selected tool.","Connect day_started to advance_day.","Save crop ID, age_days, and is_watered for each occupied grid cell."],
      tests:["Unwatered days do not grow crops.","Watered crops advance exactly once each day.","Harvest fails safely when inventory is full.","Successful harvest clears the plot and adds the exact count."],
      sources:[S.resources,S.signals,S.nodesScenes],related:["shared-day-clock","shared-item-inventory","2d-crafting"]
    }),
    recipe({
      id:"2d-npc-schedule-relationship",section:"2d",category:"Farming",title:"NPC schedules and relationship points",
      purpose:"Move town NPCs through a daily schedule and track friendship independently from dialogue and quest presentation.",difficulty:"advanced",
      tags:["NPC","schedule","relationship","dialogue","day clock","life sim"],
      nodeTree:["TownNPC (CharacterBody2D)","  AnimatedSprite2D","  CollisionShape2D","  NavigationAgent2D","  InteractionArea (Area2D)"],
      inputActions:[{name:"interact",bindings:"E, controller south, touch button"}],
      inspector:["Each schedule entry needs minute, position, and activity keys.","Bake navigation for every destination.","Use permanent lowercase NPC IDs."],
      visuals:["Attach AnimatedSprite2D below TownNPC and create idle and walk animations before adding the schedule.","Flip or switch animation from velocity; do not rotate the collision body."],
      signals:[{from:"GameClock",signal:"minute_changed(minute)",to:"TownNPC",method:"on_minute_changed",why:"Select the latest schedule stop."},{from:"RelationshipBook",signal:"points_changed(npc_id, points)",to:"Dialogue UI",method:"refresh_relationship",why:"Unlock friendship content."}],
      files:[
        file("relationship_book.gd","RelationshipBook (Node autoload)","Stores friendship points under stable NPC IDs.",`
          extends Node

          signal points_changed(npc_id: StringName, points: int)
          var points: Dictionary = {}

          func add_points(npc_id: StringName, amount: int) -> void:
              var total := maxi(0, int(points.get(npc_id, 0)) + amount)
              points[npc_id] = total
              points_changed.emit(npc_id, total)

          func get_points(npc_id: StringName) -> int:
              return int(points.get(npc_id, 0))

          func save_data() -> Dictionary:
              return points.duplicate(true)

          func load_data(data: Dictionary) -> void:
              points = data.duplicate(true)
        `),
        file("town_npc.gd","TownNPC (CharacterBody2D)","Chooses schedule stops and follows navigation to the active destination.",`
          class_name TownNPC
          extends CharacterBody2D

          signal activity_changed(activity: StringName)

          @export var npc_id: StringName
          @export var speed: float = 80.0
          @export var schedule: Array[Dictionary] = []
          @onready var agent: NavigationAgent2D = $NavigationAgent2D
          var active_stop: int = -1

          func on_minute_changed(minute: int) -> void:
              var selected := -1
              for index in range(schedule.size()):
                  if int(schedule[index].get("minute", 0)) <= minute:
                      selected = index
              if selected == active_stop or selected < 0:
                  return
              active_stop = selected
              var stop := schedule[active_stop]
              agent.target_position = stop.get("position", global_position) as Vector2
              activity_changed.emit(StringName(stop.get("activity", "idle")))

          func _physics_process(_delta: float) -> void:
              if agent.is_navigation_finished():
                  velocity = Vector2.ZERO
              else:
                  velocity = global_position.direction_to(agent.get_next_path_position()) * speed
              move_and_slide()
        `)
      ],
      steps:["Add RelationshipBook as an autoload and include it in save data.","Build TownNPC with sprite, collision, NavigationAgent2D, and interaction area.","Attach town_npc.gd and assign a stable ID.","Add chronological schedule dictionaries such as minute 480, a Vector2 position, and activity farm.","Connect minute_changed after navigation synchronizes.","Award relationship points from conversations, gifts, and missions, then select dialogue by point thresholds."],
      tests:["Time jumps select the correct latest stop.","Unreachable targets do not teleport the NPC.","Friendship never falls below zero.","Schedules and relationships restore correctly after loading."],
      sources:[S.navAgents,S.signals,S.resources],related:["shared-day-clock","shared-mission-system","shared-save-slots-autosave"]
    }),
    recipe({
      id:"2d-crafting",section:"2d",category:"Farming",title:"Inventory-backed crafting recipes",
      purpose:"Define crafting inputs and outputs as Resources, validate every ingredient, and modify inventory only after the complete recipe can succeed.",difficulty:"intermediate",
      tags:["crafting","recipe","inventory","Resource","workbench"],
      nodeTree:["CraftingStation (Node)","CraftingMenu (Control)","CraftingDefinition resources (*.tres)"],
      inputActions:[{name:"interact",bindings:"E, controller south, touch button"}],
      inspector:["Assign the player Inventory to CraftingStation at runtime.","Use stable item IDs as ingredient keys.","Keep amounts positive."],
      signals:[{from:"CraftingStation",signal:"crafted(recipe)",to:"CraftingMenu",method:"show_success",why:"Refresh counts and give feedback."}],
      files:[
        file("crafting_definition.gd","CraftingDefinition resource script","Defines ingredient IDs and one output item.",`
          class_name CraftingDefinition
          extends Resource

          @export var id: StringName
          @export var display_name: String
          @export var ingredients: Dictionary = {}
          @export var output: ItemDefinition
          @export_range(1, 99, 1) var output_count: int = 1
        `),
        file("crafting_station.gd","CraftingStation (Node)","Checks and exchanges inventory items for an output.",`
          class_name CraftingStation
          extends Node

          signal crafted(recipe: CraftingDefinition)
          signal craft_failed(reason: String)
          @export var inventory: Inventory

          func can_craft(recipe: CraftingDefinition) -> bool:
              if recipe == null or recipe.output == null or inventory == null:
                  return false
              for raw_id in recipe.ingredients:
                  if inventory.quantity(StringName(raw_id)) < int(recipe.ingredients[raw_id]):
                      return false
              var current_output := inventory.quantity(recipe.output.id)
              if current_output + recipe.output_count > recipe.output.max_stack:
                  return false
              if current_output == 0:
                  var projected_slots := inventory.stacks.size()
                  for raw_id in recipe.ingredients:
                      if inventory.quantity(StringName(raw_id)) == int(recipe.ingredients[raw_id]):
                          projected_slots -= 1
                  if projected_slots >= inventory.capacity:
                      return false
              return true

          func craft(recipe: CraftingDefinition) -> bool:
              if not can_craft(recipe):
                  craft_failed.emit("Missing ingredients or output space.")
                  return false
              for raw_id in recipe.ingredients:
                  inventory.remove(StringName(raw_id), int(recipe.ingredients[raw_id]))
              if inventory.add(recipe.output, recipe.output_count) != 0:
                  push_error("Crafting preflight and inventory result disagreed.")
                  return false
              crafted.emit(recipe)
              return true
        `)
      ],
      steps:["Create all ingredient and output ItemDefinition resources.","Create a CraftingDefinition .tres and fill Ingredients with item IDs and counts.","Attach crafting_station.gd to the station and assign the player's Inventory.","Build menu rows from resource data rather than hardcoded strings.","Call can_craft for button state and craft on press.","Connect both result signals to feedback and a menu refresh."],
      tests:["One missing ingredient prevents every removal.","A full output stack blocks crafting.","Successful crafting changes exact quantities.","New recipe resources require no code edits."],
      sources:[S.resources,S.signals,S.gdscript],related:["shared-item-inventory","2d-crop-grid","2d-tool-backpack"]
    }),
    recipe({
      id:"2d-warp-room",section:"2d",category:"World flow",title:"Warp room level selection and unlocks",
      purpose:"Create a hub with selectable portals, collectible requirements, boss gates, and persistent completion state.",difficulty:"intermediate",
      tags:["level select","hub","portal","unlock","collectibles","progression"],
      nodeTree:["WarpRoom (Node2D)","  Portal01 (Area2D)","    Sprite2D","    CollisionShape2D","    Label","LevelProgress (Node) [autoload]"],
      inputActions:[{name:"interact",bindings:"E, controller south, touch button"}],
      inspector:["Create one LevelDefinition .tres per portal.","Assign a destination scene and unique ID.","Provide locked and unlocked portal textures."],
      visuals:["Give every portal a distinct thumbnail and readable lock overlay.","Attach Sprite2D below Area2D and centre it on CollisionShape2D before duplicating the portal."],
      signals:[{from:"LevelProgress",signal:"progress_changed",to:"LevelPortal",method:"refresh",why:"Update locks immediately."},{from:"LevelPortal",signal:"entered(level_id)",to:"Transition UI",method:"begin_transition",why:"Present scene loading cleanly."}],
      files:[
        file("level_definition.gd","LevelDefinition resource script","Stores one portal's identity, destination, and requirements.",`
          class_name LevelDefinition
          extends Resource

          @export var id: StringName
          @export var display_name: String
          @export var scene: PackedScene
          @export_range(0, 999, 1) var required_collectibles: int = 0
          @export var required_level_ids: Array[StringName] = []
        `),
        file("level_progress.gd","LevelProgress (Node autoload)","Tracks collectibles and completed level IDs.",`
          extends Node

          signal progress_changed
          var collectibles: int = 0
          var completed: Array[StringName] = []

          func is_unlocked(definition: LevelDefinition) -> bool:
              if definition == null or collectibles < definition.required_collectibles:
                  return false
              for level_id in definition.required_level_ids:
                  if not completed.has(level_id):
                      return false
              return true

          func complete_level(level_id: StringName, gained: int = 0) -> void:
              if not completed.has(level_id):
                  completed.append(level_id)
              collectibles += maxi(gained, 0)
              progress_changed.emit()

          func save_data() -> Dictionary:
              return {"collectibles": collectibles, "completed": completed}

          func load_data(data: Dictionary) -> void:
              collectibles = maxi(int(data.get("collectibles", 0)), 0)
              completed.assign(data.get("completed", []))
              progress_changed.emit()
        `),
        file("level_portal.gd","LevelPortal (Area2D)","Shows lock state and enters an unlocked scene.",`
          class_name LevelPortal
          extends Area2D

          signal entered(level_id: StringName)
          @export var definition: LevelDefinition
          @export var locked_texture: Texture2D
          @export var unlocked_texture: Texture2D
          @onready var sprite: Sprite2D = $Sprite2D
          var player_inside := false

          func _ready() -> void:
              body_entered.connect(_on_body_entered)
              body_exited.connect(_on_body_exited)
              LevelProgress.progress_changed.connect(refresh)
              refresh()

          func _unhandled_input(event: InputEvent) -> void:
              if player_inside and event.is_action_pressed(&"interact"):
                  enter_level()

          func refresh() -> void:
              sprite.texture = unlocked_texture if LevelProgress.is_unlocked(definition) else locked_texture

          func enter_level() -> void:
              if not LevelProgress.is_unlocked(definition) or definition.scene == null:
                  return
              entered.emit(definition.id)
              get_tree().change_scene_to_packed(definition.scene)

          func _on_body_entered(body: Node2D) -> void:
              if body.is_in_group("player"):
                  player_inside = true

          func _on_body_exited(body: Node2D) -> void:
              if body.is_in_group("player"):
                  player_inside = false
        `)
      ],
      steps:["Add LevelProgress as an autoload and include its dictionary in save slots.","Create LevelDefinition resources for ordinary levels and the boss gate.","Build one portal scene, attach the script, and align its sprite and collision.","Duplicate it and assign different definitions and art.","For a five-level room, leave ordinary prerequisites empty and require all five IDs on the boss definition.","Call complete_level at each goal before returning to the hub."],
      tests:["Free-order levels can be entered immediately.","Locked portals never change scene.","Completion survives a restart.","The full required set unlocks the boss gate.","Returning uses a deliberate hub spawn point."],
      sources:[S.resources,S.packedScene,S.signals],related:["shared-scene-router","shared-save-slots-autosave","shared-mission-system"]
    }),
    recipe({
      id:"2d-safari-capture",section:"2d",category:"Creature games",title:"Limited-step creature safari and capture loop",
      purpose:"Run a safari session with limited steps and capture items, encounter choices, catch probability, and flee probability.",difficulty:"advanced",
      tags:["creature capture","safari","encounter","probability","limited run"],
      nodeTree:["SafariRun (Node)","EncounterUI (Control)","  CreaturePortrait (TextureRect)","  ThrowButton (Button)","  BaitButton (Button)","  ApproachButton (Button)"],
      inputActions:[{name:"interact",bindings:"E, controller south, touch button"}],
      inspector:["Create one CreatureDefinition .tres per original species.","Use rates from zero to one.","Spend a step only after a valid world move."],
      signals:[{from:"SafariRun",signal:"encounter_started(creature)",to:"EncounterUI",method:"open",why:"Show the encounter choices."},{from:"SafariRun",signal:"run_ended(reason)",to:"Results screen",method:"show_results",why:"Return captured creatures safely."}],
      files:[
        file("creature_definition.gd","CreatureDefinition resource script","Stores species presentation and balanced rates.",`
          class_name CreatureDefinition
          extends Resource

          @export var id: StringName
          @export var display_name: String
          @export var portrait: Texture2D
          @export_range(0.01, 1.0, 0.01) var catch_chance: float = 0.25
          @export_range(0.0, 1.0, 0.01) var flee_chance: float = 0.10
        `),
        file("safari_run.gd","SafariRun (Node)","Owns finite run resources and resolves choices with one RNG.",`
          class_name SafariRun
          extends Node

          signal resources_changed(steps: int, capture_items: int)
          signal encounter_started(creature: CreatureDefinition)
          signal creature_caught(creature: CreatureDefinition)
          signal creature_fled(creature: CreatureDefinition)
          signal run_ended(reason: StringName)

          @export_range(1, 9999, 1) var starting_steps: int = 500
          @export_range(1, 99, 1) var starting_capture_items: int = 30
          var steps: int
          var capture_items: int
          var active_creature: CreatureDefinition
          var catch_modifier := 1.0
          var flee_modifier := 1.0
          var ended := false
          var rng := RandomNumberGenerator.new()

          func _ready() -> void:
              rng.randomize()
              steps = starting_steps
              capture_items = starting_capture_items
              resources_changed.emit(steps, capture_items)

          func spend_step() -> void:
              if active_creature != null or ended:
                  return
              steps = maxi(steps - 1, 0)
              resources_changed.emit(steps, capture_items)
              if steps == 0:
                  ended = true
                  run_ended.emit(&"out_of_steps")

          func begin_encounter(creature: CreatureDefinition) -> void:
              if creature == null or active_creature != null or ended:
                  return
              active_creature = creature
              catch_modifier = 1.0
              flee_modifier = 1.0
              encounter_started.emit(creature)

          func throw_capture_item() -> void:
              if active_creature == null or capture_items <= 0:
                  return
              capture_items -= 1
              resources_changed.emit(steps, capture_items)
              if rng.randf() <= clampf(active_creature.catch_chance * catch_modifier, 0.01, 0.95):
                  var caught := active_creature
                  _clear_encounter()
                  creature_caught.emit(caught)
              else:
                  _roll_flee()
              if capture_items == 0:
                  _clear_encounter()
                  ended = true
                  run_ended.emit(&"out_of_capture_items")

          func use_bait() -> void:
              if active_creature != null:
                  catch_modifier *= 0.85
                  flee_modifier *= 0.50
                  _roll_flee()

          func approach() -> void:
              if active_creature != null:
                  catch_modifier *= 1.35
                  flee_modifier *= 1.35
                  _roll_flee()

          func leave_encounter() -> void:
              _clear_encounter()
              if capture_items == 0 and not ended:
                  ended = true
                  run_ended.emit(&"out_of_capture_items")

          func _roll_flee() -> void:
              if rng.randf() <= clampf(active_creature.flee_chance * flee_modifier, 0.0, 0.95):
                  var fled := active_creature
                  _clear_encounter()
                  creature_fled.emit(fled)

          func _clear_encounter() -> void:
              active_creature = null
              catch_modifier = 1.0
              flee_modifier = 1.0
        `)
      ],
      steps:["Create original CreatureDefinition resources.","Add SafariRun and attach safari_run.gd.","Connect completed grid movement to spend_step.","Use weighted loot to choose an encounter for the current area, then call begin_encounter.","Wire the encounter buttons to the four public choice methods.","Add captured creatures to a collection and route run_ended to a results screen."],
      tests:["Blocked movement costs no step.","Only one encounter is active.","Each throw consumes one item.","Bait reduces risk and catch odds; approach increases both.","A run ending preserves captured creatures."],
      sources:[S.resources,S.random,S.signals],related:["shared-weighted-loot","shared-save-slots-autosave","2d-grid-turn-combat"]
    }),
    recipe({
      id:"2d-procedural-dungeon",section:"2d",category:"Procedural",title:"Seeded room-and-corridor dungeon floors",
      purpose:"Generate repeatable rectangular rooms and connecting corridors on TileMapLayer, then expose safe floor cells for actors, items, and stairs.",difficulty:"advanced",
      tags:["procedural generation","dungeon","TileMapLayer","seed","rooms","corridors"],
      nodeTree:["DungeonGenerator (Node2D)","  Floor (TileMapLayer)","  Walls (TileMapLayer) [optional]","  Actors (Node2D)","  Items (Node2D)"],
      inputActions:[],
      inspector:["Assign a TileSet to Floor.","Set Source ID and Atlas Coordinates to a valid floor tile.","Keep room ranges smaller than the map."],
      visuals:["Import a tile sheet, make a TileSet atlas source, and paint one test cell before copying its source ID and atlas coordinate.","Keep decorative tiles on another layer so gameplay cells remain simple."],
      signals:[{from:"DungeonGenerator",signal:"generated(floor_cells, room_centres)",to:"Population system",method:"populate",why:"Spawn actors only after cells exist."}],
      files:[file("dungeon_generator.gd","DungeonGenerator (Node2D)","Builds non-overlapping rooms and L-shaped corridors from a saved seed.",`
        class_name DungeonGenerator
        extends Node2D

        signal generated(floor_cells: Array[Vector2i], room_centres: Array[Vector2i])

        @export var map_size := Vector2i(64, 48)
        @export_range(2, 30, 1) var room_attempts: int = 14
        @export var room_min := Vector2i(5, 5)
        @export var room_max := Vector2i(11, 9)
        @export var floor_source_id: int = 0
        @export var floor_atlas_coords := Vector2i.ZERO
        @onready var floor_layer: TileMapLayer = $Floor
        var floor_cells: Array[Vector2i] = []
        var room_centres: Array[Vector2i] = []
        var rng := RandomNumberGenerator.new()

        func generate(seed_value: int) -> void:
            rng.seed = seed_value
            floor_layer.clear()
            floor_cells.clear()
            room_centres.clear()
            var rooms: Array[Rect2i] = []
            for _attempt in range(room_attempts):
                var room_size := Vector2i(rng.randi_range(room_min.x, room_max.x), rng.randi_range(room_min.y, room_max.y))
                var room_position := Vector2i(rng.randi_range(1, map_size.x - room_size.x - 2), rng.randi_range(1, map_size.y - room_size.y - 2))
                var candidate := Rect2i(room_position, room_size)
                var overlaps := false
                for existing in rooms:
                    if existing.grow(1).intersects(candidate):
                        overlaps = true
                        break
                if overlaps:
                    continue
                if not rooms.is_empty():
                    _carve_corridor(rooms.back().get_center(), candidate.get_center())
                rooms.append(candidate)
                room_centres.append(candidate.get_center())
                _carve_room(candidate)
            for cell in floor_cells:
                floor_layer.set_cell(cell, floor_source_id, floor_atlas_coords)
            generated.emit(floor_cells, room_centres)

        func _carve_room(room: Rect2i) -> void:
            for x in range(room.position.x, room.end.x):
                for y in range(room.position.y, room.end.y):
                    _add_floor(Vector2i(x, y))

        func _carve_corridor(from: Vector2i, to: Vector2i) -> void:
            var cell := from
            while cell.x != to.x:
                _add_floor(cell)
                cell.x += 1 if to.x > cell.x else -1
            while cell.y != to.y:
                _add_floor(cell)
                cell.y += 1 if to.y > cell.y else -1
            _add_floor(to)

        func _add_floor(cell: Vector2i) -> void:
            if not floor_cells.has(cell):
                floor_cells.append(cell)
      `)],
      steps:["Import a tileset and verify one hand-painted floor cell.","Build the exact node tree and attach the generator.","Call generate with a saved floor seed.","Connect generated before placing player, stairs, enemies, or loot.","Use room_centres for entry and exit and floor_cells for free-position selection.","Add walls and navigation as a separate second pass."],
      tests:["The same seed produces the same floor.","Every accepted room connects to the previous one.","No room exceeds map bounds.","Spawning begins only after generated emits."],
      sources:[S.tilemap,S.random,S.signals],related:["2d-grid-turn-combat","shared-weighted-loot","shared-save-slots-autosave"]
    }),
    recipe({
      id:"2d-grid-turn-combat",section:"2d",category:"Creature games",title:"Grid movement and one-action turn queue",
      purpose:"Make player and enemies act one at a time on integer cells so movement, attacks, items, and enemy decisions share one deterministic loop.",difficulty:"advanced",
      tags:["grid","turn based","dungeon","tactics","enemy AI"],
      nodeTree:["TurnQueue (Node)","DungeonActors (Node2D)","  PlayerGridActor (Node2D)","    Sprite2D","  EnemyGridActor (Node2D)","    Sprite2D"],
      inputActions:[{name:"move_left / move_right / move_up / move_down",bindings:"Keyboard, D-pad, VirtualJoystick"},{name:"wait_turn",bindings:"Space, controller south"}],
      inspector:["Use one cell_size for tiles and actors.","Give actors initiative values.","Remove real-time movement scripts from grid actors."],
      visuals:["Attach a sprite below each GridActor and align its feet to the cell centre.","Tween only the visual position; reserve the destination cell before animation starts."],
      signals:[{from:"PlayerGridActor",signal:"action_committed",to:"TurnQueue",method:"finish_player_turn",why:"Enemies act only after a valid action."},{from:"TurnQueue",signal:"player_turn_started",to:"Player input",method:"begin_turn",why:"Re-enable input after enemies finish."}],
      files:[
        file("grid_actor.gd","Every grid actor (Node2D)","Stores a logical cell and performs move or adjacent attack actions.",`
          class_name GridActor
          extends Node2D

          signal action_committed
          @export var cell_size: int = 32
          @export var initiative: int = 10
          @export var is_player: bool = false
          var cell := Vector2i.ZERO
          var can_act := false

          func initialize(start_cell: Vector2i) -> void:
              cell = start_cell
              position = Vector2(cell * cell_size) + Vector2.ONE * cell_size * 0.5

          func try_move(direction: Vector2i, occupied: Dictionary, walkable: Array[Vector2i]) -> bool:
              if not can_act or direction == Vector2i.ZERO:
                  return false
              var destination := cell + direction
              if not walkable.has(destination):
                  return false
              if occupied.has(destination):
                  var target: Node = occupied[destination]
                  if target.has_method("take_damage"):
                      target.call("take_damage", 1)
                  _commit()
                  return true
              occupied.erase(cell)
              cell = destination
              occupied[cell] = self
              var target_position := Vector2(cell * cell_size) + Vector2.ONE * cell_size * 0.5
              create_tween().tween_property(self, "position", target_position, 0.10)
              _commit()
              return true

          func wait() -> void:
              if can_act:
                  _commit()

          func _commit() -> void:
              can_act = false
              action_committed.emit()
        `),
        file("turn_queue.gd","TurnQueue (Node)","Runs every enemy once after a committed player action.",`
          class_name GridTurnQueue
          extends Node

          signal player_turn_started
          signal round_finished
          @export var actors_root: Node
          var occupied: Dictionary = {}
          var walkable: Array[Vector2i] = []
          var player: GridActor

          func configure(floor_cells: Array[Vector2i]) -> void:
              walkable = floor_cells
              occupied.clear()
              for child in actors_root.get_children():
                  if child is GridActor:
                      var actor := child as GridActor
                      occupied[actor.cell] = actor
                      if actor.is_player:
                          player = actor
              _begin_player_turn()

          func finish_player_turn() -> void:
              var enemies: Array[GridActor] = []
              for child in actors_root.get_children():
                  if child is GridActor and not child.is_player:
                      enemies.append(child as GridActor)
              enemies.sort_custom(func(a: GridActor, b: GridActor) -> bool: return a.initiative > b.initiative)
              for enemy in enemies:
                  _run_enemy_turn(enemy)
              round_finished.emit()
              _begin_player_turn()

          func _run_enemy_turn(enemy: GridActor) -> void:
              if not is_instance_valid(enemy) or not is_instance_valid(player):
                  return
              enemy.can_act = true
              var delta := player.cell - enemy.cell
              var direction := Vector2i(signi(delta.x), 0) if absi(delta.x) > absi(delta.y) else Vector2i(0, signi(delta.y))
              if not enemy.try_move(direction, occupied, walkable):
                  enemy.wait()

          func _begin_player_turn() -> void:
              if is_instance_valid(player):
                  player.can_act = true
                  player_turn_started.emit()
        `)
      ],
      steps:["Generate the dungeon and retain floor_cells.","Build GridActor with Node2D root, Sprite2D, and optional health component.","Instance the player and enemies, then initialize distinct cells.","Assign DungeonActors, connect player action_committed, and call TurnQueue.configure.","Translate input into one cardinal Vector2i and call try_move; call wait for a no-move turn.","Add AStarGrid2D pathfinding only after occupancy and action timing pass."],
      tests:["Invalid movement spends no turn.","Movement and attacks each cost one turn.","Every living enemy acts once.","Actors never share a logical cell.","Deleted enemies are skipped safely."],
      sources:[S.astar,S.tween,S.signals],related:["2d-procedural-dungeon","2d-safari-capture","shared-item-inventory"]
    }),
    recipe({
      id:"2d-grappling-hook",section:"2d",category:"Traversal",title:"2D grappling hook with visible rope",
      purpose:"Aim a ray, attach to valid grapple surfaces, and pull a CharacterBody2D with spring-like acceleration while drawing the rope.",difficulty:"advanced",
      tags:["grappling hook","rope","RayCast2D","swing","CharacterBody2D"],
      nodeTree:["Player (CharacterBody2D)","  Sprite2D or AnimatedSprite2D","  CollisionShape2D","  GrappleRay (RayCast2D)","  Rope (Line2D)"],
      inputActions:[{name:"grapple",bindings:"Mouse 2, controller trigger, touch button"},{name:"move_left / move_right",bindings:"A/D, left stick"}],
      inspector:["Enable GrappleRay and set its collision mask to grapple surfaces only.","Give Rope a width, colour, and optional repeating texture.","Keep Player and GrappleRay transforms unscaled."],
      visuals:["Attach the character sprite first, centre its feet at the Player origin, then fit CollisionShape2D around the body.","Add Line2D last and set its two points in code; an empty line in the editor is expected."],
      signals:[{from:"GrapplePlayer2D",signal:"grapple_started(point)",to:"Audio/VFX",method:"play_hook",why:"Play feedback only on a valid hit."},{from:"GrapplePlayer2D",signal:"grapple_ended",to:"Audio/VFX",method:"stop_rope",why:"Stop looping feedback."}],
      files:[file("grapple_player_2d.gd","Player (CharacterBody2D)","Aims, attaches, pulls, releases, and draws the rope.",`
        class_name GrapplePlayer2D
        extends CharacterBody2D

        signal grapple_started(point: Vector2)
        signal grapple_ended

        @export var ground_speed: float = 220.0
        @export var max_distance: float = 520.0
        @export var pull_strength: float = 18.0
        @export var rope_stiffness: float = 9.0
        @export var max_speed: float = 900.0
        @onready var grapple_ray: RayCast2D = $GrappleRay
        @onready var rope: Line2D = $Rope
        var anchor := Vector2.ZERO
        var rope_length := 0.0
        var attached := false
        var gravity: float = ProjectSettings.get_setting("physics/2d/default_gravity")

        func _physics_process(delta: float) -> void:
            if not is_on_floor():
                velocity.y += gravity * delta
            velocity.x = move_toward(velocity.x, Input.get_axis(&"move_left", &"move_right") * ground_speed, ground_speed * 5.0 * delta)
            if attached:
                var to_anchor := anchor - global_position
                var stretch := to_anchor.length() - rope_length
                velocity += to_anchor.normalized() * (pull_strength + maxf(stretch, 0.0) * rope_stiffness) * delta
                velocity = velocity.limit_length(max_speed)
            move_and_slide()
            _draw_rope()

        func _unhandled_input(event: InputEvent) -> void:
            if event.is_action_pressed(&"grapple"):
                try_grapple(get_global_mouse_position())
            elif event.is_action_released(&"grapple"):
                release_grapple()

        func try_grapple(world_target: Vector2) -> bool:
            var local_target := to_local(world_target).limit_length(max_distance)
            grapple_ray.target_position = local_target
            grapple_ray.force_raycast_update()
            if not grapple_ray.is_colliding():
                return false
            anchor = grapple_ray.get_collision_point()
            rope_length = global_position.distance_to(anchor)
            attached = true
            grapple_started.emit(anchor)
            return true

        func release_grapple() -> void:
            if not attached:
                return
            attached = false
            rope.clear_points()
            grapple_ended.emit()

        func _draw_rope() -> void:
            if not attached:
                rope.clear_points()
                return
            rope.points = PackedVector2Array([Vector2.ZERO, to_local(anchor)])
      `)],
      steps:["Finish a collision-tested CharacterBody2D controller first.","Add and align Sprite2D and CollisionShape2D before adding grapple nodes.","Create a physics layer named GrappleSurface and assign it to valid level geometry.","Add enabled GrappleRay and set only GrappleSurface in its mask.","Add Rope Line2D, set width and colour, then attach the script and create the grapple action.","Tune pull strength, stiffness, and max speed in a test room with low and high anchors."],
      tests:["Empty space never attaches.","Non-grapple collision layers are ignored.","Holding the action draws a rope and affects velocity.","Release clears the line immediately.","Repeated attach and release never leaves stale velocity or points."],
      sources:[S.ray2d,S.line2d,S.body2d],related:["2d-platformer-controller","shared-multidevice-input","2d-slingshot"]
    }),
    recipe({
      id:"2d-slingshot",section:"2d",category:"Physics",title:"Drag, trajectory preview, and slingshot launch",
      purpose:"Drag a frozen RigidBody2D behind an anchor, preview its ballistic path, then launch it with a central impulse.",difficulty:"advanced",
      tags:["slingshot","trajectory","RigidBody2D","impulse","touch","physics"],
      nodeTree:["Slingshot (Node2D)","  Anchor (Marker2D)","  Bands (Line2D)","  Trajectory (Line2D)","  Projectile (RigidBody2D)","    Sprite2D","    CollisionShape2D"],
      inputActions:[{name:"primary_action",bindings:"Mouse 1, touch, controller south"}],
      inspector:["Set Projectile Freeze on and Freeze Mode to Static.","Set Bands and Trajectory width and colours.","Tune max_drag and impulse_scale together."],
      visuals:["Attach a sprite and collision shape to Projectile, then verify its mass and centre before freezing it.","Use dots or a fading gradient for Trajectory and a stretched texture for Bands."],
      signals:[{from:"Slingshot",signal:"launched(projectile)",to:"Shot controller",method:"begin_tracking",why:"Transfer camera and shot-state ownership."}],
      files:[file("slingshot.gd","Slingshot (Node2D)","Handles pointer dragging, trajectory prediction, and launch impulse.",`
        class_name Slingshot2D
        extends Node2D

        signal launched(projectile: RigidBody2D)

        @export var max_drag: float = 180.0
        @export var impulse_scale: float = 7.0
        @export_range(4, 40, 1) var preview_points: int = 18
        @export var preview_step: float = 0.08
        @onready var anchor: Marker2D = $Anchor
        @onready var bands: Line2D = $Bands
        @onready var trajectory: Line2D = $Trajectory
        @onready var projectile: RigidBody2D = $Projectile
        var dragging := false
        var gravity: float = ProjectSettings.get_setting("physics/2d/default_gravity")

        func _ready() -> void:
            projectile.freeze = true
            projectile.global_position = anchor.global_position
            trajectory.clear_points()

        func _unhandled_input(event: InputEvent) -> void:
            var pointer := Vector2.ZERO
            var pressed := false
            var released := false
            if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT:
                pointer = event.position
                pressed = event.pressed
                released = not event.pressed
            elif event is InputEventScreenTouch:
                pointer = event.position
                pressed = event.pressed
                released = not event.pressed
            elif event is InputEventMouseMotion or event is InputEventScreenDrag:
                pointer = event.position
            else:
                return
            var world_pointer := get_viewport().get_canvas_transform().affine_inverse() * pointer
            if pressed and world_pointer.distance_to(projectile.global_position) <= max_drag * 0.5:
                dragging = true
            if dragging and not released:
                projectile.global_position = anchor.global_position + (world_pointer - anchor.global_position).limit_length(max_drag)
                _update_preview()
            if dragging and released:
                _launch()

        func _launch() -> void:
            dragging = false
            var impulse := (anchor.global_position - projectile.global_position) * impulse_scale
            projectile.freeze = false
            projectile.apply_central_impulse(impulse)
            bands.clear_points()
            trajectory.clear_points()
            launched.emit(projectile)

        func _update_preview() -> void:
            var velocity_preview := (anchor.global_position - projectile.global_position) * impulse_scale / projectile.mass
            var points := PackedVector2Array()
            for index in range(preview_points):
                var time := index * preview_step
                var world_point := projectile.global_position + velocity_preview * time + Vector2.DOWN * gravity * time * time * 0.5
                points.append(to_local(world_point))
            trajectory.points = points
            bands.points = PackedVector2Array([to_local(anchor.global_position), to_local(projectile.global_position)])
      `)],
      steps:["Build the Projectile RigidBody2D with a sprite, accurately sized CollisionShape2D, and sensible mass.","Freeze it and place it at Anchor.","Add Bands and Trajectory Line2D nodes and style them.","Attach slingshot.gd and add the primary action for non-pointer devices.","Connect launched to camera tracking and shot completion logic.","Create a reset function or next-projectile factory only after one launch behaves consistently."],
      tests:["Dragging starts only near the projectile.","Drag distance is clamped.","Preview direction matches launch direction.","Release unfreezes and applies one impulse.","Mouse and single-touch input both work."],
      sources:[S.rigid2d,S.line2d,S.input],related:["2d-artillery-turns","2d-destructible-terrain","shared-mobile-controls"]
    }),
    recipe({
      id:"2d-tower-defense",section:"2d",category:"Strategy",title:"Path enemies, tower placement, targeting, and waves",
      purpose:"Provide the complete minimum tower-defense loop: path-following enemies, grid placement, range targeting, damage, currency, and escape penalties.",difficulty:"advanced",
      tags:["tower defense","PathFollow2D","placement","targeting","waves","currency"],
      nodeTree:["Game (Node2D)","  EnemyPath (Path2D)","    Enemies (Node2D)","  Towers (Node2D)","  Placement (Node2D)","  WaveSpawner (Node)","Enemy scene: PathFollow2D > Sprite2D, ProgressBar"],
      inputActions:[{name:"primary_action",bindings:"Mouse 1, touch"},{name:"cancel",bindings:"Mouse 2, Escape"}],
      inspector:["Draw EnemyPath.curve from entrance to exit and disable looping.","Put enemies in tower_targets.","Give every tower a Timer child named Cooldown."],
      visuals:["Attach enemy sprites below PathFollow2D and keep their forward orientation consistent.","Give tower scenes a base sprite, rotating weapon sprite, translucent range circle, and one placement preview tint."],
      signals:[{from:"PathEnemy2D",signal:"escaped(damage)",to:"Lives system",method:"lose_lives",why:"Penalize only enemies that reach the end."},{from:"TowerPlacement2D",signal:"money_changed(amount)",to:"HUD",method:"set_money",why:"Keep economy visible."}],
      files:[
        file("path_enemy_2d.gd","Enemy scene root (PathFollow2D)","Moves along the authored path, takes damage, and reports escape or death.",`
          class_name PathEnemy2D
          extends PathFollow2D

          signal died(reward: int)
          signal escaped(damage: int)
          @export var speed: float = 90.0
          @export var max_health: float = 10.0
          @export var reward: int = 5
          @export var escape_damage: int = 1
          var health: float

          func _ready() -> void:
              loop = false
              health = max_health
              add_to_group("tower_targets")

          func _process(delta: float) -> void:
              progress += speed * delta
              if progress_ratio >= 1.0:
                  escaped.emit(escape_damage)
                  queue_free()

          func take_damage(amount: float) -> void:
              health -= maxf(amount, 0.0)
              if health <= 0.0:
                  died.emit(reward)
                  queue_free()
        `),
        file("tower_2d.gd","Tower scene root (Node2D)","Selects the furthest-progress target in range and applies timed damage.",`
          class_name Tower2D
          extends Node2D

          @export var attack_range: float = 220.0
          @export var damage: float = 2.0
          @export var attacks_per_second: float = 1.0
          @onready var cooldown: Timer = $Cooldown

          func _ready() -> void:
              cooldown.wait_time = 1.0 / maxf(attacks_per_second, 0.01)
              cooldown.timeout.connect(_attack)
              cooldown.start()

          func _attack() -> void:
              var target: PathEnemy2D
              var best_progress := -1.0
              for node in get_tree().get_nodes_in_group("tower_targets"):
                  if node is PathEnemy2D and global_position.distance_to(node.global_position) <= attack_range and node.progress > best_progress:
                      target = node
                      best_progress = node.progress
              if target != null:
                  target.take_damage(damage)
        `),
        file("tower_placement_2d.gd","Placement (Node2D)","Snaps purchased towers to free grid cells and tracks money.",`
          class_name TowerPlacement2D
          extends Node2D

          signal money_changed(amount: int)
          signal tower_placed(cell: Vector2i)
          @export var towers_root: Node2D
          @export var grid_size: int = 32
          var money: int = 100
          var selected_scene: PackedScene
          var selected_cost: int = 0
          var occupied: Dictionary = {}

          func select_tower(scene: PackedScene, cost: int) -> void:
              selected_scene = scene
              selected_cost = maxi(cost, 0)

          func try_place(world_position: Vector2) -> bool:
              if selected_scene == null or money < selected_cost:
                  return false
              var cell := Vector2i((world_position / float(grid_size)).floor())
              if occupied.has(cell):
                  return false
              var tower_instance := selected_scene.instantiate()
              if not tower_instance is Node2D:
                  tower_instance.free()
                  push_error("The selected tower scene must have a Node2D root.")
                  return false
              var tower := tower_instance as Node2D
              towers_root.add_child(tower)
              tower.global_position = Vector2(cell * grid_size) + Vector2.ONE * grid_size * 0.5
              occupied[cell] = tower
              money -= selected_cost
              money_changed.emit(money)
              tower_placed.emit(cell)
              return true

          func add_money(amount: int) -> void:
              money += maxi(amount, 0)
              money_changed.emit(money)
        `)
      ],
      steps:["Draw one EnemyPath Curve2D and test an enemy scene below it before adding towers.","Build enemy art and health feedback, attach path_enemy_2d.gd, and connect escaped to lives.","Build a tower scene with visible base, weapon, and Cooldown Timer; attach tower_2d.gd.","Add Towers and Placement roots, attach the placement script, and assign Towers Root.","Connect every enemy died reward to Placement.add_money.","Use the wave spawner recipe to instance each enemy below EnemyPath and increase health or speed between rounds.","Finally, add buildable-area validation so paths and UI cannot receive towers."],
      tests:["Enemies follow the full curve and escape once.","Towers ignore out-of-range targets.","Placement rejects occupied cells and insufficient funds.","Kills award money once.","A wave ends only after its spawn queue and live enemies are empty."],
      sources:[S.path2d,S.timer,S.packedScene,S.signals],related:["2d-wave-spawner","2d-enemy-scaling","shared-upgrade-offers"]
    }),
    recipe({
      id:"2d-artillery-turns",section:"2d",category:"Physics",title:"Turn-based artillery aim, power, wind, and teams",
      purpose:"Cycle living units, aim a launcher, charge power, fire a physics projectile, and end the turn only after the shot resolves.",difficulty:"advanced",
      tags:["artillery","turn based","teams","wind","projectile","aim power"],
      nodeTree:["Battle (Node2D)","  TurnManager (Node)","  Units (Node2D)","    Unit (Node2D)","      Sprite2D","      Launcher (Node2D)","        Muzzle (Marker2D)","  Projectiles (Node2D)"],
      inputActions:[{name:"aim_up / aim_down",bindings:"W/S, stick"},{name:"charge_shot",bindings:"Space, controller south, touch hold"}],
      inspector:["Assign Units and Projectiles roots.","Give each unit a team ID and health component.","Set the projectile collision mask to terrain and units."],
      visuals:["Attach unit Sprite2D and CollisionShape2D before positioning Launcher and Muzzle.","Add an aim arrow and power bar that listen to launcher signals; never infer state from sprite rotation."],
      signals:[{from:"ArtilleryLauncher2D",signal:"shot_fired(projectile)",to:"ArtilleryTurnManager",method:"watch_shot",why:"Hold the turn until impact or timeout."},{from:"ArtilleryProjectile2D",signal:"finished",to:"ArtilleryTurnManager",method:"advance_turn",why:"Move to the next living unit exactly once."}],
      files:[
        file("artillery_launcher_2d.gd","Launcher (Node2D)","Adjusts aim, charges power, and launches one RigidBody2D.",`
          class_name ArtilleryLauncher2D
          extends Node2D

          signal aim_changed(angle: float, power: float)
          signal shot_fired(projectile: ArtilleryProjectile2D)
          @export var projectile_scene: PackedScene
          @export var projectiles_root: Node2D
          @export var min_power: float = 250.0
          @export var max_power: float = 900.0
          @export var charge_speed: float = 500.0
          @export var aim_speed: float = 1.4
          @onready var muzzle: Marker2D = $Muzzle
          var power: float
          var active := false

          func _ready() -> void:
              power = min_power

          func _process(delta: float) -> void:
              if not active:
                  return
              rotation = clampf(rotation + Input.get_axis(&"aim_up", &"aim_down") * aim_speed * delta, -PI + 0.1, -0.1)
              if Input.is_action_pressed(&"charge_shot"):
                  power = move_toward(power, max_power, charge_speed * delta)
              if Input.is_action_just_released(&"charge_shot"):
                  fire()
              aim_changed.emit(rotation, power)

          func fire() -> void:
              if not active or projectile_scene == null:
                  return
              var projectile_instance := projectile_scene.instantiate()
              if not projectile_instance is ArtilleryProjectile2D:
                  projectile_instance.free()
                  push_error("Projectile Scene must have an ArtilleryProjectile2D root.")
                  return
              active = false
              var projectile := projectile_instance as ArtilleryProjectile2D
              projectiles_root.add_child(projectile)
              projectile.global_position = muzzle.global_position
              projectile.launch(Vector2.RIGHT.rotated(global_rotation) * power)
              power = min_power
              shot_fired.emit(projectile)
        `),
        file("artillery_projectile_2d.gd","Projectile scene root (RigidBody2D)","Applies wind, reports impact or timeout, and requests a crater.",`
          class_name ArtilleryProjectile2D
          extends RigidBody2D

          signal exploded(position: Vector2, radius: float, damage: float)
          signal finished
          @export var wind: float = 0.0
          @export var blast_radius: float = 48.0
          @export var damage: float = 25.0
          @export var lifetime: float = 8.0
          var resolved := false

          func _ready() -> void:
              contact_monitor = true
              max_contacts_reported = 4
              body_entered.connect(_on_body_entered)
              get_tree().create_timer(lifetime).timeout.connect(resolve)

          func launch(initial_velocity: Vector2) -> void:
              linear_velocity = initial_velocity
              constant_force = Vector2(wind, 0.0)

          func resolve() -> void:
              if resolved:
                  return
              resolved = true
              exploded.emit(global_position, blast_radius, damage)
              finished.emit()
              queue_free()

          func _on_body_entered(_body: Node) -> void:
              resolve()
        `),
        file("artillery_turn_manager.gd","TurnManager (Node)","Cycles living launchers and generates wind for each turn.",`
          class_name ArtilleryTurnManager
          extends Node

          signal turn_started(index: int, wind: float)
          @export var launchers: Array[ArtilleryLauncher2D] = []
          @export var wind_limit: float = 80.0
          var index := -1
          var rng := RandomNumberGenerator.new()

          func _ready() -> void:
              rng.randomize()
              advance_turn()

          func advance_turn() -> void:
              if launchers.is_empty():
                  return
              for _attempt in range(launchers.size()):
                  index = wrapi(index + 1, 0, launchers.size())
                  if is_instance_valid(launchers[index]):
                      var wind := rng.randf_range(-wind_limit, wind_limit)
                      launchers[index].active = true
                      turn_started.emit(index, wind)
                      return

          func watch_shot(projectile: ArtilleryProjectile2D) -> void:
              projectile.finished.connect(advance_turn, CONNECT_ONE_SHOT)
        `)
      ],
      steps:["Build one unit with sprite, collision, health, Launcher, and Muzzle; duplicate it into teams.","Create the RigidBody2D projectile scene with sprite and collision and attach its script.","Attach the launcher script, assign the projectile scene and Projectiles root, then connect shot_fired to watch_shot.","Add all launchers to TurnManager in desired starting order.","When turn_started emits, copy wind into the next projectile and update the HUD.","Connect projectile exploded to radial damage and the destructible-terrain recipe."],
      tests:["Only the active unit reads aim input.","Power clamps at both limits.","One release creates one projectile.","Wind affects flight consistently.","Impact and timeout each advance the turn once."],
      sources:[S.rigid2d,S.random,S.signals],related:["2d-destructible-terrain","2d-slingshot","2d-area-health"]
    }),
    recipe({
      id:"2d-destructible-terrain",section:"2d",category:"Physics",title:"Tile-based destructible terrain and craters",
      purpose:"Erase collision-backed TileMapLayer cells inside a blast radius for reliable artillery terrain without runtime polygon surgery.",difficulty:"intermediate",
      tags:["destructible terrain","TileMapLayer","crater","explosion","artillery"],
      nodeTree:["DestructibleTerrain (TileMapLayer)","Projectile or ExplosionArea (Node2D)"],
      inputActions:[],
      inspector:["Give solid terrain tiles collision polygons in the TileSet editor.","Use a square tile size and record it accurately.","Keep decorative foreground on a separate non-colliding layer."],
      visuals:["Import a terrain tile atlas, add collision to the solid atlas tiles, and paint a test hill.","Add dust particles and a decal after cell erasure; those effects must not own collision."],
      signals:[{from:"ArtilleryProjectile2D",signal:"exploded(position, radius, damage)",to:"DestructibleTerrain2D",method:"carve_from_explosion",why:"Erase terrain at the resolved impact."}],
      files:[file("destructible_terrain_2d.gd","DestructibleTerrain (TileMapLayer)","Erases all occupied terrain cells whose centres fall within a world-space circle.",`
        class_name DestructibleTerrain2D
        extends TileMapLayer

        signal terrain_changed(erased_cells: Array[Vector2i])
        @export var tile_size: int = 16

        func carve(world_position: Vector2, radius: float) -> Array[Vector2i]:
            var centre := local_to_map(to_local(world_position))
            var cell_radius := ceili(radius / float(tile_size))
            var erased: Array[Vector2i] = []
            for x in range(centre.x - cell_radius, centre.x + cell_radius + 1):
                for y in range(centre.y - cell_radius, centre.y + cell_radius + 1):
                    var cell := Vector2i(x, y)
                    var cell_world := to_global(map_to_local(cell))
                    if cell_world.distance_to(world_position) <= radius and get_cell_source_id(cell) != -1:
                        erase_cell(cell)
                        erased.append(cell)
            if not erased.is_empty():
                terrain_changed.emit(erased)
            return erased

        func carve_from_explosion(world_position: Vector2, radius: float, _damage: float) -> void:
            carve(world_position, radius)
      `)],
      steps:["Create a TileSet atlas and define collision polygons for every solid terrain tile.","Paint the terrain on one TileMapLayer and attach this script.","Set tile_size to the TileSet tile width.","Connect projectile exploded to carve_from_explosion.","After terrain_changed, refresh any navigation representation and spawn dust at erased cell positions.","Save destroyed cell coordinates or regenerate from seed and replay crater operations."],
      tests:["Only cells inside the circle are erased.","Collision disappears with the tile.","Decoration layers remain intact.","Overlapping explosions are safe.","Saved crater operations reproduce the terrain."],
      sources:[S.tilemap,S.signals],related:["2d-artillery-turns","2d-slingshot","shared-save-slots-autosave"]
    }),
    recipe({
      id:"2d-lane-defense",section:"2d",category:"Strategy",title:"Lane defense grid, resource plants, and advancing enemies",
      purpose:"Place units into fixed lane cells, generate spendable sunlight, attack enemies in the same lane, and detect a breached home edge.",difficulty:"advanced",
      tags:["lane defense","grid placement","plants","sun resource","cooldown","waves"],
      nodeTree:["LaneBoard (Node2D)","  Plants (Node2D)","  Enemies (Node2D)","Plant scene: Node2D > Sprite2D, Cooldown (Timer)","Enemy scene: CharacterBody2D > Sprite2D, CollisionShape2D"],
      inputActions:[{name:"primary_action",bindings:"Mouse 1, touch"},{name:"cancel",bindings:"Mouse 2, Escape"}],
      inspector:["Set lane_count, column_count, cell_size, and board_origin.","Give each plant scene a PlantDefinition.","Assign each enemy an integer lane."],
      visuals:["Draw a board backdrop with visible rows and columns, then align the first plant sprite to a cell centre.","Prepare original seed-packet icons, plant idle/attack frames, enemy walk/attack frames, resource pickup, and lane-breach effect."],
      signals:[{from:"LaneBoard2D",signal:"sun_changed(amount)",to:"HUD",method:"set_sun",why:"Keep placement affordability visible."},{from:"LaneEnemy2D",signal:"breached(lane)",to:"Game state",method:"lose_lane",why:"Trigger the lane's final defense or defeat."}],
      files:[
        file("plant_definition.gd","PlantDefinition resource script","Stores a plant scene, cost, cooldown, and combat values.",`
          class_name PlantDefinition
          extends Resource

          @export var id: StringName
          @export var display_name: String
          @export var scene: PackedScene
          @export_range(0, 999, 1) var cost: int = 50
          @export var attack_range: float = 500.0
          @export var attack_damage: float = 1.0
          @export var attack_cooldown: float = 1.2
        `),
        file("lane_board_2d.gd","LaneBoard (Node2D)","Validates plant cells and owns the shared sunlight resource.",`
          class_name LaneBoard2D
          extends Node2D

          signal sun_changed(amount: int)
          signal plant_placed(cell: Vector2i)
          @export var plants_root: Node2D
          @export var board_origin := Vector2.ZERO
          @export var cell_size := Vector2(96.0, 112.0)
          @export var column_count: int = 9
          @export var lane_count: int = 5
          var sun: int = 100
          var occupied: Dictionary = {}

          func place(definition: PlantDefinition, cell: Vector2i) -> bool:
              if definition == null or definition.scene == null or sun < definition.cost:
                  return false
              if cell.x < 0 or cell.x >= column_count or cell.y < 0 or cell.y >= lane_count or occupied.has(cell):
                  return false
              var plant_instance := definition.scene.instantiate()
              if not plant_instance is LanePlant2D:
                  plant_instance.free()
                  push_error("The plant scene root must use LanePlant2D.")
                  return false
              var plant := plant_instance as LanePlant2D
              plants_root.add_child(plant)
              plant.position = board_origin + Vector2(cell) * cell_size + cell_size * 0.5
              plant.configure(cell.y, definition)
              occupied[cell] = plant
              sun -= definition.cost
              sun_changed.emit(sun)
              plant_placed.emit(cell)
              return true

          func add_sun(amount: int) -> void:
              sun += maxi(amount, 0)
              sun_changed.emit(sun)
        `),
        file("lane_plant_2d.gd","Plant scene root (Node2D)","Finds the nearest enemy ahead in its lane and applies timed damage.",`
          class_name LanePlant2D
          extends Node2D

          @onready var cooldown: Timer = $Cooldown
          var lane: int
          var definition: PlantDefinition

          func configure(value: int, data: PlantDefinition) -> void:
              lane = value
              definition = data
              cooldown.wait_time = definition.attack_cooldown
              cooldown.timeout.connect(_attack)
              cooldown.start()

          func _attack() -> void:
              var target: LaneEnemy2D
              var nearest := INF
              for node in get_tree().get_nodes_in_group("lane_enemies"):
                  if node is LaneEnemy2D and node.lane == lane:
                      var enemy := node as LaneEnemy2D
                      var distance: float = enemy.global_position.x - global_position.x
                      if distance >= 0.0 and distance <= definition.attack_range and distance < nearest:
                          nearest = distance
                          target = enemy
              if target != null:
                  target.take_damage(definition.attack_damage)
        `),
        file("lane_enemy_2d.gd","Enemy scene root (CharacterBody2D)","Advances left, takes damage, and reports a home-edge breach.",`
          class_name LaneEnemy2D
          extends CharacterBody2D

          signal died(reward: int)
          signal breached(lane: int)
          @export var lane: int = 0
          @export var speed: float = 24.0
          @export var max_health: float = 10.0
          @export var breach_x: float = 0.0
          @export var reward: int = 15
          var health: float

          func _ready() -> void:
              health = max_health
              add_to_group("lane_enemies")

          func _physics_process(_delta: float) -> void:
              velocity = Vector2.LEFT * speed
              move_and_slide()
              if global_position.x <= breach_x:
                  breached.emit(lane)
                  queue_free()

          func take_damage(amount: float) -> void:
              health -= maxf(amount, 0.0)
              if health <= 0.0:
                  died.emit(reward)
                  queue_free()
        `)
      ],
      steps:["Create the board art and record its top-left origin and cell size.","Build original plant and enemy scenes with aligned sprites and collisions.","Create PlantDefinition resources and assign scenes and combat values.","Attach LaneBoard, LanePlant, and LaneEnemy scripts and connect enemy rewards to add_sun.","Convert pointer position to a clamped Vector2i cell before calling place.","Use wave data to spawn enemies at the right side of a selected lane.","Add blockers and projectiles after the core affordability, targeting, death, and breach loop passes."],
      tests:["Plants place only in bounds and one per cell.","Costs deduct once.","Plants target only enemies ahead in their own lane.","Dead enemies reward once.","A breach reports the correct lane."],
      sources:[S.timer,S.packedScene,S.signals],related:["2d-wave-spawner","2d-tower-defense","shared-upgrade-offers"]
    }),
  ];

  window.GodotTokLibraryExpansion=Object.freeze({
    ...base,
    recipes:Object.freeze([...base.recipes,...recipes])
  });
})();

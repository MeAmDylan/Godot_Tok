(function(){
  "use strict";

  const VERSION="4.7.1";

  function dedent(value){
    const lines=String(value).replace(/^\n/,"").replace(/\n\s*$/,"").split("\n");
    const indents=lines.filter(line=>line.trim()).map(line=>(line.match(/^\s*/)||[""])[0].length);
    const width=indents.length?Math.min(...indents):0;
    return lines.map(line=>line.slice(width)).join("\n");
  }

  const source=(title,url,kind="Godot 4.7 docs")=>Object.freeze({title,url,kind});
  const S=Object.freeze({
    gdscript:source("GDScript reference","https://docs.godotengine.org/en/4.7/tutorials/scripting/gdscript/gdscript_basics.html"),
    bestPractices:source("Project organization","https://docs.godotengine.org/en/4.7/tutorials/best_practices/project_organization.html"),
    nodesScenes:source("Nodes and scenes","https://docs.godotengine.org/en/4.7/getting_started/step_by_step/nodes_and_scenes.html"),
    signals:source("Using signals","https://docs.godotengine.org/en/4.7/getting_started/step_by_step/signals.html"),
    resources:source("Resources","https://docs.godotengine.org/en/4.7/tutorials/scripting/resources.html"),
    resourceClass:source("Resource class","https://docs.godotengine.org/en/4.7/classes/class_resource.html"),
    packedScene:source("PackedScene class","https://docs.godotengine.org/en/4.7/classes/class_packedscene.html"),
    input:source("Input examples","https://docs.godotengine.org/en/4.7/tutorials/inputs/input_examples.html"),
    inputMap:source("InputMap class","https://docs.godotengine.org/en/4.7/classes/class_inputmap.html"),
    virtualJoystick:source("VirtualJoystick class","https://docs.godotengine.org/en/4.7/classes/class_virtualjoystick.html"),
    touchButton:source("TouchScreenButton class","https://docs.godotengine.org/en/4.7/classes/class_touchscreenbutton.html"),
    resolutions:source("Multiple resolutions","https://docs.godotengine.org/en/4.7/tutorials/rendering/multiple_resolutions.html"),
    anchors:source("Size and anchors","https://docs.godotengine.org/en/4.7/tutorials/ui/size_and_anchors.html"),
    display:source("DisplayServer class","https://docs.godotengine.org/en/4.7/classes/class_displayserver.html"),
    save:source("Saving games","https://docs.godotengine.org/en/4.7/tutorials/io/saving_games.html"),
    fileAccess:source("FileAccess class","https://docs.godotengine.org/en/4.7/classes/class_fileaccess.html"),
    dirAccess:source("DirAccess class","https://docs.godotengine.org/en/4.7/classes/class_diraccess.html"),
    config:source("ConfigFile class","https://docs.godotengine.org/en/4.7/classes/class_configfile.html"),
    timer:source("Timer class","https://docs.godotengine.org/en/4.7/classes/class_timer.html"),
    area2d:source("Area2D class","https://docs.godotengine.org/en/4.7/classes/class_area2d.html"),
    area3d:source("Area3D class","https://docs.godotengine.org/en/4.7/classes/class_area3d.html"),
    body2d:source("CharacterBody2D class","https://docs.godotengine.org/en/4.7/classes/class_characterbody2d.html"),
    body3d:source("CharacterBody3D class","https://docs.godotengine.org/en/4.7/classes/class_characterbody3d.html"),
    physics2d:source("Physics introduction","https://docs.godotengine.org/en/4.7/tutorials/physics/physics_introduction.html"),
    rigid2d:source("RigidBody2D class","https://docs.godotengine.org/en/4.7/classes/class_rigidbody2d.html"),
    ray2d:source("RayCast2D class","https://docs.godotengine.org/en/4.7/classes/class_raycast2d.html"),
    ray3d:source("RayCast3D class","https://docs.godotengine.org/en/4.7/classes/class_raycast3d.html"),
    line2d:source("Line2D class","https://docs.godotengine.org/en/4.7/classes/class_line2d.html"),
    tilemap:source("TileMapLayer class","https://docs.godotengine.org/en/4.7/classes/class_tilemaplayer.html"),
    astar:source("AStarGrid2D class","https://docs.godotengine.org/en/4.7/classes/class_astargrid2d.html"),
    path2d:source("PathFollow2D class","https://docs.godotengine.org/en/4.7/classes/class_pathfollow2d.html"),
    navAgents:source("Using NavigationAgents","https://docs.godotengine.org/en/4.7/tutorials/navigation/navigation_using_navigationagents.html"),
    springArm:source("Third-person camera with spring arm","https://docs.godotengine.org/en/4.7/tutorials/3d/spring_arm.html"),
    vehicle:source("VehicleBody3D class","https://docs.godotengine.org/en/4.7/classes/class_vehiclebody3d.html"),
    wheel:source("VehicleWheel3D class","https://docs.godotengine.org/en/4.7/classes/class_vehiclewheel3d.html"),
    random:source("RandomNumberGenerator class","https://docs.godotengine.org/en/4.7/classes/class_randomnumbergenerator.html"),
    tween:source("Tween class","https://docs.godotengine.org/en/4.7/classes/class_tween.html"),
    time:source("Time singleton","https://docs.godotengine.org/en/4.7/classes/class_time.html")
  });

  const file=(path,attachTo,purpose,content,connections=[])=>Object.freeze({
    path,language:"gdscript",attachTo,purpose,connections:Object.freeze(connections),code:dedent(content)
  });

  const recipe=value=>Object.freeze({
    ...value,
    version:VERSION,
    inputActions:Object.freeze(value.inputActions||[]),
    signals:Object.freeze(value.signals||[]),
    visuals:Object.freeze(value.visuals||[]),
    files:Object.freeze(value.files),
    sources:Object.freeze(value.sources)
  });

  const recipes=[
    recipe({
      id:"shared-project-kickoff",section:"shared",category:"Foundation",title:"New project production checklist",
      purpose:"Validate the project structure, required Input Map actions, render settings, collision layers, and autoloads before gameplay code grows around missing foundations.",difficulty:"beginner",
      tags:["project setup","folders","Input Map","autoload","collision layers","version control"],
      nodeTree:["ProjectBootstrap (Node) [main scene during setup]"],
      inputActions:[{name:"move_left / move_right / move_up / move_down",bindings:"Keyboard and controller"},{name:"pause",bindings:"Escape, Start"}],
      inspector:["Temporarily make ProjectBootstrap the main scene.","Add the required actions before running the checker.","Remove the checker from the shipped main scene after every line passes."],
      visuals:["Create icon.svg or icon.png at the project root before the first export.","Use placeholder art in res://art/placeholder/ so temporary files are easy to replace."],
      files:[file("project_bootstrap.gd","ProjectBootstrap (Node)","Reports missing project foundations without changing project settings.",`
        extends Node

        @export var required_actions: Array[StringName] = [
            &"move_left", &"move_right", &"move_up", &"move_down", &"pause"
        ]
        @export var required_autoloads: Array[StringName] = []

        func _ready() -> void:
            var failures: Array[String] = []
            for action in required_actions:
                if not InputMap.has_action(action):
                    failures.append("Missing Input Map action: %s" % action)
            for singleton_name in required_autoloads:
                if get_node_or_null("/root/" + String(singleton_name)) == null:
                    failures.append("Missing autoload: %s" % singleton_name)
            if failures.is_empty():
                print("Project bootstrap checks passed.")
                return
            for failure in failures:
                push_error(failure)
      `)],
      steps:["Create res://scenes, res://scripts, res://art, res://audio, res://data, res://ui, and res://tests.","Create a Git repository and ignore .godot/ before importing large assets.","Choose the renderer and base resolution once, then document the choice in README.md.","Name collision layers before adding bodies.","Create input actions for keyboard, controller, and later mobile controls.","Create a temporary ProjectBootstrap scene, attach the checker, and run until every check passes."],
      tests:["No required action reports missing.","The chosen main scene launches from the editor and an exported debug build.","Window resizing follows the selected stretch policy.","Collision layers have documented names.","A clean clone imports and runs without local-only files."],
      sources:[S.bestPractices,S.nodesScenes,S.inputMap],related:["shared-responsive-ui","shared-autoload-state","shared-scene-router"]
    }),
    recipe({
      id:"shared-multidevice-input",section:"shared",category:"Input",title:"One input layer for keyboard, controller, and touch",
      purpose:"Read named actions in one reusable component so gameplay code does not care which physical device produced movement, aiming, or actions.",difficulty:"beginner",
      tags:["Input","controller","keyboard","touch","actions","deadzone"],
      nodeTree:["InputReader (Node) [autoload or player child]"],
      inputActions:[{name:"move_left / move_right / move_up / move_down",bindings:"WASD, arrows, left stick, VirtualJoystick"},{name:"aim_left / aim_right / aim_up / aim_down",bindings:"Right stick"},{name:"primary_action",bindings:"Mouse 1, controller south, TouchScreenButton"}],
      inspector:["Set consistent deadzones for the four movement directions.","Bind multiple physical inputs to each named action.","Do not read raw key codes inside player or weapon scripts."],
      files:[file("input_reader.gd","InputReader (Node)","Provides normalized movement and aim values to any game system.",`
        class_name InputReader
        extends Node

        func movement() -> Vector2:
            return Input.get_vector(&"move_left", &"move_right", &"move_up", &"move_down")

        func aim() -> Vector2:
            return Input.get_vector(&"aim_left", &"aim_right", &"aim_up", &"aim_down")

        func primary_pressed() -> bool:
            return Input.is_action_just_pressed(&"primary_action")

        func pause_pressed() -> bool:
            return Input.is_action_just_pressed(&"pause")
      `)],
      steps:["Create every named action in Project Settings > Input Map.","Add keyboard and controller events to the same actions.","Create InputReader as a child of the player or an autoload.","Replace direct key checks with calls to movement, aim, primary_pressed, and pause_pressed.","Use the mobile-controls recipe to emit the same actions on phones."],
      tests:["Keyboard and controller produce matching movement vectors.","Diagonal movement stays limited to length one.","Deadzone prevents idle stick drift.","Touch controls require no gameplay-script changes."],
      sources:[S.input,S.inputMap],related:["shared-mobile-controls","2d-top-down-controller","3d-character-controller"]
    }),
    recipe({
      id:"shared-mobile-controls",section:"shared",category:"Input",title:"Phone controls with VirtualJoystick and touch buttons",
      purpose:"Add a responsive touch HUD that drives the same Input Map actions used by keyboard and controllers.",difficulty:"intermediate",
      tags:["mobile","VirtualJoystick","TouchScreenButton","safe area","touch"],
      nodeTree:["MobileControls (CanvasLayer)","  SafeMargin (MarginContainer)","    FullRect (Control)","      MoveStick (VirtualJoystick)","      Primary (TouchScreenButton)","      Secondary (TouchScreenButton)","      Pause (TouchScreenButton)"],
      inputActions:[{name:"move_left / move_right / move_up / move_down",bindings:"MoveStick direction actions"},{name:"primary_action",bindings:"Primary action property"},{name:"secondary_action",bindings:"Secondary action property"},{name:"pause",bindings:"Pause action property"}],
      inspector:["Set MoveStick action_left/right/up/down to the matching Input Map actions.","Set each TouchScreenButton action property.","Set visibility mode to touchscreen only when appropriate.","Give each button a normal texture and a pressed texture with at least a 64 pixel touch target."],
      visuals:["Use four simple high-contrast button textures: stick base, stick tip, primary, and secondary.","Keep gameplay readable beneath the controls by using partially transparent textures."],
      files:[file("mobile_controls.gd","MobileControls (CanvasLayer)","Shows touch controls on mobile and applies a minimum safe margin.",`
        extends CanvasLayer

        @export var force_visible_in_editor: bool = true
        @export var minimum_margin: int = 16
        @onready var safe_margin: MarginContainer = $SafeMargin

        func _ready() -> void:
            visible = OS.has_feature("mobile") or (Engine.is_editor_hint() and force_visible_in_editor)
            get_viewport().size_changed.connect(_apply_safe_area)
            _apply_safe_area()

        func _apply_safe_area() -> void:
            var safe_area := DisplayServer.get_display_safe_area()
            var viewport_size := Vector2i(get_viewport().get_visible_rect().size)
            var left := maxi(safe_area.position.x, minimum_margin)
            var top := maxi(safe_area.position.y, minimum_margin)
            var right := maxi(viewport_size.x - safe_area.end.x, minimum_margin)
            var bottom := maxi(viewport_size.y - safe_area.end.y, minimum_margin)
            safe_margin.add_theme_constant_override("margin_left", left)
            safe_margin.add_theme_constant_override("margin_top", top)
            safe_margin.add_theme_constant_override("margin_right", right)
            safe_margin.add_theme_constant_override("margin_bottom", bottom)
      `)],
      steps:["Finish the keyboard and controller Input Map first.","Add the CanvasLayer and Full Rect Control hierarchy.","Add VirtualJoystick and assign its four direction actions.","Add TouchScreenButton nodes and assign their action properties.","Anchor the stick bottom-left and action buttons bottom-right.","Attach the script, enable mouse-to-touch emulation for desktop testing, and verify on a real phone."],
      tests:["The stick drives the same movement actions as keyboard input.","Two simultaneous touches work, allowing movement and action together.","Buttons remain outside notches and rounded screen corners.","Controls hide on desktop exports unless explicitly forced."],
      sources:[S.virtualJoystick,S.touchButton,S.input,S.display],related:["shared-multidevice-input","shared-screen-scaling","shared-responsive-ui"]
    }),
    recipe({
      id:"shared-screen-scaling",section:"shared",category:"UI",title:"Screen scaling, aspect ratios, and safe areas",
      purpose:"Configure one deliberate base resolution and keep HUD content readable across desktop, ultrawide, tablets, and phones.",difficulty:"beginner",
      tags:["resolution","stretch","safe area","anchors","responsive","pixel art"],
      nodeTree:["HUD (Control) [Full Rect]","  SafeMargin (MarginContainer)","    MainLayout (VBoxContainer)"],
      inputActions:[],
      inspector:["For high-resolution 2D or 3D, start at 1280 by 720 with canvas_items and expand.","For pixel art, choose a smaller integer-friendly base size, viewport stretch, keep or expand, and integer scale mode.","Use Containers and anchors rather than fixed Control positions."],
      visuals:["Import pixel art with nearest filtering and design at one pixels-per-unit convention.","Prepare UI icons at enough resolution for the largest supported display."],
      files:[file("safe_area_hud.gd","HUD (Control)","Converts the platform safe display rectangle into Control offsets.",`
        extends Control

        @onready var safe_margin: MarginContainer = $SafeMargin

        func _ready() -> void:
            set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
            get_viewport().size_changed.connect(_apply_layout)
            _apply_layout()

        func _apply_layout() -> void:
            var viewport_size := get_viewport_rect().size
            var safe := DisplayServer.get_display_safe_area()
            var screen_size := DisplayServer.screen_get_size()
            if screen_size.x <= 0 or screen_size.y <= 0:
                return
            var scale_factor := viewport_size / Vector2(screen_size)
            var left := roundi(safe.position.x * scale_factor.x)
            var top := roundi(safe.position.y * scale_factor.y)
            var right := roundi((screen_size.x - safe.end.x) * scale_factor.x)
            var bottom := roundi((screen_size.y - safe.end.y) * scale_factor.y)
            safe_margin.add_theme_constant_override("margin_left", maxi(left, 8))
            safe_margin.add_theme_constant_override("margin_top", maxi(top, 8))
            safe_margin.add_theme_constant_override("margin_right", maxi(right, 8))
            safe_margin.add_theme_constant_override("margin_bottom", maxi(bottom, 8))
      `)],
      steps:["Choose the smallest supported aspect ratio and base resolution before making final art.","Set Display > Window viewport width and height.","Choose canvas_items for flexible high-resolution rendering or viewport plus integer scaling for pixel art.","Set stretch aspect to expand when supporting tall and wide devices.","Build HUDs with Containers and Full Rect anchors.","Attach the safe-area script and test every target size."],
      tests:["16:9, 16:10, 4:3, ultrawide, and tall-phone previews remain usable.","No essential control sits under a notch or system gesture area.","Pixel art has no uneven scaling when integer mode is selected.","The camera reveals intentional extra space rather than UI overlap on expanded aspects."],
      sources:[S.resolutions,S.anchors,S.display],related:["shared-responsive-ui","shared-mobile-controls","shared-project-kickoff"]
    }),
    recipe({
      id:"shared-save-slots-autosave",section:"shared",category:"Persistence",title:"Save slots, autosaves, and rotating backups",
      purpose:"Store versioned JSON save slots, create a backup before replacement, and separate manual saves from autosaves.",difficulty:"advanced",
      tags:["save slots","autosave","backup","FileAccess","JSON","versioning"],
      nodeTree:["SaveSlots (Node) [autoload]","AutosaveTimer (Timer) [optional scene child]"],
      inputActions:[{name:"quick_save",bindings:"F5 or menu button"}],
      inspector:["Add SaveSlots as an autoload named SaveSlots.","Call save_slot only from a safe point where world state is consistent.","Keep an explicit schema version and write migration code before changing saved fields."],
      signals:[{from:"SaveSlots",signal:"save_finished(slot, success)",to:"HUD",method:"show_save_result",why:"Show success or failure without coupling storage to UI."}],
      files:[file("save_slots.gd","SaveSlots (Node autoload)","Writes, loads, backs up, and lists versioned JSON slots.",`
        extends Node

        signal save_finished(slot: String, success: bool)

        const SAVE_VERSION := 1
        const SAVE_DIR := "user://saves"

        func _ready() -> void:
            DirAccess.make_dir_recursive_absolute(SAVE_DIR)

        func save_slot(slot: String, payload: Dictionary) -> bool:
            var safe_slot := slot.validate_filename()
            var path := "%s/%s.json" % [SAVE_DIR, safe_slot]
            var backup := "%s/%s.backup.json" % [SAVE_DIR, safe_slot]
            if FileAccess.file_exists(path):
                DirAccess.copy_absolute(path, backup)
            var document := {
                "version": SAVE_VERSION,
                "saved_at": Time.get_datetime_string_from_system(true),
                "payload": payload
            }
            var handle := FileAccess.open(path, FileAccess.WRITE)
            if handle == null:
                save_finished.emit(safe_slot, false)
                return false
            handle.store_string(JSON.stringify(document, "  "))
            save_finished.emit(safe_slot, true)
            return true

        func load_slot(slot: String) -> Dictionary:
            var path := "%s/%s.json" % [SAVE_DIR, slot.validate_filename()]
            if not FileAccess.file_exists(path):
                return {}
            var handle := FileAccess.open(path, FileAccess.READ)
            if handle == null:
                return {}
            var value = JSON.parse_string(handle.get_as_text())
            if value is not Dictionary or value.get("version", -1) != SAVE_VERSION:
                return {}
            return value.get("payload", {}) as Dictionary

        func autosave(payload: Dictionary) -> bool:
            return save_slot("autosave", payload)

        func list_slots() -> PackedStringArray:
            var names := PackedStringArray()
            for filename in DirAccess.get_files_at(SAVE_DIR):
                if filename.ends_with(".json") and not filename.ends_with(".backup.json"):
                    names.append(filename.trim_suffix(".json"))
            return names
      `)],
      steps:["Define one Dictionary-producing function on the game state that contains only saveable values.","Add SaveSlots as an autoload and create the save_finished HUD connection.","Use slot names such as slot_1, slot_2, and autosave.","Trigger autosave after a checkpoint, day transition, completed purchase, or level return, not every frame.","Load into a clean world before applying the payload.","Increment SAVE_VERSION only after adding a migration path or intentionally invalidating old saves."],
      tests:["Three manual slots remain independent.","Autosave never overwrites a manual slot.","Replacing a slot leaves a readable backup.","Malformed JSON returns an empty Dictionary without crashing.","An unknown schema version is rejected."],
      sources:[S.save,S.fileAccess,S.dirAccess,S.time],related:["shared-json-save","shared-settings-config","shared-autoload-state"]
    }),
    recipe({
      id:"shared-settings-config",section:"shared",category:"Persistence",title:"Settings file with ConfigFile",
      purpose:"Persist audio, display, accessibility, and control preferences separately from save-game progression.",difficulty:"beginner",
      tags:["ConfigFile","settings","audio","accessibility","preferences"],
      nodeTree:["Settings (Node) [autoload]","SettingsMenu (Control)"],
      inputActions:[],
      inspector:["Add Settings as an autoload.","Apply loaded values before the first gameplay scene appears.","Store remappable input bindings separately if they need serialized InputEvent values."],
      signals:[{from:"SettingsMenu",signal:"value_changed",to:"Settings",method:"set_value",why:"Update and persist the selected preference."}],
      files:[file("settings_store.gd","Settings (Node autoload)","Loads defaults and persists settings in an INI-style ConfigFile.",`
        extends Node

        signal setting_changed(section: String, key: String, value: Variant)

        const PATH := "user://settings.cfg"
        var config := ConfigFile.new()

        func _ready() -> void:
            config.load(PATH)

        func get_value(section: String, key: String, fallback: Variant) -> Variant:
            return config.get_value(section, key, fallback)

        func set_value(section: String, key: String, value: Variant) -> Error:
            config.set_value(section, key, value)
            var error := config.save(PATH)
            if error == OK:
                setting_changed.emit(section, key, value)
            return error

        func reset_section(section: String) -> Error:
            if config.has_section(section):
                config.erase_section(section)
            return config.save(PATH)
      `)],
      steps:["List every setting and its default before building the menu.","Add SettingsStore as an autoload.","Read with a fallback so first launch never needs a pre-existing file.","Apply audio and display settings immediately when changed.","Provide per-section reset buttons and a full reset confirmation."],
      tests:["First launch uses defaults.","Changed values survive a restart.","A missing key falls back safely.","Resetting one section leaves other sections intact."],
      sources:[S.config,S.save,S.signals],related:["shared-audio-settings","shared-save-slots-autosave","shared-responsive-ui"]
    }),
    recipe({
      id:"shared-experience-levels",section:"shared",category:"Progression",title:"Experience and multi-level progression component",
      purpose:"Accumulate experience, handle gaining several levels from one reward, and emit UI-friendly progress signals.",difficulty:"beginner",
      tags:["experience","level up","progression","signals","component"],
      nodeTree:["Actor (Node2D or Node3D)","  Experience (Node)"],
      inputActions:[],
      inspector:["Attach experience_component.gd to Experience.","Set Base Requirement and Growth to tune the curve.","Connect level_gained to upgrade selection or stat growth."],
      signals:[{from:"Experience",signal:"progress_changed(level, current, required)",to:"HUD",method:"update_experience_bar",why:"Keep UI separate from progression rules."},{from:"Experience",signal:"level_gained(level)",to:"UpgradeMenu",method:"open_for_level",why:"Offer an upgrade after each gained level."}],
      files:[file("experience_component.gd","Experience (Node)","Owns experience totals and level thresholds.",`
        class_name ExperienceComponent
        extends Node

        signal progress_changed(level: int, current: int, required: int)
        signal level_gained(level: int)

        @export var base_requirement: int = 10
        @export var growth: float = 1.35
        var level: int = 1
        var experience: int = 0

        func add_experience(amount: int) -> void:
            experience += maxi(amount, 0)
            while experience >= required_for_next_level():
                experience -= required_for_next_level()
                level += 1
                level_gained.emit(level)
            progress_changed.emit(level, experience, required_for_next_level())

        func required_for_next_level() -> int:
            return maxi(1, roundi(base_requirement * pow(growth, level - 1)))

        func save_data() -> Dictionary:
            return {"level": level, "experience": experience}

        func load_data(data: Dictionary) -> void:
            level = maxi(int(data.get("level", 1)), 1)
            experience = maxi(int(data.get("experience", 0)), 0)
            progress_changed.emit(level, experience, required_for_next_level())
      `)],
      steps:["Add an Experience Node below the player or persistent profile.","Attach the component and tune the curve using a spreadsheet or small test scene.","Connect enemy rewards or quest rewards to add_experience.","Connect progress_changed to the HUD.","Connect level_gained to stat growth or the upgrade-offers recipe.","Include save_data in the selected save slot."],
      tests:["Negative rewards do not reduce experience.","A large reward can grant multiple levels.","The remainder carries into the next level.","Save and load reproduce the same level and progress."],
      sources:[S.signals,S.gdscript],related:["shared-upgrade-offers","shared-save-slots-autosave","2d-xp-magnet"]
    }),
    recipe({
      id:"shared-item-inventory",section:"shared",category:"Inventory",title:"Resource-driven item inventory and stacks",
      purpose:"Define items as reusable Resources and store stack counts independently from UI or world pickups.",difficulty:"intermediate",
      tags:["inventory","Resource","items","stacks","data driven"],
      nodeTree:["Inventory (Node)","InventoryUI (Control) [optional]","Item resources (*.tres)"],
      inputActions:[{name:"inventory",bindings:"Tab, controller select, touch button"}],
      inspector:["Create ItemDefinition resources in res://data/items/.","Use a stable ID that never changes after saves ship.","Assign icon textures to the resources, not inventory code."],
      signals:[{from:"Inventory",signal:"changed",to:"InventoryUI",method:"refresh",why:"Refresh slots only after data changes."}],
      files:[
        file("item_definition.gd","ItemDefinition resource script","Defines immutable item metadata shared by pickups, shops, and inventory UI.",`
          class_name ItemDefinition
          extends Resource

          @export var id: StringName
          @export var display_name: String
          @export_multiline var description: String
          @export var icon: Texture2D
          @export_range(1, 999, 1) var max_stack: int = 99
          @export var sell_value: int = 0
        `),
        file("inventory.gd","Inventory (Node)","Stores item Resources and quantities with add and remove validation.",`
          class_name Inventory
          extends Node

          signal changed
          signal item_added(item: ItemDefinition, amount: int)

          @export var capacity: int = 24
          var stacks: Dictionary = {}

          func add(item: ItemDefinition, amount: int = 1) -> int:
              if item == null or amount <= 0:
                  return amount
              var current := int(stacks.get(item.id, 0))
              if current == 0 and stacks.size() >= capacity:
                  return amount
              var accepted := mini(amount, item.max_stack - current)
              stacks[item.id] = current + accepted
              item_added.emit(item, accepted)
              changed.emit()
              return amount - accepted

          func remove(item_id: StringName, amount: int = 1) -> bool:
              var current := int(stacks.get(item_id, 0))
              if amount <= 0 or current < amount:
                  return false
              current -= amount
              if current == 0:
                  stacks.erase(item_id)
              else:
                  stacks[item_id] = current
              changed.emit()
              return true

          func quantity(item_id: StringName) -> int:
              return int(stacks.get(item_id, 0))

          func save_data() -> Dictionary:
              return stacks.duplicate(true)

          func load_data(data: Dictionary) -> void:
              stacks = data.duplicate(true)
              changed.emit()
        `)
      ],
      steps:["Create item_definition.gd and use the Inspector to create one .tres file per item type.","Add Inventory to the player or persistent profile and attach inventory.gd.","Give every item a permanent lowercase ID.","World pickups call add and only disappear when the remainder is zero.","Inventory UI listens to changed and reads quantities.","Save only IDs and amounts, then resolve icons and descriptions from the resource catalogue after loading."],
      tests:["New items consume one inventory slot.","Stacks stop at max_stack and return the remainder.","Removing the final item erases the stack.","Capacity blocks only new item types, not additions to existing stacks.","Saved stacks load without serializing textures."],
      sources:[S.resources,S.resourceClass,S.signals],related:["shared-weapon-data-loadout","2d-tool-backpack","2d-crafting"]
    }),
    recipe({
      id:"shared-weapon-data-loadout",section:"shared",category:"Weapons",title:"Data-driven weapons and loadout slots",
      purpose:"Add weapons by creating Resource files instead of adding a new branch to one oversized player script.",difficulty:"intermediate",
      tags:["weapons","loadout","Resource","PackedScene","data driven","inventory"],
      nodeTree:["WeaponLoadout (Node)","  ActiveWeapons (Node)","Weapon scenes (*.tscn)","WeaponDefinition resources (*.tres)"],
      inputActions:[{name:"primary_action",bindings:"Mouse 1, controller trigger, touch button"}],
      inspector:["Create one WeaponDefinition .tres per weapon.","Assign each weapon's PackedScene, icon, cooldown, damage, range, and tags.","Set Max Slots to the number of simultaneous weapons your game allows."],
      signals:[{from:"WeaponLoadout",signal:"loadout_changed",to:"WeaponHUD",method:"refresh",why:"Update slot icons after an equip or removal."}],
      files:[
        file("weapon_definition.gd","WeaponDefinition resource script","Defines reusable weapon data without spawning gameplay nodes.",`
          class_name WeaponDefinition
          extends Resource

          @export var id: StringName
          @export var display_name: String
          @export var icon: Texture2D
          @export var scene: PackedScene
          @export var damage: float = 1.0
          @export var cooldown: float = 0.5
          @export var range: float = 400.0
          @export var tags: Array[StringName] = []
        `),
        file("weapon_loadout.gd","WeaponLoadout (Node)","Instantiates equipped weapon scenes and provides one stable add-weapon API.",`
          class_name WeaponLoadout
          extends Node

          signal loadout_changed
          signal weapon_equipped(slot: int, definition: WeaponDefinition)

          @export_range(1, 12, 1) var max_slots: int = 6
          @onready var active_weapons: Node = $ActiveWeapons
          var definitions: Array[WeaponDefinition] = []
          var instances: Array[Node] = []

          func equip(definition: WeaponDefinition) -> bool:
              if definition == null or definition.scene == null:
                  return false
              if definitions.size() >= max_slots:
                  return false
              var weapon := definition.scene.instantiate()
              active_weapons.add_child(weapon)
              if weapon.has_method("configure"):
                  weapon.call("configure", definition)
              definitions.append(definition)
              instances.append(weapon)
              weapon_equipped.emit(definitions.size() - 1, definition)
              loadout_changed.emit()
              return true

          func replace(slot: int, definition: WeaponDefinition) -> bool:
              if slot < 0 or slot >= definitions.size() or definition == null or definition.scene == null:
                  return false
              instances[slot].queue_free()
              var weapon := definition.scene.instantiate()
              active_weapons.add_child(weapon)
              if weapon.has_method("configure"):
                  weapon.call("configure", definition)
              definitions[slot] = definition
              instances[slot] = weapon
              weapon_equipped.emit(slot, definition)
              loadout_changed.emit()
              return true

          func definition_at(slot: int) -> WeaponDefinition:
              return definitions[slot] if slot >= 0 and slot < definitions.size() else null
        `)
      ],
      steps:["Create weapon_definition.gd and save a .tres resource for the first weapon.","Build that weapon as a separate scene whose root script implements configure(definition).","Add WeaponLoadout and its ActiveWeapons child to the player.","Assign max slots and attach weapon_loadout.gd.","Call equip(resource) from pickups, shops, or starting-loadout code.","Duplicate the .tres and weapon scene to add another weapon without editing the loadout."],
      tests:["A valid weapon creates one scene below ActiveWeapons.","An unassigned scene is rejected.","The slot limit cannot be exceeded.","Replacing a slot frees the old instance and configures the new one.","HUD signals contain the correct slot and resource."],
      sources:[S.resources,S.packedScene,S.signals],related:["shared-weapon-wheel","2d-arena-weapon-manager","3d-auto-weapon"]
    }),
    recipe({
      id:"shared-weapon-wheel",section:"shared",category:"Weapons",title:"Pause-safe radial weapon wheel",
      purpose:"Select an equipped weapon with mouse, stick, or touch while the game is paused, then resume with one active slot.",difficulty:"advanced",
      tags:["weapon wheel","radial menu","pause","controller","inventory"],
      nodeTree:["WeaponWheel (Control) [Full Rect, hidden]","  Center (Control)","    SlotButtons (Control children)"],
      inputActions:[{name:"weapon_wheel",bindings:"Q, controller bumper, touch hold"},{name:"aim_left / aim_right / aim_up / aim_down",bindings:"Right stick"}],
      inspector:["Set WeaponWheel Process Mode to When Paused.","Arrange one Button per supported slot around Center.","Assign the WeaponLoadout reference."],
      signals:[{from:"WeaponWheel slot Button",signal:"pressed",to:"WeaponWheel",method:"select_slot",why:"Select a slot from mouse or touch."},{from:"WeaponWheel",signal:"slot_selected(index)",to:"PlayerWeaponController",method:"activate_slot",why:"Keep the radial UI separate from weapon activation."}],
      files:[file("weapon_wheel.gd","WeaponWheel (Control)","Pauses, highlights a radial slot, emits the selection, and resumes.",`
        class_name WeaponWheel
        extends Control

        signal slot_selected(index: int)

        @export var slot_buttons: Array[Button] = []
        @export var stick_deadzone: float = 0.35
        var highlighted: int = -1

        func _ready() -> void:
            process_mode = Node.PROCESS_MODE_WHEN_PAUSED
            hide()
            for index in range(slot_buttons.size()):
                slot_buttons[index].pressed.connect(select_slot.bind(index))

        func _unhandled_input(event: InputEvent) -> void:
            if event.is_action_pressed(&"weapon_wheel"):
                open_wheel()
                get_viewport().set_input_as_handled()
            elif event.is_action_released(&"weapon_wheel") and visible:
                close_wheel(true)
                get_viewport().set_input_as_handled()

        func _process(_delta: float) -> void:
            if not visible or slot_buttons.is_empty():
                return
            var direction := Input.get_vector(&"aim_left", &"aim_right", &"aim_up", &"aim_down")
            if direction.length() < stick_deadzone:
                direction = get_local_mouse_position() - size * 0.5
            if direction.length() < 8.0:
                return
            var angle := fposmod(direction.angle() + PI * 0.5, TAU)
            highlighted = mini(floori(angle / TAU * slot_buttons.size()), slot_buttons.size() - 1)
            slot_buttons[highlighted].grab_focus()

        func open_wheel() -> void:
            show()
            get_tree().paused = true

        func close_wheel(confirm: bool) -> void:
            if confirm and highlighted >= 0:
                slot_selected.emit(highlighted)
            hide()
            get_tree().paused = false

        func select_slot(index: int) -> void:
            highlighted = index
            close_wheel(true)
      `)],
      steps:["Finish the weapon-data-loadout recipe first.","Create a Full Rect Control that remains hidden outside selection.","Add and position one Button for each loadout slot.","Assign the Buttons array in clockwise order starting at the top.","Attach the script and verify Process Mode changes to When Paused.","Connect slot_selected to the weapon controller's activate_slot method."],
      tests:["Holding the action pauses gameplay but keeps the wheel responsive.","Mouse and right stick highlight the expected radial segment.","Releasing confirms exactly one slot.","Touching a button selects and resumes.","Closing without a highlighted segment preserves the prior weapon."],
      sources:[S.input,S.signals,S.anchors],related:["shared-weapon-data-loadout","shared-pause-menu","shared-item-inventory"]
    }),
    recipe({
      id:"shared-upgrade-offers",section:"shared",category:"Progression",title:"Weighted level-up upgrade offers",
      purpose:"Roll unique upgrade choices, enforce maximum ranks, and pass selected modifiers to the player without hardcoding menu cards.",difficulty:"advanced",
      tags:["upgrades","level up","random choice","Resource","roguelite"],
      nodeTree:["UpgradePicker (Node)","UpgradeMenu (Control)","UpgradeDefinition resources (*.tres)"],
      inputActions:[],
      inspector:["Create one UpgradeDefinition .tres per upgrade.","Assign the complete catalogue to UpgradePicker.","Connect Experience.level_gained to offer."],
      signals:[{from:"Experience",signal:"level_gained",to:"UpgradePicker",method:"offer",why:"Roll an offer for every new level."},{from:"UpgradePicker",signal:"offers_ready(choices)",to:"UpgradeMenu",method:"show_choices",why:"Render data without owning roll rules."},{from:"UpgradeMenu",signal:"chosen(definition)",to:"UpgradePicker",method:"choose",why:"Apply and record the selected rank."}],
      files:[
        file("upgrade_definition.gd","UpgradeDefinition resource script","Stores one upgrade card and its modifiers.",`
          class_name UpgradeDefinition
          extends Resource

          @export var id: StringName
          @export var title: String
          @export_multiline var description: String
          @export var icon: Texture2D
          @export_range(1, 99, 1) var max_rank: int = 5
          @export_range(0.01, 100.0, 0.01) var weight: float = 1.0
          @export var modifiers: Dictionary = {}
        `),
        file("upgrade_picker.gd","UpgradePicker (Node)","Rolls unique eligible upgrades and applies a selected modifier dictionary.",`
          class_name UpgradePicker
          extends Node

          signal offers_ready(choices: Array[UpgradeDefinition])
          signal upgrade_chosen(definition: UpgradeDefinition, new_rank: int)

          @export var catalogue: Array[UpgradeDefinition] = []
          @export_range(1, 6, 1) var choice_count: int = 3
          @export var target: Node
          var ranks: Dictionary = {}
          var current_offers: Array[UpgradeDefinition] = []
          var rng := RandomNumberGenerator.new()

          func offer(_level: int = 0) -> void:
              var pool: Array[UpgradeDefinition] = []
              for definition in catalogue:
                  if definition != null and int(ranks.get(definition.id, 0)) < definition.max_rank:
                      pool.append(definition)
              current_offers.clear()
              while not pool.is_empty() and current_offers.size() < choice_count:
                  var selected := _weighted_pick(pool)
                  current_offers.append(selected)
                  pool.erase(selected)
              offers_ready.emit(current_offers)

          func choose(definition: UpgradeDefinition) -> bool:
              if definition == null or not current_offers.has(definition):
                  return false
              var rank := int(ranks.get(definition.id, 0)) + 1
              ranks[definition.id] = rank
              if target != null and target.has_method("apply_upgrade"):
                  target.call("apply_upgrade", definition.modifiers)
              current_offers.clear()
              upgrade_chosen.emit(definition, rank)
              return true

          func _weighted_pick(pool: Array[UpgradeDefinition]) -> UpgradeDefinition:
              var total := 0.0
              for definition in pool:
                  total += definition.weight
              var roll := rng.randf_range(0.0, total)
              for definition in pool:
                  roll -= definition.weight
                  if roll <= 0.0:
                      return definition
              return pool.back()
        `)
      ],
      steps:["Create upgrade_definition.gd and several .tres upgrades with stable IDs.","Use modifier keys your player apply_upgrade method understands.","Add UpgradePicker, assign its catalogue, target, and choice count.","Connect level_gained to offer.","Build UpgradeMenu cards from offers_ready and send the selected resource back to choose.","Pause only through the menu layer so UpgradePicker remains reusable."],
      tests:["One offer never contains duplicate upgrades.","Max-rank upgrades disappear from future rolls.","Weights change frequency without making any positive-weight item impossible.","A definition not in the current offer is rejected.","One selection applies one rank and clears the offer."],
      sources:[S.resources,S.random,S.signals],related:["shared-experience-levels","shared-weighted-loot","2d-wave-shop-loop"]
    }),
    recipe({
      id:"shared-weighted-loot",section:"shared",category:"Progression",title:"Weighted loot table Resource",
      purpose:"Roll reproducible weighted drops from editor-authored Resource entries with optional empty results.",difficulty:"intermediate",
      tags:["loot","weighted random","drops","Resource","RNG"],
      nodeTree:["LootTable resources (*.tres)","LootEntry resources [nested or external]"],
      inputActions:[],
      inspector:["Create LootEntry resources and assign item IDs, weights, and quantity ranges.","Set Empty Weight when a roll may intentionally return nothing.","Inject a run seed for reproducible procedural tests."],
      files:[
        file("loot_entry.gd","LootEntry resource script","Defines one weighted outcome and quantity range.",`
          class_name LootEntry
          extends Resource

          @export var item_id: StringName
          @export_range(0.0, 10000.0, 0.01) var weight: float = 1.0
          @export var minimum: int = 1
          @export var maximum: int = 1
        `),
        file("loot_table.gd","LootTable resource script","Rolls one entry using an optional shared RandomNumberGenerator.",`
          class_name LootTable
          extends Resource

          @export var entries: Array[LootEntry] = []
          @export_range(0.0, 10000.0, 0.01) var empty_weight: float = 0.0

          func roll(rng: RandomNumberGenerator = null) -> Dictionary:
              var generator := rng if rng != null else RandomNumberGenerator.new()
              var total := empty_weight
              for entry in entries:
                  if entry != null:
                      total += maxf(entry.weight, 0.0)
              if total <= 0.0:
                  return {}
              var value := generator.randf_range(0.0, total)
              if value <= empty_weight:
                  return {}
              value -= empty_weight
              for entry in entries:
                  if entry == null:
                      continue
                  value -= maxf(entry.weight, 0.0)
                  if value <= 0.0:
                      return {
                          "item_id": entry.item_id,
                          "amount": generator.randi_range(mini(entry.minimum, entry.maximum), maxi(entry.minimum, entry.maximum))
                      }
              return {}
        `)
      ],
      steps:["Create the two Resource scripts.","Create one LootTable .tres for each enemy, chest, fish pool, or encounter table.","Add LootEntry subresources and stable item IDs.","Use a shared seeded RandomNumberGenerator when a run must be reproducible.","Resolve the returned item ID through the item catalogue before adding it to inventory."],
      tests:["Zero total weight returns an empty result.","Empty weight produces intentional no-drop outcomes.","Quantity always remains inside its configured range.","The same seed and call sequence reproduce the same results.","Null entries are ignored safely."],
      sources:[S.resources,S.random],related:["shared-item-inventory","shared-upgrade-offers","2d-safari-capture"]
    }),
    recipe({
      id:"shared-day-clock",section:"shared",category:"Simulation",title:"Calendar and accelerated day clock",
      purpose:"Advance minutes, hours, and days from one authoritative clock and let farms, NPCs, shops, and lighting subscribe by signal.",difficulty:"intermediate",
      tags:["time","day night","calendar","simulation","signals"],
      nodeTree:["GameClock (Node) [autoload or world child]"],
      inputActions:[],
      inspector:["Set Real Seconds Per Game Minute for the desired day length.","Pause the clock during menus or cutscenes by disabling processing.","Save day, hour, minute, and the fractional accumulator."],
      signals:[{from:"GameClock",signal:"minute_changed(day, hour, minute)",to:"ClockHUD",method:"refresh",why:"Display current time."},{from:"GameClock",signal:"day_started(day)",to:"CropManager",method:"advance_day",why:"Grow crops once per new day."}],
      files:[file("game_clock.gd","GameClock (Node)","Advances calendar time and emits coarse-grained simulation events.",`
        class_name GameClock
        extends Node

        signal minute_changed(day: int, hour: int, minute: int)
        signal hour_changed(day: int, hour: int)
        signal day_started(day: int)

        @export_range(0.01, 60.0, 0.01) var real_seconds_per_game_minute: float = 0.75
        @export_range(0, 23, 1) var starting_hour: int = 6
        var day: int = 1
        var hour: int
        var minute: int = 0
        var accumulator: float = 0.0

        func _ready() -> void:
            hour = starting_hour
            minute_changed.emit(day, hour, minute)

        func _process(delta: float) -> void:
            accumulator += delta
            while accumulator >= real_seconds_per_game_minute:
                accumulator -= real_seconds_per_game_minute
                _advance_minute()

        func _advance_minute() -> void:
            minute += 1
            if minute >= 60:
                minute = 0
                hour += 1
                if hour >= 24:
                    hour = 0
                    day += 1
                    day_started.emit(day)
                hour_changed.emit(day, hour)
            minute_changed.emit(day, hour, minute)

        func set_time(new_day: int, new_hour: int, new_minute: int) -> void:
            day = maxi(new_day, 1)
            hour = clampi(new_hour, 0, 23)
            minute = clampi(new_minute, 0, 59)
            minute_changed.emit(day, hour, minute)
      `)],
      steps:["Decide the real-time length of one full game day.","Add GameClock to the persistent world or autoload list.","Connect the HUD to minute_changed.","Connect expensive systems to hour_changed or day_started instead of every frame.","Disable processing while time should stop.","Save and restore the complete clock state."],
      tests:["Minutes roll into hours at 60.","Hour 23 rolls into a new day.","Large delta values catch up through multiple minutes.","Paused processing stops time.","Loaded time immediately refreshes listeners."],
      sources:[S.signals,S.gdscript],related:["2d-crop-grid","2d-npc-schedule-relationship","shared-save-slots-autosave"]
    }),
    recipe({
      id:"shared-mission-system",section:"shared",category:"Game Flow",title:"Data-driven multi-step mission system",
      purpose:"Track ordered mission objectives, prerequisites, rewards, and completion signals without embedding mission logic in NPC scripts.",difficulty:"advanced",
      tags:["missions","quests","objectives","Resource","signals","open world"],
      nodeTree:["MissionManager (Node) [autoload]","MissionDefinition resources (*.tres)","MissionHUD (Control)"],
      inputActions:[],
      inspector:["Create one MissionDefinition .tres per mission.","Use stable IDs and ordered objective IDs.","Register definitions at startup before loading progress."],
      signals:[{from:"Gameplay systems",signal:"objective event",to:"MissionManager",method:"report_objective",why:"Advance only matching active objectives."},{from:"MissionManager",signal:"mission_updated",to:"MissionHUD",method:"refresh",why:"Display current objective text."}],
      files:[
        file("mission_definition.gd","MissionDefinition resource script","Stores mission metadata and ordered objective IDs.",`
          class_name MissionDefinition
          extends Resource

          @export var id: StringName
          @export var title: String
          @export_multiline var description: String
          @export var objectives: Array[StringName] = []
          @export var prerequisite_ids: Array[StringName] = []
          @export var reward: Dictionary = {}
        `),
        file("mission_manager.gd","MissionManager (Node autoload)","Starts eligible missions and advances matching objective events.",`
          extends Node

          signal mission_started(id: StringName)
          signal mission_updated(id: StringName, objective_index: int)
          signal mission_completed(id: StringName, reward: Dictionary)

          @export var catalogue: Array[MissionDefinition] = []
          var active: Dictionary = {}
          var completed: Array[StringName] = []

          func start_mission(id: StringName) -> bool:
              var definition := get_definition(id)
              if definition == null or active.has(id) or completed.has(id):
                  return false
              for prerequisite in definition.prerequisite_ids:
                  if not completed.has(prerequisite):
                      return false
              active[id] = 0
              mission_started.emit(id)
              mission_updated.emit(id, 0)
              return true

          func report_objective(objective_id: StringName) -> void:
              for id in active.keys().duplicate():
                  var definition := get_definition(id)
                  var index := int(active[id])
                  if definition != null and index < definition.objectives.size() and definition.objectives[index] == objective_id:
                      index += 1
                      if index >= definition.objectives.size():
                          active.erase(id)
                          completed.append(id)
                          mission_completed.emit(id, definition.reward)
                      else:
                          active[id] = index
                          mission_updated.emit(id, index)

          func get_definition(id: StringName) -> MissionDefinition:
              for definition in catalogue:
                  if definition != null and definition.id == id:
                      return definition
              return null
        `)
      ],
      steps:["Write each mission as a short ordered objective list before creating resources.","Create MissionDefinition resources and permanent IDs.","Add MissionManager as an autoload and assign the catalogue.","NPC dialogue starts missions by ID.","Collectibles, zones, combat, races, and cutscenes report objective IDs when completed.","Connect mission_completed to rewards and autosave."],
      tests:["Prerequisites block locked missions.","Unrelated objective events change nothing.","Objectives advance only in order.","Completion emits the configured reward once.","Active and completed IDs serialize into a save slot."],
      sources:[S.resources,S.signals,S.gdscript],related:["3d-objective-marker","3d-wanted-heat","shared-save-slots-autosave"]
    }),
    recipe({
      id:"shared-incremental-economy",section:"shared",category:"Simulation",title:"Incremental production and exponential costs",
      purpose:"Model click income, automatic producers, bulk purchases, and exponentially rising costs with one deterministic economy node.",difficulty:"intermediate",
      tags:["incremental","idle","production","economy","exponential cost"],
      nodeTree:["Economy (Node)","EconomyUI (Control)"],
      inputActions:[{name:"primary_action",bindings:"Mouse, controller, touch"}],
      inspector:["Keep economy values as float for very large magnitudes.","Define producers in data before creating buttons.","Use compact number formatting only in UI, never in saved values."],
      signals:[{from:"Economy",signal:"changed(currency, per_second)",to:"EconomyUI",method:"refresh",why:"Update labels after ticks and purchases."}],
      files:[file("incremental_economy.gd","Economy (Node)","Accumulates click and passive income and prices producer purchases.",`
        class_name IncrementalEconomy
        extends Node

        signal changed(currency: float, per_second: float)

        @export var click_value: float = 1.0
        var currency: float = 0.0
        var producers: Dictionary = {
            &"cursor": {"count": 0, "base_cost": 15.0, "rate": 0.1, "growth": 1.15}
        }

        func _process(delta: float) -> void:
            var income := production_per_second()
            currency += income * delta
            changed.emit(currency, income)

        func click() -> void:
            currency += click_value
            changed.emit(currency, production_per_second())

        func production_per_second() -> float:
            var total := 0.0
            for producer in producers.values():
                total += float(producer.count) * float(producer.rate)
            return total

        func next_cost(id: StringName) -> float:
            if not producers.has(id):
                return INF
            var producer: Dictionary = producers[id]
            return float(producer.base_cost) * pow(float(producer.growth), int(producer.count))

        func buy(id: StringName) -> bool:
            var cost := next_cost(id)
            if currency < cost or not producers.has(id):
                return false
            currency -= cost
            producers[id].count = int(producers[id].count) + 1
            changed.emit(currency, production_per_second())
            return true
      `)],
      steps:["Define the first producer's base cost, production rate, and growth factor.","Add Economy and attach the script.","Connect the main click button to click.","Build one producer button that reads next_cost and calls buy.","Add more producers only after the first purchase loop is clear.","Save raw currency, click value, and producer counts."],
      tests:["One click grants exactly click_value.","Passive production scales with delta.","Purchases fail without enough currency.","Each purchase increases the next cost.","UI formatting does not alter stored values."],
      sources:[S.gdscript,S.signals],related:["shared-offline-prestige","shared-save-slots-autosave","shared-responsive-ui"]
    }),
    recipe({
      id:"shared-offline-prestige",section:"shared",category:"Simulation",title:"Offline progress and prestige reset",
      purpose:"Award capped offline income from a trusted saved timestamp and reset run progress into a permanent prestige multiplier.",difficulty:"advanced",
      tags:["offline progress","prestige","idle","timestamp","reset"],
      nodeTree:["Progression (Node)","IncrementalEconomy (Node)"],
      inputActions:[],
      inspector:["Cap offline seconds to limit clock manipulation and runaway rewards.","Show the exact reset result before requiring confirmation.","Store the last-seen timestamp in the same atomic save as economy data."],
      signals:[{from:"Progression",signal:"offline_awarded(amount, seconds)",to:"OfflineSummary",method:"show_result",why:"Explain the return reward."},{from:"Progression",signal:"prestiged(points)",to:"EconomyUI",method:"refresh_after_reset",why:"Rebuild UI after the run reset."}],
      files:[file("offline_prestige.gd","Progression (Node)","Calculates capped offline income and permanent prestige points.",`
        class_name OfflinePrestige
        extends Node

        signal offline_awarded(amount: float, seconds: int)
        signal prestiged(total_points: int)

        @export var economy: IncrementalEconomy
        @export var max_offline_seconds: int = 28800
        @export var prestige_threshold: float = 1000000.0
        var prestige_points: int = 0
        var lifetime_currency: float = 0.0

        func award_offline(saved_unix_time: int) -> float:
            if economy == null:
                return 0.0
            var now := int(Time.get_unix_time_from_system())
            var elapsed := clampi(now - saved_unix_time, 0, max_offline_seconds)
            var amount := economy.production_per_second() * elapsed
            economy.currency += amount
            offline_awarded.emit(amount, elapsed)
            return amount

        func available_prestige() -> int:
            return maxi(floori(sqrt(maxf(lifetime_currency, 0.0) / prestige_threshold)), 0)

        func prestige() -> bool:
            var gained := available_prestige()
            if gained <= 0 or economy == null:
                return false
            prestige_points += gained
            economy.currency = 0.0
            for producer in economy.producers.values():
                producer.count = 0
            lifetime_currency = 0.0
            prestiged.emit(prestige_points)
            return true

        func production_multiplier() -> float:
            return 1.0 + prestige_points * 0.01
      `)],
      steps:["Finish and save the incremental economy first.","Store a Unix timestamp whenever the game saves or exits normally.","On load, call award_offline once before replacing the timestamp.","Display the capped elapsed time and reward.","Track lifetime currency separately from spendable currency.","Require confirmation before prestige and save immediately after reset."],
      tests:["A future timestamp grants zero.","Long absences stop at the configured cap.","Offline income uses the saved producer rate.","Prestige fails below the threshold.","A successful prestige resets run values and retains permanent points."],
      sources:[S.time,S.gdscript,S.save],related:["shared-incremental-economy","shared-save-slots-autosave","shared-settings-config"]
    }),
    recipe({
      id:"2d-arena-auto-aim",section:"2d",category:"Arena Survivor",title:"Nearest-target auto aim",
      purpose:"Find the closest valid enemy inside range and expose one target to automatic weapons without scanning independently per weapon.",difficulty:"intermediate",
      tags:["auto aim","nearest enemy","groups","targeting","arena survivor"],
      nodeTree:["Player (CharacterBody2D)","  AutoAim (Node2D)"],
      inputActions:[],
      inspector:["Put damageable enemies in the enemies group.","Attach auto_aim_2d.gd to AutoAim.","Set Target Range to the longest automatic weapon range."],
      signals:[{from:"AutoAim",signal:"target_changed(target)",to:"WeaponHUD",method:"show_target",why:"Optional target feedback without coupling weapons to UI."}],
      files:[file("auto_aim_2d.gd","Player/AutoAim (Node2D)","Selects the nearest live Node2D in a group at a limited scan rate.",`
        class_name AutoAim2D
        extends Node2D

        signal target_changed(target: Node2D)

        @export var target_group: StringName = &"enemies"
        @export var target_range: float = 650.0
        @export_range(0.02, 1.0, 0.01) var scan_interval: float = 0.12
        var target: Node2D
        var elapsed: float = 0.0

        func _physics_process(delta: float) -> void:
            elapsed += delta
            if elapsed < scan_interval:
                return
            elapsed = 0.0
            var previous := target
            target = _nearest_target()
            if target != previous:
                target_changed.emit(target)

        func _nearest_target() -> Node2D:
            var best: Node2D
            var best_distance_squared := target_range * target_range
            for candidate in get_tree().get_nodes_in_group(target_group):
                if candidate is not Node2D or not is_instance_valid(candidate):
                    continue
                var distance_squared := global_position.distance_squared_to(candidate.global_position)
                if distance_squared < best_distance_squared:
                    best_distance_squared = distance_squared
                    best = candidate
            return best

        func direction_to_target() -> Vector2:
            if target == null or not is_instance_valid(target):
                return Vector2.ZERO
            return global_position.direction_to(target.global_position)
      `)],
      steps:["Add every enemy root to the enemies group.","Add AutoAim below the player and attach the script.","Set a scan range and interval appropriate for enemy count.","Give every automatic weapon the same AutoAim reference.","Treat a zero direction as no valid target and skip firing."],
      tests:["No enemies produces a null target.","The closest in-range enemy is selected.","Removing the target safely selects another.","Out-of-range enemies are ignored.","Multiple weapons do not perform duplicate scene-tree scans."],
      sources:[S.nodesScenes,S.body2d],related:["2d-arena-weapon-manager","2d-enemy-scaling","2d-wave-shop-loop"]
    }),
    recipe({
      id:"2d-arena-weapon-manager",section:"2d",category:"Arena Survivor",title:"Automatic weapon scene with easy weapon additions",
      purpose:"Turn a WeaponDefinition into timed projectiles so a new arena-survivor weapon requires one scene and one Resource, not player-script edits.",difficulty:"advanced",
      tags:["automatic weapon","weapon Resource","projectile","cooldown","Brotato style"],
      nodeTree:["AutoProjectileWeapon (Node2D) [weapon scene]","  Cooldown (Timer)","Projectile (Area2D) [separate scene]","  Sprite2D","  CollisionShape2D"],
      inputActions:[],
      inspector:["Assign projectile.tscn to Projectile Scene.","The loadout calls configure with the selected WeaponDefinition.","Set Projectile Speed independently from WeaponDefinition damage and cooldown."],
      visuals:["Give every weapon Resource an icon for shops and loadouts.","Give each projectile scene its own Sprite2D so weapon logic stays reusable."],
      signals:[{from:"Projectile",signal:"area_entered",to:"Projectile",method:"_on_area_entered",why:"Damage one compatible hurtbox then free the projectile."}],
      files:[
        file("auto_projectile_weapon.gd","AutoProjectileWeapon (Node2D)","Fires configured projectiles at the shared AutoAim target.",`
          extends Node2D

          @export var projectile_scene: PackedScene
          @export var auto_aim: AutoAim2D
          @export var projectile_speed: float = 700.0
          @onready var cooldown: Timer = $Cooldown
          var definition: WeaponDefinition

          func _ready() -> void:
              cooldown.timeout.connect(_fire)

          func configure(value: WeaponDefinition) -> void:
              definition = value
              cooldown.wait_time = maxf(value.cooldown, 0.02)
              cooldown.start()

          func _fire() -> void:
              if definition == null or projectile_scene == null or auto_aim == null:
                  return
              var direction := auto_aim.direction_to_target()
              if direction == Vector2.ZERO:
                  return
              var projectile := projectile_scene.instantiate()
              get_tree().current_scene.add_child(projectile)
              projectile.global_position = global_position
              projectile.launch(direction, projectile_speed, definition.damage, definition.range)
        `),
        file("arena_projectile.gd","Projectile (Area2D)","Moves a projectile, tracks range, and calls take_damage on compatible areas.",`
          class_name ArenaProjectile2D
          extends Area2D

          var velocity: Vector2
          var damage: float
          var remaining_range: float

          func _ready() -> void:
              area_entered.connect(_on_area_entered)

          func launch(direction: Vector2, speed: float, amount: float, max_range: float) -> void:
              velocity = direction.normalized() * speed
              damage = amount
              remaining_range = maxf(max_range, 0.0)
              rotation = velocity.angle()

          func _physics_process(delta: float) -> void:
              var movement := velocity * delta
              global_position += movement
              remaining_range -= movement.length()
              if remaining_range <= 0.0:
                  queue_free()

          func _on_area_entered(area: Area2D) -> void:
              if area.has_method("take_damage"):
                  area.call("take_damage", damage)
                  queue_free()
        `)
      ],
      steps:["Finish WeaponDefinition, WeaponLoadout, AutoAim, and an enemy hurtbox first.","Create a Projectile Area2D scene with Sprite2D and CollisionShape2D.","Attach arena_projectile.gd and set its collision mask to enemy hurtboxes.","Create the weapon Node2D scene with a one-shot Timer named Cooldown.","Attach auto_projectile_weapon.gd and assign Projectile Scene and AutoAim.","Create a WeaponDefinition .tres pointing to the weapon scene; duplicate both assets to add another weapon."],
      tests:["No target means no projectile.","Cooldown controls shots per second.","Projectiles free after configured range.","Enemy hurtboxes receive Resource damage.","Adding a second weapon requires no loadout-script change."],
      sources:[S.resources,S.packedScene,S.area2d,S.timer],related:["shared-weapon-data-loadout","2d-arena-auto-aim","2d-area-health"]
    }),
    recipe({
      id:"2d-enemy-scaling",section:"2d",category:"Arena Survivor",title:"Wave-based enemy stat scaling",
      purpose:"Apply one documented difficulty curve to spawned enemies while keeping base stats in enemy scenes.",difficulty:"intermediate",
      tags:["enemy scaling","waves","difficulty curve","health","damage"],
      nodeTree:["EnemyScaler (Node)","WaveSpawner (Node2D)","Enemy instances"],
      inputActions:[],
      inspector:["Assign EnemyScaler to the spawner.","Tune health, damage, and speed growth separately.","Cap speed growth so late waves remain readable."],
      files:[file("enemy_scaler.gd","EnemyScaler (Node)","Calculates multipliers and configures compatible enemy instances.",`
        class_name EnemyScaler
        extends Node

        @export var health_growth_per_wave: float = 0.14
        @export var damage_growth_per_wave: float = 0.08
        @export var speed_growth_per_wave: float = 0.015
        @export var maximum_speed_multiplier: float = 1.6

        func configure_enemy(enemy: Node, wave: int) -> void:
            var index := maxi(wave - 1, 0)
            var stats := {
                "health_multiplier": 1.0 + health_growth_per_wave * index,
                "damage_multiplier": 1.0 + damage_growth_per_wave * index,
                "speed_multiplier": minf(1.0 + speed_growth_per_wave * index, maximum_speed_multiplier)
            }
            if enemy.has_method("apply_scaling"):
                enemy.call("apply_scaling", stats)
            else:
                push_warning("Enemy lacks apply_scaling(stats): %s" % enemy.name)
      `)],
      steps:["Keep each enemy's base health, damage, and speed in its own scene or Resource.","Add EnemyScaler beside the wave spawner.","After instantiating an enemy, call configure_enemy before adding gameplay effects.","Implement apply_scaling(stats) on every scalable enemy type.","Graph expected values for early, middle, and final waves before balancing drops."],
      tests:["Wave one uses multipliers of one.","Health and damage increase independently.","Speed never exceeds the cap.","Missing apply_scaling reports a warning without crashing.","Boss scenes may opt into a different scaler."],
      sources:[S.packedScene,S.gdscript],related:["2d-wave-spawner","2d-wave-shop-loop","2d-xp-magnet"]
    }),
    recipe({
      id:"2d-xp-magnet",section:"2d",category:"Arena Survivor",title:"Experience pickup and magnet attraction",
      purpose:"Drop lightweight experience pickups that begin moving toward the player inside a magnet radius and award progression on contact.",difficulty:"intermediate",
      tags:["experience pickup","magnet","Area2D","level up","loot"],
      nodeTree:["ExperiencePickup (Area2D)","  Sprite2D","  CollisionShape2D","Player (CharacterBody2D) [group: player]","  Experience (Node)"],
      inputActions:[],
      inspector:["Set the pickup collision mask to the player layer.","Give the player the player group.","Assign ExperienceComponent on the player."],
      signals:[{from:"ExperiencePickup",signal:"body_entered",to:"ExperiencePickup",method:"_on_body_entered",why:"Award once on physical collection."}],
      files:[file("experience_pickup.gd","ExperiencePickup (Area2D)","Attracts toward the player and awards ExperienceComponent on contact.",`
        extends Area2D

        @export var amount: int = 1
        @export var magnet_radius: float = 180.0
        @export var attraction_speed: float = 520.0
        var player: Node2D

        func _ready() -> void:
            body_entered.connect(_on_body_entered)

        func _physics_process(delta: float) -> void:
            if player == null or not is_instance_valid(player):
                player = get_tree().get_first_node_in_group(&"player") as Node2D
            if player == null:
                return
            if global_position.distance_to(player.global_position) <= magnet_radius:
                global_position = global_position.move_toward(player.global_position, attraction_speed * delta)

        func _on_body_entered(body: Node2D) -> void:
            if not body.is_in_group(&"player"):
                return
            var experience := body.get_node_or_null("Experience") as ExperienceComponent
            if experience == null:
                return
            experience.add_experience(amount)
            queue_free()
      `)],
      steps:["Finish the ExperienceComponent recipe and add it as Player/Experience.","Create an Area2D pickup scene with a small Sprite2D and collision circle.","Attach the script and set the player collision mask.","Spawn one pickup from enemy death logic.","Increase Magnet Radius through upgrades rather than scanning more frequently."],
      tests:["The pickup remains still outside the radius.","It moves toward the player inside the radius.","Only a player-group body can collect it.","Collection awards once and frees the pickup.","A missing Experience child leaves the pickup intact for diagnosis."],
      sources:[S.area2d,S.signals,S.body2d],related:["shared-experience-levels","2d-enemy-scaling","shared-upgrade-offers"]
    }),
    recipe({
      id:"2d-wave-shop-loop",section:"2d",category:"Arena Survivor",title:"Timed combat waves and between-wave shop",
      purpose:"Run a combat timer, stop spawning, wait for the arena to clear, then open a shop before the next wave.",difficulty:"advanced",
      tags:["wave director","shop","arena survivor","state","timer"],
      nodeTree:["RunDirector (Node)","  WaveTimer (Timer)","WaveSpawner (Node2D)","ShopMenu (Control)"],
      inputActions:[],
      inspector:["Set WaveTimer One Shot on.","Assign the spawner and shop menu.","Put every enemy in the enemies group so clearing can be detected."],
      signals:[{from:"RunDirector",signal:"shop_opened(wave)",to:"ShopMenu",method:"open",why:"Generate purchases after combat clears."},{from:"ShopMenu",signal:"closed",to:"RunDirector",method:"start_next_wave",why:"Resume spawning only when shopping finishes."}],
      files:[file("run_director.gd","RunDirector (Node)","Coordinates combat, clearing, shop, and next-wave states.",`
        class_name RunDirector
        extends Node

        signal wave_started(wave: int, duration: float)
        signal wave_cleared(wave: int)
        signal shop_opened(wave: int)

        enum State { COMBAT, CLEARING, SHOP }

        @export var base_wave_duration: float = 30.0
        @export var duration_growth: float = 2.0
        @export var spawner: Node
        @onready var wave_timer: Timer = $WaveTimer
        var state := State.SHOP
        var wave: int = 0

        func _ready() -> void:
            wave_timer.one_shot = true
            wave_timer.timeout.connect(_on_wave_time_finished)

        func start_next_wave() -> void:
            wave += 1
            state = State.COMBAT
            var duration := base_wave_duration + duration_growth * (wave - 1)
            wave_timer.start(duration)
            if spawner != null and spawner.has_method("start_wave"):
                spawner.call("start_wave", wave)
            wave_started.emit(wave, duration)

        func _process(_delta: float) -> void:
            if state == State.CLEARING and get_tree().get_nodes_in_group(&"enemies").is_empty():
                state = State.SHOP
                wave_cleared.emit(wave)
                shop_opened.emit(wave)

        func _on_wave_time_finished() -> void:
            if state != State.COMBAT:
                return
            state = State.CLEARING
            if spawner != null and spawner.has_method("stop_wave"):
                spawner.call("stop_wave")
      `)],
      steps:["Finish the wave spawner and add all enemies to the enemies group.","Create RunDirector with a child Timer named WaveTimer.","Implement start_wave(wave) and stop_wave on the spawner.","Connect shop_opened to the shop UI.","Connect the shop close or continue button to start_next_wave.","Start wave one after the run-intro UI closes."],
      tests:["The spawner starts and stops exactly once per wave.","The shop waits until remaining enemies are defeated.","Closing the shop increments the wave.","Wave duration follows the documented curve.","Paused menus do not consume combat time."],
      sources:[S.timer,S.signals,S.nodesScenes],related:["2d-wave-spawner","2d-enemy-scaling","shared-upgrade-offers"]
    }),
    recipe({
      id:"2d-destructible-snow",section:"2d",category:"Digging",title:"Diggable snow with TileMapLayer",
      purpose:"Erase snow cells in a brush around a tool position while leaving decoration, hazards, and ground on separate tile layers.",difficulty:"intermediate",
      tags:["TileMapLayer","digging","snow","destructible tiles","tool"],
      nodeTree:["SnowField (Node2D)","  Ground (TileMapLayer)","  Snow (TileMapLayer)","  Decoration (TileMapLayer)","Player (CharacterBody2D)","  DigPoint (Marker2D)"],
      inputActions:[{name:"use_tool",bindings:"Mouse 1, controller south, touch button"}],
      inspector:["Paint removable snow only on the Snow TileMapLayer.","Give solid snow tiles collision in the TileSet.","Set Dig Radius in cells, not pixels."],
      files:[file("diggable_snow.gd","Snow (TileMapLayer)","Erases cells within an integer brush around a world position.",`
        class_name DiggableSnow
        extends TileMapLayer

        signal cells_dug(count: int)

        func dig_world_position(world_position: Vector2, radius: int = 0) -> int:
            var center := local_to_map(to_local(world_position))
            var removed := 0
            for y in range(center.y - radius, center.y + radius + 1):
                for x in range(center.x - radius, center.x + radius + 1):
                    var cell := Vector2i(x, y)
                    if cell.distance_squared_to(center) > radius * radius:
                        continue
                    if get_cell_source_id(cell) == -1:
                        continue
                    erase_cell(cell)
                    removed += 1
            if removed > 0:
                cells_dug.emit(removed)
            return removed
      `),file("dig_tool.gd","Player or equipped DigTool (Node2D)","Calls the snow layer at the player's DigPoint.",`
        extends Node2D

        @export var snow: DiggableSnow
        @export_range(0, 8, 1) var dig_radius: int = 0
        @onready var dig_point: Marker2D = $DigPoint

        func _unhandled_input(event: InputEvent) -> void:
            if event.is_action_pressed(&"use_tool") and snow != null:
                snow.dig_world_position(dig_point.global_position, dig_radius)
      `)],
      steps:["Create a TileSet with ground and snow visuals; add collision only to snow tiles that block movement.","Create separate Ground, Snow, and Decoration TileMapLayer nodes.","Paint the ground first and snow above it.","Attach diggable_snow.gd to Snow.","Add DigPoint to the player or tool, attach dig_tool.gd, and assign Snow.","Upgrade Dig Radius through the tool progression recipe."],
      tests:["Digging empty ground removes nothing.","Radius zero removes one occupied cell.","Larger brushes remove only cells inside the circle.","Ground and decoration layers remain unchanged.","Collision disappears with erased snow cells after the layer update."],
      sources:[S.tilemap,S.signals],related:["2d-tool-backpack","2d-warmth-shelter","2d-crafting"]
    }),
    recipe({
      id:"2d-warmth-shelter",section:"2d",category:"Digging",title:"Warmth meter and shelter recovery",
      purpose:"Drain warmth while exploring, recover inside shelter areas, and emit threshold events for warnings and death handling.",difficulty:"intermediate",
      tags:["warmth","survival","Area2D","shelter","meter"],
      nodeTree:["Player (CharacterBody2D)","  Warmth (Node)","Shelter (Area2D)","  CollisionShape2D"],
      inputActions:[],
      inspector:["Attach WarmthComponent to Player/Warmth.","Set shelters to detect the player layer.","Connect depleted to run-failure logic instead of freeing the player inside the component."],
      signals:[{from:"Shelter",signal:"body_entered/body_exited",to:"Warmth",method:"set_in_shelter",why:"Switch between drain and recovery."},{from:"Warmth",signal:"depleted",to:"RunDirector",method:"fail_run",why:"Keep survival rules outside the meter."}],
      files:[
        file("warmth_component.gd","Player/Warmth (Node)","Drains or restores a clamped warmth value.",`
          class_name WarmthComponent
          extends Node

          signal changed(current: float, maximum: float)
          signal depleted

          @export var maximum: float = 100.0
          @export var drain_per_second: float = 2.5
          @export var recovery_per_second: float = 18.0
          var current: float
          var in_shelter: bool = false
          var was_depleted: bool = false

          func _ready() -> void:
              current = maximum
              changed.emit(current, maximum)

          func _process(delta: float) -> void:
              var rate := recovery_per_second if in_shelter else -drain_per_second
              current = clampf(current + rate * delta, 0.0, maximum)
              changed.emit(current, maximum)
              if current <= 0.0 and not was_depleted:
                  was_depleted = true
                  depleted.emit()
              elif current > 0.0:
                  was_depleted = false

          func set_in_shelter(value: bool) -> void:
              in_shelter = value
        `),
        file("shelter_area.gd","Shelter (Area2D)","Toggles the entering player's Warmth child.",`
          extends Area2D

          func _ready() -> void:
              body_entered.connect(_set_shelter.bind(true))
              body_exited.connect(_set_shelter.bind(false))

          func _set_shelter(body: Node2D, value: bool) -> void:
              if not body.is_in_group(&"player"):
                  return
              var warmth := body.get_node_or_null("Warmth") as WarmthComponent
              if warmth != null:
                  warmth.set_in_shelter(value)
        `)
      ],
      steps:["Add Warmth below the player and attach warmth_component.gd.","Connect changed to a ProgressBar and depleted to run-failure logic.","Create an Area2D shelter with a visible fire, tent, or home boundary.","Set the shelter mask to the player layer and attach shelter_area.gd.","Place the first shelter close enough to teach the loop safely.","Save permanent warmth upgrades, but reset current warmth according to the run design."],
      tests:["Warmth drains outside shelter and recovers inside.","Values remain between zero and maximum.","Depleted emits only once per depletion.","Leaving shelter resumes draining.","Non-player bodies do not affect the component."],
      sources:[S.area2d,S.signals,S.gdscript],related:["2d-destructible-snow","2d-tool-backpack","shared-upgrade-offers"]
    }),
    recipe({
      id:"2d-tool-backpack",section:"2d",category:"Digging",title:"Upgradeable tools, backpack, and return-home loop",
      purpose:"Store tool power, carrying capacity, and collected run resources so upgrades can expand digging and hauling without changing player code.",difficulty:"intermediate",
      tags:["tools","backpack","capacity","upgrades","resources"],
      nodeTree:["Player (CharacterBody2D)","  ToolProgression (Node)","  Inventory (Node)","HomeDeposit (Area2D)"],
      inputActions:[{name:"use_tool",bindings:"Mouse, controller, touch"}],
      inspector:["Assign the player's Inventory.","Start Tool Tier and Backpack Capacity at one small readable value.","Deposit resources at home before purchasing permanent upgrades."],
      signals:[{from:"ToolProgression",signal:"tool_upgraded/backpack_upgraded",to:"UpgradeHUD",method:"refresh",why:"Update tier and capacity labels."}],
      files:[file("tool_progression.gd","Player/ToolProgression (Node)","Owns simple tool and backpack upgrade values.",`
        class_name ToolProgression
        extends Node

        signal tool_upgraded(tier: int, power: int)
        signal backpack_upgraded(tier: int, capacity: int)

        @export var base_tool_power: int = 1
        @export var base_capacity: int = 8
        var tool_tier: int = 1
        var backpack_tier: int = 1

        func tool_power() -> int:
            return base_tool_power + tool_tier - 1

        func backpack_capacity() -> int:
            return base_capacity + (backpack_tier - 1) * 4

        func upgrade_tool() -> void:
            tool_tier += 1
            tool_upgraded.emit(tool_tier, tool_power())

        func upgrade_backpack() -> void:
            backpack_tier += 1
            backpack_upgraded.emit(backpack_tier, backpack_capacity())

        func save_data() -> Dictionary:
            return {"tool_tier": tool_tier, "backpack_tier": backpack_tier}

        func load_data(data: Dictionary) -> void:
            tool_tier = maxi(int(data.get("tool_tier", 1)), 1)
            backpack_tier = maxi(int(data.get("backpack_tier", 1)), 1)
      `)],
      steps:["Add Inventory and ToolProgression below the player.","Use tool_power as dig radius, damage, or collection speed depending on the equipped tool.","Use backpack_capacity to limit total carried run resources.","Create a HomeDeposit Area2D that transfers carried resources to permanent storage.","Spend deposited resources on upgrade_tool and upgrade_backpack.","Save tiers and permanent storage after every purchase."],
      tests:["Tool power increases once per tool upgrade.","Backpack capacity follows the documented step size.","A full backpack rejects or redirects overflow.","Depositing clears carried resources and preserves permanent totals.","Save and load preserve both tiers."],
      sources:[S.resources,S.area2d,S.signals],related:["shared-item-inventory","2d-destructible-snow","shared-save-slots-autosave"]
    }),
    recipe({
      id:"2d-fishing-cast",section:"2d",category:"Fishing",title:"Physics fishing cast, line, and bite timer",
      purpose:"Launch a RigidBody2D bobber toward the pointer, draw a live fishing line, and emit a bite after a randomized wait.",difficulty:"advanced",
      tags:["fishing","RigidBody2D","Line2D","cast","bobber","bite"],
      nodeTree:["FishingRod (Node2D)","  Line (Line2D)","  LineOrigin (Marker2D)","Bobber (RigidBody2D) [separate scene]","  Sprite2D","  CollisionShape2D","  BiteTimer (Timer)"],
      inputActions:[{name:"fish_cast",bindings:"Mouse 1, controller south, touch button"},{name:"fish_reel",bindings:"Mouse 1, controller south, touch button"}],
      inspector:["Assign bobber.tscn to Bobber Scene.","Set Line points dynamically; do not hand-author them.","Set BiteTimer One Shot on and randomized wait limits on the bobber."],
      signals:[{from:"Bobber/BiteTimer",signal:"timeout",to:"Bobber",method:"_on_bite_timer_timeout",why:"Emit one bite opportunity."},{from:"Bobber",signal:"bite",to:"FishingRod",method:"_on_bite",why:"Open the fishing minigame."}],
      files:[
        file("fishing_rod.gd","FishingRod (Node2D)","Spawns, launches, tracks, and reels one bobber.",`
          class_name FishingRod2D
          extends Node2D

          signal bite_started(bobber: FishingBobber2D)

          @export var bobber_scene: PackedScene
          @export var cast_impulse: float = 720.0
          @onready var line: Line2D = $Line
          @onready var line_origin: Marker2D = $LineOrigin
          var bobber: FishingBobber2D

          func _unhandled_input(event: InputEvent) -> void:
              if event.is_action_pressed(&"fish_cast"):
                  if bobber == null:
                      cast_toward(get_global_mouse_position())
                  else:
                      reel_in()

          func _process(_delta: float) -> void:
              if bobber == null or not is_instance_valid(bobber):
                  line.clear_points()
                  return
              line.points = PackedVector2Array([
                  line.to_local(line_origin.global_position),
                  line.to_local(bobber.global_position)
              ])

          func cast_toward(target: Vector2) -> void:
              if bobber_scene == null:
                  return
              var instance := bobber_scene.instantiate()
              if not instance is FishingBobber2D:
                  instance.free()
                  push_error("Bobber Scene must have a FishingBobber2D root.")
                  return
              bobber = instance as FishingBobber2D
              get_tree().current_scene.add_child(bobber)
              bobber.global_position = line_origin.global_position
              bobber.bite.connect(_on_bite)
              bobber.apply_central_impulse(line_origin.global_position.direction_to(target) * cast_impulse)

          func reel_in() -> void:
              if bobber != null and is_instance_valid(bobber):
                  bobber.queue_free()
              bobber = null

          func _on_bite(value: FishingBobber2D) -> void:
              bite_started.emit(value)
        `),
        file("fishing_bobber.gd","Bobber (RigidBody2D)","Waits a randomized duration after entering water and emits one bite.",`
          class_name FishingBobber2D
          extends RigidBody2D

          signal bite(bobber: FishingBobber2D)

          @export var minimum_bite_wait: float = 1.5
          @export var maximum_bite_wait: float = 5.0
          @onready var bite_timer: Timer = $BiteTimer
          var can_bite: bool = false

          func _ready() -> void:
              bite_timer.one_shot = true
              bite_timer.timeout.connect(_on_bite_timer_timeout)

          func enter_fishing_water() -> void:
              can_bite = true
              bite_timer.start(randf_range(minimum_bite_wait, maximum_bite_wait))

          func leave_fishing_water() -> void:
              can_bite = false
              bite_timer.stop()

          func _on_bite_timer_timeout() -> void:
              if can_bite:
                  bite.emit(self)
        `)
      ],
      steps:["Create the Bobber RigidBody2D scene with Sprite2D, CollisionShape2D, and Timer.","Attach fishing_bobber.gd and configure collision layers for water detection.","Create FishingRod with Line2D and a Marker2D at the rod tip.","Attach fishing_rod.gd and assign the Bobber scene.","Water Area2D nodes call enter_fishing_water and leave_fishing_water on overlapping bobbers.","Connect bite_started to the fishing minigame and disable normal reel input while it is open."],
      tests:["Casting creates one bobber at LineOrigin.","A one-time impulse launches it toward the target.","Line2D follows both endpoints.","No bite occurs outside fishing water.","Reeling frees the bobber and clears the line."],
      sources:[S.rigid2d,S.line2d,S.timer,S.area2d],related:["2d-fishing-minigame","shared-weighted-loot","shared-item-inventory"]
    }),
    recipe({
      id:"2d-fishing-minigame",section:"2d",category:"Fishing",title:"Catch-bar fishing minigame",
      purpose:"Move a controllable catch bar against gravity, bounce a fish target, and resolve progress into caught or escaped signals.",difficulty:"advanced",
      tags:["fishing minigame","Control","progress","input","difficulty"],
      nodeTree:["FishingMinigame (Control)","  Track (Control)","    CatchBar (ColorRect or TextureRect)","    FishMarker (TextureRect)","  Progress (ProgressBar)"],
      inputActions:[{name:"fish_reel",bindings:"Mouse 1, Space, controller south, touch button"}],
      inspector:["Set Track, CatchBar, and FishMarker anchors to the left edge with vertical movement space.","Assign easier fish lower move speed and larger catch contribution.","Process Mode may need When Paused if the world pauses during fishing."],
      signals:[{from:"FishingMinigame",signal:"caught",to:"FishingController",method:"award_fish",why:"Roll and add the selected fish to inventory."},{from:"FishingMinigame",signal:"escaped",to:"FishingController",method:"finish_without_reward",why:"Return cleanly to normal play."}],
      files:[file("fishing_minigame.gd","FishingMinigame (Control)","Runs catch bar physics, fish movement, and progress resolution.",`
        class_name FishingMinigame
        extends Control

        signal caught
        signal escaped

        @export var bar_acceleration: float = 900.0
        @export var bar_gravity: float = 620.0
        @export var fish_speed: float = 90.0
        @export var catch_rate: float = 0.28
        @export var escape_rate: float = 0.18
        @onready var track: Control = $Track
        @onready var catch_bar: Control = $Track/CatchBar
        @onready var fish_marker: Control = $Track/FishMarker
        @onready var progress: ProgressBar = $Progress
        var bar_velocity: float = 0.0
        var fish_direction: float = 1.0

        func _process(delta: float) -> void:
            bar_velocity += (-bar_acceleration if Input.is_action_pressed(&"fish_reel") else bar_gravity) * delta
            catch_bar.position.y = clampf(catch_bar.position.y + bar_velocity * delta, 0.0, track.size.y - catch_bar.size.y)
            if catch_bar.position.y <= 0.0 or catch_bar.position.y >= track.size.y - catch_bar.size.y:
                bar_velocity = 0.0
            fish_marker.position.y += fish_direction * fish_speed * delta
            if fish_marker.position.y <= 0.0 or fish_marker.position.y >= track.size.y - fish_marker.size.y:
                fish_direction *= -1.0
                fish_marker.position.y = clampf(fish_marker.position.y, 0.0, track.size.y - fish_marker.size.y)
            var overlapping := catch_bar.get_rect().intersects(fish_marker.get_rect())
            progress.value += (catch_rate if overlapping else -escape_rate) * delta * progress.max_value
            if progress.value >= progress.max_value:
                caught.emit()
                set_process(false)
            elif progress.value <= progress.min_value:
                escaped.emit()
                set_process(false)
      `)],
      steps:["Create the Control hierarchy exactly as shown.","Give CatchBar and FishMarker visible placeholder textures.","Attach the script and set an initial Progress value above zero.","Connect the rod bite signal to show the minigame and enable processing.","On caught, roll a fish from the current area's loot table and add it to inventory.","On caught or escaped, hide the minigame, reel the bobber, and restore world input."],
      tests:["Holding reel moves the bar upward and releasing lets it fall.","The bar never leaves the track.","Fish movement bounces at both track ends.","Overlap raises progress and separation lowers it.","Only one caught or escaped result emits."],
      sources:[S.anchors,S.input,S.signals],related:["2d-fishing-cast","shared-weighted-loot","shared-item-inventory"]
    }),
  ];

  const bundles=[];
  const baseEnhancements=Object.freeze({
    "2d-top-down-controller":Object.freeze({
      visuals:["Select Player, add Sprite2D, then drag the character PNG into Sprite2D > Texture.","Keep Sprite2D centered on the CharacterBody2D origin and resize the imported texture or Sprite2D scale, never the CollisionShape2D scale.","Add CollisionShape2D as a Player child and choose a CapsuleShape2D or RectangleShape2D that covers the character's body."],
      fileMeta:Object.freeze({"player.gd":Object.freeze({attachTo:"Player (CharacterBody2D)",purpose:"Reads movement actions and moves the collision body."})})
    }),
    "3d-character-controller":Object.freeze({
      visuals:["Import a .glb model, instance it below Pivot, and keep its feet at the Player origin.","Add CollisionShape3D directly below Player and size the shape without scaling the node.","Rotate only the Pivot visual so the CharacterBody3D collision remains stable."],
      fileMeta:Object.freeze({"player.gd":Object.freeze({attachTo:"Player (CharacterBody3D)",purpose:"Moves the 3D collision body and rotates its visual pivot."})})
    })
  });

  window.GodotTokLibraryExpansion=Object.freeze({
    version:VERSION,
    recipes:Object.freeze(recipes),
    bundles:Object.freeze(bundles),
    sources:S,
    baseEnhancements
  });
})();

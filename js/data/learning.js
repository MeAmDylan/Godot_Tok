(function(){
  "use strict";

  const VERSION="4.7";
  const DOC="https://docs.godotengine.org/en/4.7/";
  const S={
    nodes:{title:"Nodes and scenes",url:DOC+"getting_started/step_by_step/nodes_and_scenes.html"},
    node:{title:"Node class",url:DOC+"classes/class_node.html"},
    instancing:{title:"Creating instances",url:DOC+"getting_started/step_by_step/instancing.html"},
    resources:{title:"Resources",url:DOC+"tutorials/scripting/resources.html"},
    signals:{title:"Using signals",url:DOC+"getting_started/step_by_step/signals.html"},
    gdscript:{title:"GDScript reference",url:DOC+"tutorials/scripting/gdscript/gdscript_basics.html"},
    exports:{title:"GDScript exported properties",url:DOC+"tutorials/scripting/gdscript/gdscript_exports.html"},
    movement2d:{title:"2D movement overview",url:DOC+"tutorials/2d/2d_movement.html"},
    character2d:{title:"CharacterBody2D",url:DOC+"classes/class_characterbody2d.html"},
    area2d:{title:"Area2D",url:DOC+"classes/class_area2d.html"},
    animation2d:{title:"AnimatedSprite2D",url:DOC+"classes/class_animatedsprite2d.html"},
    camera2d:{title:"Camera2D",url:DOC+"classes/class_camera2d.html"},
    tilemap:{title:"TileMapLayer",url:DOC+"classes/class_tilemaplayer.html"},
    navigation2d:{title:"2D navigation overview",url:DOC+"tutorials/navigation/navigation_introduction_2d.html"},
    first3d:{title:"First 3D game player input",url:DOC+"getting_started/first_3d_game/02.player_input.html"},
    character3d:{title:"CharacterBody3D",url:DOC+"classes/class_characterbody3d.html"},
    area3d:{title:"Area3D",url:DOC+"classes/class_area3d.html"},
    raycast:{title:"Ray-casting",url:DOC+"tutorials/physics/ray-casting.html"},
    transforms3d:{title:"Using 3D transforms",url:DOC+"tutorials/3d/using_transforms.html"},
    navigationAgents:{title:"Using navigation agents",url:DOC+"tutorials/navigation/navigation_using_navigationagents.html"},
    springArm:{title:"Third-person camera with SpringArm3D",url:DOC+"tutorials/3d/spring_arm.html"},
    controls:{title:"Control node",url:DOC+"classes/class_control.html"},
    anchors:{title:"Size and anchors",url:DOC+"tutorials/ui/size_and_anchors.html"},
    containers:{title:"GUI containers",url:DOC+"tutorials/ui/gui_containers.html"},
    themes:{title:"GUI skinning and themes",url:DOC+"tutorials/ui/gui_skinning.html"},
    focus:{title:"Keyboard and controller navigation",url:DOC+"tutorials/ui/gui_navigation.html"},
    resolutions:{title:"Multiple resolutions",url:DOC+"tutorials/rendering/multiple_resolutions.html"},
    timer:{title:"Timer",url:DOC+"classes/class_timer.html"},
    audio:{title:"Audio buses",url:DOC+"tutorials/audio/audio_buses.html"},
    autoload:{title:"Singletons and Autoload",url:DOC+"tutorials/scripting/singletons_autoload.html"},
    pause:{title:"Pausing games",url:DOC+"tutorials/scripting/pausing_games.html"},
    sceneChange:{title:"Changing scenes manually",url:DOC+"tutorials/scripting/change_scenes_manually.html"},
    saving:{title:"Saving games",url:DOC+"tutorials/io/saving_games.html"},
    tween:{title:"Tween",url:DOC+"classes/class_tween.html"},
    particles:{title:"2D particle systems",url:DOC+"tutorials/2d/particle_systems_2d.html"},
    shaders:{title:"Introduction to shaders",url:DOC+"tutorials/shaders/introduction_to_shaders.html"},
    debugging:{title:"Debugging tools",url:DOC+"tutorials/scripting/debug/overview_of_debugging_tools.html"},
    profiler:{title:"The profiler",url:DOC+"tutorials/scripting/debug/the_profiler.html"},
    organization:{title:"Project organization",url:DOC+"tutorials/best_practices/project_organization.html"},
    interpolation:{title:"Physics interpolation",url:DOC+"tutorials/physics/interpolation/physics_interpolation_introduction.html"},
    loading:{title:"Resources",url:DOC+"tutorials/scripting/resources.html"},
    exporting:{title:"Exporting projects",url:DOC+"tutorials/export/exporting_projects.html"}
  };

  const categories=[
    {id:"fundamentals",name:"Fundamentals",description:"Nodes, scenes, the scene tree, lifecycle, and resources",accent:"#88C0D0"},
    {id:"gdscript",name:"GDScript",description:"Language syntax, types, collections, signals, and coroutines",accent:"#81A1C1"},
    {id:"2d",name:"2D",description:"Movement, collision, animation, cameras, tiles, and navigation",accent:"#A3BE8C"},
    {id:"3d",name:"3D",description:"Spatial movement, cameras, raycasts, transforms, and navigation",accent:"#B48EAD"},
    {id:"ui",name:"UI & UX",description:"Control nodes, anchors, containers, themes, focus, and scaling",accent:"#EBCB8B"},
    {id:"systems",name:"Game Systems",description:"Scenes, timers, autoloads, audio, pause, and saving",accent:"#D08770"},
    {id:"polish",name:"Polish & Tools",description:"Tweens, particles, shaders, debugging, profiling, and export",accent:"#BF616A"}
  ];

  const c=(id,category,topic,difficulty,question,answer,source,code)=>({id,category,topic,difficulty,question,answer,source,godotVersion:VERSION,...(code?{code}:{})});
  const flashcards=[
    c("fund-b-01","fundamentals","Nodes","beginner","What is a node in Godot?","A node is a basic building block with a focused purpose, such as displaying a sprite, playing audio, or detecting collision.",S.nodes),
    c("fund-b-02","fundamentals","Scenes","beginner","What is a scene?","A scene is a reusable tree of nodes saved as a resource. A project can instance scenes inside other scenes.",S.nodes),
    c("fund-b-03","fundamentals","Scene tree","beginner","What does a scene need at its top?","Every saved scene has one root node. All other nodes in that scene are descendants of the root.",S.nodes),
    c("fund-i-01","fundamentals","Lifecycle","intermediate","When is _ready() called?","It is called after the node and its children have entered the scene tree, so child-node references are available.",S.node,"func _ready() -> void:\n    pass"),
    c("fund-i-02","fundamentals","Instancing","intermediate","How do you create a node from a PackedScene?","Call instantiate() on the PackedScene, then add the returned node to the scene tree.",S.instancing,"var enemy = enemy_scene.instantiate()\nadd_child(enemy)"),
    c("fund-i-03","fundamentals","Resources","intermediate","When should data be stored in a Resource?","Use a Resource for reusable, serializable data that can be edited in the Inspector and shared by multiple nodes.",S.resources),
    c("fund-i-04","fundamentals","Deletion","intermediate","Why use queue_free() instead of immediately deleting a node?","queue_free() safely schedules the node for deletion at the end of the current frame.",S.node,"queue_free()"),
    c("fund-a-01","fundamentals","Scene ownership","advanced","Why can a runtime child fail to appear when a scene is saved from a tool script?","Nodes need an owner in the edited scene to be serialized as part of that scene.",S.node),
    c("fund-a-02","fundamentals","Composition","advanced","Why prefer small composed scenes over one large script?","Composition keeps responsibilities isolated, makes scenes reusable, and lets child scenes be tested independently.",S.nodes),
    c("fund-a-03","fundamentals","Decoupling","advanced","How do signals reduce coupling between scenes?","The sender emits an event without needing to know which object will respond. Receivers choose whether to connect.",S.signals),

    c("gds-b-01","gdscript","Variables","beginner","What is the difference between var and const?","var declares a value that can change. const declares a value that cannot be reassigned.",S.gdscript,"var score = 0\nconst MAX_SCORE = 10"),
    c("gds-b-02","gdscript","Static typing","beginner","How do you give a variable an explicit type?","Write a colon and the type after its name.",S.gdscript,"var speed: float = 300.0"),
    c("gds-b-03","gdscript","Functions","beginner","How is a function return type declared?","Place an arrow and the return type after the parameter list.",S.gdscript,"func get_score() -> int:\n    return score"),
    c("gds-i-01","gdscript","Collections","intermediate","Are Array and Dictionary copied on every assignment?","No. Arrays and dictionaries are reference types. Use duplicate() when you need an independent copy.",S.gdscript),
    c("gds-i-02","gdscript","Exports","intermediate","What does @export do?","It exposes a compatible property in the Inspector and stores its value with the scene or resource.",S.exports,"@export var speed: float = 300.0"),
    c("gds-i-03","gdscript","Node references","intermediate","What does @onready do?","It delays a member variable's initialization until _ready(), when the scene's child nodes are available.",S.gdscript,"@onready var label: Label = $Label"),
    c("gds-i-04","gdscript","Signals","intermediate","How do you declare and emit a custom signal?","Declare it with signal, then call emit() on the signal property.",S.gdscript,"signal health_changed(value: int)\nhealth_changed.emit(health)"),
    c("gds-a-01","gdscript","Operators","advanced","What result does 5 / 2 produce when both operands are int?","It produces 2 because integer division is used. Use 2.0 or a float cast when a fractional result is required.",S.gdscript),
    c("gds-a-02","gdscript","Coroutines","advanced","What does await do in GDScript?","It suspends the current function until a signal is emitted or another coroutine finishes, then resumes execution.",S.gdscript,"await get_tree().create_timer(1.0).timeout"),
    c("gds-a-03","gdscript","Callables","advanced","What is a Callable?","A Callable represents a method that can be stored and invoked later, and can be passed as data or connected to a signal.",S.gdscript),

    c("2d-b-01","2d","Transforms","beginner","Which node provides a 2D transform with position, rotation, and scale?","Node2D is the base class for objects positioned in 2D space.",S.movement2d),
    c("2d-b-02","2d","Character movement","beginner","Which property is normally set before calling CharacterBody2D.move_and_slide()?","Set the velocity property. move_and_slide() then moves the body and updates collision information.",S.character2d,"velocity = direction * speed\nmove_and_slide()"),
    c("2d-b-03","2d","Input","beginner","What does Input.get_vector() return?","It combines four input actions into a Vector2 limited to length 1, which is useful for directional movement.",S.movement2d,"var direction := Input.get_vector(\"left\", \"right\", \"up\", \"down\")"),
    c("2d-i-01","2d","Physics loop","intermediate","Where should collision-aware CharacterBody2D movement run?","Run it in _physics_process(delta), which updates at a fixed physics rate.",S.movement2d),
    c("2d-i-02","2d","Areas","intermediate","When should Area2D be used?","Use Area2D to detect bodies or other areas entering and leaving a region without using it as a solid moving body.",S.area2d),
    c("2d-i-03","2d","Animation","intermediate","What does AnimatedSprite2D use to store its animation frames?","It uses a SpriteFrames resource containing named animations and their textures.",S.animation2d),
    c("2d-i-04","2d","Camera","intermediate","What must be true for a Camera2D to control the viewport?","The Camera2D must be enabled. Only one Camera2D can be active per viewport at a time.",S.camera2d),
    c("2d-a-01","2d","Collision filtering","advanced","How do collision layers and masks differ?","A layer states what the object is on. A mask states which layers the object scans or collides with.",S.area2d),
    c("2d-a-02","2d","Navigation","advanced","Why should NavigationAgent2D.get_next_path_position() be called during movement updates after a target is set?","The call advances the agent's internal path logic and returns the next point the controlled body should move toward.",S.navigationAgents),
    c("2d-a-03","2d","Tile maps","advanced","What is TileMapLayer used for in current Godot 4 projects?","It represents one tile-map layer. Multiple TileMapLayer nodes are composed when a map needs several layers.",S.tilemap),

    c("3d-b-01","3d","Coordinates","beginner","Which axis is normally up in Godot 3D?","Positive Y is up. X runs left and right, while Z runs forward and backward.",S.first3d),
    c("3d-b-02","3d","Character movement","beginner","Which node is designed for script-controlled 3D characters?","CharacterBody3D provides velocity-based movement and collision helpers for user-controlled bodies.",S.character3d),
    c("3d-b-03","3d","Input","beginner","How can four movement actions be combined for 3D movement input?","Use Input.get_vector() to make a Vector2, then map its x and y values into a Vector3 direction.",S.first3d),
    c("3d-i-01","3d","Local direction","intermediate","Why transform a 3D input direction by transform.basis?","It converts the input from local orientation into the character's current world-facing direction.",S.first3d,"var input_dir := Input.get_vector(\"move_left\", \"move_right\", \"move_forward\", \"move_back\")\nvar direction := (transform.basis * Vector3(input_dir.x, 0, input_dir.y)).normalized()"),
    c("3d-i-02","3d","Cameras","intermediate","What does Camera3D determine?","It defines the viewpoint used to render a 3D viewport when that camera is current.",S.first3d),
    c("3d-i-03","3d","Areas","intermediate","What is a common use for Area3D?","Area3D detects overlapping 3D bodies or areas and can also override local physics or audio properties.",S.area3d),
    c("3d-i-04","3d","Ray casts","intermediate","Why perform physics ray queries inside _physics_process()?","The physics space is safe and current during the physics step. Accessing it during _input() can be locked or out of sync.",S.raycast),
    c("3d-a-01","3d","Transforms","advanced","What do Basis and Transform3D represent?","Basis stores 3D rotation and scale. Transform3D combines a Basis with an origin position.",S.transforms3d),
    c("3d-a-02","3d","Navigation","advanced","Does NavigationAgent3D move its parent automatically?","No. It computes path information and avoidance velocity, but your script must move the controlled body.",S.navigationAgents),
    c("3d-a-03","3d","Third-person cameras","advanced","Why place a Camera3D under SpringArm3D?","The spring arm moves the camera closer when geometry blocks its path, helping prevent the camera from clipping through walls.",S.springArm),

    c("ui-b-01","ui","Control nodes","beginner","Which node family is used for interfaces?","Control and its subclasses are used for interface elements such as buttons, labels, panels, and lists.",S.controls),
    c("ui-b-02","ui","Anchors","beginner","What do Control anchors describe?","Anchors describe where the control's sides are attached relative to its parent, using values from 0 to 1.",S.anchors),
    c("ui-b-03","ui","Containers","beginner","What is the purpose of a Container node?","A Container automatically arranges and resizes its child Control nodes according to its layout rules.",S.containers),
    c("ui-i-01","ui","Size flags","intermediate","What do container size flags control?","They tell a parent Container how a child should use available horizontal or vertical space.",S.containers),
    c("ui-i-02","ui","Themes","intermediate","Why use a Theme resource?","A Theme centralizes fonts, colors, icons, constants, and style boxes so many controls can share consistent styling.",S.themes),
    c("ui-i-03","ui","Focus","intermediate","What enables keyboard and controller navigation between controls?","Controls need an appropriate focus mode and configured focus neighbors or a usable layout order.",S.focus),
    c("ui-i-04","ui","GUI input","intermediate","Which callback receives input targeted at a Control?","_gui_input(event) receives GUI events after picking determines that the Control should handle them.",S.controls,"func _gui_input(event: InputEvent) -> void:\n    pass"),
    c("ui-a-01","ui","Mouse filtering","advanced","How does mouse_filter affect GUI event propagation?","It controls whether a Control stops, passes, or ignores mouse events during GUI picking.",S.controls),
    c("ui-a-02","ui","Resolution scaling","advanced","Why configure a base viewport size and stretch settings?","They give the project a predictable design resolution while allowing content to scale across different window and screen sizes.",S.resolutions),
    c("ui-a-03","ui","Reusable UI","advanced","How can a reusable UI scene communicate without knowing its parent?","Expose signals for user actions and data changes. The parent connects to those signals and decides what happens.",S.signals),

    c("sys-b-01","systems","Scene instances","beginner","What type does preload() return when loading a .tscn file?","It returns a PackedScene resource, which can create node instances with instantiate().",S.instancing,"const ENEMY_SCENE := preload(\"res://enemy.tscn\")"),
    c("sys-b-02","systems","Timers","beginner","What signal does Timer emit when it reaches zero?","Timer emits its timeout signal.",S.timer),
    c("sys-b-03","systems","Audio","beginner","Which node plays a non-positional audio stream?","AudioStreamPlayer plays audio without 2D or 3D positional attenuation.",S.audio),
    c("sys-i-01","systems","Autoloads","intermediate","What does an Autoload provide?","It loads a script or scene before the main scene and keeps it available through a global name for the life of the project.",S.autoload),
    c("sys-i-02","systems","Pause","intermediate","What happens when SceneTree.paused is true?","Physics stops and nodes process according to their process_mode. Nodes configured to run while paused can still handle pause UI.",S.pause),
    c("sys-i-03","systems","Scene flow","intermediate","What does SceneTree.change_scene_to_file() do?","It replaces the current scene with the scene at the supplied resource path.",S.sceneChange,"get_tree().change_scene_to_file(\"res://levels/level_02.tscn\")"),
    c("sys-i-04","systems","Save paths","intermediate","Where should writable save data be stored in an exported game?","Use a user:// path, which points to a writable per-user project data directory.",S.saving,"var path := \"user://savegame.json\""),
    c("sys-a-01","systems","Saving","advanced","Why does the official save-game approach mark persistent nodes with a group?","The group lets the save system discover only nodes that opt into persistence instead of hard-coding every node path.",S.saving),
    c("sys-a-02","systems","Architecture","advanced","Why should a global game-state object avoid directly controlling every scene child?","A narrowly scoped state service plus signals reduces dependencies and keeps scenes reusable and testable.",S.autoload),
    c("sys-a-03","systems","Data modeling","advanced","Why store shared item definitions in Resources instead of live Nodes?","Resources are data-focused, serializable, Inspector-friendly, and reusable without needing to exist in the scene tree.",S.resources),

    c("pol-b-01","polish","Tweens","beginner","How is a Tween created in Godot 4?","Call create_tween() from a Node. The returned Tween starts automatically and is valid until it finishes or is killed.",S.tween,"var tween := create_tween()"),
    c("pol-b-02","polish","Particles","beginner","Which 2D node emits GPU-accelerated particles?","GPUParticles2D emits particles using a ParticleProcessMaterial or a custom particle shader.",S.particles),
    c("pol-b-03","polish","Shaders","beginner","What declares a shader's processing context?","shader_type selects the context, such as canvas_item for 2D or spatial for 3D.",S.shaders,"shader_type canvas_item;"),
    c("pol-i-01","polish","Debugger","intermediate","What should you inspect first when a script fails at runtime?","Check the debugger errors and stack trace, then inspect the reported file and line before changing unrelated code.",S.debugging),
    c("pol-i-02","polish","Profiler","intermediate","What does the profiler help identify?","It measures frame-time costs so you can find functions, physics work, rendering, or other systems causing slow frames.",S.profiler),
    c("pol-i-03","polish","Remote inspection","intermediate","Why use the Remote scene tree while the game runs?","It shows the live node hierarchy and runtime property values rather than only the edited scene.",S.debugging),
    c("pol-i-04","polish","Project organization","intermediate","What organization style does Godot recommend for game projects?","Group files close to the scenes or features that use them, while keeping broadly shared assets in clear shared locations.",S.organization),
    c("pol-a-01","polish","Physics interpolation","advanced","What problem does physics interpolation solve?","It visually smooths movement between fixed physics ticks, especially when rendered frames occur more frequently than physics updates.",S.interpolation),
    c("pol-a-02","polish","Resource loading","advanced","When should preload() be preferred over load()?","Use preload() for a constant resource path needed with the script. It loads when the script is parsed; load() resolves a path at runtime.",S.loading),
    c("pol-a-03","polish","Export","advanced","Why are export templates required?","They contain the platform-specific binaries and data needed to package a project for supported targets.",S.exporting)
  ];

  const q=(id,category,topic,difficulty,type,prompt,choices,correct,explanation,source)=>({id,category,topic,difficulty,type,prompt,choices,correct,explanation,source,godotVersion:VERSION});
  const quizzes=[
    q("q-fund-b-01","fundamentals","Nodes","beginner","concept","What is the smallest reusable building block in a Godot scene?",["Node","Viewport","Project","Import preset"],0,"Scenes are trees composed of nodes.",S.nodes),
    q("q-fund-b-02","fundamentals","Scenes","beginner","concept","What is saved in a .tscn file?",["A scene","A shader cache","An export template","An input event"],0,"Text scene files describe a scene and its resources.",S.nodes),
    q("q-fund-b-03","fundamentals","Scene tree","beginner","concept","How many root nodes does a saved scene have?",["Exactly one","Exactly two","Any number","None"],0,"Every scene starts from one root node.",S.nodes),
    q("q-fund-i-01","fundamentals","Lifecycle","intermediate","scenario","You need a child node reference after the scene enters the tree. Which callback is intended for this?",["_ready()","_init()","_draw()","_to_string()"],0,"_ready() runs after the node and its children have entered the tree.",S.node),
    q("q-fund-i-02","fundamentals","Instancing","intermediate","order","Which order correctly adds a PackedScene to the running tree?",["instantiate(), then add_child()","add_child(), then instantiate()","queue_free(), then instantiate()","load(), then queue_free()"],0,"instantiate() creates the node hierarchy, then add_child() enters it into the tree.",S.instancing),
    q("q-fund-i-03","fundamentals","Resources","intermediate","scenario","Which type best stores reusable item statistics editable in the Inspector?",["Resource","Camera2D","Viewport","InputEvent"],0,"Resources are serializable data containers designed for this use.",S.resources),
    q("q-fund-a-01","fundamentals","Deletion","advanced","debug","A node must be safely removed during gameplay. Which method is appropriate?",["queue_free()","remove_meta()","notify_property_list_changed()","duplicate()"],0,"queue_free() schedules safe deletion at the end of the frame.",S.node),
    q("q-fund-a-02","fundamentals","Scene ownership","advanced","debug","A tool script adds a child, but the child is missing after saving. What should be checked?",["The child's owner","The viewport stretch mode","The audio bus","The input deadzone"],0,"A node needs an owner in the edited scene to be serialized with it.",S.node),
    q("q-fund-a-03","fundamentals","Architecture","advanced","scenario","A reusable enemy must announce death without knowing the score manager. What should it use?",["A signal","A hard-coded root path","A global search every frame","An editor plugin"],0,"Signals let the enemy publish the event without depending on a specific receiver.",S.signals),

    q("q-gds-b-01","gdscript","Variables","beginner","code","Which declaration cannot be reassigned?",["const MAX_HEALTH = 100","var health = 100","var health: int","@export var health = 100"],0,"const creates a constant binding.",S.gdscript),
    q("q-gds-b-02","gdscript","Types","beginner","code","Which line declares a typed float?",["var speed: float = 3.0","float speed := 3.0","speed var float = 3.0","let speed = 3.0"],0,"GDScript writes the type after a colon.",S.gdscript),
    q("q-gds-b-03","gdscript","Functions","beginner","code","Which function explicitly returns an int?",["func score() -> int:","func score(): int","int func score():","function score: int"],0,"Return types follow an arrow after the parameters.",S.gdscript),
    q("q-gds-i-01","gdscript","Collections","intermediate","concept","How do you make an independent copy of an Array?",["Call duplicate()","Assign it to another variable","Call append_array()","Convert it to String"],0,"Arrays are reference types, so assignment alone shares the same Array.",S.gdscript),
    q("q-gds-i-02","gdscript","Exports","intermediate","scenario","Which annotation exposes a compatible property in the Inspector?",["@export","@tool","@rpc","@warning_ignore"],0,"@export stores and exposes the property.",S.exports),
    q("q-gds-i-03","gdscript","Signals","intermediate","code","Which line emits a declared signal named died?",["died.emit()","emit died","signal.emit(died)","died.send()"],0,"In Godot 4, the signal property exposes emit().",S.gdscript),
    q("q-gds-a-01","gdscript","Operators","advanced","code","What is the value of 5 / 2 when both values are int?",["2","2.5","3","A compiler error"],0,"Integer operands use integer division.",S.gdscript),
    q("q-gds-a-02","gdscript","Coroutines","advanced","concept","What causes an awaiting function to resume?",["The awaited signal or coroutine completes","The next rendered frame always","Any input event","Only a scene change"],0,"await resumes when its awaited signal is emitted or coroutine completes.",S.gdscript),
    q("q-gds-a-03","gdscript","Typing","advanced","debug","Why can explicit types improve a large project?",["They catch incompatible assignments and improve editor assistance","They make every object a Node","They remove the scene tree","They disable runtime errors"],0,"Static type information catches a class of mistakes and improves completion, but does not remove all runtime errors.",S.gdscript),

    q("q-2d-b-01","2d","Movement","beginner","scenario","Which node is intended for a script-controlled 2D player with collision?",["CharacterBody2D","Marker2D","CanvasLayer","AudioStreamPlayer2D"],0,"CharacterBody2D provides collision-aware scripted movement.",S.character2d),
    q("q-2d-b-02","2d","Input","beginner","concept","What type does Input.get_vector() return?",["Vector2","Vector3","Transform2D","Rect2"],0,"It combines four actions into a Vector2.",S.movement2d),
    q("q-2d-b-03","2d","Transforms","beginner","concept","Which properties come from Node2D?",["position, rotation, and scale","volume, pitch, and bus","text, font, and outline","mass, inertia, and gravity only"],0,"Node2D supplies the standard 2D transform.",S.movement2d),
    q("q-2d-i-01","2d","Physics loop","intermediate","scenario","Where should move_and_slide() normally run for a player body?",["_physics_process(delta)","_draw()","_exit_tree()","_notification() only"],0,"Character movement belongs in the fixed physics update.",S.movement2d),
    q("q-2d-i-02","2d","Areas","intermediate","scenario","A collectible should detect the player without acting as a solid wall. Which node fits?",["Area2D","StaticBody2D","Camera2D","NavigationRegion2D"],0,"Area2D is intended for overlap detection.",S.area2d),
    q("q-2d-i-03","2d","Camera","intermediate","debug","A Camera2D exists but does not control the viewport. What should be checked first?",["Its enabled property","Its z_index only","Its script filename","Its collision mask"],0,"A Camera2D must be enabled to become active.",S.camera2d),
    q("q-2d-a-01","2d","Collision filtering","advanced","concept","What does a collision mask specify?",["Which layers the object scans","Which layer stores the scene file","The viewport render order","The animation playback speed"],0,"Masks select the layers an object detects or collides with.",S.area2d),
    q("q-2d-a-02","2d","Navigation","advanced","debug","An agent has a target but the character never moves. What is still required?",["Script movement using the agent's path output","A second World2D","A Camera2D child","Disabling physics"],0,"NavigationAgent2D calculates navigation information but does not move its parent.",S.navigationAgents),
    q("q-2d-a-03","2d","Tile maps","advanced","scenario","How should a current Godot project represent two independent tile layers?",["Use two TileMapLayer nodes","Put two roots in one scene","Use two InputMaps","Store tiles in AudioStreamPlayers"],0,"Each TileMapLayer represents one layer, so layers are composed as separate nodes.",S.tilemap),

    q("q-3d-b-01","3d","Coordinates","beginner","concept","Which axis is up in Godot 3D?",["Y","X","Z","W"],0,"Godot uses Y-up 3D coordinates.",S.first3d),
    q("q-3d-b-02","3d","Movement","beginner","scenario","Which node is intended for a script-controlled 3D character?",["CharacterBody3D","MeshInstance3D","WorldEnvironment","ReflectionProbe"],0,"CharacterBody3D provides scripted collision-aware movement.",S.character3d),
    q("q-3d-b-03","3d","Cameras","beginner","concept","Which node renders a 3D viewpoint?",["Camera3D","CanvasLayer","NavigationLink3D","AudioListener2D"],0,"A current Camera3D defines the viewport's 3D view.",S.first3d),
    q("q-3d-i-01","3d","Direction","intermediate","concept","Why normalize a diagonal movement direction?",["To prevent diagonals from moving faster","To increase gravity","To enable the camera","To create a navmesh"],0,"Normalization limits the direction vector to a consistent length.",S.first3d),
    q("q-3d-i-02","3d","Areas","intermediate","scenario","Which node detects entry into a 3D trigger volume?",["Area3D","CSGBox3D","Camera3D","Skeleton3D"],0,"Area3D detects overlapping bodies and areas.",S.area3d),
    q("q-3d-i-03","3d","Ray casts","intermediate","scenario","When is direct physics-space access safest?",["During _physics_process()","While the editor imports textures","Only after queue_free()","Inside a shader fragment function"],0,"Physics space may be locked outside the physics step.",S.raycast),
    q("q-3d-a-01","3d","Transforms","advanced","concept","What does Transform3D add to a Basis?",["An origin position","An audio bus","A navigation map","A viewport texture"],0,"Transform3D contains a Basis plus an origin.",S.transforms3d),
    q("q-3d-a-02","3d","Navigation","advanced","concept","What moves a NavigationAgent3D's parent?",["Your movement script","The agent automatically","The navmesh baking process","The Camera3D"],0,"The agent calculates path and avoidance information; it does not move the parent node.",S.navigationAgents),
    q("q-3d-a-03","3d","Third-person cameras","advanced","scenario","Which node helps keep a third-person camera from clipping through walls?",["SpringArm3D","FogVolume","BoneAttachment3D","NavigationObstacle3D"],0,"SpringArm3D shortens its child camera distance when geometry blocks the arm.",S.springArm),

    q("q-ui-b-01","ui","Controls","beginner","concept","Which base class is used for Godot UI nodes?",["Control","Node3D","RigidBody2D","ResourceImporter"],0,"Control is the base class for interface elements.",S.controls),
    q("q-ui-b-02","ui","Anchors","beginner","concept","What range do Control anchors normally use relative to the parent?",["0 to 1","-255 to 255","0 to 360","Any node index"],0,"Anchor values are ratios of the parent rectangle.",S.anchors),
    q("q-ui-b-03","ui","Containers","beginner","scenario","Which node automatically arranges child controls in a row?",["HBoxContainer","Camera2D","Area3D","AnimationPlayer"],0,"HBoxContainer is a Container that lays out children horizontally.",S.containers),
    q("q-ui-i-01","ui","Themes","intermediate","scenario","Many buttons need the same colors and fonts. What should be shared?",["A Theme resource","A NavigationMesh","A PhysicsMaterial","A PackedVector3Array"],0,"Themes centralize reusable Control styling.",S.themes),
    q("q-ui-i-02","ui","Focus","intermediate","debug","A menu cannot be used with a gamepad. What should be reviewed?",["Focus modes and neighbors","Collision layers","Audio buses","Shader uniforms"],0,"Keyboard and controller GUI navigation depends on focus configuration.",S.focus),
    q("q-ui-i-03","ui","Size flags","intermediate","concept","Who interprets a Control child's size flags?",["Its parent Container","The audio server","The scene importer","NavigationServer3D"],0,"Container layout uses the child's size flags.",S.containers),
    q("q-ui-a-01","ui","Mouse filtering","advanced","debug","A decorative Control blocks clicks intended for a button beneath it. What property should be checked?",["mouse_filter","physics_material_override","stream_paused","navigation_layers"],0,"mouse_filter controls whether the decorative Control receives or passes mouse events.",S.controls),
    q("q-ui-a-02","ui","Scaling","advanced","scenario","What creates a predictable cross-resolution UI baseline?",["A base viewport size with suitable stretch settings","Randomly scaling every control","Changing physics ticks per screen","One Camera3D per button"],0,"Project viewport and stretch configuration define how the design resolution scales.",S.resolutions),
    q("q-ui-a-03","ui","Reusable UI","advanced","scenario","How should a reusable inventory panel announce that an item was selected?",["Emit a signal","Search for a hard-coded root path","Change scenes immediately","Modify the editor settings"],0,"A signal keeps the panel independent from the screen that owns it.",S.signals),

    q("q-sys-b-01","systems","Scenes","beginner","code","Which method creates nodes from a PackedScene?",["instantiate()","emit()","duplicate_deep()","get_ticks_msec()"],0,"PackedScene.instantiate() creates the stored hierarchy.",S.instancing),
    q("q-sys-b-02","systems","Timers","beginner","concept","Which Timer signal fires when its wait time ends?",["timeout","finished","expired","tick"],0,"Timer emits timeout.",S.timer),
    q("q-sys-b-03","systems","Audio","beginner","scenario","Which node plays menu music without positional attenuation?",["AudioStreamPlayer","AudioStreamPlayer2D","AudioEffectReverb","AudioListener3D"],0,"AudioStreamPlayer is non-positional.",S.audio),
    q("q-sys-i-01","systems","Autoload","intermediate","scenario","A small state service must persist while scenes change. Where can it live?",["An Autoload","A temporary child of each level","An import preset","A shader include"],0,"Autoloaded scripts or scenes remain available across scene changes.",S.autoload),
    q("q-sys-i-02","systems","Pause","intermediate","debug","A pause menu must keep processing while the tree is paused. What should be configured?",["Its process_mode","Its collision mask","Its texture filter","Its navigation map"],0,"process_mode determines whether a node runs while the SceneTree is paused.",S.pause),
    q("q-sys-i-03","systems","Saving","intermediate","concept","Which path prefix is writable in an exported game?",["user://","res://","uid://","scene://"],0,"user:// resolves to the project's per-user data directory.",S.saving),
    q("q-sys-a-01","systems","Persistence","advanced","scenario","How can a save system discover only objects that opt into saving?",["Use a persistent group","Scan every Object in memory","Read the editor history","Use collision layers"],0,"The official saving guide uses a group to identify persistent nodes.",S.saving),
    q("q-sys-a-02","systems","Scene flow","advanced","debug","A manager stores direct references to level children, then the level changes. What risk appears?",["References may point to freed nodes","All Resources become immutable","The input map is deleted","The viewport cannot render"],0,"Scene changes free the old scene. Signals and narrow interfaces reduce stale dependencies.",S.sceneChange),
    q("q-sys-a-03","systems","Data","advanced","scenario","Which type best represents one shared weapon definition used by many enemies?",["A custom Resource","A live Camera3D","A separate SceneTree","An InputEventMouseMotion"],0,"A Resource is reusable serialized data and can be shared by many nodes.",S.resources),

    q("q-pol-b-01","polish","Tweens","beginner","code","How do you create a Tween in Godot 4?",["create_tween()","Tween.new() and add_child()","get_tree().new_tween()","AnimationPlayer.tween()"],0,"Node.create_tween() returns a bound Tween that starts automatically.",S.tween),
    q("q-pol-b-02","polish","Particles","beginner","scenario","Which node provides GPU 2D particles?",["GPUParticles2D","SpriteFrames","CollisionPolygon2D","RemoteTransform2D"],0,"GPUParticles2D is the GPU particle emitter for 2D.",S.particles),
    q("q-pol-b-03","polish","Shaders","beginner","code","Which declaration selects a 2D canvas shader?",["shader_type canvas_item;","shader_type spatial;","extends CanvasItem","render_mode 2d;"],0,"canvas_item is the shader type for 2D canvas rendering.",S.shaders),
    q("q-pol-i-01","polish","Debugging","intermediate","scenario","A runtime error names a file and line. What is the first useful next step?",["Inspect that stack frame and error message","Change every related script","Disable the debugger","Export a release build"],0,"The debugger's stack trace identifies the failing path before broader changes are made.",S.debugging),
    q("q-pol-i-02","polish","Profiling","intermediate","concept","What does the profiler measure?",["Where frame time is spent","Only file sizes","Only input bindings","Only project metadata"],0,"Profiler categories and functions show performance costs over frames.",S.profiler),
    q("q-pol-i-03","polish","Remote tree","intermediate","debug","You need to inspect nodes created only at runtime. Which scene-tree view should be used?",["Remote","Local","Filesystem","Import"],0,"The Remote scene tree shows the running hierarchy.",S.debugging),
    q("q-pol-a-01","polish","Interpolation","advanced","concept","What does physics interpolation visually smooth?",["Motion between fixed physics ticks","Audio bus routing","Script parsing","Resource imports"],0,"It interpolates rendered transforms between physics updates.",S.interpolation),
    q("q-pol-a-02","polish","Loading","advanced","scenario","A resource path is constant and always needed by a script. Which load style is suitable?",["preload()","A per-frame load() call","HTTP polling","EditorInterface only"],0,"preload() resolves a constant path while the script is parsed.",S.loading),
    q("q-pol-a-03","polish","Export","advanced","debug","The editor cannot package a platform build because platform binaries are missing. What is required?",["Export templates","A second main scene","A new input map","A NavigationMesh"],0,"Export templates provide the platform-specific packaging data.",S.exporting)
  ];

  const guides=[
    {id:"christophe-tween-guide",kind:"Interactive guide",title:"Godot Tween Guide",description:"Interactive guide to tweens and game feel.",topics:["Tweens","Polish"],url:"https://qaqelol.itch.io/tweens",creator:"Christophe",version:"Godot 4.5+"},
    {id:"christophe-ui-guide",kind:"Interactive guide",title:"Godot Controls & UI Guide",description:"Interactive guide to Control nodes and interface layout.",topics:["UI","Control nodes"],url:"https://qaqelol.itch.io/gui",creator:"Christophe",version:"Godot 4.5+"},
    {id:"christophe-gdscript",kind:"Cheatsheets",title:"GDScript Cheatsheets",description:"Code order, naming, documentation comments, and export annotations.",topics:["GDScript","Exports"],url:"https://qaqelol.itch.io/godot-cheatsheets-gdscript",creator:"Christophe",version:"Godot 4.6+"},
    {id:"christophe-tweens",kind:"Cheatsheet",title:"Tween Cheatsheet",description:"Tween syntax and common tween operations.",topics:["Tweens"],url:"https://qaqelol.itch.io/tweens-cheatsheet",creator:"Christophe",version:"Godot 4"},
    {id:"christophe-shaders",kind:"Cheatsheets",title:"Shader Cheatsheets",description:"Shader uniforms and texture sampler hints.",topics:["Shaders"],url:"https://qaqelol.itch.io/godot-cheatsheets-shaders",creator:"Christophe",version:"Godot 4.6+"},
    {id:"christophe-text",kind:"Cheatsheets",title:"Text Formatting Cheatsheets",description:"Percent formatting and String.format syntax.",topics:["Strings","Formatting"],url:"https://qaqelol.itch.io/godot-cheatsheets-string",creator:"Christophe",version:"Godot 4.6+"},
    {id:"christophe-colors",kind:"Cheatsheets",title:"Color Cheatsheets",description:"Godot named Color constants.",topics:["Color","UI"],url:"https://qaqelol.itch.io/godot-cheatsheets-colors",creator:"Christophe",version:"Godot 4.6+"},
    {id:"christophe-bbcode",kind:"Cheatsheets",title:"BBCode Cheatsheets",description:"RichTextLabel tags, images, and animated text effects.",topics:["BBCode","UI"],url:"https://qaqelol.itch.io/godot-cheatsheets-bbcode",creator:"Christophe",version:"Godot 4.6+"}
  ];

  const categoryIds=new Set(categories.map(category=>category.id));
  const ids=new Set();
  for(const item of [...flashcards,...quizzes]){
    if(ids.has(item.id))throw new Error("Duplicate learning item id: "+item.id);
    if(!categoryIds.has(item.category))throw new Error("Unknown category: "+item.category);
    if(!item.source||!item.source.url.startsWith("https://docs.godotengine.org/en/4.7/"))throw new Error("Unpinned learning source: "+item.id);
    ids.add(item.id);
  }
  if(flashcards.length!==70)throw new Error("Expected 70 flashcards, received "+flashcards.length);
  if(quizzes.length!==63)throw new Error("Expected 63 quiz questions, received "+quizzes.length);

  window.GodotTokLearning=Object.freeze({version:VERSION,categories,flashcards,quizzes,guides});
})();

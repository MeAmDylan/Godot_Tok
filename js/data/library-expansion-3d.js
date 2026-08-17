(function(){
  "use strict";

  const base=window.GodotTokLibraryExpansion;
  if(!base) throw new Error("2D expansion must load before 3D expansion");
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
      id:"3d-auto-weapon",section:"3d",category:"Combat",title:"3D auto-target weapon and homing projectile",
      purpose:"Find the nearest target inside a configurable radius, fire on a Timer, and steer a projectile toward the selected target.",difficulty:"advanced",
      tags:["3D weapon","auto aim","horde","projectile","targeting","Timer"],
      nodeTree:["AutoWeapon3D (Node3D)","  Muzzle (Marker3D)","  Cooldown (Timer)","Projectile scene: Area3D > MeshInstance3D, CollisionShape3D"],
      inputActions:[],
      inspector:["Put damageable enemies in auto_targets_3d.","Assign projectile_scene and Muzzle.","Set projectile collision mask to enemy bodies only."],
      visuals:["Attach an original weapon mesh below AutoWeapon3D and align Muzzle at the barrel tip.","Give the projectile a small visible MeshInstance3D and matching CollisionShape3D before testing homing."],
      signals:[{from:"AutoWeapon3D",signal:"fired(target)",to:"Audio/VFX",method:"play_shot",why:"Spawn feedback only for real shots."},{from:"AutoProjectile3D",signal:"hit(target)",to:"Damage feedback",method:"show_hit",why:"Separate presentation from damage."}],
      files:[
        file("auto_weapon_3d.gd","AutoWeapon3D (Node3D)","Selects the nearest target and creates configured projectiles.",`
          class_name AutoWeapon3D
          extends Node3D

          signal fired(target: Node3D)
          @export var projectile_scene: PackedScene
          @export var damage: float = 1.0
          @export var attack_range: float = 16.0
          @export var cooldown_seconds: float = 0.6
          @onready var muzzle: Marker3D = $Muzzle
          @onready var cooldown: Timer = $Cooldown

          func _ready() -> void:
              cooldown.wait_time = cooldown_seconds
              cooldown.timeout.connect(_try_fire)
              cooldown.start()

          func configure(definition: WeaponDefinition) -> void:
              damage = definition.damage
              attack_range = definition.range
              cooldown_seconds = definition.cooldown
              if is_node_ready():
                  cooldown.wait_time = cooldown_seconds

          func _try_fire() -> void:
              var target := _nearest_target()
              if target == null or projectile_scene == null:
                  return
              var projectile_instance := projectile_scene.instantiate()
              if not projectile_instance is AutoProjectile3D:
                  projectile_instance.free()
                  push_error("Projectile Scene must have an AutoProjectile3D root.")
                  return
              var projectile := projectile_instance as AutoProjectile3D
              get_tree().current_scene.add_child(projectile)
              projectile.global_position = muzzle.global_position
              projectile.launch(target, damage)
              look_at(target.global_position, Vector3.UP, true)
              fired.emit(target)

          func _nearest_target() -> Node3D:
              var result: Node3D
              var best := attack_range
              for node in get_tree().get_nodes_in_group("auto_targets_3d"):
                  if node is Node3D:
                      var distance := global_position.distance_to(node.global_position)
                      if distance < best:
                          best = distance
                          result = node
              return result
        `),
        file("auto_projectile_3d.gd","Projectile scene root (Area3D)","Homes toward one target, applies damage, and expires safely.",`
          class_name AutoProjectile3D
          extends Area3D

          signal hit(target: Node)
          @export var speed: float = 18.0
          @export var turn_speed: float = 7.0
          @export var lifetime: float = 5.0
          var target: Node3D
          var damage: float
          var direction := Vector3.FORWARD

          func _ready() -> void:
              body_entered.connect(_on_body_entered)
              get_tree().create_timer(lifetime).timeout.connect(queue_free)

          func launch(value: Node3D, amount: float) -> void:
              target = value
              damage = amount
              if is_instance_valid(target):
                  direction = global_position.direction_to(target.global_position)

          func _physics_process(delta: float) -> void:
              if is_instance_valid(target):
                  var desired := global_position.direction_to(target.global_position)
                  direction = direction.slerp(desired, clampf(turn_speed * delta, 0.0, 1.0)).normalized()
              global_position += direction * speed * delta
              if direction.length_squared() > 0.0:
                  look_at(global_position + direction, Vector3.UP, true)

          func _on_body_entered(body: Node3D) -> void:
              if body.has_method("take_damage"):
                  body.call("take_damage", damage)
                  hit.emit(body)
                  queue_free()
        `)
      ],
      steps:["Build and test an enemy with collision, health, and auto_targets_3d membership.","Create the Area3D projectile scene with mesh and correctly sized collision.","Create AutoWeapon3D under the player, attach its visual mesh, and position Muzzle at the barrel.","Assign projectile scene and tune range and cooldown.","For loadouts, make the weapon scene implement configure and assign it to a WeaponDefinition.","Connect fired and hit to original SFX, particles, and screen feedback."],
      tests:["No target means no projectile.","The nearest in-range target is chosen.","An invalidated target does not crash a projectile.","A hit applies damage once.","Equipping another weapon resource changes stats without code edits."],
      sources:[S.area3d,S.timer,S.packedScene,S.resources],related:["shared-weapon-data-loadout","3d-area-health","shared-upgrade-offers"]
    }),
    recipe({
      id:"3d-procedural-arena",section:"3d",category:"Procedural",title:"Seeded modular 3D arena builder",
      purpose:"Scatter authored floor and obstacle modules on a reproducible grid while reserving safe spawn cells around the player.",difficulty:"advanced",
      tags:["procedural 3D","arena","modules","seed","roguelite","spawn safety"],
      nodeTree:["ArenaBuilder3D (Node3D)","  Generated (Node3D)","  PlayerSpawn (Marker3D)","  ExitSpawn (Marker3D)"],
      inputActions:[],
      inspector:["Assign only self-contained PackedScene modules with collision.","Use matching dimensions and pivots for every module.","Set safe_radius_cells around PlayerSpawn."],
      visuals:["Build each module as its own scene with MeshInstance3D and StaticBody3D collision aligned to the same origin.","Use primitive meshes first, then replace modules without changing grid coordinates."],
      signals:[{from:"ArenaBuilder3D",signal:"arena_built(seed, open_cells)",to:"Spawner",method:"populate",why:"Spawn enemies and loot only after geometry exists."}],
      files:[file("arena_builder_3d.gd","ArenaBuilder3D (Node3D)","Instantiates weighted random modules on a repeatable grid.",`
        class_name ArenaBuilder3D
        extends Node3D

        signal arena_built(seed: int, open_cells: Array[Vector2i])
        @export var modules: Array[PackedScene] = []
        @export var grid_size := Vector2i(12, 12)
        @export var spacing: float = 8.0
        @export_range(0.0, 1.0, 0.01) var obstacle_chance: float = 0.24
        @export_range(0, 5, 1) var safe_radius_cells: int = 2
        @onready var generated: Node3D = $Generated
        var rng := RandomNumberGenerator.new()

        func build(seed_value: int) -> void:
            for child in generated.get_children():
                child.queue_free()
            rng.seed = seed_value
            var open_cells: Array[Vector2i] = []
            var centre := grid_size / 2
            for x in range(grid_size.x):
                for y in range(grid_size.y):
                    var cell := Vector2i(x, y)
                    var safe := cell.distance_to(centre) <= safe_radius_cells
                    if safe or modules.is_empty() or rng.randf() > obstacle_chance:
                        open_cells.append(cell)
                        continue
                    var module_instance := modules[rng.randi_range(0, modules.size() - 1)].instantiate()
                    if not module_instance is Node3D:
                        module_instance.free()
                        push_error("Every arena module must have a Node3D root.")
                        continue
                    var module := module_instance as Node3D
                    generated.add_child(module)
                    module.position = Vector3((x - centre.x) * spacing, 0.0, (y - centre.y) * spacing)
                    module.rotation.y = rng.randi_range(0, 3) * PI * 0.5
            arena_built.emit(seed_value, open_cells)
      `)],
      steps:["Create a flat arena floor with navigation and a central PlayerSpawn.","Build at least three obstacle module scenes with aligned mesh and static collision.","Add them to Modules, set spacing to the module footprint, and attach the builder.","Call build with a saved run seed before navigation agents and spawners start.","Use open_cells for enemy, chest, and exit placement while reserving the central safe area.","Bake or update navigation after generated collision is present, according to the chosen navigation workflow."],
      tests:["The same seed produces the same transforms.","No obstacle enters the central safe radius.","All module collisions align to the grid.","Population begins after arena_built.","Restarting clears old generated modules."],
      sources:[S.packedScene,S.random,S.navAgents],related:["3d-auto-weapon","2d-enemy-scaling","shared-weighted-loot"]
    }),
    recipe({
      id:"3d-grappling-swing",section:"3d",category:"Traversal",title:"3D grapple pull, swing constraint, and rope mesh",
      purpose:"Attach a CharacterBody3D to a forward ray hit, add spring acceleration, constrain excess rope length, and visualize the connection.",difficulty:"advanced",
      tags:["3D grapple","swing","RayCast3D","rope","CharacterBody3D"],
      nodeTree:["GrapplePlayer3D (CharacterBody3D)","  CollisionShape3D","  Pivot (Node3D)","    CharacterMesh or imported model","    Camera3D","      GrappleRay (RayCast3D)","  Rope (MeshInstance3D) [BoxMesh]"],
      inputActions:[{name:"grapple",bindings:"Mouse 2, controller trigger, touch button"},{name:"move_left / move_right / move_up / move_down",bindings:"WASD, left stick"}],
      inspector:["Enable GrappleRay, point target_position down local negative Z, and mask grapple surfaces.","Assign a one-unit BoxMesh to Rope and set it initially hidden.","Keep CollisionShape3D scale at one."],
      visuals:["Import the player model below Pivot, position its feet at the body origin, and align CollisionShape3D before adding grapple movement.","Use a thin one-unit BoxMesh for Rope; the script stretches it between player and anchor."],
      signals:[{from:"GrapplePlayer3D",signal:"grapple_started(point)",to:"Audio/VFX",method:"play_attach",why:"Confirm a valid anchor."},{from:"GrapplePlayer3D",signal:"grapple_ended",to:"Audio/VFX",method:"play_release",why:"Stop rope effects."}],
      files:[file("grapple_player_3d.gd","GrapplePlayer3D (CharacterBody3D)","Provides basic air movement plus grapple attachment, pull, release, and rope visualization.",`
        class_name GrapplePlayer3D
        extends CharacterBody3D

        signal grapple_started(point: Vector3)
        signal grapple_ended
        @export var move_speed: float = 8.0
        @export var acceleration: float = 28.0
        @export var pull_strength: float = 24.0
        @export var rope_stiffness: float = 12.0
        @export var max_speed: float = 36.0
        @onready var camera: Camera3D = $Pivot/Camera3D
        @onready var ray: RayCast3D = $Pivot/Camera3D/GrappleRay
        @onready var rope: MeshInstance3D = $Rope
        var anchor := Vector3.ZERO
        var rope_length := 0.0
        var attached := false
        var gravity: float = ProjectSettings.get_setting("physics/3d/default_gravity")

        func _physics_process(delta: float) -> void:
            if not is_on_floor():
                velocity.y -= gravity * delta
            var input := Input.get_vector(&"move_left", &"move_right", &"move_up", &"move_down")
            var basis := camera.global_basis
            var wish := (basis.x * input.x + -basis.z * input.y)
            wish.y = 0.0
            velocity.x = move_toward(velocity.x, wish.normalized().x * move_speed, acceleration * delta)
            velocity.z = move_toward(velocity.z, wish.normalized().z * move_speed, acceleration * delta)
            if attached:
                var offset := anchor - global_position
                var stretch := offset.length() - rope_length
                velocity += offset.normalized() * (pull_strength + maxf(stretch, 0.0) * rope_stiffness) * delta
                velocity = velocity.limit_length(max_speed)
            move_and_slide()
            _update_rope()

        func _unhandled_input(event: InputEvent) -> void:
            if event.is_action_pressed(&"grapple"):
                try_grapple()
            elif event.is_action_released(&"grapple"):
                release_grapple()

        func try_grapple() -> bool:
            ray.force_raycast_update()
            if not ray.is_colliding():
                return false
            anchor = ray.get_collision_point()
            rope_length = global_position.distance_to(anchor)
            attached = true
            grapple_started.emit(anchor)
            return true

        func release_grapple() -> void:
            if attached:
                attached = false
                rope.hide()
                grapple_ended.emit()

        func _update_rope() -> void:
            if not attached:
                rope.hide()
                return
            rope.show()
            var midpoint := global_position.lerp(anchor, 0.5)
            rope.global_transform = Transform3D(Basis.looking_at(global_position.direction_to(anchor), Vector3.UP), midpoint)
            rope.scale = Vector3(0.04, 0.04, global_position.distance_to(anchor))
      `)],
      steps:["Finish collision, camera, and ground movement first.","Import the character below Pivot and align its feet, orientation, and collision.","Create a GrappleSurface physics layer and apply it only to valid geometry.","Add enabled GrappleRay below Camera3D and mask only GrappleSurface.","Add Rope MeshInstance3D with a one-unit BoxMesh, hide it, then attach the script.","Tune in a test tower, then isolate grapple, wall run, zip, and ground movement as explicit states before combining them."],
      tests:["The forward ray ignores invalid surfaces.","Attach preserves current momentum.","Pull speed clamps.","Release hides the rope immediately.","Camera and collision remain stable at high velocity."],
      sources:[S.ray3d,S.body3d,S.springArm],related:["3d-character-controller","3d-wall-run-web-zip","shared-finite-state-machine"]
    }),
    recipe({
      id:"3d-objective-marker",section:"3d",category:"Missions",title:"On-screen and off-screen 3D objective marker",
      purpose:"Project a world target into HUD coordinates, clamp off-screen markers to a safe rectangle, and rotate an arrow toward the target.",difficulty:"intermediate",
      tags:["objective marker","waypoint","HUD","Camera3D","missions","offscreen"],
      nodeTree:["HUD (CanvasLayer)","  ObjectiveMarker (Control)","    Icon (TextureRect)","    Arrow (TextureRect)","    Distance (Label)"],
      inputActions:[],
      inspector:["Set ObjectiveMarker layout to Full Rect.","Give Icon and Arrow fixed minimum sizes.","Assign the active Camera3D and target Node3D at runtime."],
      visuals:["Import one objective icon and one upward-facing arrow texture.","Keep the marker under a safe-area MarginContainer on mobile and reserve room for the distance label."],
      signals:[],
      files:[file("objective_marker_3d.gd","ObjectiveMarker (Control)","Projects and clamps one world-space target every frame.",`
        class_name ObjectiveMarker3D
        extends Control

        @export var camera: Camera3D
        @export var target: Node3D
        @export var edge_margin: float = 48.0
        @onready var icon: TextureRect = $Icon
        @onready var arrow: TextureRect = $Arrow
        @onready var distance_label: Label = $Distance

        func _process(_delta: float) -> void:
            if not is_instance_valid(camera) or not is_instance_valid(target):
                hide()
                return
            show()
            var viewport_size := get_viewport_rect().size
            var centre := viewport_size * 0.5
            var screen_position := camera.unproject_position(target.global_position)
            var behind := camera.is_position_behind(target.global_position)
            var direction := screen_position - centre
            if behind:
                direction = -direction
            if direction.length_squared() < 0.001:
                direction = Vector2.UP
            var bounds := Rect2(Vector2.ONE * edge_margin, viewport_size - Vector2.ONE * edge_margin * 2.0)
            var clamped := Vector2(clampf(screen_position.x, bounds.position.x, bounds.end.x), clampf(screen_position.y, bounds.position.y, bounds.end.y))
            var offscreen := behind or not bounds.has_point(screen_position)
            icon.position = clamped - icon.size * 0.5
            arrow.position = clamped - arrow.size * 0.5
            arrow.rotation = direction.angle() + PI * 0.5
            arrow.visible = offscreen
            distance_label.position = clamped + Vector2(18.0, 14.0)
            distance_label.text = "%d m" % roundi(camera.global_position.distance_to(target.global_position))
      `)],
      steps:["Create a full-screen Control below the HUD CanvasLayer.","Add Icon, Arrow, and Distance children and assign original textures.","Attach the script and assign the gameplay Camera3D.","When MissionSystem activates an objective, assign its world Node3D as target.","Clear target on completion or scene change.","Place the HUD below the screen-scaling safe-area container and test wide, tall, and behind-camera targets."],
      tests:["A visible target aligns with its world position.","Off-screen markers stay inside every edge.","Behind-camera targets point in the useful opposite direction.","Destroyed targets hide the marker.","Distance updates without opening another screen."],
      sources:[S.anchors,S.signals,S.body3d],related:["shared-mission-system","shared-screen-scaling","3d-wanted-heat"]
    }),
    recipe({
      id:"3d-wanted-heat",section:"3d",category:"Missions",title:"Wanted heat, pursuit levels, and decay",
      purpose:"Convert reported crimes into discrete heat levels, pause decay while observed, and emit clean signals for spawners, HUD, and mission rules.",difficulty:"intermediate",
      tags:["wanted level","heat","police","pursuit","open world","missions"],
      nodeTree:["WantedHeat (Node) [autoload]","HeatHUD (Control)","PursuitSpawner (Node3D)"],
      inputActions:[],
      inspector:["Add WantedHeat as an autoload.","Keep thresholds ascending and start with zero.","Call set_observed from detection zones rather than each officer."],
      signals:[{from:"WantedHeat",signal:"level_changed(level)",to:"HeatHUD and PursuitSpawner",method:"refresh / set_level",why:"Scale presentation and response from one authority."},{from:"WantedHeat",signal:"cleared",to:"MissionSystem",method:"on_heat_cleared",why:"Complete escape objectives."}],
      files:[file("wanted_heat.gd","WantedHeat (Node autoload)","Tracks heat points, levels, observation, and timed decay.",`
        extends Node

        signal heat_changed(points: float)
        signal level_changed(level: int)
        signal cleared
        @export var thresholds: Array[float] = [0.0, 20.0, 50.0, 90.0, 140.0, 200.0]
        @export var decay_per_second: float = 8.0
        @export var decay_delay: float = 5.0
        var heat: float = 0.0
        var level: int = 0
        var observed_count: int = 0
        var delay_remaining: float = 0.0

        func _process(delta: float) -> void:
            if observed_count > 0 or heat <= 0.0:
                return
            delay_remaining = maxf(delay_remaining - delta, 0.0)
            if delay_remaining == 0.0:
                _set_heat(heat - decay_per_second * delta)

        func report_crime(points: float) -> void:
            delay_remaining = decay_delay
            _set_heat(heat + maxf(points, 0.0))

        func observer_entered() -> void:
            observed_count += 1
            delay_remaining = decay_delay

        func observer_exited() -> void:
            observed_count = maxi(observed_count - 1, 0)

        func clear() -> void:
            _set_heat(0.0)

        func _set_heat(value: float) -> void:
            if thresholds.is_empty():
                push_error("Wanted heat thresholds cannot be empty.")
                return
            var previous_level := level
            var had_heat := heat > 0.0
            heat = clampf(value, 0.0, thresholds.back())
            level = 0
            for index in range(thresholds.size()):
                if heat >= thresholds[index]:
                    level = index
            heat_changed.emit(heat)
            if level != previous_level:
                level_changed.emit(level)
            if had_heat and heat == 0.0:
                cleared.emit()
      `)],
      steps:["Add WantedHeat as an autoload and set six ascending thresholds.","Connect criminal actions to report_crime with documented point values.","Create detection Areas that call observer_entered and observer_exited.","Connect level_changed to HUD icons and a PursuitSpawner table for response strength.","Connect cleared to escape-mission objectives.","Decide whether heat persists across manual saves, mission restarts, and scene transitions, then test that policy."],
      tests:["Negative reports add no heat.","Levels change only at thresholds.","Decay waits after a crime.","Any active observer prevents decay.","Heat reaching zero emits cleared once."],
      sources:[S.signals,S.gdscript],related:["shared-mission-system","3d-objective-marker","shared-save-slots-autosave"]
    }),
    recipe({
      id:"3d-arcade-car",section:"3d",category:"Vehicles",title:"Arcade VehicleBody3D setup and controls",
      purpose:"Configure a four-wheel VehicleBody3D, map steering, acceleration, reverse, and braking, and expose speed for HUD and race systems.",difficulty:"advanced",
      tags:["VehicleBody3D","car","driving","wheels","arcade","mobile"],
      nodeTree:["Car (VehicleBody3D)","  BodyMesh (MeshInstance3D)","  CollisionShape3D","  FrontLeft (VehicleWheel3D) [steering]","    WheelMesh","  FrontRight (VehicleWheel3D) [steering]","    WheelMesh","  RearLeft (VehicleWheel3D) [traction]","    WheelMesh","  RearRight (VehicleWheel3D) [traction]","    WheelMesh","  SpringArm3D","    Camera3D"],
      inputActions:[{name:"accelerate / brake_reverse",bindings:"W/S, triggers, touch pedals"},{name:"steer_left / steer_right",bindings:"A/D, left stick, touch steering"},{name:"handbrake",bindings:"Space, controller button"}],
      inspector:["Place wheel nodes at wheel centres and set wheel_radius to the mesh radius.","Enable wheel_use_steering on front wheels and wheel_use_as_traction on driven wheels.","Use a simple convex collision shape for the body and keep its centre low."],
      visuals:["Import the car model below VehicleBody3D and keep its forward direction aligned with local negative Z.","Attach each wheel mesh below its VehicleWheel3D and rotate the mesh locally if the imported axle orientation differs."],
      signals:[{from:"ArcadeCar3D",signal:"speed_changed(kph)",to:"Speed HUD",method:"set_speed",why:"Present speed without querying physics from UI."}],
      files:[file("arcade_car_3d.gd","Car (VehicleBody3D)","Applies engine force, steering, braking, drag, and a speed limit.",`
        class_name ArcadeCar3D
        extends VehicleBody3D

        signal speed_changed(kph: float)
        @export var engine_power: float = 55.0
        @export var reverse_power: float = 30.0
        @export var brake_power: float = 28.0
        @export var handbrake_power: float = 55.0
        @export var steering_limit: float = 0.48
        @export var steering_speed: float = 2.5
        @export var max_speed_kph: float = 145.0

        func _physics_process(delta: float) -> void:
            var throttle := Input.get_axis(&"brake_reverse", &"accelerate")
            var steer_input := Input.get_axis(&"steer_right", &"steer_left")
            steering = move_toward(steering, steer_input * steering_limit, steering_speed * delta)
            var forward_speed := linear_velocity.dot(-global_basis.z) * 3.6
            if throttle >= 0.0:
                engine_force = throttle * engine_power
            elif forward_speed > 3.0:
                engine_force = 0.0
                brake = -throttle * brake_power
            else:
                brake = 0.0
                engine_force = throttle * reverse_power
            if throttle >= 0.0:
                brake = handbrake_power if Input.is_action_pressed(&"handbrake") else 0.0
            if linear_velocity.length() * 3.6 > max_speed_kph and engine_force > 0.0:
                engine_force = 0.0
            speed_changed.emit(linear_velocity.length() * 3.6)
      `)],
      steps:["Create Car as VehicleBody3D, attach a low simple CollisionShape3D, and import the body mesh at the origin.","Add four VehicleWheel3D children at exact wheel centres and attach visible wheel meshes.","Set wheel radii, suspension travel, steering flags, and traction flags in the Inspector.","Add SpringArm3D and Camera3D behind and above the car.","Create all named input actions, attach the script, and test on a flat collision plane.","Tune mass, wheel friction, suspension, power, and steering one variable at a time; Godot documents VehicleBody3D as a known-issues convenience model, so switch to custom raycast suspension if the final handling needs exceed it."],
      tests:["The body rests on all wheels without mesh penetration.","Forward and reverse use correct visual direction.","Steering recentres smoothly.","Handbrake increases braking.","Speed caps and HUD values remain stable."],
      sources:[S.vehicle,S.wheel,S.springArm],related:["3d-kart-race","shared-mobile-controls","shared-multidevice-input"]
    }),
    recipe({
      id:"3d-kart-race",section:"3d",category:"Vehicles",title:"Kart laps, ordered checkpoints, drift boost, and item boxes",
      purpose:"Layer race rules over the arcade car: ordered checkpoints, laps, placements, drift-charge boosts, and randomized single-use item pickups.",difficulty:"advanced",
      tags:["kart","race","laps","checkpoints","drift boost","items"],
      nodeTree:["Race (Node3D)","  RaceProgress (Node)","  Checkpoints (Node3D)","    Checkpoint00 (Area3D)","      CollisionShape3D","  ItemBoxes (Node3D)","    ItemBox (Area3D)","  Racers (Node3D)","Kart: ArcadeCar3D > KartDriftBoost (Node)"],
      inputActions:[{name:"drift",bindings:"Space, bumper, touch button"},{name:"use_item",bindings:"Control, controller button, touch button"}],
      inspector:["Number checkpoints from zero in driving order.","Set total_checkpoints and laps_to_finish on RaceProgress.","Add racers to race_racers and item receivers to kart_item_receivers."],
      visuals:["Create checkpoint gates wide enough for the track and show the next gate with particles or arrows.","Attach original kart and driver meshes to the arcade-car hierarchy, then add wheel effects and drift sparks under dedicated Marker3D nodes."],
      signals:[{from:"RaceCheckpoint3D",signal:"racer_passed(racer, index)",to:"KartRaceProgress",method:"pass_checkpoint",why:"Validate sequence centrally."},{from:"KartRaceProgress",signal:"race_finished(racer, place)",to:"Results UI",method:"show_finish",why:"Freeze final placement."}],
      files:[
        file("kart_race_progress.gd","RaceProgress (Node)","Tracks each racer's expected checkpoint, lap, and finish order.",`
          class_name KartRaceProgress
          extends Node

          signal progress_changed(racer: Node3D, lap: int, checkpoint: int)
          signal race_finished(racer: Node3D, place: int)
          @export_range(1, 20, 1) var total_checkpoints: int = 4
          @export_range(1, 20, 1) var laps_to_finish: int = 3
          var progress: Dictionary = {}
          var finish_order: Array[Node3D] = []

          func register_racer(racer: Node3D) -> void:
              progress[racer] = {"lap": 1, "next": 0}

          func pass_checkpoint(racer: Node3D, checkpoint: int) -> void:
              if not progress.has(racer) or finish_order.has(racer):
                  return
              var data: Dictionary = progress[racer]
              if checkpoint != int(data["next"]):
                  return
              data["next"] = (checkpoint + 1) % total_checkpoints
              if int(data["next"]) == 0:
                  data["lap"] = int(data["lap"]) + 1
                  if int(data["lap"]) > laps_to_finish:
                      finish_order.append(racer)
                      race_finished.emit(racer, finish_order.size())
                      return
              progress[racer] = data
              progress_changed.emit(racer, int(data["lap"]), int(data["next"]))
        `),
        file("race_checkpoint_3d.gd","Each Checkpoint (Area3D)","Reports racer bodies with this gate's ordered index.",`
          class_name RaceCheckpoint3D
          extends Area3D

          signal racer_passed(racer: Node3D, index: int)
          @export var index: int = 0

          func _ready() -> void:
              body_entered.connect(_on_body_entered)

          func _on_body_entered(body: Node3D) -> void:
              if body.is_in_group("race_racers"):
                  racer_passed.emit(body, index)
        `),
        file("kart_drift_boost.gd","KartDriftBoost (Node below ArcadeCar3D)","Charges while steering and drifting, then adds a capped forward impulse.",`
          class_name KartDriftBoost
          extends Node

          signal charge_changed(ratio: float)
          signal boost_released(tier: int)
          @export var minimum_speed_kph: float = 25.0
          @export var charge_seconds: float = 1.5
          @export var max_charge_seconds: float = 3.0
          @export var impulse_per_tier: float = 5.0
          @onready var kart: ArcadeCar3D = get_parent() as ArcadeCar3D
          var charge: float = 0.0

          func _physics_process(delta: float) -> void:
              var steering_input := absf(Input.get_axis(&"steer_right", &"steer_left"))
              var drifting := Input.is_action_pressed(&"drift") and steering_input > 0.25 and kart.linear_velocity.length() * 3.6 >= minimum_speed_kph
              if drifting:
                  charge = minf(charge + delta, max_charge_seconds)
                  charge_changed.emit(charge / max_charge_seconds)
              elif charge > 0.0:
                  var tier := clampi(floori(charge / charge_seconds) + 1, 1, 2)
                  kart.apply_central_impulse(-kart.global_basis.z * impulse_per_tier * tier)
                  charge = 0.0
                  charge_changed.emit(0.0)
                  boost_released.emit(tier)
        `),
        file("kart_item_box.gd","ItemBox (Area3D)","Awards one random item ID, hides, and respawns after a delay.",`
          class_name KartItemBox3D
          extends Area3D

          @export var item_ids: Array[StringName] = []
          @export var respawn_seconds: float = 6.0
          var rng := RandomNumberGenerator.new()
          var available := true

          func _ready() -> void:
              rng.randomize()
              body_entered.connect(_on_body_entered)

          func _on_body_entered(body: Node3D) -> void:
              if not available or item_ids.is_empty() or not body.has_method("receive_kart_item"):
                  return
              available = false
              body.call("receive_kart_item", item_ids[rng.randi_range(0, item_ids.size() - 1)])
              hide()
              set_deferred("monitoring", false)
              await get_tree().create_timer(respawn_seconds).timeout
              show()
              monitoring = true
              available = true
        `)
      ],
      steps:["Complete the arcade-car recipe and make one stable lap around a collision-tested track.","Place Area3D checkpoint gates in order, set indices from zero, and connect each racer_passed to RaceProgress.pass_checkpoint.","Register every player and AI kart before countdown ends.","Add KartDriftBoost below each car, create the drift action, and connect charge feedback to wheel sparks.","Place item boxes and implement receive_kart_item plus use_item on racers using original item Resources.","Add countdown, wrong-way detection, respawn, AI pathing, and results only after checkpoint sequence and finish order pass tests."],
      tests:["Skipping a checkpoint never advances progress.","Crossing a gate twice does not skip the expected index.","The final ordered gate increments a lap.","Finish placement is immutable.","Drift boosts cap at two tiers and item boxes respawn once."],
      sources:[S.vehicle,S.area3d,S.random,S.signals],related:["3d-arcade-car","shared-weighted-loot","shared-mobile-controls"]
    }),
    recipe({
      id:"3d-wall-run-web-zip",section:"3d",category:"Traversal",title:"Wall run and forward web-zip traversal",
      purpose:"Detect runnable walls on either side, reduce falling while moving along them, and zip toward a valid forward ray point without teleporting.",difficulty:"advanced",
      tags:["wall run","web zip","parkour","RayCast3D","CharacterBody3D","traversal"],
      nodeTree:["TraversalPlayer3D (CharacterBody3D)","  CollisionShape3D","  Pivot (Node3D)","    CharacterMesh","    Camera3D","      ZipRay (RayCast3D)","  WallLeft (RayCast3D)","  WallRight (RayCast3D)"],
      inputActions:[{name:"zip",bindings:"Mouse 2, trigger, touch button"},{name:"jump",bindings:"Space, controller south"},{name:"move_left / move_right / move_up / move_down",bindings:"WASD, left stick"}],
      inspector:["Point WallLeft and WallRight along local X and mask runnable walls.","Point ZipRay forward from the camera and set the maximum zip distance.","Use a capsule collision with scale one."],
      visuals:["Import and align the player model below Pivot before tuning traversal.","Add separate trail, wall-contact sparks, zip reticle, and landing effects under Marker3D children so code never depends on model bones."],
      signals:[{from:"TraversalPlayer3D",signal:"wall_run_changed(active)",to:"Animation/Audio",method:"set_wall_run",why:"Drive presentation from traversal state."},{from:"TraversalPlayer3D",signal:"zip_started(point)",to:"Camera/VFX",method:"play_zip",why:"Confirm a valid target."}],
      files:[file("wall_run_web_zip.gd","TraversalPlayer3D (CharacterBody3D)","Combines basic movement, side-ray wall running, wall jump, and timed zip acceleration.",`
        class_name TraversalPlayer3D
        extends CharacterBody3D

        signal wall_run_changed(active: bool)
        signal zip_started(point: Vector3)
        signal zip_finished
        @export var move_speed: float = 10.0
        @export var acceleration: float = 35.0
        @export var jump_velocity: float = 9.0
        @export var wall_fall_speed: float = 1.5
        @export var wall_jump_push: float = 7.0
        @export var zip_speed: float = 30.0
        @export var zip_stop_distance: float = 1.5
        @onready var camera: Camera3D = $Pivot/Camera3D
        @onready var zip_ray: RayCast3D = $Pivot/Camera3D/ZipRay
        @onready var wall_left: RayCast3D = $WallLeft
        @onready var wall_right: RayCast3D = $WallRight
        var gravity: float = ProjectSettings.get_setting("physics/3d/default_gravity")
        var wall_running := false
        var zip_target := Vector3.ZERO
        var zipping := false

        func _physics_process(delta: float) -> void:
            var input := Input.get_vector(&"move_left", &"move_right", &"move_up", &"move_down")
            var wish := camera.global_basis.x * input.x + -camera.global_basis.z * input.y
            wish.y = 0.0
            wish = wish.normalized()
            var touching_wall := wall_left.is_colliding() or wall_right.is_colliding()
            var should_wall_run := not is_on_floor() and touching_wall and input.y > 0.1 and velocity.length() > 2.0 and not zipping
            if should_wall_run != wall_running:
                wall_running = should_wall_run
                wall_run_changed.emit(wall_running)
            if zipping:
                var distance := global_position.distance_to(zip_target)
                if distance <= zip_stop_distance:
                    zipping = false
                    zip_finished.emit()
                else:
                    velocity = global_position.direction_to(zip_target) * zip_speed
            else:
                velocity.x = move_toward(velocity.x, wish.x * move_speed, acceleration * delta)
                velocity.z = move_toward(velocity.z, wish.z * move_speed, acceleration * delta)
                if wall_running:
                    velocity.y = maxf(velocity.y, -wall_fall_speed)
                elif not is_on_floor():
                    velocity.y -= gravity * delta
                if Input.is_action_just_pressed(&"jump"):
                    if is_on_floor():
                        velocity.y = jump_velocity
                    elif wall_running:
                        var normal := wall_left.get_collision_normal() if wall_left.is_colliding() else wall_right.get_collision_normal()
                        velocity = normal * wall_jump_push + Vector3.UP * jump_velocity
            move_and_slide()

        func _unhandled_input(event: InputEvent) -> void:
            if event.is_action_pressed(&"zip"):
                try_zip()

        func try_zip() -> bool:
            zip_ray.force_raycast_update()
            if not zip_ray.is_colliding():
                return false
            zip_target = zip_ray.get_collision_point()
            zipping = true
            wall_running = false
            zip_started.emit(zip_target)
            return true
      `)],
      steps:["Finish the normal 3D character and camera before adding traversal.","Import and align the character mesh and capsule collision.","Create RunnableWall and ZipTarget physics layers on deliberate geometry.","Add and enable side rays at torso height, pointing just beyond the capsule.","Add ZipRay below Camera3D, mask valid zip geometry, attach the script, and add input actions.","Move traversal into explicit finite-state-machine states before combining it with grapple swinging, combat, animation, and camera shake."],
      tests:["Ground movement and jump still work without walls.","Only masked side surfaces start wall run.","Falling is limited but not removed on a wall.","Wall jump pushes away from the detected normal.","Zip fails on empty space and stops near the hit without teleporting."],
      sources:[S.ray3d,S.body3d,S.signals],related:["3d-grappling-swing","3d-character-controller","shared-finite-state-machine"]
    }),
  ];

  window.GodotTokLibraryExpansion=Object.freeze({
    ...base,
    recipes:Object.freeze([...base.recipes,...recipes])
  });
})();

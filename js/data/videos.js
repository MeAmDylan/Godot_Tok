(function(){
  "use strict";

  const manual = [
    {
      "id": "tt_7621614029471059233",
      "type": "tt",
      "vid": "7621614029471059233",
      "handle": "@godot_tutorial",
      "title": "Godot engine tips and tricks",
      "creator": "@godot_tutorial",
      "long": false
    },
    {
      "id": "yt_v7d8uYw59jk",
      "type": "yt",
      "vid": "v7d8uYw59jk",
      "title": "60-Second Godot Roadmap for 2025",
      "creator": "GDQuest",
      "long": false
    },
    {
      "id": "yt_7bDRWiPMVjM",
      "type": "yt",
      "vid": "7bDRWiPMVjM",
      "title": "3 Simple Tips for Godot 4.3",
      "creator": "TheGodotRookie",
      "long": false
    },
    {
      "id": "yt__JfiGCH3IH4",
      "type": "yt",
      "vid": "_JfiGCH3IH4",
      "title": "Disabling Nodes | Godot Tips",
      "creator": "Bitlytic",
      "long": false
    },
    {
      "id": "yt_2KL1cAe2NFI",
      "type": "yt",
      "vid": "2KL1cAe2NFI",
      "title": "Biggest Game Made with Godot 4",
      "creator": "GameDevShorts",
      "long": false
    },
    {
      "id": "yt_ckQGoa6-TMU",
      "type": "yt",
      "vid": "ckQGoa6-TMU",
      "title": "Change Game Scene in Godot 4.4",
      "creator": "GodotTips",
      "long": false
    },
    {
      "id": "yt_bChoEFDe5ks",
      "type": "yt",
      "vid": "bChoEFDe5ks",
      "title": "Godot 4.6: What's New",
      "creator": "Zenva",
      "long": false
    },
    {
      "id": "yt_iletwmlcsEM",
      "type": "yt",
      "vid": "iletwmlcsEM",
      "title": "Why AI Will Never Be Good at Godot 4",
      "creator": "Zenva",
      "long": false
    },
    {
      "id": "yt_-zwY2jM32A",
      "type": "yt",
      "vid": "-zwY2jM3-2A",
      "title": "Control Projectile Direction in Godot 4",
      "creator": "Quick Guide",
      "long": false
    },
    {
      "id": "yt_UuEqUN98uZo",
      "type": "yt",
      "vid": "UuEqUN98uZo",
      "title": "5 Invaluable Godot 4 Code Patterns ft. GDQuest",
      "creator": "PlayWithFurcifer",
      "long": false
    },
    {
      "id": "yt_Pm-Gu8d_2Ug",
      "type": "yt",
      "vid": "Pm-Gu8d_2Ug",
      "title": "Should You Use Godot 4 Already?",
      "creator": "GDQuest",
      "long": false
    },
    {
      "id": "yt_D0uGtnMhB-E",
      "type": "yt",
      "vid": "D0uGtnMhB-E",
      "title": "Resources vs Dictionaries in Godot 4",
      "creator": "DevWorm",
      "long": false
    },
    {
      "id": "yt_XvRY-g27OQk",
      "type": "yt",
      "vid": "XvRY-g27OQk",
      "title": "Easy 3D Pathfinding in Godot",
      "creator": "Chap.C Creates",
      "long": false
    },
    {
      "id": "yt_h7O2lLNgbn4",
      "type": "yt",
      "vid": "h7O2lLNgbn4",
      "title": "Procedural Dungeon with Drunkard Walk",
      "creator": "DeveloperEzra",
      "long": false
    },
    {
      "id": "yt_xoExhXu-Aw0",
      "type": "yt",
      "vid": "xoExhXu-Aw0",
      "title": "GodotCon 2025: C# in Godot",
      "creator": "GodotCon",
      "long": false
    },
    {
      "id": "yt_u_WMJG0menc",
      "type": "yt",
      "vid": "u_WMJG0menc",
      "title": "State of Godot and the Web: GodotCon 2025",
      "creator": "GodotCon",
      "long": false
    },
    {
      "id": "yt_wWD7OCx7tNs",
      "type": "yt",
      "vid": "wWD7OCx7tNs",
      "title": "Open Language Models in Godot: GodotCon 2025",
      "creator": "GodotCon",
      "long": false
    },
    {
      "id": "yt_JqL_oZ9SG7Q",
      "type": "yt",
      "vid": "JqL_oZ9SG7Q",
      "title": "Building a Godot Plugin: GodotCon 2025",
      "creator": "Scott Doxey",
      "long": false
    },
    {
      "id": "yt_kXn2WoWK0rc",
      "type": "yt",
      "vid": "kXn2WoWK0rc",
      "title": "Making a Fake OS in Godot: GodotCon 2025",
      "creator": "Davide Di Staso",
      "long": false
    },
    {
      "id": "yt_ITRuS1ge9AY",
      "type": "yt",
      "vid": "ITRuS1ge9AY",
      "title": "3D Particle Trail in Godot 4",
      "creator": "FencerDevLog",
      "long": false
    },
    {
      "id": "yt_LOhfqjmasi0",
      "type": "yt",
      "vid": "LOhfqjmasi0",
      "title": "How to Make a Video Game: Godot Beginner Tutorial",
      "creator": "Brackeys",
      "long": true
    },
    {
      "id": "yt_e1zJS31tr88",
      "type": "yt",
      "vid": "e1zJS31tr88",
      "title": "How to Program in Godot: GDScript in 1 Hour",
      "creator": "Brackeys",
      "long": true
    },
    {
      "id": "yt_nAh_Kx5Zh5Q",
      "type": "yt",
      "vid": "nAh_Kx5Zh5Q",
      "title": "The Ultimate Introduction to Godot 4",
      "creator": "Clear Code",
      "long": true
    },
    {
      "id": "yt_HRxw8Ecrqxk",
      "type": "yt",
      "vid": "HRxw8Ecrqxk",
      "title": "Complete FREE Godot 4 Beginner Course 2025",
      "creator": "Red Fools Studio",
      "long": true
    }
  ];

  const automatic = [];
  const freezeItem = item => Object.freeze(item);
  const frozenManual = Object.freeze(manual.map(freezeItem));
  const frozenAutomatic = Object.freeze(automatic.map(freezeItem));

  window.GodotTokVideos = Object.freeze({
    manual: frozenManual,
    automatic: frozenAutomatic,
    all: Object.freeze([...frozenManual, ...frozenAutomatic])
  });
})();

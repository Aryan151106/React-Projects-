"""PixelLab Asset Generator for Quest Taskmaster

This script generates pixel art assets using the PixelLab MCP API.
Run this locally with your PixelLab API token to generate game assets.

Usage:
    python generate_assets.py

The script will generate:
- Character sprites (base character, different outfits, accessories)
- Monster sprites (slime, orc, dragon, etc.)
- UI elements (buttons, borders, icons)
- Environment tiles

Requirements:
    pip install requests pillow
"""

import os
import sys
import json
import time

try:
    import requests
except ImportError:
    print("Please install requests: pip install requests")
    sys.exit(1)

# Configuration
CONFIG_PATH = os.path.join(os.path.dirname(__file__), '..', 'pixellab_mcp.json')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'public', 'assets')

def load_config():
    """Load PixelLab MCP configuration"""
    try:
        with open(CONFIG_PATH, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Config not found at {CONFIG_PATH}")
        print("Please create pixellab_mcp.json with your API credentials")
        sys.exit(1)

def ensure_output_dirs():
    """Create output directories if they don't exist"""
    dirs = [
        os.path.join(OUTPUT_DIR, 'characters'),
        os.path.join(OUTPUT_DIR, 'monsters'),
        os.path.join(OUTPUT_DIR, 'ui'),
        os.path.join(OUTPUT_DIR, 'tiles'),
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)

def call_pixellab_tool(url, headers, tool_name, params):
    """Call a PixelLab MCP tool"""
    payload = {'tool': tool_name, 'params': params}
    print(f"Calling {tool_name}...")
    resp = requests.post(url, json=payload, headers=headers, timeout=120)
    resp.raise_for_status()
    return resp.json()

def wait_for_completion(url, headers, get_tool, resource_id, id_field='character_id'):
    """Poll until a resource is ready"""
    print(f"Waiting for {resource_id} to complete...")
    for _ in range(60):  # 5 minute timeout
        payload = {'tool': get_tool, 'params': {id_field: resource_id}}
        resp = requests.post(url, json=payload, headers=headers, timeout=30)
        data = resp.json()
        
        status = data.get('status') or data.get('job_status')
        if status in ('completed', 'success'):
            print(f"  ✓ Completed!")
            return data
        if status in ('failed', 'error'):
            print(f"  ✗ Failed: {data}")
            return None
        
        time.sleep(5)
    
    print("  ✗ Timeout")
    return None

def generate_character_assets(url, headers):
    """Generate character sprites"""
    print("\n=== Generating Character Assets ===")
    
    characters = [
        {
            'description': 'young adventurer boy with red cap, yellow vest over white shirt, blue shorts, brown shoes, friendly determined expression',
            'name': 'hero_base',
            'n_directions': 8,
            'size': 48,
            'proportions': '{"type": "preset", "name": "chibi"}',
        },
        {
            'description': 'warrior knight in silver armor with sword and shield, heroic pose',
            'name': 'hero_knight',
            'n_directions': 8,
            'size': 48,
            'proportions': '{"type": "preset", "name": "heroic"}',
        },
        {
            'description': 'wizard mage in purple robe with magic staff, mysterious aura',
            'name': 'hero_mage',
            'n_directions': 8,
            'size': 48,
            'proportions': '{"type": "preset", "name": "stylized"}',
        },
    ]
    
    for char in characters:
        try:
            result = call_pixellab_tool(url, headers, 'create_character', char)
            char_id = result.get('character_id') or result.get('id')
            if char_id:
                data = wait_for_completion(url, headers, 'get_character', char_id)
                if data and data.get('download_url'):
                    # Download the character sprite
                    download_url = data['download_url']
                    img_resp = requests.get(download_url)
                    if img_resp.status_code == 200:
                        output_path = os.path.join(OUTPUT_DIR, 'characters', f"{char['name']}.png")
                        with open(output_path, 'wb') as f:
                            f.write(img_resp.content)
                        print(f"  Saved: {output_path}")
        except Exception as e:
            print(f"  Error generating {char['name']}: {e}")

def generate_monster_sprites(url, headers):
    """Generate monster sprites using map_object or character tools"""
    print("\n=== Generating Monster Sprites ===")
    
    monsters = [
        {'name': 'slime', 'description': 'cute green slime monster, bouncy gelatinous blob with googly eyes, pixel art RPG style'},
        {'name': 'goblin', 'description': 'small green goblin scout with dagger, mischievous evil grin, pixel art RPG style'},
        {'name': 'orc', 'description': 'muscular orc warrior with battle axe, fierce angry expression, pixel art RPG style'},
        {'name': 'dragon', 'description': 'majestic red dragon breathing fire, wings spread, pixel art boss monster style'},
        {'name': 'shadow_knight', 'description': 'dark armored knight with glowing red eyes, ethereal shadow effects, pixel art style'},
        {'name': 'lich', 'description': 'undead lich sorcerer with skull face, purple magic aura, tattered robes, pixel art style'},
    ]
    
    for monster in monsters:
        try:
            params = {
                'description': monster['description'],
                'width': 64,
                'height': 64,
                'view': 'low top-down',
                'outline': 'single color outline',
                'shading': 'medium shading',
                'detail': 'highly detailed',
            }
            result = call_pixellab_tool(url, headers, 'create_map_object', params)
            obj_id = result.get('object_id') or result.get('id')
            if obj_id:
                data = wait_for_completion(url, headers, 'get_map_object', obj_id, 'object_id')
                if data:
                    # Look for image in response
                    download_url = data.get('download_url') or data.get('url')
                    if download_url:
                        img_resp = requests.get(download_url)
                        if img_resp.status_code == 200:
                            output_path = os.path.join(OUTPUT_DIR, 'monsters', f"{monster['name']}.png")
                            with open(output_path, 'wb') as f:
                                f.write(img_resp.content)
                            print(f"  Saved: {output_path}")
        except Exception as e:
            print(f"  Error generating {monster['name']}: {e}")

def generate_ui_elements(url, headers):
    """Generate UI elements"""
    print("\n=== Generating UI Elements ===")
    
    ui_elements = [
        {'name': 'button_normal', 'description': 'RPG game button, golden border, dark background, medieval fantasy style'},
        {'name': 'button_hover', 'description': 'RPG game button glowing, golden highlight, medieval fantasy style'},
        {'name': 'health_bar_frame', 'description': 'RPG health bar ornate frame, red and gold, pixel art style'},
        {'name': 'exp_bar_frame', 'description': 'RPG experience bar frame, green and silver, pixel art style'},
        {'name': 'coin_icon', 'description': 'golden coin with shine, pixel art RPG style'},
        {'name': 'sword_icon', 'description': 'pixel art sword weapon icon, silver blade gold handle'},
        {'name': 'shield_icon', 'description': 'pixel art shield icon, blue with gold trim'},
    ]
    
    for element in ui_elements:
        try:
            params = {
                'description': element['description'],
                'width': 32,
                'height': 32,
                'view': 'high top-down',
                'outline': 'single color outline',
                'detail': 'medium detail',
            }
            result = call_pixellab_tool(url, headers, 'create_map_object', params)
            obj_id = result.get('object_id') or result.get('id')
            if obj_id:
                data = wait_for_completion(url, headers, 'get_map_object', obj_id, 'object_id')
                if data and data.get('download_url'):
                    img_resp = requests.get(data['download_url'])
                    if img_resp.status_code == 200:
                        output_path = os.path.join(OUTPUT_DIR, 'ui', f"{element['name']}.png")
                        with open(output_path, 'wb') as f:
                            f.write(img_resp.content)
                        print(f"  Saved: {output_path}")
        except Exception as e:
            print(f"  Error generating {element['name']}: {e}")

def generate_environment_tiles(url, headers):
    """Generate environment tilesets"""
    print("\n=== Generating Environment Tiles ===")
    
    try:
        # Dark dungeon tileset
        params = {
            'lower_description': 'dark stone dungeon floor',
            'upper_description': 'cracked stone path with moss',
            'tile_size': {'width': 16, 'height': 16},
            'view': 'low top-down',
            'transition_size': 0.25,
        }
        result = call_pixellab_tool(url, headers, 'create_topdown_tileset', params)
        tileset_id = result.get('tileset_id') or result.get('id')
        if tileset_id:
            data = wait_for_completion(url, headers, 'get_topdown_tileset', tileset_id, 'tileset_id')
            if data and data.get('download_url'):
                img_resp = requests.get(data['download_url'])
                if img_resp.status_code == 200:
                    output_path = os.path.join(OUTPUT_DIR, 'tiles', 'dungeon_tiles.png')
                    with open(output_path, 'wb') as f:
                        f.write(img_resp.content)
                    print(f"  Saved: {output_path}")
    except Exception as e:
        print(f"  Error generating dungeon tiles: {e}")

def main():
    print("Quest Taskmaster - PixelLab Asset Generator")
    print("=" * 50)
    
    config = load_config()
    server = config['servers']['pixellab']
    url = server['url']
    headers = server.get('headers', {})
    
    ensure_output_dirs()
    
    # Generate all assets
    generate_character_assets(url, headers)
    generate_monster_sprites(url, headers)
    generate_ui_elements(url, headers)
    generate_environment_tiles(url, headers)
    
    print("\n" + "=" * 50)
    print("Asset generation complete!")
    print(f"Assets saved to: {OUTPUT_DIR}")

if __name__ == '__main__':
    main()

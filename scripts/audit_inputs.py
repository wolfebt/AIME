import os
import re
from html.parser import HTMLParser

class ElementInputParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tabs = {} # id_suffix -> display_name
        self.subtabs = {} # id_suffix -> display_name

        self.current_tab_id = None
        self.current_subtab_id = None

        # Structure: TabName -> (fields_list, {SubTabName -> fields_list})
        self.structure = {}
        self.tab_order = []
        self.subtab_order_map = {} # TabName -> [SubTabNames]

        self.in_label = False
        self.current_label = ""
        self.ignored_containers_depth = 0

        self.active_container_type = None # 'tab' or 'subtab'

        # Depth tracking
        self.current_depth = 0
        self.tab_start_depth = None
        self.subtab_start_depth = None

    def handle_starttag(self, tag, attrs):
        self.current_depth += 1
        attrs_dict = dict(attrs)
        classes = attrs_dict.get('class', '').split()
        id_val = attrs_dict.get('id', '')

        # Identify ignored containers
        if 'accordion-content' in classes or 'asset-hub-panel' in classes or 'modal-content' in classes or 'settings-modal-overlay' in classes:
            self.ignored_containers_depth += 1
            return

        if self.ignored_containers_depth > 0:
            self.ignored_containers_depth += 1
            return

        # 1. Map Tab Buttons
        if tag == 'button' and 'element-nav-button' in classes:
            tab_id = attrs_dict.get('data-tab')
            if tab_id:
                self.tabs[tab_id] = '' # Name captured in handle_data
                self.current_capture_target = ('tab', tab_id)

        # 2. Map Sub-Tab Buttons
        if tag == 'button' and 'sub-nav-button' in classes:
            subtab_id = attrs_dict.get('data-sub-tab')
            if subtab_id:
                self.subtabs[subtab_id] = '' # Name captured in handle_data
                self.current_capture_target = ('subtab', subtab_id)

        # 3. Enter Tab Content
        if tag == 'div' and 'element-tab' in classes:
            # Check if this ID matches a known tab
            for tab_key in self.tabs.keys():
                if id_val == f"{tab_key}-tab":
                    self.current_tab_id = tab_key
                    self.active_container_type = 'tab'
                    self.tab_start_depth = self.current_depth

                    # Reset label state on tab switch
                    self.current_label = ""

                    tab_name = self.tabs[tab_key]
                    if tab_name not in self.structure:
                        self.structure[tab_name] = ([], {}) # (Main fields, Subtabs dict)
                        self.tab_order.append(tab_name)
                    break

        # 4. Enter Sub-Tab Content
        if tag == 'div' and 'sub-tab-content' in classes:
             for subtab_key in self.subtabs.keys():
                 if id_val == f"{subtab_key}-sub-tab":
                     self.current_subtab_id = subtab_key
                     self.active_container_type = 'subtab'
                     self.subtab_start_depth = self.current_depth

                     # Reset label state on sub-tab switch
                     self.current_label = ""

                     if self.current_tab_id:
                         parent_tab_name = self.tabs[self.current_tab_id]
                         subtab_name = self.subtabs[subtab_key]

                         if parent_tab_name not in self.subtab_order_map:
                             self.subtab_order_map[parent_tab_name] = []

                         if subtab_name not in self.subtab_order_map[parent_tab_name]:
                             self.subtab_order_map[parent_tab_name].append(subtab_name)
                             self.structure[parent_tab_name][1][subtab_name] = []
                     break

        # 5. Capture Labels
        if tag == 'label':
            self.in_label = True
            self.current_label = ""

        # 6. Capture Inputs
        if tag in ['input', 'textarea']:
            placeholder = attrs_dict.get('placeholder', '')

            # Record field if we are in a valid container
            if self.current_tab_id:
                parent_tab_name = self.tabs[self.current_tab_id]

                label_text = self.current_label.strip() if self.current_label else "(No Label)"

                field_data = {
                    'label': label_text,
                    'placeholder': placeholder,
                }

                if self.active_container_type == 'subtab' and self.current_subtab_id:
                    subtab_name = self.subtabs[self.current_subtab_id]
                    self.structure[parent_tab_name][1][subtab_name].append(field_data)
                elif self.active_container_type == 'tab':
                     self.structure[parent_tab_name][0].append(field_data)

                # Reset label after using it for an input
                self.current_label = ""

    def handle_endtag(self, tag):
        if self.ignored_containers_depth > 0:
            self.ignored_containers_depth -= 1

        # Check if we are exiting a subtab
        if self.subtab_start_depth is not None and self.current_depth == self.subtab_start_depth:
            self.current_subtab_id = None
            self.subtab_start_depth = None
            self.active_container_type = 'tab' # Fallback to parent tab
            self.current_label = "" # Ensure no leakage

        # Check if we are exiting a main tab
        if self.tab_start_depth is not None and self.current_depth == self.tab_start_depth:
            self.current_tab_id = None
            self.tab_start_depth = None
            self.active_container_type = None
            self.current_label = "" # Ensure no leakage

        self.current_depth -= 1

        if tag == 'label':
            self.in_label = False

    def handle_data(self, data):
        if self.ignored_containers_depth > 0:
            return

        if hasattr(self, 'current_capture_target'):
            target_type, target_id = self.current_capture_target
            if target_type == 'tab':
                self.tabs[target_id] = data.strip()
            elif target_type == 'subtab':
                self.subtabs[target_id] = data.strip()
            del self.current_capture_target

        if self.in_label:
            self.current_label += data

def parse_file(filepath):
    parser = ElementInputParser()
    with open(filepath, 'r') as f:
        content = f.read()
    parser.feed(content)
    return parser

def main():
    writer_files = {
        'Persona': 'pages/persona.html',
        'Species': 'pages/species.html',
        'Faction': 'pages/faction.html',
        'Scene': 'pages/scene.html',
        'Setting': 'pages/setting.html',
        'World': 'pages/world.html',
        'Technology': 'pages/technology.html',
        'Philosophy': 'pages/philosophy.html',
        'Universe': 'pages/universe.html'
    }

    scenario_files = {
        'Story': 'pages/sg-storyarc.html',
        'Adventure': 'pages/sg-adventure.html',
        'NPC': 'pages/sg-npc.html',
        'Location': 'pages/sg-location.html',
        'Group': 'pages/sg-group.html',
        'Encounter': 'pages/sg-encounter.html',
        'Item': 'pages/sg-item.html',
        'Clue': 'pages/sg-clue.html',
        'Map': 'pages/sg-map.html',
        'Handout': 'pages/sg-handout.html'
    }

    output_lines = ["# Input Field Audit\n"]

    # Process Writer Elements
    output_lines.append("## Writer Elements\n")
    for name, filepath in writer_files.items():
        output_lines.append(f"### {name}")
        if not os.path.exists(filepath):
             output_lines.append(f"_File not found: {filepath}_")
             continue

        parser = parse_file(filepath)

        for tab in parser.tab_order:
            main_fields, subtabs = parser.structure[tab]

            has_content = len(main_fields) > 0 or any(len(s) > 0 for s in subtabs.values())

            if has_content:
                output_lines.append(f"#### {tab}")

                for field in main_fields:
                    p_text = field['placeholder'] if field['placeholder'] else "_(No placeholder)_"
                    output_lines.append(f"* **Label:** {field['label']} | **Placeholder:** {p_text}")

                if tab in parser.subtab_order_map:
                    for subtab in parser.subtab_order_map[tab]:
                        fields = subtabs.get(subtab, [])
                        if fields:
                            output_lines.append(f"##### {subtab}")
                            for field in fields:
                                p_text = field['placeholder'] if field['placeholder'] else "_(No placeholder)_"
                                output_lines.append(f"* **Label:** {field['label']} | **Placeholder:** {p_text}")

        output_lines.append("")

    # Process Scenario Elements
    output_lines.append("## Scenario Elements\n")
    for name, filepath in scenario_files.items():
        output_lines.append(f"### {name}")
        if not os.path.exists(filepath):
             output_lines.append(f"_File not found: {filepath}_")
             continue

        parser = parse_file(filepath)

        for tab in parser.tab_order:
            main_fields, subtabs = parser.structure[tab]

            has_content = len(main_fields) > 0 or any(len(s) > 0 for s in subtabs.values())

            if has_content:
                output_lines.append(f"#### {tab}")

                for field in main_fields:
                    p_text = field['placeholder'] if field['placeholder'] else "_(No placeholder)_"
                    output_lines.append(f"* **Label:** {field['label']} | **Placeholder:** {p_text}")

                if tab in parser.subtab_order_map:
                    for subtab in parser.subtab_order_map[tab]:
                        fields = subtabs.get(subtab, [])
                        if fields:
                            output_lines.append(f"##### {subtab}")
                            for field in fields:
                                p_text = field['placeholder'] if field['placeholder'] else "_(No placeholder)_"
                                output_lines.append(f"* **Label:** {field['label']} | **Placeholder:** {p_text}")

        output_lines.append("")

    with open('docs/input_field_audit.md', 'w') as f:
        f.write('\n'.join(output_lines))

if __name__ == "__main__":
    main()

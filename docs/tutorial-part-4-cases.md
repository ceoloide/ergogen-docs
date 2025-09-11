---
id: 'tutorial-part-4-cases'
sidebar_label: 'Part 4: Cases'
---

# Part 4: Cases

Welcome to Part 4 of the Ergogen tutorial! We've designed our [layout](./tutorial-part-1-units-points.md), created our [outlines](./tutorial-part-2-outlines.md), and configured our [PCB](./tutorial-part-3-pcbs.md). In this section, we'll create a 3D-printable case for our keyboard.

## A Note on Local Ergogen

As of this writing, the Ergogen Web UI does not support exporting case files. To generate a case, you'll need to run Ergogen locally on your computer. This is also useful for using custom footprints that are not part of the standard Ergogen library.

To install Ergogen locally, you'll need [Node.js](https://nodejs.org/). Once you have Node.js installed, you can install Ergogen from your command line:

```bash
npm install -g ergogen
```

To run Ergogen, navigate to your project directory in the command line and run:

```bash
ergogen .
```
This will process the `config.yaml` file in the current directory and generate the output files in an `outputs` folder.

## Creating a Simple Case

The `cases` section of your config file is where you define your 3D models. Let's start with a simple case that's just a 1mm thick plate.

```yaml
cases:
  bottom:
    - name: board
      extrude: 1
```

*   `bottom`: This is the name we've given to our case part.
*   `name: board`: This tells Ergogen to use the `board` outline we created in Part 2.
*   `extrude: 1`: This extrudes the outline by 1mm along the Z-axis.

Ergogen v4 exports cases as `.jscad` files. You can use a tool like the [JSCAD CLI](https://www.npmjs.com/package/@jscad/cli) to convert them to `.stl` files for 3D printing.

## Building a Better Case

A simple plate is a good start, but a case with walls and standoffs would be more robust.

### Walls

To create walls, we can create a slightly larger version of our board outline and subtract the original board outline from it.

First, let's define a new, larger outline in our `outlines` section. We'll use new units for extra padding.

```yaml
units:
  # ... (existing units)
  dpx: kx + 8
  dpy: ky + 8

outlines:
  # ... (existing outlines)
  xlBoard:
    - what: polygon
      # ... (same as the board outline, but using dpx and dpy)
```

Now, we can create the walls in our `cases` section.

```yaml
cases:
  # ... (bottom case)
  _outerWall:
    - name: xlBoard
      extrude: 5.6
  _innerWall:
    - name: board
      extrude: 5.6
  wall:
    - what: case
      name: _outerWall
    - what: case
      name: _innerWall
      operation: subtract
```
Here, we've created two "private" cases (prefixed with an underscore so they don't get exported) and then subtracted one from the other to create the `wall`.

### Standoffs

For mounting the PCB to the case, we can add standoffs with holes for threaded inserts.

First, we'll create outlines for the standoffs and the screw holes.

```yaml
units:
  # ... (existing units)
  screwSize: 1.5
  standoffSize: 2.5

outlines:
  # ... (existing outlines)
  mounting:
    - what: circle
      radius: screwSize
      where:
        # ... (same where clauses as the mountinghole footprints in the pcb section)
  standoff:
    - what: circle
      radius: standoffSize
      where:
        # ... (same where clauses as the mountinghole footprints in the pcb section)
```

Now, we can create the standoffs in our `cases` section and add them to our final case.

```yaml
cases:
  # ... (wall case)
  _holes:
    - name: mounting
      extrude: 4
  _standoffs:
    - name: standoff
      extrude: 4
  case:
    - what: case
      name: xlBottom # A 1mm plate based on the xlBoard outline
      operation: add
    - what: case
      name: wall
      operation: add
    - what: case
      name: _standoffs
      operation: add
    - what: case
      name: _holes
      operation: subtract
```
This creates a complete case with a bottom plate, walls, and standoffs for the mounting screws.

## The Final Layout

Here is the complete configuration for the fourth part of our tutorial.

```yaml
units:
  # Proxy Spacing Variables
  kx: cx
  ky: cy
  # Padding Variables
  px: kx + 4
  py: ky + 4
  # Double Padding Variables
  dpx: kx + 8
  dpy: ky + 8
  # Defaults to M2 Screws
  screwSize: 1.5
  standoffSize: 2.5
points:
  zones:
    # The primary 6x4 key matrix, plus 3 modifiers.
    matrix:
      # Position in center of KiCAD workspace.
      anchor:
        shift: [100, -100]
      # Choc spacing
      key:
        padding: 1ky
        spread: 1kx
      columns:
        # Hide the first two mods and the last mod.
        # Provide a Sofle-like column stagger.
        outer:
          rows.mod.skip: true
          key.column_net: P14
        pinky:
          rows.mod.skip: true
          key.column_net: P16
        ring:
          key:
            stagger: 5
            column_net: P10
          rows.mod.column_net: P16
        middle:
          key:
            stagger: 2.5
            column_net: P7
          rows.mod.column_net: P10
        index:
          key:
            stagger: -2.5
            column_net: P8
          rows.mod.column_net: P7
        inner:
          rows.mod.skip: true
          key:
            stagger: -2.5
            column_net: P9
      rows:
        # Four main rows, one partial row.
        mod:
          row_net: P15
          mirror.row_net: P6
        bottom:
          row_net: P18
          mirror.row_net: P5
        home:
          row_net: P19
          mirror.row_net: P4
        top:
          row_net: P20
          mirror.row_net: P0
        num:
          row_net: P21
          mirror.row_net: P1
    # Thumb cluster for Layer and Space keys.
    thumbs:
      # Choc spacing
      key:
        padding: 1ky
        spread: 1kx
      # Place thumbs where the inner mod would go.
      anchor:
        ref: matrix_inner_mod
        shift: [2, -2]
      columns:
        # Fan thumbs out by -15 degrees.
        layer:
          key:
            splay: -15
            column_net: P8
        # Spacebar uses a 1.5 wide key.
        space:
          key:
            width: 1.5kx
            splay: 75
            shift: [2.5,-3.25]
            column_net: P9
      rows:
        # Thumbs only have one row.
        cluster:
          row_net: P15
          mirror.row_net: P6
  # Mirror keyboard halves with a moderate rotation.
  rotate: -20
  mirror:
    ref: matrix_inner_num
    distance: 2kx
outlines:
  # Key outlines with 0.5mm removed to show key overlaps.
  keys:
    - what: rectangle
      where: true
      size: [kx-0.5, ky-0.5]
  # PCB board outline.
  board:
    - what: polygon
      points:
        - ref: matrix_outer_num
          shift: [-0.5px, 0.5py]
        - ref: matrix_ring_num
          shift: [-0.5px, 0.5py]
        - ref: matrix_middle_num
          shift: [-0.5px, 0.5py]
        - ref: matrix_middle_num
          shift: [0.5px, 0.5py]
        - ref: matrix_inner_num
          shift: [0.5px, 0.5py]
        - ref: mirror_matrix_inner_num
          shift: [0.5px, 0.5py]
        - ref: mirror_matrix_middle_num
          shift: [0.5px, 0.5py]
        - ref: mirror_matrix_middle_num
          shift: [-0.5px, 0.5py]
        - ref: mirror_matrix_ring_num
          shift: [-0.5px, 0.5py]
        - ref: mirror_matrix_outer_num
          shift: [-0.5px, 0.5py]
        - ref: mirror_matrix_outer_bottom
          shift: [-0.5px, -0.5py]
        - ref: mirror_matrix_ring_mod
          shift: [-0.5px, -0.5py]
        - ref: mirror_thumbs_layer_cluster
          shift: [-0.5px, -0.5py]
        - ref: mirror_thumbs_space_cluster
          shift: [-0.5py, -0.5px]
        - ref: thumbs_space_cluster
          shift: [-0.5py, -0.5px]
        - ref: thumbs_layer_cluster
          shift: [-0.5px, -0.5py]
        - ref: matrix_ring_mod
          shift: [-0.5px, -0.5py]
        - ref: matrix_outer_bottom
          shift: [-0.5px, -0.5py]
      fillet: 2
  # Combination preview showing outline and keys.
  combo:
    - name: board
    - operation: subtract
      name: keys
pcbs:
  tutorial:
    outlines:
      main:
        outline: board
    footprints:
      # Hotswap Choc keys.
      choc_hotswap:
        what: choc
        where: true
        params:
          keycaps: true
          reverse: false
          hotswap: true
          from: "{{colrow}}"
          to: "{{column_net}}"
      # Through Hole or SMD Diodes
      diode:
        what: diode
        where: true
        params:
          from: "{{colrow}}"
          to: "{{row_net}}"
        adjust:
          shift: [0, -5]
      # Face Down Arduino Pro Micro
      promicro:
        what: promicro
        params:
          orientation: "down"
        where:
          ref.aggregate.parts: [matrix_inner_home, mirror_matrix_inner_home]
          shift: [0,0]
          rotate: -90
      # OLED Screen
      oled:
        what: oled
        params:
          side: "F"
          SDA: P2
          SCL: P3
        where:
          ref.aggregate.parts: [matrix_inner_home, mirror_matrix_inner_home]
          shift: [-6,-19]
          rotate: 90
      # Four Pin Reset Button
      reset:
        what: button
        params:
          from: GND
          to: RST
        where:
          ref.aggregate.parts: [matrix_index_mod, mirror_matrix_index_mod]
          shift: [0, -1]
          rotate: -90
cases:
  bottom:
    - name: board
      extrude: 1
  xlBottom:
    - name: xlBoard
      extrude: 1
  _outerWall:
    - name: xlBoard
      extrude: 5.6
  _innerWall:
    - name: board
      extrude: 5.6
  wall:
    - what: case
      name: _outerWall
      operation: add
    - what: case
      name: _innerWall
      operation: subtract
  _holes:
    - name: mounting
      extrude: 4
  _standoffs:
    - name: standoff
      extrude: 4
  case:
    - what: case
      name: _standoffs
      operation: add
    - what: case
      name: _holes
      operation: subtract
    - what: case
      name: xlBottom
      operation: add
    - what: case
      name: wall
      operation: add
```

In the [next part](./tutorial-part-5-next-steps.md), we'll discuss the final steps to get your keyboard built, including routing the PCB in KiCad, generating firmware, and assembly.

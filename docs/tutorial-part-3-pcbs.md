---
id: 'tutorial-part-3-pcbs'
sidebar_label: 'Part 3: PCBs'
---

# Part 3: PCBs

Welcome to Part 3 of the Ergogen tutorial! So far, we have defined our keyboard's [layout](./tutorial-part-1-units-points.md) and [outline](./tutorial-part-2-outlines.md). Now, it's time to create the Printed Circuit Board (PCB).

## A Primer on PCBs

Before we dive into the config, let's briefly cover some basics.

*   **Microcontrollers:** A keyboard is controlled by a small computer called a microcontroller. The [Arduino Pro Micro](https://www.sparkfun.com/products/12640) and its clones are very popular in the DIY keyboard community.
*   **Keyboard Matrix:** A microcontroller doesn't have enough pins to connect to every single key individually. To solve this, we use a keyboard matrix, which is a grid of columns and rows. By detecting which column and row are activated, the microcontroller can determine which key was pressed.
*   **Nets:** In PCB design, a "net" is a collection of connections that should be electrically connected. For example, all the keys in the same row will be connected to the same row pin on the microcontroller. Ergogen helps us define these nets, which makes the process of routing the PCB in a tool like [KiCad](https://www.kicad.org/) much easier.

## Defining the PCB

The `pcbs` section in our config file is where we define our PCB. We can have multiple PCBs in a project, but we'll just create one.

```yaml
pcbs:
  tutorial:
    outlines:
      main:
        outline: board
```
Here, we've created a PCB named `tutorial`. In the `outlines` section, we're telling Ergogen to use our `board` outline (which we created in Part 2) for the edge cuts of the PCB.

## Placing Footprints

Now, let's add the components to our PCB. In PCB design, the physical layout of a component is called a "footprint". Ergogen comes with a library of common footprints for keyboard parts.

We'll add footprints for our switches, diodes, microcontroller, OLED screen, and a reset button.

```yaml
pcbs:
  tutorial:
    outlines:
      # ... (outlines config)
    footprints:
      choc_hotswap:
        what: choc
        where: true
        params:
          keycaps: true
          reverse: false
          hotswap: true
          from: "{{colrow}}"
          to: "{{column_net}}"
      diode:
        what: diode
        where: true
        params:
          from: "{{colrow}}"
          to: "{{row_net}}"
        adjust:
          shift: [0, -5]
      promicro:
        what: promicro
        params:
          orientation: "down"
        where:
          ref.aggregate.parts: [matrix_inner_home, mirror_matrix_inner_home]
          shift: [0,0]
          rotate: -90
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
      reset:
        what: button
        params:
          from: GND
          to: RST
        where:
          ref.aggregate.parts: [matrix_index_mod, mirror_matrix_index_mod]
          shift: [0, -1]
          rotate: -90
```

Let's break this down:
*   `footprints`: This section contains a list of all the footprints we want to add.
*   `what`: This specifies which footprint from the Ergogen library to use (e.g., `choc`, `diode`, `promicro`).
*   `where`: This tells Ergogen where to place the footprint. `where: true` places the footprint at every key position. For single components like the microcontroller, we can use `ref`, `shift`, `rotate`, and `aggregate` to position it precisely.
*   `params`: Each footprint has its own set of parameters. For example, the `choc` footprint has a `hotswap` parameter, and the `promicro` footprint has an `orientation` parameter.
*   `from` and `to`: These are the most important parameters. They define the nets that the footprint's pins should connect to. We'll cover this in more detail in the next section.

## Wiring the Matrix with Nets

The `from` and `to` parameters in our footprints use a special syntax: `{{...}}`. This is Ergogen's templating feature, which allows us to use key-level attributes to define the nets.

*   `{{colrow}}`: This is a built-in Ergogen variable that uniquely identifies each key's position in the matrix. We're using it to create a connection between the switch and the diode at each key.
*   `{{column_net}}` and `{{row_net}}`: These are custom attributes that we will define in our `points` section. They will specify which microcontroller pin each column and row should connect to.

Let's add the `column_net` and `row_net` attributes to our `points` section to wire up our matrix.

```yaml
points:
  zones:
    matrix:
      # ...
      columns:
        outer:
          rows.mod.skip: true
          key.column_net: P14
        pinky:
          rows.mod.skip: true
          key.column_net: P16
        # ... (and so on for all columns)
      rows:
        mod:
          row_net: P15
          mirror.row_net: P6 # Different pin for the right half
        bottom:
          row_net: P18
          mirror.row_net: P5
        # ... (and so on for all rows)
    thumbs:
      # ...
      columns:
        layer:
          key:
            splay: -15
            column_net: P8 # Override the column net for the thumb keys
        space:
          key:
            # ...
            column_net: P9
      rows:
        cluster:
          row_net: P15
          mirror.row_net: P6
```
We've now assigned a specific pin on our Pro Micro (e.g., `P14`, `P15`) to each column and row.
*   We've used `key.column_net` to define the column nets.
*   We've used `row_net` to define the row nets.
*   We've used `mirror.row_net` to specify different pins for the right half of the keyboard, which helps with cleaner routing.
*   We've overridden the `column_net` for the thumb cluster keys, as they are wired into the main matrix.

## The Final Layout

Here is the complete configuration for the third part of our tutorial.

```yaml
units:
  # Proxy Spacing Variables
  kx: cx
  ky: cy
  # Padding Variables
  px: kx + 4
  py: ky + 4
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
```
In the [next part](./tutorial-part-4-cases.md), we'll learn how to create a 3D-printable case for our keyboard.

---
id: 'tutorial-part-2-outlines'
sidebar_label: 'Part 2: Outlines'
---

# Part 2: Outlines

In the [previous part](./tutorial-part-1-units-points.md), we created a set of points that define our keyboard layout. Now, in Part 2, we'll focus on creating an outline for our board.

## What are Outlines?

Outlines define the shape of our keyboard. We can create simple outlines that trace the shape of our keys, or complex, custom shapes for our PCB and case. Outlines are defined in the `outlines` section of the config file.

## Basic Outlines

Let's start with a simple outline that draws a rectangle around every key.

```yaml
outlines:
  raw:
    - what: rectangle
      where: true
      size: [kx, ky]
```

Here, we've created an outline named `raw`.
*   `what: rectangle` tells Ergogen to draw rectangles.
*   `where: true` tells Ergogen to draw a rectangle at every point in our layout.
*   `size: [kx, ky]` sets the size of the rectangles to our Choc spacing proxy units.

Since the rectangles for our Choc-spaced keys overlap, Ergogen combines them into two larger shapes.

We can create a small margin around our keys by using our padded units `px` and `py`.

```yaml
outlines:
  raw:
    - what: rectangle
      where: true
      size: [px, py] # Using padded units
```

## Creating a Custom Preview

The default preview in the Ergogen Web UI uses MX-sized keycaps. To get a more accurate view of our Choc-spaced layout, we can create a custom outline just for previewing.

```yaml
outlines:
  # ... (raw outline)
  keys:
    - what: rectangle
      where: true
      size: [kx-0.5, ky-0.5] # Slightly smaller than the actual keys
```

This `keys` outline will show us the actual spacing of our keys. This is a great way to fine-tune the layout.

> **Note:** The Ergogen Web UI now supports custom preview variables. You can set `$default_width` and `$default_height` in the `units` section to adjust the preview. However, creating a custom `keys` outline is still a useful technique.

## Creating a Custom Board Shape

Now for the main event: creating a custom shape for our PCB. We'll use a polygon for this.

```yaml
outlines:
  # ... (raw and keys outlines)
  board:
    - what: polygon
      points:
        - ref: matrix_outer_num
          shift: [-0.5px, 0.5py]
        - ref: matrix_ring_num
          shift: [-0.5px, 0.5py]
        # ... (many more points to trace the outline of the board)
        - ref: matrix_outer_bottom
          shift: [-0.5px, -0.5py]
      fillet: 2
```

Here's what's happening:
*   `what: polygon` tells Ergogen we're drawing a custom polygon.
*   `points` is a list of points that define the vertices of the polygon.
*   Each point uses `ref` to reference a key from our layout and `shift` to move the vertex to the edge of the key. We're using our padded units `px` and `py` to create a nice margin.
*   `fillet: 2` rounds the sharp corners of our polygon with a 2mm radius.

This is the most tedious part of the process, but it gives you full control over the shape of your board. You'll need to add enough points to trace the entire perimeter of both halves of the keyboard, using the `mirror_` prefix to reference keys on the right half.

## Combining Outlines

To check if our board outline is correct and all keys fit inside, we can create a "combo" outline that subtracts the key cutouts from the board shape.

```yaml
outlines:
  # ... (raw, keys, and board outlines)
  combo:
    - name: board
    - operation: subtract
      name: keys
```
This new outline, `combo`, first takes the `board` outline, and then subtracts the `keys` outline from it. This gives us a preview of our final PCB shape with the switch cutouts.

## The Power of Parametric Design

Now that we have our outlines set up, we can easily make changes to our design. For example, if we want more padding around the edges, we can just change our `px` and `py` units:

```yaml
units:
  kx: cx
  ky: cy
  px: kx + 4 # More padding!
  py: ky + 4
```
The entire board outline will update automatically. This is the power of parametric design!

## The Final Layout

Here is the complete configuration for the second part of our tutorial.

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
      # Choc spacing
      key:
        padding: ky
        spread: kx
      columns:
        # Hide the first two mods and the last mod.
        # Provide a Sofle-like column stagger.
        outer:
          rows.mod.skip: true
        pinky:
          rows.mod.skip: true
        ring:
          key.stagger: 5
        middle:
          key.stagger: 2.5
        index:
          key.stagger: -2.5
        inner:
          rows.mod.skip: true
          key.stagger: -2.5
      rows:
        # Four main rows, one partial row.
        mod:
        bottom:
        home:
        top:
        num:
    # Thumb cluster for Layer and Space keys.
    thumbs:
      # Choc spacing
      key:
        padding: ky
        spread: kx
      # Place thumbs where the inner mod would go.
      anchor:
        ref: matrix_inner_mod
        shift: [2, -2]
      columns:
        # Fan thumbs out by -15 degrees.
        layer:
          key.splay: -15
        # Spacebar uses a 1.5 wide key.
        space:
          key:
            width: 1.5kx
            splay: 75
            shift: [2.5, -3.25]
      rows:
        # Thumbs only have one row.
        cluster:
  # Mirror keyboard halves with a moderate rotation.
  rotate: -20
  mirror:
    ref: matrix_inner_num
    distance: 2.5kx
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
```

In the [next part](./tutorial-part-3-pcbs.md), we'll learn how to configure the PCB and add footprints for our components.

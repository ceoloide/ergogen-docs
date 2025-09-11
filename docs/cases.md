---
sidebar_position: 7
---

# Cases

## Overview

Cases add a basic 3D aspect to the generation process. In this phase, you take outlines (defined in the previous section), extrude them, position them in space, and combine them into a single 3D-printable object.

A case declaration looks like this:

```yaml
cases:
  case_name:
    - what: outline # default
      name: <outline_ref>
      extrude: <number> # default: 1
      shift: [x, y, z] # default: [0, 0, 0]
      rotate: [ax, ay, az] # default: [0, 0, 0]
      operation: add | subtract | intersect # default: add
    - what: case
      name: <case_ref>
      # extrude makes no sense here
      shift: # same as above
      rotate: # same as above
      operation: # same as above
    - ...
```

When `what` is `outline`, `name` specifies which outline to import onto the XY plane, and `extrude` specifies how much to extrude it along the Z axis. When `what` is `case`, `name` specifies a previously defined case to use.

After establishing a base 3D object, it can be `rotate`d, `shift`ed, and combined with the result of previous parts using `operation`.

Just like with outlines, you can use private cases (with names starting with `_`), object notation for parts, and string shorthands (`+`, `-`, `~`).

## Examples

<details><summary>Simple Extrusion</summary>
<p>

This example takes a simple outline and extrudes it by 10mm to create a solid block.

<Tabs>
<TabItem value="config" label="Config" default>

```yaml
points:
  zones:
    main:
      columns: {c1:}
      rows: {r1:}
outlines:
  simple:
    - what: rectangle
      size: [30, 20]
cases:
  block:
    - what: outline
      name: simple
      extrude: 10
```

</TabItem>
<TabItem value="visualization" label="Visualization">
<div style={{textAlign: 'center'}}>

![Simple extrusion example](./assets/simple_extrusion.png)

</div>
</TabItem>
</Tabs>

</p>
</details>

<details><summary>Unibody Case</summary>
<p>

A more realistic example of creating a unibody case. We define outlines for the plate and the walls, then extrude and combine them.

<Tabs>
<TabItem value="config" label="Config" default>

```yaml
points:
  zones:
    matrix:
      columns: {c1:, c2:}
      rows: {r1:, r2:}
outlines:
  plate:
    - what: rectangle
      where: true
      bound: true
  wall:
    - what: rectangle
      where: true
      bound: true
      expand: 3 # make the wall 3mm thick
cases:
  unibody:
    - what: outline
      name: wall
      extrude: 10 # 10mm high walls
    - what: outline
      name: plate
      extrude: 1.5 # 1.5mm thick plate
      shift: [0, 0, 8.5] # position the plate at the top of the walls
    - what: outline
      name: plate
      extrude: 10 # create cutouts for the switches
      operation: subtract
```

</TabItem>
<TabItem value="visualization" label="Visualization">
<div style={{textAlign: 'center'}}>

![Unibody case example](./assets/unibody_case.png)

</div>
</TabItem>
</Tabs>

</p>
</details>
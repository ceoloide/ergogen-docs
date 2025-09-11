---
sidebar_position: 5
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Points

## Overview

A point in this context refers to a 2D point `[x,y]` with a rotation/orientation `r` and some extra metadata added in.
These can be thought of as the middle points of the keycaps in a resulting keyboard layout, with the additional handling of the angle of the keycap, plus, again, some metadata (like names, row/column information, custom variables, etc.).

The basic coordinate system works just like your math workbooks did: X values are positive to the right, negative to the left, while Y values are positive upward, negative downward.
Additionally, rotation represents the direction of the Y axis, and changes to it work counter-clockwise (so +90° turns to the left, while -90° turns to the right).
Throughout this doc, we'll often reference points in the form `[x, y, r°]`.

<div style={{textAlign: 'center'}}>

![Ergogen coordinate system](./assets/coords.png)

</div>

Points are an important part of keyboard creation as they can later be used to position shapes (to form board outlines) and PCB footprints &ndash; optionally by using filters to use only a subset.
But thing would get pretty tedious if we had to lay out each point manually, and downright horrific if any kind of trigonometry came into play!
So Ergogen tries to do as much of the heavy lifting as it can while providing more comfortable declaration alternatives.

<br />

























## Anchors

One of these alternatives is the use of **anchors**. With an anchor, you don't *directly* specify a point's `x`/`y`/`r` coordinates. Instead, you compute them from an already existing starting point through some translation, rotation, or other adjustment.

Of course, direct point declarations are also possible by starting from `[0, 0, 0°]` and translating/rotating to where you want the point to be, but we can do better than that. Anchors are very flexible, which naturally comes with some complexity &ndash; but remember that they are just another way to declare a point.

Anchors can be parsed from the following data types:

- A **`string`**: A reference to an already existing point with that name, without any further modifications.
- An **`array`**: A multipart anchor (or, multi-anchor), where each item is an anchor itself, recursively. Each sub-anchor becomes the starting point of the next.
  :::tip
  Think of this as a kind of treasure hunt where you first have to find a clue to know where the next clue will be. Through this *follow-the-dots* functionality, you can get to many interesting, exact locations on your board without having to actually calculate where that is.
  :::
- An **`object`**: A full anchor declaration with several attributes.

### Attributes

In a full, object anchor declaration, the following fields can be used:

- **`ref`**: The starting point for the anchor's modifications. This field is parsed as an anchor itself, recursively. It can be a string (referencing a point by name) or a full nested anchor.

- **`aggregate`**: An alternative to `ref` for combining several locations into a single starting point. You can use either `ref` or `aggregate` in an anchor, but not both.
  The `aggregate` field is an object containing:
  - `parts`: An array of sub-anchors to aggregate.
  - `method`: A string indicating *how* to aggregate them. The only method implemented so far is `average` (the default).
  :::note
  Averaging applies to both the `x`/`y` coordinates *and* the `r` rotation.
  :::

- **`orient`**: A pre-rotation that happens before any shifting. The value can be:
  - A **`number`**: This value is added to the current rotation.
  - A **sub-anchor**: The point "turns towards" the referenced point.
  :::note
  `orient` only affects the `r` (rotation) value.
  :::

- **`shift`**: Translates the point on the XY plane. The value can be:
  - An **`array` of two numbers**: The `x` and `y` shift, respectively.
  - A single **`number`**: Parsed as `[number, number]`.
  :::caution
  Shifting is relative to the point's current rotation. At 0° rotation ("looking up"), a positive `x` shifts right and a positive `y` shifts up. At 90° rotation ("looking left"), a positive `x` shift would move the point upward.
  :::

- **`rotate`**: A post-rotation that happens after shifting. It works the same way as `orient`.

- **`affect`**: Overrides which fields (`x`, `y`, or `r`) are affected by the current anchor calculation. The value can be:
  - A **`string`**: A subset of the characters `x`, `y`, or `r`.
  - An **`array`**: A subset of the strings `"x"`, `"y"`, or `"r"`.
  :::tip
  - To shift a rotated point "visually right", you could `orient` it back to 0°, `shift` it, and then `rotate` it back. Or, you could just `shift` it and use `affect: "x"` to constrain the movement to the global X axis.
  - To copy only the rotation from another point, you can use a multi-anchor. In the second part, `ref`erence the other point and set `affect: "r"`.
  :::

- **`resist`**: If `true`, this anchor will ignore the special adjustments usually applied to mirrored points. We'll get to [mirroring](#mirroring) in a second, but in short: shifts and rotations on mirrored points are inverted to maintain symmetry. `resist` disables this behavior, which is useful for components like PCB footprints that should be oriented the same way on both halves.





### Examples

<details><summary>Basic</summary>
<p>

To get the gist of what's happening, take a look at the following anchor config and its visualization.
It first orients itself 45°, then it shift "one to the right", but since its orientation is now 45°, "right" means "up and to the right" along the diagonal line.
Once it gets there (at [&radic;2/2, &radic;2/2], on the unit circle), it finally rotates another 135°, which (when added to its existing rotation) results is 180°, so it's looking "down".

<Tabs>
<TabItem value="config" label="Config" default>

```yaml
anchor:
  orient: 45
  shift: [1, 0]
  rotate: 135
```

</TabItem>
<TabItem value="visualization" label="Visualization">
<div style={{textAlign: 'center'}}>

![Basic anchor example](./assets/anchor_basic.png)

</div>
</TabItem>
</Tabs>

</p>
</details>

<details><summary>Follow-the-dots</summary>
<p>

We can now turn towards multi-anchors, which are just regular anchors in an array.
Arrays in YAML are denoted by using the dash (`-`) notation and an extra level of indent.
The first item is the same as above, meaning we're starting from the same situation as the basic example.
Only now, the result of the basic example won't be the end, only the starting point of a second anchor component.

Shifting with a positive `x` coordinate usually means "visually right", but remember that our starting point (resulting from the first sub-anchor) faces down, so positive `x` values here mean "visually left".

On top of this, we demonstrate how `rotate` (or `orient`) works when given a sub-anchor instead of a number, turning towards the center, automatically calculating the degrees of rotation it requires.
Hopefully this demonstrates how easy it is to get to very non-obvious coordinates using nice "round" numbers only &ndash; no &pi; in sight!
For the record, the final result is a point at `[-0.293, 0.707, -157.5°]`.

<Tabs>
<TabItem value="config" label="Config" default>

```yaml
anchor:
  - orient: 45
    shift: [1, 0]
    rotate: 135
  - shift: [1, 0]
    rotate.shift: [0, 0]
```

</TabItem>
<TabItem value="visualization" label="Visualization">
<div style={{textAlign: 'center'}}>

![Follow-the-dots anchor example](./assets/anchor_follow.png)

</div>
</TabItem>
</Tabs>

</p>
</details>

<details><summary>Averaging</summary>
<p>

Here we can see how to aggregate two existing points.
`left` is at `[-1, 0, -90°]`, marked green, while `right` is at `[1, 0, 90°]`, marked blue.
Aggregating without a `method` defaults to `average`, so what we get as our aggregated point is the good 'ol `[0, 0, 0°]` that we would have started with anyway.
Note that the rotation also got averaged, not just the `x`/`y` coordinates.

From here on out, it's the same as if we `ref`erenced a single existing starting point, or left it empty for the default `[0, 0, 0°]`.
We can perform any additional shifting or rotating, make this a part of a multi-anchor, whatever...

<Tabs>
<TabItem value="config" label="Config" default>

```yaml
anchor:
  aggregate.parts:
    - left
    - right
  shift: [1, 0]
  rotate: 180
```

</TabItem>
<TabItem value="visualization" label="Visualization">
<div style={{textAlign: 'center'}}>

![Anchor averaging example](./assets/anchor_average.png)

</div>
</TabItem>
</Tabs>

</p>
</details>

<details><summary>Affecting</summary>
<p>

Let's say we have an existing point at `[-1, 0, 45°]`, fittingly named `existing`, and we want a new point "facing the other way".
It would be easy to add 180° to its rotation, if we knew it &ndash; but as we saw in previous examples, some coordinate values are not exactly round numbers and using them would be easier through calculation.
Fortunately, we don't have to recalculate it, either.
We can just `ref`erence the existing point, and then pick-and-choose what we want to reuse from it using `affect`.

So we get a multi-anchor going by first shifting our point to where we want it to be on the x/y plane, then adding a second part that `ref`s the existing point and make some further adjustments.
Normally, specifying a `ref` would overwrite all progress we've made so far, but `affect` to the rescue.

<Tabs>
<TabItem value="config" label="Config" default>

```yaml
anchor:
  - shift: [0, 1]
  - ref: existing
    rotate: 180
    affect: r
```

</TabItem>
<TabItem value="visualization" label="Visualization">
<div style={{textAlign: 'center'}}>

![Anchor affect example](./assets/anchor_affect.png)

</div>
</TabItem>
</Tabs>

</p>
</details>

<details><summary>Resisting</summary>
<p>

Let's take the same starting point we have in the Averaging example, only now the existing points are not separate, but mirror images of each other, named `left` at `[-1,0,-90°]` (green) and `mirror_left` at `[1,0,90°]` (blue).
Read more on [mirroring](#mirroring) later.

So, if we do an ordinary right shift and some counter-clockwise (positive) rotation on a "normal" point, we get the normal result.
Remember, though, that since `left` is facing towards the middle, a "rightward" shift from its perspective is going to be moving "visually down" (see 1).

Now the interesting part: when we do the same "rightward" shift + positive rotation on a mirrored point, what actually happens is a seemingly leftward shift and a negative rotation, to keep the mirror image in sync with its source (see 2).

If we don't want this, we can specify the same with an additional `resist: true` and now the mirrored point will also do a rightward shift (from its perspective!) and counter-clockwise rotation (see 3).

<Tabs>
<TabItem value="config" label="Config" default>

```yaml
# 1, default non-mirrored case
anchor_1:
  ref: left
  shift: [1, 0]
  rotate: 45

# 2, default mirrored case
anchor_2:
  ref: left_mirror
  shift: [1, 0]
  rotate: 45

# 3, mirrored case with resistance
anchor_3:
  ref: left_mirror
  shift: [1, 0]
  rotate: 45
  resist: true
```

</TabItem>
<TabItem value="visualization" label="Visualization">
<div style={{textAlign: 'center'}}>

![Anchor resist example](./assets/anchor_resist.png)

</div>
</TabItem>
</Tabs>

</p>
</details>

<br />






























## Zones

Anchors are a great way to dial in the exact position of a single point, but they would be cumbersome for whole keyboards. While you'll be using anchors all the time in your config, the main approach to define batches of points is through the use of **zones**.

### Basics

"Ergogen" is a contraction of "Ergonomic Generator," and what makes it "ergo" is its opinionated, explicit focus on the column-stagger. This means that instead of the more common row-then-column order, Ergogen lays out zones **columns first**, from left-to-right by default.

A collection of columns comprises a zone, and you can have as many zones as you'd like &ndash; for example, to differentiate the keywell and the thumb fan. Columns can be staggered and splayed relative to each other, while zones can be anchored to each other so that everything is right where you want it. Within columns, the rows are built from bottom-to-top by default.

A full zone declaration looks something like this:

```yaml
points:
  zones:
    <zone_name>: # A unique key for each zone
      anchor: # Optional anchor to position the zone, default = [0, 0, 0°]
      columns: 
        <column_name>: # A unique key for each column within the zone
          rows:
            <row_name>: <defs> # Key-level attributes set here apply to this key alone
            ...
          key: <defs> # Key-level attributes set here apply to the whole column
        ...
      rows:
        <row_name>: <defs> # Key-level attributes set here apply to the whole row
        ...
      key: <defs> # Key-level attributes set here apply to the whole zone
    ...
  key: <defs> # Key-level attributes set here apply to ALL zones
```

### Inheritance

As you can see, there are quite a few places where key-level attributes can be defined. To determine which attributes apply to which key, Ergogen uses an **inheritance** system. Similar to object-oriented programming, we go from generic to specific, overriding what we must, and reusing the rest.

The inheritance order is:

1. Built-in, hardcoded defaults
2. Global `points.key` overrides
3. Zone-wide `points.zones.<zone_name>.key` overrides
4. Column-wide `points.zones.<zone_name>.columns.<column_name>.key` overrides
5. Row-wide `points.zones.<zone_name>.rows.<row_name>` overrides
6. Key-specific `points.zones.<zone_name>.columns.<column_name>.rows.<row_name>` overrides

This complexity exists to minimize repetition. You can choose the best place for any key-level attribute where it can apply to all its intended keys while being declared only once. These sources "extend" each other in the order above, so by the time we reach a specific key, every level has had an opportunity to modify something.

:::caution
Note that levels 2, 3, and 4 have a `.key` suffix, while levels 5 and 6 do *not*. This is because the parent levels for the first three (`points`, `zone`, and `column`) can have other content, while the latter two are exclusively for key-level attributes.
:::

:::note
The higher the number in the inheritance order, the higher the precedence. Values declared at the key-specific level (6) are sacred, while everything the user configures can override the hardcoded defaults (1).
:::

If a key-related attribute is defined at the column-level (4), and a key-level definition (6) for the same key specifies other attributes but not this one, its value will be inherited from the column.

:::note
To **unset** a value, you can use the `$unset` directive. This is useful when you want to prevent a key from inheriting an attribute. For example, to remove a pinky key, you can declare zone-wide `bottom`, `home`, and `top` rows, but for the `pinky` column, you can override `pinky.rows.top: $unset`.
:::

When multiple levels define the same attribute, simple values (booleans, numbers, strings) are replaced, while composite values (arrays, objects) are merged recursively.

- `key: 1` extended by `key: 2` results in `key: 2`.
- `key: {a: 1}` extended by `key: {b: 2}` results in `key: {a: 1, b: 2}`.
- `key: {a: 1}` extended by `key: {a: $unset, b: 2}` results in `key: {b: 2}`.

### Keys

Keys can contain any metadata as attributes, but only a handful have special meaning for laying out positions. These are:

- **`stagger`**: An extra vertical shift for a whole column compared to the previous one. Default: `0`.

- **`spread`**: The horizontal space between the current column and the next one. Default: `u`.

- **`splay`**: A rotation applied to the starting point of a new column, around an optional **`origin`**. Default: `0`.

- **`padding`**: The vertical gap between a key and the next one in the same column. Default: `u`.

- **`orient`** / **`shift`** / **`rotate`**: These behave similarly to their [anchor](#anchors) counterparts but are interpreted **cumulatively** within a column. They position the current key and also provide the starting point for the next key in the column.

- **`adjust`**: An anchor that applies **independently** to the current key, without affecting the cumulative column layout.

- **`bind`**: The directional "reach" of a key for forming contiguous outlines. See the [outlines section](./outlines.md) for more details. The value can be:
  - a `number` (uniform reach)
  - an `array` of two numbers (`[horizontal, vertical]`)
  - an `array` of four numbers (`[top, right, bottom, left]`)
  The default is `-1` (no bind).

- **`autobind`**: Enables automatically assigned binding to combine traditional keywells. See the [outlines section](./outlines.md) for more details. Default: `10`.

- **`skip`**: If `true`, the current point is treated as a "helper" and is not included in the final output. This is useful for creating stepping stones for other points. Default: `false`.

- **`asym`**: Determines which side of the keyboard the key belongs to. See [Mirroring](#mirroring). Default: `both`.

- **`mirror`**: Provides a way to override any key-level attributes for mirrored keys. See [Mirroring](#mirroring). Empty by default.

- **`colrow`**: A built-in variable that stores a concatenated name of the column and row, like `pinky_home`. The default template is `{{col.name}}_{{row}}`.

- **`name`**: The globally unique name of the key. The default template is `{{zone.name}}_{{colrow}}`, which would result in something like `matrix_pinky_home`.
  :::note
  For single-key zones, the `default` column and row names are trimmed, so the key name is the same as the zone name.
  :::

- **`width`** / **`height`**: Helper values for the keycap width and height.
  :::caution
  These values only affect the **demo** output. For actual outlines, see the [outlines section](./outlines.md).
  :::

Other than these, any extra field can be specified, containing any value.
These can become useful later when we want to pass key-specific information to PCB footprints (for example, which nets the current key should belong to).

Basic **templating** is supported to make reusing existing key-level attributes easier.
Anything within double curly braces (`{{` and `}}`) inside a string is interpreted as a reference to, and is replaced by the key-level attribute of the same name.
This is how `{{col.name}}_{{row}}` automatically expands to something like `pinky_home` in the case of `colrow`, or how `{{zone.name}}_{{colrow}}` expands to something like `keywell_pinky_home` in the case of `name`.

For example, a simple one point config (**1**) creates the following internal representation with all key-level attributes filled out (**2**) &ndash; and of course, specifying custom key-level attributes in a config (**3**) reflects in the metadata as well (**4**):

<Tabs>
<TabItem value="config1" label="Simple Config (1)" default>

```yaml
points.zones.matrix:
```

</TabItem>
<TabItem value="metadata2" label="Simple Metadata (2)">

```json
"matrix": {
  "x": 0,
  "y": 0,
  "r": 0,
  "meta": {
    "stagger": 0,
    "spread": 19,
    "splay": 0,
    "origin": [0, 0],
    "orient": 0,
    "shift": [0, 0],
    "rotate": 0,
    "adjust": {},
    "width": 18,
    "height": 18,
    "padding": 19,
    "autobind": 10,
    "skip": false,
    "asym": "both",
    "colrow": "default_default",
    "name": "matrix",
    "zone": {
      "name": "matrix"
    },
    "col": {
      "rows": {},
      "key": {},
      "name": "default"
    },
    "row": "default",
    "bind": [0, 0, 0, 0]
  }
}
```

</TabItem>
<TabItem value="config3" label="Custom Config (3)">

```yaml
points.zones.matrix.key:
  foo: bar
  answer: 42
```

</TabItem>
<TabItem value="metadata4" label="Custom Metadata (4)">

```json
"matrix": {
  "x": 0,
  "y": 0,
  "r": 0,
  "meta": {
    "stagger": 0,
    "spread": 19,
    "splay": 0,
    "origin": [0, 0],
    "orient": 0,
    "shift": [0, 0],
    "rotate": 0,
    "adjust": {},
    "width": 18,
    "height": 18,
    "padding": 19,
    "autobind": 10,
    "skip": false,
    "asym": "both",
    "colrow": "default_default",
    "name": "matrix",
    // highlight-start
    "foo": "bar",
    "answer": 42,
    // highlight-end
    "zone": {
      // highlight-start
      "key": {
        "foo": "bar",
        "answer": 42
      },
      // highlight-end
      "name": "matrix"
    },
    "col": {
      "rows": {},
      "key": {},
      "name": "default"
    },
    "row": "default",
    "bind": [0, 0, 0, 0],
  }
}
```

</TabItem>
</Tabs>


### Layout

Based on the above settings, let's see how Ergogen actually lays out the `matrix` zone of this example config:

<Tabs>
<TabItem value="config" label="Config" default>

```yaml
points.zones.matrix:
  # we skew left a bit by default
  anchor.rotate: 5
  columns:
    pinky:
    ring.key:
      # inter-column splay resets subsequent columns to "upright"
      splay: -5
      stagger: 12
      # hinge at the bottom left corner of the key
      origin: [-u/2, -u/2]
    middle.key.stagger: 5
    index.key.stagger: -6
    inner.key.stagger: -2
  rows:
    bottom:
    home:
    top:
```

</TabItem>
<TabItem value="1" label="1">
<div style={{textAlign: 'center'}}>

![Zone layout - step 1](./assets/layout_1.png)

</div>

**Step 1**: We determine the starting point of the zone based on its `anchor` attribute.
In this case, only a 5° rotation was specified, so our initial mark is at `[0, 0, 5°]`.
This blue point is going to be our running "column anchor", where each column will start building from.
Since `spread` doesn't apply to the first column of any zone, and there's no `stagger` or `splay` given, we can start iterating over the zone's columns.

</TabItem>
<TabItem value="2" label="2">
<div style={{textAlign: 'center'}}>

![Zone layout - step 2](./assets/layout_2.png)

</div>

**Step 2**: To start actually laying out the first ("pinky") column, we copy the current column anchor to a running "row anchor" (marked red).
Note that this is where key-level `orient`/`shift`/`rotate` would take effect, if any were specified.

</TabItem>
<TabItem value="3" label="3">
<div style={{textAlign: 'center'}}>

![Zone layout - step 3](./assets/layout_3.png)

</div>

**Step 3**: When a row anchor is finalized, a key is laid out there &ndash; shown here by 18mm by 18mm squares, representing regular keycaps.
It's worth emphasizing that the keys we're generating here are always defined as the *middle points* of these visualization squares.
They're *not* the squares themselves, as we don't always necessarily want to put rectangles at these locations.

</TabItem>
<TabItem value="4" label="4">
<div style={{textAlign: 'center'}}>

![Zone layout - step 4](./assets/layout_4.png)

</div>

**Step 4**: Now that the first key of the column is fixed, we add `padding` to figure out where the next row should go.

</TabItem><TabItem value="5" label="5">
<div style={{textAlign: 'center'}}>

![Zone layout - step 5](./assets/layout_5.png)

</div>

**Step 5**: And we keep doing this until we run out of rows in the current column &ndash; cumulatively, always adding `padding` (and potential `orient`/`shift`/`rotate` modifiers) to get to the next location.

</TabItem>
<TabItem value="6" label="6">
<div style={{textAlign: 'center'}}>

![Zone layout - step 6](./assets/layout_6.png)

</div>

**Step 6**: Once the current column is done, we move on to the next column by applying `spread` (to move horizontally) and `stagger` (to move vertically).
Note that the column anchor is still "skewed" at the original 5° rotation.

</TabItem>
<TabItem value="7" label="7">
<div style={{textAlign: 'center'}}>

![Zone layout - step 7](./assets/layout_7.png)

</div>

**Step 7**: After `spread`ing and `stagger`ing, inter-column `splay` is applied &ndash; again, cumulatively.
By default, `splay`ing happens "around" the point itself, so it doesn't affect its x/y position, only its rotation.
But we can change this with an optional `origin` to rotate around.
In this case, it's used so that the column hinges around the first key's bottom left corner (so that the rotation doesn't accidentally make that exact corner overlap the first column, as it would during sufficient rotation around the key's center).
Note that this `splay` takes us back to 0° (upright) rotation.

</TabItem>
<TabItem value="8" label="8">
<div style={{textAlign: 'center'}}>

![Zone layout - step 8](./assets/layout_8.png)

</div>

**Step 8**: From this new column anchor, we can repeat the same in-column process we saw before: copy it to a running row anchor, and create the column's relevant rows one by one, leaving `padding` in between stops.

</TabItem>
<TabItem value="9" label="9">
<div style={{textAlign: 'center'}}>

![Zone layout - step 9](./assets/layout_9.png)

</div>

**Step 9**: And now steps 6-7-8, again.
We create the new column anchor by `spread`ing/`stagger`ing/`splay`ing the old one, and lay out the next column, row by row.

</TabItem>
<TabItem value="10" label="10">
<div style={{textAlign: 'center'}}>

![Zone layout - step 10](./assets/layout_10.png)

</div>

**Step 10**: Same old, same old, only now the `stagger` value is negative.

</TabItem>
<TabItem value="11" label="11">
<div style={{textAlign: 'center'}}>

![Zone layout - step 11](./assets/layout_11.png)

</div>

**Step 11**: Once more for the inner column, and we're done with this zone.

</TabItem>
</Tabs>

<hr/>

Once we have an existing zone (`matrix`), we can anchor further zones to it &ndash; like, say, a thumbfan.

<Tabs>
<TabItem value="config" label="Config" default>

```yaml
points:
  zones:
    matrix:
      # The matrix is the same as in the layout example above
      anchor.rotate: 5
      columns:
        pinky:
        ring.key:
          splay: -5
          stagger: 12
          origin: [-u/2, -u/2]
        middle.key.stagger: 5
        index.key.stagger: -6
        inner.key.stagger: -2
      rows:
        bottom:
        home:
        top:
    thumbfan:
      # Anchor the thumbfan to the inner-most, bottom-most key of the matrix
      anchor:
        ref: matrix_inner_bottom
        shift: [-10, -10]
        rotate: -15
      columns:
        # Note that columns can also be just single keys
        thumb1:
        thumb2.key:
          spread: u-1
          stagger: 10
        thumb3.key:
          spread: u-1
          stagger: 10
```

</TabItem>
<TabItem value="visualization" label="Visualization">
<div style={{textAlign: 'center'}}>

![Thumbfan example visualization](./assets/thumbfan.png)

</div>
</TabItem>
</Tabs>

**Step 1**: We anchor the new `thumbfan` zone to the `matrix_inner_bottom` key.
**Step 2**: We shift and rotate it to a suitable position.
**Step 3**: We define the keys of the thumbfan with their own `spread` and `stagger` values.

<hr/>

### Examples

<details><summary>Choc spacing</summary>
<p>

Kailh Choc switches have a different footprint than MX-style switches, and they are usually spaced closer together. Here is an example of how to adjust for that. We override the default `spread` and `padding` globally, and also set the `width` and `height` to match Choc keycaps.

<Tabs>
<TabItem value="config" label="Config" default>

```yaml
points:
  key:
    spread: 18
    padding: 17
    width: 17
    height: 16
  zones:
    matrix:
      columns:
        pinky:
        ring:
        middle:
        index:
      rows:
        bottom:
        home:
        top:
```

</TabItem>
<TabItem value="visualization" label="Visualization">
<div style={{textAlign: 'center'}}>

![Choc spacing example visualization](./assets/choc_spacing.png)

</div>
</TabItem>
</Tabs>

</p>
</details>

<details><summary>Row overrides</summary>
<p>

Sometimes, you want a specific row to behave differently. In this example, we make the home row stick out by giving it an extra `shift`.

<Tabs>
<TabItem value="config" label="Config" default>

```yaml
points:
  zones:
    matrix:
      columns:
        pinky:
        ring:
        middle:
        index:
      rows:
        bottom:
        home.shift: [-3, 0]
        top:
```

</TabItem>
<TabItem value="visualization" label="Visualization">
<div style={{textAlign: 'center'}}>

![Row overrides example visualization](./assets/row_overrides.png)

</div>
</TabItem>
</Tabs>

</p>
</details>

<details><summary>Column arcs</summary>
<p>

To create a natural curve for a column, you can apply a slight rotation to each key. This is done cumulatively.

<Tabs>
<TabItem value="config" label="Config" default>

```yaml
points:
  zones:
    matrix:
      columns:
        arc:
          rows:
            bottom.rotate: -5
            home.rotate: -5
            top.rotate: -5
      rows:
        # need to define rows here for the column to pick them up
        bottom:
        home:
        top:
```

</TabItem>
<TabItem value="visualization" label="Visualization">
<div style={{textAlign: 'center'}}>

![Column arcs example visualization](./assets/column_arcs.png)

</div>
</TabItem>
</Tabs>

</p>
</details>

<br />

## Adjustments

Once we're done with zone-specific definitions, we can adjust the individual zones as a whole, or even all the zones collectively.
The corresponding config sections look something like this:

```yaml
points:
  zones:
    zone_name:
      rotate: <number> # zone-level rotation
      mirror: <axis> # zone-level mirror
  rotate: <number> # global rotation
  mirror: <axis> # global mirror
```

### Rotation

In this context, `rotate` can apply an angle to all relevant points, most often used to simulate the inter-half angle of one-piece boards.
If specified at the zone level, it applies to the points of that zone only &ndash; if specified globally, it applies to all points.

The origin of the rotation is always assumed to be `[0, 0]`.
This doesn't matter for global rotations, but should be considered for zone-level ones.

### Mirroring

At this stage, all "original" points are declared and positioned.
And since the default direction in Ergogen is left-to-right, this usually means the left side of the board.
But there's usually two sides to a board, so to save us the work of replicating everything on the right, Ergogen offers a way to mirror "source" points automatically along an axis.

If the `mirror` field is a number, it will be used as the x coordinate of the axis to mirror along.
Otherwise, it's going to be treated as an anchor with an additional `distance` field, where the anchor defines an arbitrary reference point and `distance` defines how far away it should be from its eventual mirror image.

As with rotation, mirroring can be applied to individual zones, or all of them simultaneously at the end, depending on which of the above two `mirror` declarations we use.

:::caution
The `mirror` field can have different meanings depending on its location in the config.
As we just saw, `points.mirror` and `points.zones.<zone_name>.mirror` are for declaring what points should be mirrored to the other side and along what axis.
These are not to be confused with the key-level `mirror` attribute (appearing at any of the 6 levels we've discussed for [inheritance](#inheritance)), which provides a way to override any other key-level attribute for mirrored versions of points.
:::

Now if our design is not symmetric, we need to use the `asym` key-level attribute to indicate which side any given point should appear on.
If it's set as `source`, mirroring will simply skip this key, as it should only be present on the source side, as it was declared.
If the `asym` field is set as `clone`, mirroring will "move" the point instead of copying it, because it should only appear on the mirrored side.
The default value of `both` assumes symmetry &ndash; so the given point should appear on both sides of the board.

:::tip
The `source`/`clone` pair was chosen to replace the old `left`/`right` as the canonical options for the `asym` field so as not to make any hardcoded assumptions about the spatial relationships between original and mirrored positions.
But as aliases, `origin`/`image`, `base`/`derived`, `primary`/`seconday` and even the old `left`/`right` pairs are also supported, so feel free to use whichever makes most sense to you.
:::

And this concludes point definitions.
This should be generic enough to describe any ergo layout, yet hopefully easy enough so that you'll appreciate not having to work in raw CAD.

### Examples

<details><summary>Zone-level adjustment</summary>
<p>

You can apply adjustments like `rotate` to an entire zone. Here, we rotate the whole `matrix` zone by -10 degrees.

<Tabs>
<TabItem value="config" label="Config" default>

```yaml
points:
  zones:
    matrix:
      rotate: -10 # This rotates the whole zone
      columns:
        pinky:
        ring:
        middle:
        index:
      rows:
        bottom:
        home:
        top:
```

</TabItem>
<TabItem value="visualization" label="Visualization">
<div style={{textAlign: 'center'}}>

![Zone-level adjustment visualization](./assets/zone_adjustment.png)

</div>
</TabItem>
</Tabs>

</p>
</details>

<details><summary>Anchoring to adjusted zones</summary>
<p>

When you anchor a new zone to a key in a zone that has been adjusted (e.g., rotated), the anchor will correctly use the final position of the reference key.

<Tabs>
<TabItem value="config" label="Config" default>

```yaml
points:
  zones:
    matrix:
      rotate: -10
      columns:
        pinky:
        ring:
        middle:
        index:
      rows:
        bottom:
        home:
        top:
    thumb:
      anchor:
        ref: matrix_index_bottom
        shift: [0, -u]
      columns:
        thumb1:
```

</TabItem>
<TabItem value="visualization" label="Visualization">
<div style={{textAlign: 'center'}}>

![Anchoring to adjusted zones visualization](./assets/anchoring_adjusted.png)

</div>
</TabItem>
</Tabs>

</p>
</details>

<details><summary>Asymmetry</summary>
<p>

For split keyboards, you often have keys that are only on one side. You can use the `asym` property for this. `asym: source` means the key will only appear on the left (source) half, and `asym: clone` means it will only appear on the right (mirrored) half.

You can also use the key-level `mirror` property to change attributes for the mirrored version of a key. In this example, the `thumb2` key has a different `splay` on the right side.

<Tabs>
<TabItem value="config" label="Config" default>

```yaml
points:
  mirror:
    ref: matrix_index_bottom
    distance: 100
  zones:
    matrix:
      columns:
        pinky:
        ring:
        middle:
        index:
      rows:
        bottom:
        home:
        top:
    thumb:
      anchor:
        ref: matrix_index_bottom
        shift: [0, -u]
      columns:
        thumb1.asym: source
        thumb2:
          mirror.splay: -15 # splay is different on the right side
        thumb3.asym: clone
```

</TabItem>
<TabItem value="visualization" label="Visualization">
<div style={{textAlign: 'center'}}>

![Asymmetry example visualization](./assets/asymmetry.png)

</div>
</TabItem>
</Tabs>

</p>
</details>

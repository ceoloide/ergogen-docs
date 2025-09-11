---
sidebar_position: 6
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Outlines

## Overview

TODO points -> outlines illustration

Once the raw points are available, we often want to turn them into solid, continuous outlines.
We do this by selecting an arbitrary subset of points and placing shapes there to form a part, and then use boolean operations (i.e., addition, subtraction, or intersection) to combine parts into a final outline to export.
We'll get back to how an individual part looks soon &ndash; but first, we need to get familiar with binding and filtering.

<br />











## Binding

While the points are enough to place properly positioned and rotated shapes (most commonly, rectangles, representing the keys of the board), these usually won't combine into a contiguous shape since there won't be any overlap.
So the first part of outline generation is thinking about "binding", where we can make the individual switch holes reach out towards (or, _bind_ to) each other.
Think of this as a kind of "neighbor declaration", telling Ergogen which directions to grow towards (and by how much) to reach the next-door point.

Of course, overlap could be achieved by placing larger shapes at each of the points, causing them to overlap by default, but since everything is placed by its center point, these larger shapes would result in larger outside margins as well.
With bind, we can declare the selective directions in which to grow the shapes placed, so that their final combination can become contiguous, yet with as little (or as much) margin as we might want.

### Explicit

The fully customizable way to add binding to points is through the key-level attribute `bind`:

```yaml
bind: num | [num_x, num_y] | [num_t, num_r, num_b, num_l] # defer to autobind by default
```

To recap, key-level declaration means that `bind` should be specified in the `points` section, benefiting from the same extension process every key-level attribute does.
Valid values follow CSS standards, so `num` applies to all directions, `num_x` horizontally, `num_y` vertically, and the `t`/`r`/`b`/`l` versions to top/right/bottom/left, respectively.

:::tip
Don't recall seeing `bind` in the [Keys](./points.md#keys) section, where supposedly all key-level attributes were listed?
That's because those were only the ones with meaning to the layout system.
Apart from those, *anything* can be declared as a key-level attribute, and some might gain meaning in later stages, like `bind` did just now.
:::

### Automatic

To spare us the `bind` declaration whenever possible, Ergogen offers an `autobind` key-level attribute as well.
Its value is a single number (`10` by default), and the relevant directions are calculated automatically (by looking at intra- and inter-column bounding boxes).
Basically, if we want bound shapes, we only need to say so (by setting `bound: true`, see [below](#common-attributes)) in most cases &ndash; or specify a larger `autobind` value once if `10` wasn't enough to bridge the gaps.
And if autobinding fails for a more complex shape, we can always fall back to explicit `bind` declarations.

### Examples

<details><summary>Explicit bind</summary>
<p>

Using `bind`, we can make keys "reach" towards each other to form a solid plate. This is better than just making the key rectangles larger, because it doesn't increase the outer margins.

<Tabs>
<TabItem value="config" label="Config" default>

```yaml
points:
  zones:
    matrix:
      columns:
        c1:
          rows:
            r1:
            r2.key.bind: [0, 5, 0, 5] # bind left and right
        c2:
          rows:
            r1:
            r2:
outlines:
  plate:
    - what: rectangle
      where: true
      bound: true
```

</TabItem>
<TabItem value="visualization" label="Visualization">
<div style={{textAlign: 'center'}}>

![Explicit bind example](./assets/explicit_bind.png)

</div>
</TabItem>
</Tabs>

</p>
</details>

<details><summary>Autobind</summary>
<p>

`autobind` does the same thing as `bind`, but automatically. You can just set `bound: true` and Ergogen will try to connect the keys. You can provide a numerical value to `autobind` to control the reach.

<Tabs>
<TabItem value="config" label="Config" default>

```yaml
points:
  key:
    autobind: 10 # default is 10, but we're being explicit
  zones:
    matrix:
      columns:
        c1:
        c2:
      rows:
        r1:
        r2:
outlines:
  plate:
    - what: rectangle
      where: true
      bound: true
```

</TabItem>
<TabItem value="visualization" label="Visualization">
<div style={{textAlign: 'center'}}>

![Autobind example](./assets/autobind.png)

</div>
</TabItem>
</Tabs>

</p>
</details>

<br />

## Filtering

Filtering is how Ergogen decides which points to use when placing a shape. This is essential because a config can contain many points for different purposes (key matrix, thumb cluster, mounting holes, etc.).

### Basics

Filters can be defined using different data types:

- **`undefined`**: If left empty, the filter produces the default `[0, 0, 0°]` origin point.
- **`boolean`**: `true` uses all points, `false` uses none.
- **`string`**: A simple filter, explained below.
- **`object` or `array` with an object**: Parsed as an [anchor](./points.md#anchors), returning a single point.
- **`array` without objects**: A complex filter for advanced logic.

A simple **string filter** matches against a key's `name` and `tags`. For example, `matrix_pinky_home` selects that specific key.

To select multiple keys, you can use **`tags`**. `tags` is a key-level attribute that can be an array of strings. A string filter will match any key that has the string in its `tags` array.

You can also use **regex** by surrounding the string with slashes (`/`). For example, `/^matrix_.*/` selects all keys in the `matrix` zone.

To **negate** a filter, prefix it with a minus sign (`-`). For example, `-matrix_pinky_home` selects all keys *except* `matrix_pinky_home`.

### Advanced usage

Every simple filter actually consists of three components: `which` key-level attributes to check, `how` to check them, and `what` value to check for.

The default is `meta.name,meta.tags ~ something`, where `~` is a similarity operator. You can write a **full form filter** to change this. For example, to filter by a custom `foobar` attribute, you could write `meta.foobar ~ something`.

For even more advanced usage, you can combine filters with **AND/OR** logic using arrays. Odd levels of nesting are OR, and even levels are AND.
- `[filter1, filter2]` is `filter1` OR `filter2`.
- `[[filter1, filter2]]` is `filter1` AND `filter2`.

### Examples

<details><summary>Tags</summary>
<p>

Here, we use tags to create separate outlines for the alphas and the thumb keys.

<Tabs>
<TabItem value="config" label="Config" default>

```yaml
points:
  zones:
    matrix:
      key:
        tags: ['alphas']
      columns: {c1:, c2: }
      rows: {r1: }
    thumb:
      key:
        tags: ['thumbs']
      anchor:
        ref: matrix_c2_r1
        shift: [20, -20]
      columns: {t1: }
outlines:
  alphas:
    - what: rectangle
      where: {tags: 'alphas'}
  thumbs:
    - what: rectangle
      where: {tags: 'thumbs'}
```

</TabItem>
<TabItem value="visualization" label="Visualization">
<div style={{textAlign: 'center'}}>

![Filtering with tags](./assets/filter_tags.png)

</div>
</TabItem>
</Tabs>

</p>
</details>

<details><summary>Regexes</summary>
<p>

This example uses a regex to select all keys in the `c1` column.

<Tabs>
<TabItem value="config" label="Config" default>

```yaml
points:
  zones:
    matrix:
      columns: { c1:, c2: }
      rows: { r1:, r2: }
outlines:
  c1_keys:
    - what: rectangle
      where: /_c1_/
```

</TabItem>
<TabItem value="visualization" label="Visualization">
<div style={{textAlign: 'center'}}>

![Filtering with regex](./assets/filter_regex.png)

</div>
</TabItem>
</Tabs>

</p>
</details>

<details><summary>Negation</summary>
<p>

This example creates an outline for all keys *except* the home row.

<Tabs>
<TabItem value="config" label="Config" default>

```yaml
points:
  zones:
    matrix:
      columns: { c1:, c2: }
      rows: { top:, home:, bottom: }
outlines:
  not_home:
    - what: rectangle
      where: -/_home$/
```

</TabItem>
<TabItem value="visualization" label="Visualization">
<div style={{textAlign: 'center'}}>

![Filtering with negation](./assets/filter_negation.png)

</div>
</TabItem>
</Tabs>

</p>
</details>

<details><summary>Combination</summary>
<p>

This example selects keys that are in the `c1` column AND are on the `home` row.

<Tabs>
<TabItem value="config" label="Config" default>

```yaml
points:
  zones:
    matrix:
      columns: { c1:, c2: }
      rows: { top:, home:, bottom: }
outlines:
  c1_home:
    - what: rectangle
      where: [[ /_c1_/, /_home$/ ]]
```

</TabItem>
<TabItem value="visualization" label="Visualization">
<div style={{textAlign: 'center'}}>

![Combined filtering](./assets/filter_combination.png)

</div>
</TabItem>
</Tabs>

</p>
</details>

<br />

## Parts

With filtering understood, we can finally move on to the outlines themselves. An outline is a collection of **parts**, which are combined in order to create a final shape.

<Tabs>
<TabItem value="array" label="Array notation" default>

```yaml
outlines:
  <outline_name>:
    - <part>
    - <part>
    - ...
```

</TabItem>
<TabItem value="object" label="Object notation">

```yaml
outlines:
  <outline_name>:
    part1: <part>
    part2: <part>
    ...
```

</TabItem>
</Tabs>

Operations are performed in order. The resulting shape is exported and also becomes available for other outlines to use.

### Common attributes

Each part has the following common attributes:

- **`what`**: The shape to place (e.g., `rectangle`). See [Shapes](#shapes).
- **`where`**: A filter to select the points where the shape will be placed.
- **`operation`**: How to combine this part with the result of the previous parts.
  - `add`: (Default) Union of the shapes.
  - `subtract`: Subtracts this part from the result.
  - `intersect`: Intersects this part with the result.
  - `stack`: Draws the part "on top" of the result (useful for debugging).
- **`bound`**: A boolean indicating whether to apply binding.
- **`asym`**: How the `where` filter should handle mirrored points (`source`, `clone`, or `both`).
- **`adjust`**: An anchor to adjust the position of each placed shape.
- **`scale`**: A multiplier to scale the shape.
- **`expand`**: A value in mm to expand or shrink the outline.
- **`joints`**: How to treat joints when expanding (`round`, `pointy`, or `beveled`).
- **`fillet`**: A radius to round the corners of the part.

### Shapes

Shapes can have their own specific attributes.

- **`rectangle`**:
  - `size`: The width and height, as a number or a `[width, height]` array.
  - `bevel`: The bevel size.
  - `corner`: The corner radius.
- **`circle`**:
  - `radius`: The radius of the circle.
- **`poly`**:
  - `points`: An array of anchors defining the polygon's vertices.
- **`outline`**:
  - `name`: The name of a previously defined outline to reuse.
  - `origin`: An anchor specifying the origin point of the outline.

### Syntactic sugar

- **String shorthands**: A part can be defined as a string like `+outline_name` or `-outline_name` for quick add/subtract operations.
- **`expand` shorthand**: `expand: 3]` is equivalent to `expand: 3, joints: beveled`.
- **Private outlines**: An outline name starting with `_` will not be exported.

### Examples

<details><summary>Shapes</summary>
<p>

This example shows how to create a plate with rectangular holes for keys, and a circular hole for a rotary encoder.

<Tabs>
<TabItem value="config" label="Config" default>

```yaml
points:
  zones:
    matrix:
      columns: {c1:}
      rows: {r1:}
    encoder:
      anchor:
        ref: matrix_c1_r1
        shift: [25, 0]
      columns: {enc:}
outlines:
  plate:
    - what: rectangle
      where: true
      size: [50, 25]
    - what: rectangle
      where: /matrix/
      operation: subtract
    - what: circle
      where: /encoder/
      radius: 6
      operation: subtract
```

</TabItem>
<TabItem value="visualization" label="Visualization">
<div style={{textAlign: 'center'}}>

![Shapes example](./assets/shapes.png)

</div>
</TabItem>
</Tabs>

</p>
</details>

<details><summary>Boolean operations</summary>
<p>

This example demonstrates the `add`, `subtract`, and `intersect` operations.

<Tabs>
<TabItem value="config" label="Config" default>

```yaml
points:
  zones:
    main:
      columns: {c1:}
      rows: {r1:}
outlines:
  shape1:
    - what: rectangle
      size: [30, 20]
  shape2:
    - what: circle
      radius: 15
      adjust:
        shift: [20, 0]
  added:
    - shape1
    - +shape2
  subtracted:
    - shape1
    - -shape2
  intersected:
    - shape1
    - ~shape2
```

</TabItem>
<TabItem value="visualization" label="Visualization">
<div style={{textAlign: 'center'}}>

![Boolean operations](./assets/boolean_operations.png)

</div>
</TabItem>
</Tabs>

</p>
</details>

<details><summary>Asymmetry</summary>
<p>

Here we create a plate where the left half has a circular cutout, but the right half has a rectangular one.

<Tabs>
<TabItem value="config" label="Config" default>

```yaml
points:
  mirror:
    ref: matrix_c1_r1
    distance: 100
  zones:
    matrix:
      columns: {c1:}
      rows: {r1:}
outlines:
  plate:
    - what: rectangle
      where: true
      bound: true
      asym: both
    - what: circle
      where: matrix_c1_r1
      radius: 5
      asym: source
      operation: subtract
    - what: rectangle
      where: matrix_c1_r1
      size: 10
      asym: clone
      operation: subtract
```

</TabItem>
<TabItem value="visualization" label="Visualization">
<div style={{textAlign: 'center'}}>

![Outline asymmetry](./assets/outline_asymmetry.png)

</div>
</TabItem>
</Tabs>

</p>
</details>

<details><summary>Adjustments</summary>
<p>

This example shows how to use `fillet` and `expand` to create a rounded plate with a thicker border.

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
      expand: 3
      fillet: 2
```

</TabItem>
<TabItem value="visualization" label="Visualization">
<div style={{textAlign: 'center'}}>

![Outline adjustments](./assets/outline_adjustments.png)

</div>
</TabItem>
</Tabs>

</p>
</details>

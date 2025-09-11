---
id: 'tutorial-part-1-units-points'
sidebar_label: 'Part 1: Units and Points'
---

# Part 1: Units and Points

Welcome to the first part of the Ergogen tutorial! In this section, we'll define some useful variables (units) for our keyboard and create the points that make up its layout.

We'll be building a keyboard inspired by the [Sofle keyboard](https://josefadamcik.github.io/SofleKeyboard/). By the end of this part, you'll have a complete layout for a split ergonomic keyboard.

Let's start by opening the [Ergogen Web UI](https://ergogen.ceoloide.com/) and clearing the default configuration on the left side.

## Units: Your Best Variables

In Ergogen, all numbers without a unit are in millimeters. For example, `padding: 4` means 4mm of padding. The main exception is rotation, where numbers are in degrees.

When designing keyboards, you'll often use the same numbers repeatedly. For example, Cherry MX switches are typically spaced 19mm apart, while Kailh Choc switches are 18mm wide and 17mm tall.

Ergogen provides some built-in units for these common values:
*   `u`: 19mm (for MX switches)
*   `U`: 19.05mm (for MX keycaps with a bit more room)
*   `cx`: 18mm (for Choc switch width)
*   `cy`: 17mm (for Choc switch height)

You can also define your own custom units in the `units` section of your config file. This is a great way to make your design more flexible. Let's create a `units` section and set up some "proxy" units. We're designing a Choc-spaced board, but with these proxies, we can easily switch to MX spacing later by changing just two lines.

```yaml
units:
  # Proxy Spacing Variables
  kx: cx
  ky: cy
  # Padding Variables
  px: kx + 2
  py: ky + 2
```

Here, we've defined `kx` and `ky` to be our main spacing units. We've also created `px` and `py` for padded versions of our spacing, which will be useful later when creating outlines.

## Points and Zones: The Keyboard Layout

The core of an Ergogen configuration is the `points` section. A "point" in Ergogen represents the center `[x,y]` coordinate and rotation `r` of a single key. A group of points is called a "zone".

Most ergonomic keyboards use a matrix of columns and rows. Let's define a simple matrix for our keyboard. The Sofle has 6 columns and 4 main rows, plus a modifier row.

```yaml
points:
  zones:
    matrix:
      columns:
        outer:
        pinky:
        ring:
        middle:
        index:
        inner:
      rows:
        mod:
        bottom:
        home:
        top:
        num:
```

This creates a 6x5 grid of keys. The names of the zones, columns, and rows are up to you. `matrix`, `pinky`, `home`, etc., are common conventions, but you can name them whatever you like.

## Modifying the Layout

Our current layout is a perfect rectangle, but we want a more ergonomic shape.

### Skipping Keys

First, let's remove some keys we don't need. We can do this with the `skip: true` property.

```yaml
points:
  zones:
    matrix:
      columns:
        outer:
          rows:
            mod:
              skip: true # We don't want a key here
        pinky:
          rows.mod.skip: true # Same here, but with dot notation
        ring:
        middle:
        index:
        inner:
          rows.mod.skip: true # And here
      rows:
        # ... (rest of the rows)
```
Here, we've used two different ways to apply the `skip` property. In the `outer` column, we've nested the properties. In the `pinky` and `inner` columns, we've used dot notation (`rows.mod.skip`) as a shortcut. Both achieve the same result.

### Column Stagger

To create the characteristic curve of an ergonomic keyboard, we can use the `stagger` property. This shifts each column vertically relative to the previous one.

```yaml
points:
  zones:
    matrix:
      columns:
        # ... (outer and pinky columns)
        ring:
          key:
            stagger: 5
        middle:
          key:
            stagger: 2.5
        index:
          key:
            stagger: -2.5
        inner:
          key:
            stagger: -2.5
      # ... (rest of the config)
```
The `stagger` values are cumulative. The `middle` column is staggered by 2.5mm relative to the `ring` column, which is already staggered by 5mm.

### Spacing

Our keys are a bit cramped. Let's add some spacing. We can control the horizontal and vertical spacing between keys with the `spread` and `padding` properties.

```yaml
points:
  zones:
    matrix:
      key:
        padding: ky # Use our proxy unit for vertical spacing
        spread: kx  # Use our proxy unit for horizontal spacing
      columns:
      # ... (rest of the columns)
```
We've added a `key` section to our `matrix` zone. Properties defined here apply to all keys in the zone. We're using our proxy units `kx` and `ky` to set the spacing.

### Thumb Cluster

Now, let's add the thumb keys. We'll create a new zone called `thumbs`.

```yaml
points:
  zones:
    matrix:
      # ... (matrix zone config)
    thumbs:
      key:
        padding: ky
        spread: kx
      columns:
        layer:
        space:
      rows:
        cluster:
```
This creates a new 2x1 zone. But where is it? By default, Ergogen places new zones at the origin `[0,0]`. We need to position it correctly.

### Anchors

We can use `anchor` to position one zone relative to another. Let's anchor our `thumbs` zone to the `matrix_inner_mod` key (the key at the intersection of the `inner` column and `mod` row of the `matrix` zone), even though we've skipped it.

```yaml
points:
  zones:
    # ... (matrix zone)
    thumbs:
      key:
        padding: ky
        spread: kx
      anchor:
        ref: matrix_inner_mod # Reference the point to anchor to
        shift: [2, -2]         # Shift it a bit
      columns:
        layer:
          key:
            splay: -15 # Angle the key
        space:
          key:
            width: 1.5kx # Make the spacebar wider
            splay: 75    # Angle it differently
            shift: [2, -2]
      rows:
        cluster:
```
Here, we've anchored the `thumbs` zone and then applied some `splay` (rotation) and `shift` to the individual thumb keys to get the desired layout. We also made the `space` key wider.

## Mirroring and Rotation

We've designed one half of our keyboard. Now, let's create the other half.

```yaml
points:
  # ... (zones config)
  rotate: -15 # Rotate the left half
  mirror:
    ref: matrix_inner_num
    distance: 2.5kx
```
The `mirror` property creates a mirrored copy of all our points. We're telling Ergogen to mirror along an axis that is `2.5kx` away from the `matrix_inner_num` key.

The `rotate` property rotates the entire layout. Since we've mirrored the keyboard, the right half will be rotated in the opposite direction, giving us a nice ergonomic angle.

## The Final Layout

Here is the complete configuration for the first part of our tutorial. You can copy and paste this into the Ergogen Web UI to see the result.

```yaml
units:
  # Proxy Spacing Variables
  kx: cx
  ky: cy
  # Padding Variables
  px: kx + 2
  py: ky + 2
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
            shift: [2, -2]
      rows:
        # Thumbs only have one row.
        cluster:
  # Mirror keyboard halves with a moderate rotation.
  rotate: -15
  mirror:
    ref: matrix_inner_num
    distance: 2.5kx
```

In the [next part](./tutorial-part-2-outlines.md), we'll learn how to create outlines for our keyboard.

# GEDCOM-3D

An experimental 3d force graph viewer for GEDCOM files to visualise and explore family tree data as
a single (complex) structure rather than the often encoutered flat 2d graphs of partials that must
be related back togther in one's head!

## Awesomeness

Comes from Vasco Asturiano and his [3d-force-graph](https://github.com/vasturiano/3d-force-graph)
engine, which is both easy to get going with and beautifully extensible!

## Hackiness

Comes from my cut-down [GEDCOM parser](gedcom-parser.js) which I wrote after bailing on a number of
existing parsers that were waay more comprehensive than I needed, or had dependency chains that did
not allow me the ease of importing at runtime from `unpkg.com`.

## Deployment

Push files to a static server of your choice, point your browser at it, enter `potter.ged` in the first
box and hit `Load`. If that works (it should!) then drop your own GEDCOM file in and try that...

## Navigation

Hovering the pointer over any visible object provides additional information from the GEDCOM related
to the object.

You can 'grab the ball' and rotate it by holding the primary mouse button outside any visible objects.

You can zoom the view by scrolling with your preferred scroll mechanism (eg: mouse wheel, double finger).

You can click on any coloured node to focus on that (and zoom in to it).

You can follow arrows in either direction by clicking on them: primary button towards the arrowhead;
secondary button towards the tail.

Search is terrible (please help me fix it), it matches the __exact prefix__ of names in the data only.

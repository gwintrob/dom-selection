dom-selection
=============

Extrapolate selections of DOM elements to include similar elements


### Methods

#### `.include(HTMLElement|Array|NodeList|String)`
Adds one or more elements to the selection.

#### `.exclude(HTMLElement|Array|NodeList|String)`
Removes one or more elements from the selection and prevents them from being selected during extrapolation.

#### `.contains(HTMLElement, Boolean)`
Determines if the provided element is included in the selection. If the second parameter is `true` it will check child elements in the selection recursively.  

#### `.extrapolate()`
Extends the selection to include similar elements based on Bayesian similarity of various element properties and returns the new selection. 

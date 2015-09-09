var DOMUtils = require('dom-utils'),
    Selector = require('selector-fitter');

function tokenize(element) {
    var tokens  = [],
        bounds  = element.getBoundingClientRect(),
        classes = element.className.split(' ');

    tokens.push(element.tagName);
    tokens.push('offset-left-' + bounds.left);
    tokens.push('offset-top-'  + bounds.top);
    tokens.push('nth-child-'   + Array.prototype.slice.call(element.parentNode.children).indexOf(element));

    if(classes.length) {
        tokens = tokens.concat(element.className.split(' ').map(function(className) {
            return 'class-' + className
        }));
    }

    return tokens.join(' ');
};

/**
 * Represents a selection of HTML Elements
 *
 * @param   {HTMLElement|Array|NodeList|String}    includes    One or more HTMLElements or a CSS selector
 */
module.exports = function DOMSelection() {
    var classifier = require('bayes'),
        includes   = [],
        excludes   = [];

    this.include = function(elements, isXpath) {
        elements = DOMUtils.toElementArray(elements, isXpath);

        elements.forEach(function(el) {
            var index = excludes.indexOf(el);

            // Remove from includes
            if(index !== -1) {
                excludes.splice(index, 1);
            }

            // Ensure uniqueness
            if(includes.indexOf(el) === -1) {
                includes.push(el);
            }
        });

        return this;
    };

    this.exclude = function(elements) {
        elements = DOMUtils.toElementArray(elements);

        elements.forEach(function(el) {
            var index = includes.indexOf(el);

            // Remove from includes
            if(index !== -1) {
                includes.splice(index, 1);
            }

            // Ensure uniqueness
            if(excludes.indexOf(el) === -1) {
                excludes.push(el)
            }
        });

        return this;
    };

    this.contains = function(element, deep) {
        if(deep) {
            return includes.some(function(selected) {
                selected.contains(element);
            });
        } else {
            return includes.indexOf(element) !== -1;
        }
    };

    this.extrapolate = function() {
        var bayes      = new classifier(),
            selection  = new DOMSelection(),
            candidates = [],
            suggested  = [];

        includes.forEach(function(el) {
            var selector  = el.tagName,
                tokenized = tokenize(el);

            while(el = el.parentElement) {
                selector = el.tagName + ' > ' + selector;
            }

            Array.prototype.slice.call(
                document.querySelectorAll(selector)
            ).forEach(function(el) {
                if(candidates.indexOf(el) === -1) {
                    candidates.push(el);
                }
            });

            bayes.learn(tokenized, 'positive');
        });

        excludes.forEach(function(el) {
            bayes.learn(tokenize(el), 'negative');
        });

        suggested = candidates.filter(function(el) {
            return bayes.categorize(tokenize(el)) === 'positive'
                && excludes.indexOf(el) === -1;
        })

        return new DOMSelection()
            .include(includes)
            .include(suggested)
            .exclude(excludes);
    };

    this.getElements = function() {
        return includes;
    };

    this.getExclusions = function() {
        return excludes;
    };

    this.getSelector = function() {
        return new Selector(this.getElements()).generate();
    };
}

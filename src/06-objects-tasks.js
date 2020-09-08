/* ************************************************************************************************
 *                                                                                                *
 * Plese read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectagle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  this.width = width;
  this.height = height;
  this.getArea = () => this.width * this.height;
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const o = JSON.parse(json);
  Object.setPrototypeOf(o, proto);
  return o;
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurences
 *
 * All types of selectors can be combined using the combinators ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string repsentation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */


class MyCssSelector {
  constructor() {
    this.order = ['myElement', 'myId', 'myClasses', 'myAttr', 'myPseudoClasses', 'myPseudoElement'];
    this.myClasses = [];
    this.myPseudoClasses = [];
    this.subBuilders = [];
    return this;
  }

  checkAfterElemsExist(name) {
    const idx = this.order.indexOf(name);
    const arr = this.order.slice(idx + 1);
    const found = arr.find((item) => this[item] && this[item].length);
    if (found) throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
  }

  combine(selector1, combinator, selector2) {
    this.subBuilders.push(selector1, combinator, selector2);
    return this;
  }

  element(elem) {
    this.checkAfterElemsExist('myElement');
    if (this.myElement) throw new Error('/Element, id and pseudo-element should not occur more then one time inside the selector/');
    this.myElement = elem;
    return this;
  }

  getElement() {
    return this.myElement || '';
  }

  id(val) {
    this.checkAfterElemsExist('myId');
    if (this.myId) throw new Error('/Element, id and pseudo-element should not occur more then one time inside the selector/');
    this.myId = val;
    return this;
  }

  getId() {
    return this.myId ? `#${this.myId}` : '';
  }

  attr(val) {
    this.checkAfterElemsExist('myAttr');
    this.myAttr = val;
    return this;
  }

  getAttr() {
    return this.myAttr ? `[${this.myAttr}]` : '';
  }

  pseudoClass(val) {
    this.checkAfterElemsExist('myPseudoClasses');
    this.myPseudoClasses.push(val);
    return this;
  }

  getPseudoClass() {
    return this.myPseudoClasses.reduce((acc, cl) => `${acc}:${cl}`, '');
  }

  pseudoElement(val) {
    if (this.myPseudoElement) throw new Error('/Element, id and pseudo-element should not occur more then one time inside the selector/');
    this.myPseudoElement = val;
    return this;
  }

  getPseudoElement() {
    return this.myPseudoElement ? `::${this.myPseudoElement}` : '';
  }

  class(val) {
    this.checkAfterElemsExist('myClasses');
    this.myClasses.push(val);
    return this;
  }

  getClass() {
    const classes = this.myClasses.reduce((acc, cl) => `${acc}.${cl}`, '');
    return classes;
  }

  stringify() {
    if (this.subBuilders.length) {
      const result = this.subBuilders.reduce((acc, item) => {
        const res = item instanceof MyCssSelector ? item.stringify() : item.toString();
        return `${acc.length ? ` ${acc}` : ''} ${res}`;
      }, '') || '';
      return result.trim();
    }
    return `${this.getElement()}${this.getId()}${this.getClass()}${this.getAttr()}${this.getPseudoClass()}${this.getPseudoElement()}`;
  }
}

const cssSelectorBuilder = {
  element(val) {
    return new MyCssSelector().element(val);
  },

  id(val) {
    return new MyCssSelector().id(val);
  },

  class(val) {
    return new MyCssSelector().class(val);
  },

  attr(val) {
    return new MyCssSelector().attr(val);
  },

  pseudoClass(val) {
    return new MyCssSelector().pseudoClass(val);
  },

  pseudoElement(val) {
    return new MyCssSelector().pseudoElement(val);
  },

  combine(selector1, combinator, selector2) {
    return new MyCssSelector().combine(selector1, combinator, selector2);
  },
};

module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};

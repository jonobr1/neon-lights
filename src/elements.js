(function() {

  var root = this;
  var previousElements = root.Elements || {};

  var Elements = root.Elements = function(obj) {

    Object.call(this);

    this.content = document.createElement('div');
    this.content.classList.add('content');
    this.content.isContainer = true;

    for (var k in obj) {
      this[k] = obj[k];
      this[k].classList.add(k);
    }

  };

  Elements.prototype = Object.create(Object.prototype);
  Elements.prototype.constructor = Elements;

  Elements.prototype.forEach = function(func, context) {
    var ctx = context || this;
    for (var k in this) {
      if (!!(this[k] && this[k].nodeType === 1)) {
        func.call(ctx, this[k], k);
      }
    }
    return this;
  };

  Elements.prototype.appendTo = function(elem) {
    elem.appendChild(this.content);
    return this;
  };

  Elements.prototype.append = function(elem) {
    this.content.appendChild(elem);
    return this;
  };

})();

var circlePacking = function() {
  var $ = circlePacking;
  var width = 768;
  var height = 500;
  var container = "body";
  var hl = "hl";
  var getMaxDomain = function(d) {
    return d.children ? Math.max(d.length || 0, d3.max(d.children.map(getMaxDomain))) : (d.length || 0);
  }
  var rScale = d3.scale.sqrt().range([0,65]).domain([0,1]);
  var pack = d3.layout.pack()
      .size([width, height])
      .padding(20)
      .sort(function() { return 0.5 - Math.random(); })
      .radius(rScale)
      .value(function(d) { return d.length; });
  var force = d3.layout.force()
      .size([width, height])
      .gravity(0)
      .charge(0);
  var zoom = d3.behavior.zoom()
      .translate([0,0])
      .scale(1)
      .scaleExtent([1,1]);
  var drag = force.drag()
      .on("dragstart", $dragstart)
      .on("dragend", $dragend);

  $.maxRadius = function(_) { rScale.range([5,_]); return $; };
  $.padding = function(_) { pack.padding(_); return $; };
  $.container = function(_) { container = _; return $; };
  $.highlight = function(_) { hl = _; return $; };
  $.pack = function(root) {
    if (!root.children || root.children.length === 0) return;
    // set domain
    rScale.domain([0, getMaxDomain(root)]);
    // insert self
    root.children.forEach($ignore);
    // remove root node
    var nodes = pack.nodes(root).slice(1);
    // scale to rScale and init random position
    nodes.forEach($transform);
    // shape container (pannable)
    var svg = d3.select(container).append("svg")
        .attr("class", "gshape")
        .attr("width", width)
        .attr("height", height)
        .call(zoom)
        .call($panonly)
      .append("g");
    // text container
    var div = d3.select(container).append("div")
        .attr("class", "gtext")
      .append("div")
        .style("position", "absolute");
    // update zoom fn
    zoom.on("zoom", $zoomed(svg,div));
    // circles
    var svgas = svg.selectAll("a").data(nodes).enter().append("a")
        .attr("xlink:href", function(d) { return d.path; })
        .call(drag)
        .call($connectEvents);
    svgas.append("circle")
        .classed("no-stroke", function(d) { return d.depth === 1 || d.ignore; })
        .classed("ignore", function(d) { return d.ignore; })
        .attr("r", function(d) { return d.r; })
        .each(function (d) { d.shape = d.ignore ? d.parent.shape : this; });
    // tag links
    var divas = div.selectAll("a")
        .data(nodes.filter(function(d) { return !d.children; }))
      .enter().append("a")
        .attr("href", function(d) { return d.path })
        .call(drag)
        .call($connectEvents);
    // name label
    divas.append("div")
        .attr("class", "tag-name")
        .text(function(d) { return d.name; });
    // count label
    divas.append("div")
        .attr("class", "tag-count")
        .text(function(d) { return d.ignore ? d.parent.length : d.length; });
    // https://github.com/vlandham/bubble_cloud
    divas
        .style("font-size", function(d) { return Math.max(8, (d.ignore ? d.parent.r : d.r) / 2) + "px" })
        .style("width", function(d) { return (2.5 * d.r) + "px" });
    divas.append("span")
        .text(function(d) { return d.name })
        .each(function(d) { d.dx = Math.max(2.5 * d.r, this.getBoundingClientRect().width)})
        .remove();
    divas
        .style("width", function(d) { return d.dx + "px" })
        .each(function(d) { d.dy = this.getBoundingClientRect().height })
        .each(function(d) { d.label = this; d.ignore && (d.parent.label = this); });
    force
        .nodes(nodes)
        .on("tick", $tick(nodes,svgas,divas))
        .start();
  };
  function $ignore(d) {
    if (d.children) {
      d.children.forEach($ignore);
      d.children.push({ name: d.name, path: d.path, length: 1e-2, ignore: true });
    }
  }
  function $transform(d) {
    d.tf = d.parent.tf || {
      scale: rScale(d.length) / d.r,
      tx: (Math.random() - .5) * width * 4,
      ty: (Math.random() - .5) * height * 4
    };
    d.r *= d.tf.scale;
    d.x = d.tf.scale * (d.x + d.tf.tx);
    d.y = d.tf.scale * (d.y + d.tf.ty);
  }
  function $panonly(d) {
    d
      .on("mousewheel.zoom", null)
      .on("wheel.zoom", null)
      .on("MozMousePixelScroll.zoom", null)
      .on("dblclick.zoom", null);
  }
  function $zoomed(svg, div) {
    return function() {
      var tx = d3.event.translate[0];
      svg.attr("transform", "translate("+[tx,0]+")");
      div.style("left", tx + "px");
    }
  }
  var dragging;
  function $connectEvents(d) {
    d
      .on("mouseover", function(d) {
        if (dragging) return;
        d3.select(d.label).moveToFront();
        d3.select(d.shape).classed(hl, true);
      })
      .on("mouseout", function (d) {
        if (dragging) return;
        d3.selectAll("."+hl).classed(hl, false);
      });
  }
  function $dragstart(d) {
    d3.event.sourceEvent.stopPropagation();
    dragging = true;
    d3.select(d.label).moveToFront();
    d3.select(d.shape).classed(hl, true);
  }
  function $dragend(d) {
    dragging = false;
    d3.selectAll("."+hl).classed(hl, false);
  }
  function $tick(nodes,svgas,divas) {
    return function(e) {
      var q = d3.geom.quadtree(nodes);
      svgas
          .each($gravity(e.alpha * 0.2))
          .each(function(svga) { q.visit($collide(svga)); })
          .attr("transform", function(d) { return "translate("+[d.x,d.y]+")"; });
      divas
          .style("left", function(d) { return (d.x - d.dx / 2)+"px"; })
          .style("top", function(d) { return (d.y - d.dy / 2)+"px"; });
    }
  }
  // https://github.com/vlandham/bubble_cloud
  function $gravity(alpha) {
    var cx = width / 2,
        cy = height / 2,
        ax = alpha / 8,
        ay = alpha;
    return function(d) {
      d.x += (cx - d.x) * ax;
      d.y += (cy - d.y) * ay;
    }
  }
  function $collide(node) {
    var dr = d3.max(node.parent.children, function(d) { return d.r; });
    var r = node.r + dr;
        nx1 = node.x - r,
        nx2 = node.x + r,
        ny1 = node.y - r,
        ny2 = node.y + r;
    return function(quad, x1, y1, x2, y2) {
      if (quad.point && (quad.point !== node)) {
        var x = node.x - quad.point.x,
            y = node.y - quad.point.y,
            l = Math.sqrt(x * x + y * y),
            ri = Math.abs(node.r - quad.point.r) - 5,
            ro = node.r + quad.point.r + 3;
        if (node.parent === quad.point || node === quad.point.parent) {
          if (l && l > ri) {
            l = (l - ri) / l *.5;
            node.x -= x *= l;
            node.y -= y *= l;
            quad.point.x += x;
            quad.point.y += y;
          }
        } else if (node.parent.children.indexOf(quad.point) !== -1) {
          if (l && l < ro) {
            l = (l - ro) / l * .5;
            node.x -= x *= l;
            node.y -= y *= l;
            quad.point.x += x;
            quad.point.y += y;
          }
        }
      }
      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    };
  }
  return $;
}
// https://gist.github.com/trtg/3922684
d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

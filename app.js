(function() {
  'use strict';

  var express = require('express');
  var path = require('path');
  var logger = require('morgan');
  var cookieParser = require('cookie-parser');
  var bodyParser = require('body-parser');
  var _ = require('underscore');

  var app = express();

  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));

  app.disable('x-powered-by');

  var graph = function () {
    this.nodes = {};
    this.neighbors = {};
  };

  /**
   *
   * @param {string} newHost - Name of new host to add
   * @param {string} host - Name of host to create link from (Optional)
   * @param {string} link - Protocol of file transfer (Optional)
   * @param {string} dest - Name of host to create link to (Optional)
   * @returns {boolean}
   */
  graph.prototype.addHost = function (newHost, host, link, dest) {
    if (!_.has(this.nodes, newHost.toLowerCase())) {
      this.nodes[newHost.toLowerCase()] = [];
      this.neighbors[newHost.toLowerCase()] = [];
      if (!_.isUndefined(host) && !_.isUndefined(link) && !_.isUndefined(dest)) {
        this.createLink(host, link, dest);
        return true;
      } else {
        return true;
      }
    } else {
      return false;
    }

  };

  /**
   * Gets an array of all hosts
   */
  graph.prototype.getHosts = function () {
    return _.keys(this.nodes);
  };

  /**
   *
   * @param {string} host -  Name of host to start transfer from
   * @param {string} link - Protocol of file transfer
   * @param {string} dest -  Name of host to transfer to
   * @returns {boolean}
   */
  graph.prototype.createLink = function (host, link, dest) {
    if (!_.has(this.nodes, host.toLowerCase())) {
      //create host entry for source host
      this.addHost(host, host, link, dest);
    } else if (!_.has(this.nodes, dest.toLowerCase())) {
      //create host entry for destination host
      this.addHost(dest, host, link, dest);
    } else if (_.isEmpty(_.filter(this.nodes[host], function (i) {
          return i.description.toLowerCase() === link.toLowerCase() && i.dest.toLowerCase() === dest.toLowerCase();
        })) || _.isEmpty(this.nodes[host])) {
      this.nodes[host.toLowerCase()].push({description: link.toLowerCase(), dest: dest.toLowerCase()});
      this.neighbors[host.toLowerCase()].push(dest);
      return true;
    } else {
      return false;
    }
  };

  /**
   *
   * @returns {object} - Object of all hosts and their links
   */
  graph.prototype.getLinks = function () {
    return this.nodes;
  };

  /**
   *
   * @param {string} host - Name of host to start transfer from
   * @param {string} dest - Name of host to transfer to
   * @returns {array} - An array of hosts that represent the shortest path that includes the description
   */
  graph.prototype.getPath = function (host, dest) {
    if (_.isEmpty(this.nodes)) {
      return [];
    }
    var queue = [host],
        visited = {host: true},
        previous = {},
        tail = 0;
    while (tail < queue.length) {
      var curNode = queue[tail++],  // Pop a vertex off the queue.
          neighbors = this.neighbors[curNode];
      for (var i = 0; i < neighbors.length; ++i) {
        var next = neighbors[i];
        if (visited[next]) {
          continue;
        }
        visited[next] = true;
        if (next === dest) {   // Check if the path is complete.
          var path = [next];   // If so, backtrack through the path.
          while (curNode !== host) {
            path.push(curNode);
            curNode = previous[curNode];
          }
          path.push(curNode);
          path.reverse();
          return this.getLink(path);
        }
        previous[next] = curNode;
        queue.push(next);
      }
    }
    return this.getLink([]);
  };

  /**
   *
   * @param {array} path - An array of hosts that represent the shortest path
   * @returns {array} - An array of hosts that represent the shortest path that includes the description
   */
  graph.prototype.getLink = function (path) {
    var that = this;
    if (_.isEmpty(path)) {
      return path;
    } else {
      var result = [];
      path.forEach(function (value, i) {
        var link = {};
        if (i !== path.length - 1) {
          link.host = value;
          link.description = _.chain(that.nodes[value])
              .values()
              .filter(function (link) {
                return link.dest === path[i + 1];
              })
              .pluck('description').toString();
          link.dest = path[i + 1];
          result.push(link);
        }

      });
      return result;

    }
  };

  var servers = new graph();

  app.use(function (req, res, next) {
    res.header('Content-Type', 'application/json');
    res.header('Access-Control-Allow-Origin', '*'); //Only used to make it easy for us since this is not a production environent
    res.header('Vary', 'Accept-Encoding');
    res.header('Cache-Control', "max-age=30");
    next();
  });


  app.post('/host', function (req, res, next) {
    var name, ref;
    name = (ref = req.body.name) !== null ? ref : false;
    if (!name) {
      return res.status(400).jsonp({message: "You must specify a hostname"});
    }
    var promise = new Promise(function (resolve, reject) {
      resolve(servers.addHost(name));
    });
    return promise.then(function (result) {
      if (result) {
        return res.status(201).jsonp({success: true});
      } else {
        return res.status(409).jsonp({message: "A host with that name already exists"});
      }
    });
  });

  app.get('/hosts', function (req, res, next) {
    res.status(200).jsonp(servers.getHosts());
  });

  app.post('/link', function (req, res, next) {
    var host = req.body.host,
        link = req.body.description,
        dest = req.body.dest;
    if (!host || !link || !dest) {
      return res.status(400).jsonp({message: "You must specify a hostname, link, and a destination"});
    }
    var promise = new Promise(function (resolve, reject) {
      resolve(servers.createLink(host, link, dest));
    });
    return promise.then(function (result) {
      //if no host exists, it will create the host + link and return undefined
      if (result || _.isUndefined(result)) {
        return res.status(201).jsonp({success: true});
      } else {
        return res.status(409).jsonp({message: "Link already exists"});
      }
    }), function () {
      return res.status(500).jsonp({message: "Internal Server Error"});
    };
  });

  app.get('/links', function (req, res, next) {
    res.status(200).jsonp(servers.getLinks());
  });

  app.get('/path/:A/to/:B', function (req, res, next) {
    var host = req.params.A,
        dest = req.params.B;
    if (!host || !dest) {
      return res.status(400).jsonp({message: "You must specify a hostname and a destination"});
    }
    var promise = new Promise(function (resolve, reject) {
      resolve(servers.getPath(host, dest));
    });
    promise.then(function (result) {
      return res.status(200).jsonp(result);
    });

  });


// catch 404 and forward to error handler
  app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

// error handlers

// development error handler
// will print stacktrace
  if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
      res.status(err.status || 500);
      res.jsonp({status: err.status || 500, message: "Internal Server Error"});
    });
  }

// production error handler
// no stacktraces leaked to user
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.jsonp({status: err.status || 500, message: "Internal Server Error"});
  });


  module.exports = app;
})();

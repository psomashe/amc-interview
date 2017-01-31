'use strict';

var fs = require("fs");
var path = require("path");

var nodeId = 1;
var root = null;

var nodeMap = {};

function Node(parent, number) {
    var self = this;

    self.id = nodeId++;
    self.number = number;
    self.parent = parent;
    self.left = null;
    self.right = null;

    if (parent) {
        if (number < parent.number) {
            parent.left = self;
        } else {
            parent.right = self;
        }
    }

    nodeMap[self.id] = self;

    self.toJSON = function () {
        var obj = {
            id: self.id,
            number: self.number
        };

        if (self.parent) {
            obj.parentId = self.parent.id;
        }

        return obj;
    }
}

function addTreeNode(number) {
    var rv = null;

    if (root == null) {
        root = new Node(null, number);
        rv = root;
    } else {
        var cur = root;
        var parent = null;

        while (cur) {
            parent = cur;

            if (number < cur.number) {
                cur = cur.left;
            } else if (number > cur.number) {
                cur = cur.right;
            } else {
                rv = cur;
                break;
            }
        }

        if (rv == null) {
            rv = new Node(parent, number);
        }
    }

    return rv;
}

function findTreeNode(number) {
    var cur = root;
    var rv = null;

    while (cur) {
        if (cur.number == number) {
            rv = cur;
            break;
        } else if (number < cur.number) {
            cur = cur.left;
        } else {
            cur = cur.right;
        }
    }

    return rv;
}

function addNode(req, res, next) {
    var number = req.swagger.params.number.value;
    var node = addTreeNode(number);

    res.json(node.toJSON());
}

function getRootNode(req, res, next) {
    if (root) {
        res.json(root.toJSON());
    } else {
        res.status(204).send();
    }
}

function getNodeByID(req, res, next) {
    var id = req.swagger.params.id.value;
    var node = nodeMap[id];
    if (node) {
        res.json(node.toJSON());
    } else {
        res.status(404).send();
    }
}

function findNode(req, res, next) {
    var number = req.swagger.params.number.value;
    var parentId = req.swagger.params.parentId.value;
    var rv = [];
    var node;

    if (number) {
        node = findTreeNode(number);
        if (node) {
            rv = [node.toJSON()];
        }
    } else if (parentId) {
        node = nodeMap[parentId];
        if (node) {
            rv = [];
            if (node.left) {
                rv.push(node.left.toJSON());
            }

            if (node.right) {
                rv.push(node.right.toJSON());
            }
        }
    }

    res.json(rv);
}


function getDocPath(filename) {
    return path.join(__dirname, "../../doc/" + filename);
}

function getDoc(req, res, next) {
    fs.readFile(getDocPath("index.html"), "utf8", function (err, data) {
        res.status(200).send(data.toString());
    });
}

function getPopulate(req, res, next) {
    fs.readFile(getDocPath("populate.html"), "utf8", function (err, data) {
        res.status(200).send(data.toString());
    });
}

function populateTree(req, res, next) {
    var numbers = req.swagger.params.numbers.value.split(" ");
    numbers.forEach(function (number) {
        number = +(number.trim());
        if (number) {
            addTreeNode(number);
        }
    });

    res.status(200).send("OK");
}

module.exports = { addNode, getRootNode, getNodeByID, findNode, getDoc, getPopulate, populateTree };

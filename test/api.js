var should = require('should');
var request = require("supertest");



function addHost(i) {
    describe("File Transfer API", function() {
        describe("Adding a new host", function() {
            var url = "http://localhost:3000";
            it("Adds a new host without creating a link", function () {
                var alphabet = 'abcdefghijklmnopqrstuvqxyz'.split('');
                request(url)
                    .post('/host')
                    .send({name: alphabet[i]})
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }
                        // this is should.js syntax, very clear
                        res.should.have.status(201);
                        done();
                    });
            });
        });
    });
}
for (var i = 0; i < 20; i++) {
    addHost(i);
}

function addLinks(i) {
    describe("File Transfer API", function() {
        describe("Adding a new link", function() {
            var url = "http://localhost:3000";
            it("Adds a new link between two hosts", function () {
                var alphabet = 'abcdefghijklmnopqrstuvqxyz'.split('');
                console.log({host: alphabet[i], link: fileProtocol(), dest: alphabet[randNumber(i)]});
                request(url)
                    .post('/link')
                    .send({host: alphabet[randNumber()], description: fileProtocol(), dest: alphabet[randNumber(i)]})
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }
                        // this is should.js syntax, very clear
                        res.should.have.status(201);
                        done();
                    });
            });
        });
    });
}
function fileProtocol() {
    var protocols = [
        "ftp",
        "scp",
        "rsync",
        "samba"
    ]
    return protocols[Math.floor(Math.random() * 4)];
}

function randNumber(i) {
    var num = Math.floor(Math.random() * 26)
    return  (num === i) ? randNumber(i) : num;
}

for (var i = 0; i < 40; i++) {
    addLinks(i);
}

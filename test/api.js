import chai from "chai";
import chaiHttp from "chai-http";
import app from '../index.js';
import User from '../models/User.js';
let should = chai.should();
chai.use(chaiHttp);

let server = app

describe('Simple JWT Login', function () {

    it('should return a message for health check', function(done) {
        chai.request(server)
            .get('/health-check')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('serverTime');
                res.body.should.have.property('msg');

                done();
            })
    })

    it('should register a user', function(done) {
        chai.request(server)
            .post('/api/v1/users/register')
            .send({
                "firstName": "Johnny",
                "lastName": "Danger",
                "contactNumber": "0911222",
                "email": "test@gmail.com",
                "password": "rootroot"
            })
            .end(function(err, res) {

                // the res object should have a status of 201
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('token');
                res.body.should.have.property('msg');

                done();
            });
    })

    it('should login a user', function(done) {
        chai.request(server)
            .post('/api/v1/auth')
            .send({
                "email": "test@gmail.com",
                "password": "rootroot"
            })
            .end(function(err, res) {

                // the res object should have a status of 201
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('token');
                res.body.should.have.property('msg');

                done();
            });
    })

    it('return list of users to a valid registered user', function(done) {
        chai.request(server)
            .post('/api/v1/auth')
            .send({
                "email": "test@gmail.com",
                "password": "rootroot"
            })
            .end(function(err, res) {

                // the res object should have a status of 201
                res.should.have.status(200);
                res.body.should.have.property('token');
                console.log('User authenticated, token receieved...');
                let token = res.body.token;
                
                chai.request(server)
                    .get('/api/v1/users')
                    .set('x-auth-token', token)
                    .end(function(err, res) {
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.should.be.a('array');
                        done();
                    })
            });
    })

    

    this.afterAll(function (done) {
        User.collection.drop().then(function() {
            console.log('Cleaning up test cases...');  
            console.log('Dropping collection `User`...');
            console.log('Test finished! Timestamp: ' + new Date());
        }).catch(function() {

            // error handling
            console.warn('Collection may not exist!');
        })


        done();
    })


})
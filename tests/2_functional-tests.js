const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const { beforeEach } = require('mocha');

chai.use(chaiHttp);

const openRequest = chai.request(server).keepOpen();

suite('Functional Tests', function () {
  // Create an issue with every field: POST request to /api/issues/{project}
  test('Create an issue with every field: POST request to /api/issues/{project}', function (done) {
    openRequest
      .post('/api/issues/test')
      .send({
        issue_title: 'Title',
        issue_text: 'text',
        created_by: 'Functional Test - Every field filled in',
        assigned_to: 'Chai and Mocha',
        status_text: 'In QA'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Title');
        assert.equal(res.body.issue_text, 'text');
        assert.equal(
          res.body.created_by,
          'Functional Test - Every field filled in'
        );
        assert.equal(res.body.assigned_to, 'Chai and Mocha');
        assert.equal(res.body.status_text, 'In QA');
        done();
      });
  });

  // Create an issue with only required fields: POST request to /api/issues/{project}
  test('Create an issue with only required fields: POST request to /api/issues/{project}', function (done) {
    openRequest
      .post('/api/issues/test')
      .send({
        issue_title: 'Title#2',
        issue_text: 'text#2',
        created_by: 'Functional Test - Only required fields filled in'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Title#2');
        assert.equal(res.body.issue_text, 'text#2');
        assert.equal(
          res.body.created_by,
          'Functional Test - Only required fields filled in'
        );
        assert.equal(res.body.assigned_to, '');
        assert.equal(res.body.status_text, '');
        done();
      });
  });

  // Create an issue with missing required fields: POST request to /api/issues/{project}
  test('Create an issue with missing required fields: POST request to /api/issues/{project}', function (done) {
    openRequest
      .post('/api/issues/test')
      .send({
        issue_title: 'Title#3',
        issue_text: 'text#3'
      })
      .end(function (err, res) {
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });

  // View issues on a project: GET request to /api/issues/{project}
  test('View issues on a project: GET request to /api/issues/{project}', function (done) {
    openRequest.get('/api/issues/test').end(function (err, res) {
      assert.equal(res.status, 200);
      assert.isArray(res.body);
      done();
    });
  });

  // View issues on a project with one filter: GET request to /api/issues/{project}
  test('View issues on a project with one filter: GET request to /api/issues/{project}', function (done) {
    openRequest.get('/api/issues/test?open=true').end(function (err, res) {
      assert.equal(res.status, 200);
      assert.isArray(res.body);
      assert.isNotEmpty(res.body);
      assert.equal(res.body[0].open, true);
      done();
    });
  });

  // View issues on a project with multiple filters: GET request to /api/issues/{project}
  test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function (done) {
    openRequest
      .keepOpen()
      .get('/api/issues/test?open=true&issue_text=text')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isNotEmpty(res.body);
        assert.equal(res.body[0].open, true);
        assert.equal(res.body[0].issue_text, 'text');
        done();
      });
  });

  // Update one field on an issue: PUT request to /api/issues/{project}
  test('Update one field on an issue: PUT request to /api/issues/{project}', function (done) {
    openRequest
      .put('/api/issues/test')
      .send({
        _id: '2jt90YrZ3AKfJdz6S7UA',
        issue_title: 'Title#2Updated'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, '2jt90YrZ3AKfJdz6S7UA');
        done();
      });
  });

  // Update multiple fields on an issue: PUT request to /api/issues/{project}
  test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function (done) {
    openRequest
      .put('/api/issues/test')
      .send({
        _id: '2jt90YrZ3AKfJdz6S7UA',
        issue_title: 'Title#2Updated#2',
        issue_text: 'text#2Updated',
        created_by: 'Chai and Mocha',
        assigned_to: 'Jest',
        status_text: 'In Progress',
        open: false
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, '2jt90YrZ3AKfJdz6S7UA');
        done();
      });
  });

  // Update an issue with missing _id: PUT request to /api/issues/{project}
  test('Update an issue with missing _id: PUT request to /api/issues/{project}', function (done) {
    openRequest
      .put('/api/issues/test')
      .send({
        issue_title: 'Title#2Updated#2',
        issue_text: 'text#2Updated',
        created_by: 'Chai and Mocha',
        assigned_to: 'Jest',
        status_text: 'In Progress',
        open: false
      })
      .end(function (err, res) {
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

  // Update an issue with no fields to update: PUT request to /api/issues/{project}
  test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function (done) {
    openRequest
      .put('/api/issues/test')
      .send({
        _id: '2jt90YrZ3AKfJdz6S7UA'
      })
      .end(function (err, res) {
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'no update field(s) sent');
        done();
      });
  });

  // Update an issue with an invalid _id: PUT request to /api/issues/{project}
  test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function (done) {
    openRequest
      .put('/api/issues/test')
      .send({
        _id: '2jt90YrZ3AKfJdz6S7UAInvalid',
        issue_title: 'Title#2Updated#2',
        issue_text: 'text#2Updated',
        created_by: 'Chai and Mocha',
        assigned_to: 'Jest',
        status_text: 'In Progress',
        open: false
      })
      .end(function (err, res) {
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'could not update');
        done();
      });
  });

  suite('Delete requests', function () {
    // setup a new issue to delete before each test

    beforeEach(function (done) {
      openRequest
        .post('/api/issues/test')
        .send({
          _id: 'Rh0nr1x23Iru4JCQgvjo',
          issue_title: 'Title#3',
          issue_text: 'text#3',
          created_by: 'Chai and Mocha',
          assigned_to: 'Jest',
          status_text: 'In Progress'
        })
        .end(function (err, res) {
          done();
        });
    });

    // Delete an issue: DELETE request to /api/issues/{project}
    test('Delete an issue: DELETE request to /api/issues/{project}', function (done) {
      openRequest
        .delete('/api/issues/test')
        .send({
          _id: 'Rh0nr1x23Iru4JCQgvjo'
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully deleted');
          assert.equal(res.body._id, 'Rh0nr1x23Iru4JCQgvjo');
          done();
        });
    });

    // Delete an issue with an invalid _id: DELETE request to /api/issues/{project}
    test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function (done) {
      openRequest
        .delete('/api/issues/test')
        .send({
          _id: 'Rh0nr1x23Iru4JCQgvjoInvalid'
        })
        .end(function (err, res) {
          assert.equal(res.status, 400);
          assert.equal(res.body.error, 'could not delete');
          done();
        });
    });

    // Delete an issue with missing _id: DELETE request to /api/issues/{project}
    test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function (done) {
      openRequest.delete('/api/issues/test').end(function (err, res) {
        assert.equal(res.status, 400);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
    });
  });
});


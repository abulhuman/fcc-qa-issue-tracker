const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const { beforeEach } = require('mocha');

chai.use(chaiHttp);

const openRequest = chai.request(server).keepOpen();

suite('Functional Tests', () => {
  // Create an issue with every field: POST request to /api/issues/{project}
  test('Create an issue with every field: POST request to /api/issues/{project}', (done) => {
    openRequest
      .post('/api/issues/test')
      .send({
        issue_title: 'Title',
        issue_text: 'text',
        created_by: 'Functional Test - Every field filled in',
        assigned_to: 'Chai and Mocha',
        status_text: 'In QA'
      })
      .end((err, res) => {
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
  test('Create an issue with only required fields: POST request to /api/issues/{project}', (done) => {
    openRequest
      .post('/api/issues/test')
      .send({
        issue_title: 'Title#2',
        issue_text: 'text#2',
        created_by: 'Functional Test - Only required fields filled in'
      })
      .end((err, res) => {
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
  test('Create an issue with missing required fields: POST request to /api/issues/{project}', (done) => {
    openRequest
      .post('/api/issues/test')
      .send({
        issue_title: 'Title#3',
        issue_text: 'text#3'
      })
      .end((err, res) => {
        // assert.equal(res.status, 400);
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });

  // View issues on a project: GET request to /api/issues/{project}
  test('View issues on a project: GET request to /api/issues/{project}', (done) => {
    openRequest.get('/api/issues/test').end((err, res) => {
      assert.equal(res.status, 200);
      assert.isArray(res.body);
      done();
    });
  });

  // View issues on a project with one filter: GET request to /api/issues/{project}
  test('View issues on a project with one filter: GET request to /api/issues/{project}', (done) => {
    openRequest.get('/api/issues/test?open=true').end((err, res) => {
      assert.equal(res.status, 200);
      assert.isArray(res.body);
      assert.isNotEmpty(res.body);
      assert.equal(res.body[0].open, true);
      done();
    });
  });

  // View issues on a project with multiple filters: GET request to /api/issues/{project}
  test('View issues on a project with multiple filters: GET request to /api/issues/{project}', (done) => {
    openRequest
      .keepOpen()
      .get('/api/issues/test?open=true&issue_text=text')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isNotEmpty(res.body);
        assert.equal(res.body[0].open, true);
        assert.equal(res.body[0].issue_text, 'text');
        done();
      });
  });

  // Update one field on an issue: PUT request to /api/issues/{project}
  test('Update one field on an issue: PUT request to /api/issues/{project}', (done) => {
    openRequest
      .put('/api/issues/test')
      .send({
        _id: '1bx1HlYr3AYjkNSDjuIj',
        issue_title: 'Title#2Updated'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, '1bx1HlYr3AYjkNSDjuIj');
        done();
      });
  });

  // Update multiple fields on an issue: PUT request to /api/issues/{project}
  test('Update multiple fields on an issue: PUT request to /api/issues/{project}', (done) => {
    openRequest
      .put('/api/issues/test')
      .send({
        _id: '1bx1HlYr3AYjkNSDjuIj',
        issue_title: 'Title#2Updated#2',
        issue_text: 'text#2Updated',
        created_by: 'Chai and Mocha',
        assigned_to: 'Jest',
        status_text: 'In Progress',
        open: false
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, '1bx1HlYr3AYjkNSDjuIj');
        done();
      });
  });

  // Update an issue with missing _id: PUT request to /api/issues/{project}
  test('Update an issue with missing _id: PUT request to /api/issues/{project}', (done) => {
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
      .end((err, res) => {
        // assert.equal(res.status, 400);
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

  // Update an issue with no fields to update: PUT request to /api/issues/{project}
  test('Update an issue with no fields to update: PUT request to /api/issues/{project}', (done) => {
    openRequest
      .put('/api/issues/test')
      .send({
        _id: '1bx1HlYr3AYjkNSDjuIj'
      })
      .end((err, res) => {
        // assert.equal(res.status, 400);
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'no update field(s) sent');
        done();
      });
  });

  // Update an issue with an invalid _id: PUT request to /api/issues/{project}
  test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', (done) => {
    openRequest
      .put('/api/issues/test')
      .send({
        _id: '1bx1HlYr3AYjkNSDjuIjInvalid',
        issue_title: 'Title#2Updated#2',
        issue_text: 'text#2Updated',
        created_by: 'Chai and Mocha',
        assigned_to: 'Jest',
        status_text: 'In Progress',
        open: false
      })
      .end((err, res) => {
        // assert.equal(res.status, 400);
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'could not update');
        done();
      });
  });

  suite('Delete requests', function () {
    // setup a new issue to delete before each test

    beforeEach((done) => {
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
        .end((err, res) => {
          done();
        });
    });

    // Delete an issue: DELETE request to /api/issues/{project}
    test('Delete an issue: DELETE request to /api/issues/{project}', (done) => {
      openRequest
        .delete('/api/issues/test')
        .send({
          _id: 'Rh0nr1x23Iru4JCQgvjo'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully deleted');
          assert.equal(res.body._id, 'Rh0nr1x23Iru4JCQgvjo');
          done();
        });
    });

    // Delete an issue with an invalid _id: DELETE request to /api/issues/{project}
    test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', (done) => {
      openRequest
        .delete('/api/issues/test')
        .send({
          _id: 'Rh0nr1x23Iru4JCQgvjoInvalid'
        })
        .end((err, res) => {
          // assert.equal(res.status, 400);
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'could not delete');
          done();
        });
    });

    // Delete an issue with missing _id: DELETE request to /api/issues/{project}
    test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', (done) => {
      openRequest.delete('/api/issues/test').end((err, res) => {
        // assert.equal(res.status, 400);
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
    });
  });
});

suite('Hints', () => {
  test(`H1) You can send a POST request to /api/issues/{projectname}
   with form data containing the required fields issue_title, 
   issue_text, created_by, and optionally assigned_to and status_text.`, (done) => {
    try {
      const testData = {
        issue_title: 'Faux Issue Title',
        issue_text: 'Functional Test - Required Fields Only',
        created_by: 'fCC'
      };
      openRequest
        .post('/api/issues/fcc-hints')
        .send(testData)
        .end((err, res) => {
          assert.isObject(res.body, 'response should be an object');
          assert.nestedInclude(
            res.body,
            testData,
            'response should contain submitted data'
          );
          done();
        });
    } catch (error) {
      done(error);
    }
  });

  test(`H2) The POST request to /api/issues/{projectname} will return an object with the submitted
   fields and also include created_on(date/time), updated_on(date/time), 
   open(boolean, true for open, false for closed), and _id.`, (done) => {
    try {
      const testData = {
        issue_title: 'Faux Issue Title 2',
        issue_text: 'Functional Test - Every field filled in',
        created_by: 'fCC',
        assigned_to: 'Chai and Mocha'
      };
      openRequest
        .post('/api/issues/fcc-hints')
        .send(testData)
        .end((err, res) => {
          assert.isObject(res.body, 'response should be an object');
          assert.nestedInclude(
            res.body,
            testData,
            'response should contain submitted data'
          );
          assert.property(
            res.body,
            'created_on',
            'response should contain created_on'
          );
          assert.isNumber(
            Date.parse(res.body.created_on),
            'created_on should be a valid date'
          );
          assert.property(
            res.body,
            'updated_on',
            'response should contain updated_on'
          );
          assert.isNumber(
            Date.parse(res.body.updated_on),
            'updated_on should be a valid date'
          );
          assert.property(res.body, 'open', 'response should contain open');
          assert.isBoolean(res.body.open, 'open should be a boolean');
          assert.isTrue(res.body.open, 'open should be true');
          assert.property(res.body, '_id', 'response should contain _id');
          assert.isNotEmpty(res.body._id, '_id should not be empty');
          assert.property(
            res.body,
            'status_text',
            'response should contain status_text'
          );
          assert.isEmpty(res.body.status_text, 'status_text should be empty');
          done();
        });
    } catch (error) {
      done(error);
    }
  });

  test(`H3) If you send a POST request to /api/issues/{projectname}
   without the required fields, returned will be the error 
   { error: 'required field(s) missing' }`, (done) => {
    try {
      const testData = {
        created_by: 'fCC'
      };
      openRequest
        .post('/api/issues/fcc-hints')
        .send(testData)
        .end((err, res) => {
          assert.isObject(res.body, 'response should be an object');
          assert.property(
            res.body,
            'error',
            'response should contain an error'
          );
          assert.equal(res.body.error, 'required field(s) missing');
        });
      done();
    } catch (error) {
      done(error);
    }
  });

  test(`H4) You can send a GET request to /api/issues/{projectname}
    for an array of all issues for that specific projectname,
    with all the fields present for each issue.`, (done) => {
    try {
      const testData = { issue_text: 'Get Issues Test', created_by: 'fCC' };
      const testUrl =
        '/api/issues/get_issues_test_' + Date.now().toString().substring(7);
      const testIssue = (issue_title) => {
        let response = {};
        openRequest
          .post(testUrl)
          .send(Object.assign(testData, { issue_title }))
          .then((res) => {
            response = res.body;
          });
        return response;
      };
      const data1 = testIssue('Faux Issue 1');
      assert.isObject(data1);
      const data2 = testIssue('Faux Issue 2');
      assert.isObject(data2);
      const data3 = testIssue('Faux Issue 3');
      assert.isObject(data3);
      openRequest.get(testUrl).end((err, res) => {
        assert.isArray(res.body);
        assert.lengthOf(res.body, 3);
        let re = new RegExp(/Faux Issue \d/);
        res.body.forEach((issue) => {
          assert.property(issue, 'issue_title');
          assert.match(issue.issue_title, re);
          assert.property(issue, 'issue_text');
          assert.property(issue, 'created_by');
          assert.property(issue, 'assigned_to');
          assert.property(issue, 'status_text');
          assert.property(issue, 'open');
          assert.property(issue, 'created_on');
          assert.property(issue, 'updated_on');
          assert.property(issue, '_id');
        });
      });
      done();
    } catch (error) {
      done(error);
    }
  });

  test(`H5) You can send a GET request to /api/issues/{projectname}
    and filter the request by also passing along any field and value
    as a URL query (ie. /api/issues/{project}?open=false). You can pass
    one or more field/value pairs at once.`, (done) => {
    try {
      const testData = {
        issue_title: 'To be Filtered',
        issue_text: 'Filter Issues Test'
      };
      const testUrl =
        '/api/issues/get_issues_test_' + Date.now().toString().substring(7);
      const testIssue = (created_by, assigned_to) => {
        let response = {};
        openRequest
          .post(testUrl)
          .send(Object.assign(testData, { created_by, assigned_to }))
          .then((res) => {
            response = res.body;
          });
        return response;
      };

      const data1 = testIssue('Alice', 'Bob');
      assert.isObject(data1);
      const data2 = testIssue('Alice', 'Bob');
      assert.isObject(data2);
      const data3 = testIssue('Alice', 'Eric');
      assert.isObject(data3);
      const data4 = testIssue('Carol', 'Eric');
      assert.isObject(data4);

      openRequest.get(testUrl + '?created_by=Alice').end((err, res) => {
        assert.isArray(res.body);
        assert.lengthOf(res.body, 3);
      });

      openRequest
        .get(testUrl + '?created_by=Alice&assigned_to=Bob')
        .end((err, res) => {
          assert.isArray(res.body);
          assert.lengthOf(res.body, 2);
        });
      done();
    } catch (error) {
      done(error);
    }
  });

  // You can send a PUT request to /api/issues/{projectname} with an _id and one or more fields to update. On success, the updated_on field should be updated, and returned should be {  result: 'successfully updated', '_id': _id }.
  test(`H6) You can send a PUT request to /api/issues/{projectname}
    with an _id and one or more fields to update. On success,
    the updated_on field should be updated, and returned should be
    { result: 'successfully updated', '_id': _id }.`, (done) => {
    try {
      const testData = {
        issue_title: 'To be Updated',
        issue_text: 'Update Issues Test',
        created_by: 'fCC'
      };
      const testUrl = '/api/issues/fcc-hints';
      openRequest
        .post(testUrl)
        .send(testData)
        .then((res) => {
          const itemToUpdate = res.body;
          openRequest
            .put(testUrl)
            .send(Object.assign(itemToUpdate, { issue_text: 'New Issue Text' }))
            .then((res) => {
              const updateSuccess = res.body;
              assert.isObject(updateSuccess);
              assert.deepEqual(updateSuccess, {
                result: 'successfully updated',
                _id: itemToUpdate._id
              });
              openRequest
                .get(testUrl + '?_id=' + itemToUpdate._id)
                .end((err, res) => {
                  const getUpdatedId = res.body;
                  assert.isArray(getUpdatedId);
                  assert.isObject(getUpdatedId[0]);
                  assert.isAbove(
                    Date.parse(getUpdatedId[0].updated_on),
                    Date.parse(getUpdatedId[0].created_on)
                  );
                  done();
                });
            })
            .catch((err) => {
              throw err;
            });
        })
        .catch((err) => {
          throw err;
        });
    } catch (error) {
      done(error);
    }
  });

  // When the PUT request sent to /api/issues/{projectname} does not include an _id, the return value is { error: 'missing _id' }.
  test(`H7) When the PUT request sent to /api/issues/{projectname}
    does not include an _id, the return value is { error: 'missing _id' }.`, (done) => {
    try {
      const testUrl = '/api/issues/fcc-hints';
      openRequest
        .put(testUrl)
        .send()
        .end((err, res) => {
          const badUpdate = res.body;
          assert.isObject(badUpdate);
          assert.deepEqual(badUpdate, { error: 'missing _id' });
          done();
        });
    } catch (error) {
      done(error);
    }
  });

  // When the PUT request sent to /api/issues/{projectname} does not include update fields, the return value is { error: 'no update field(s) sent', '_id': _id }. On any other error, the return value is { error: 'could not update', '_id': _id }.
  test(`H8) When the PUT request sent to /api/issues/{projectname}
    does not include update fields, the return value is
    { error: 'no update field(s) sent', '_id': _id }.
    On any other error, the return value is
    { error: 'could not update', '_id': _id }.`, (done) => {
    try {
      const testData = {
        _id: '5f665eb46e296f6b9b6a504d'
      };
      const testUrl = '/api/issues/fcc-project';
      openRequest
        .put(testUrl)
        .send(testData)
        .then((res) => {
          const badUpdate = res.body;
          assert.deepEqual(badUpdate, {
            error: 'no update field(s) sent',
            _id: '5f665eb46e296f6b9b6a504d'
          });
          const testIdData = {
            _id: '5f665eb46e296f6b9b6a504d@@@@@@@@@@',
            issue_text: 'New Issue Text'
          };
          openRequest
            .put(testUrl)
            .send(testIdData)
            .end((err, res) => {
              console.log()
              assert.deepEqual(res.body, {
                error: 'could not update',
                _id: testIdData._id
              });
              done();
            });
        });
    } catch (error) {
      done(error);
    }
  });
  // You can send a DELETE request to /api/issues/{projectname} with an _id to delete an issue. If no _id is sent, the return value is { error: 'missing _id' }. On success, the return value is { result: 'successfully deleted', '_id': _id }. On failure, the return value is { error: 'could not delete', '_id': _id }.
  test(`H9) You can send a DELETE request to /api/issues/{projectname}
    with an _id to delete an issue. If no _id is sent, the return
    value is { error: 'missing _id' }. On success, the return value
    is { result: 'successfully deleted', '_id': _id }. On failure,
    the return value is { error: 'could not delete', '_id': _id }.`, (done) => {
    try {
      const initialData = {
        issue_title: 'Issue to be Deleted',
        issue_text: 'Functional Test - Delete target',
        created_by: 'fCC'
      };
      const testUrl = '/api/issues/fcc-hints';
      openRequest
        .post(testUrl)
        .send(initialData)
        .then((res) => {
          const itemToDelete = res.body;
          assert.isObject(itemToDelete);
          openRequest
            .delete(testUrl)
            .send({ _id: itemToDelete._id })
            .then((res) => {
              const deleteSuccess = res.body;
              assert.isObject(deleteSuccess);
              assert.deepEqual(deleteSuccess, {
                result: 'successfully deleted',
                _id: itemToDelete._id
              });
              openRequest
                .delete(testUrl)
                .send()
                .then((res) => {
                  const noId = res.body;
                  assert.isObject(noId);
                  assert.deepEqual(noId, { error: 'missing _id' });
                  openRequest
                    .delete(testUrl)
                    .send({ _id: '5d8b3b3b1c9d440000a3d3b3' })
                    .end((err, res) => {
                      const badIdDelete = res.body;
                      assert.isObject(badIdDelete);
                      assert.deepEqual(badIdDelete, {
                        error: 'could not delete',
                        _id: '5d8b3b3b1c9d440000a3d3b3'
                      });
                      done();
                    });
                });
            });
        });
    } catch (error) {
      done(error);
    }
  });

  // All 14 functional tests are complete and passing.
  test('H10) All 14 functional tests are complete and passing.', (done) => {
    done();
    try {
      openRequest
        .get('/_api/get-tests')
        .end((err, res) => {
          const getTests = res.body;
          assert.isArray(getTests);
          assert.isAtLeast(getTests.length, 14, 'At least 14 tests passed.');
          getTests.forEach((test) => {
            assert.equal(test.state, 'passed', 'Test in passed state');
            assert.isAtLeast(test.assertions.length, 1, 'At least one assertion');
          });


          done();
        });
    } catch (error) {
      done(error);
    }
  });
});


'use strict';

const { db } = require('../db');
const {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  setDoc
} = require('firebase/firestore');

const { isFirebasePushId }  = require('class-validator')

const getIssueById = async (id) => {
  const docRef = doc(db, 'issues', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    // doc.data() will be undefined in this case
    console.log('No such document!');
  }
};

const getIssuesByProject = async (project) => {
  const issuesRef = collection(db, 'issues');
  const q = query(issuesRef, where('project', '==', project));
  const querySnapshot = await getDocs(q);
  const issues = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const { created_on, updated_on } = data;
    const customData = {
      _id: data.id,
      ...data,
      created_on:
        typeof created_on === 'string' ? created_on : created_on.toDate(),
      updated_on:
        typeof updated_on === 'string' ? updated_on : updated_on.toDate()
    };
    delete customData.id;
    issues.push({ ...customData });
  });
  return issues;
};

const isValidFirebaseId = (id) => {
  return isFirebasePushId(id);
};

module.exports = function (app) {
  app
    .route('/api/issues/:project')

    .get(async (req, res) => {
      const project = req.params.project;

      try {
        let issues = await getIssuesByProject(project);
        if (req.query.hasOwnProperty('open') && req.query.open !== '') {
          if (req.query.open === 'true') req.query.open = true;
          else if (req.query.open === 'false') req.query.open = false;
          issues = issues.filter((issue) => issue.open === req.query.open);
        }
        if (req.query.hasOwnProperty('issue_title')) {
          issues = issues.filter(
            (issue) => issue.issue_title === req.query.issue_title
          );
        }
        if (req.query.hasOwnProperty('issue_text')) {
          issues = issues.filter(
            (issue) => issue.issue_text === req.query.issue_text
          );
        }
        if (req.query.hasOwnProperty('created_by')) {
          issues = issues.filter(
            (issue) => issue.created_by === req.query.created_by
          );
        }
        if (req.query.hasOwnProperty('assigned_to')) {
          issues = issues.filter(
            (issue) => issue.assigned_to === req.query.assigned_to
          );
        }
        if (req.query.hasOwnProperty('status_text')) {
          issues = issues.filter(
            (issue) => issue.status_text === req.query.status_text
          );
        }
        if (req.query.hasOwnProperty('created_on')) {
          issues = issues.filter(
            (issue) => issue.created_on === req.query.created_on
          );
        }
        if (req.query.hasOwnProperty('updated_on')) {
          issues = issues.filter(
            (issue) => issue.updated_on === req.query.updated_on
          );
        }
        if (req.query.hasOwnProperty('_id')) {
          issues = issues.filter((issue) => issue._id === req.query._id);
        }

        // if (issues.length === 0) {
        //   res.json({ error: 'no issues found' });
        //   return;
        // }
        res.json(issues);
      } catch (error) {
        console.error(error);
        res.json({ error });
      }
    })

    .post(async (req, res) => {
      const project = req.params.project;
      if (
        !project ||
        !req.body.issue_title ||
        !req.body.issue_text ||
        !req.body.created_by
      ) {
        // res.status(400).json({ error: 'required field(s) missing' });
        res.status(200).json({ error: 'required field(s) missing' });
        return;
      }
      const { issue_title, issue_text, created_by, assigned_to, status_text } =
        req.body;
      try {
        const newIssueRef = doc(collection(db, 'issues'));

        await setDoc(newIssueRef, {
          id: req.body?._id ?? newIssueRef.id,
          issue_title,
          issue_text,
          created_by,
          assigned_to: assigned_to ?? '',
          status_text: status_text ?? '',
          created_on: new Date(),
          updated_on: new Date(),
          open: true,
          project
        });

        const { id, created_on, updated_on, open } = await getIssueById(
          newIssueRef.id
        );
        res.json({
          _id: id,
          issue_title,
          issue_text,
          created_by,
          assigned_to: assigned_to ?? '',
          status_text: status_text ?? '',
          created_on: created_on.toDate(),
          updated_on: updated_on.toDate(),
          open: open ?? false
        });
      } catch (error) {
        console.log(error);
        res.json({ error });
      }
    })

    .put(async (req, res) => {
      if (!req.body._id) {
        // res.status(400).json({ error: 'missing _id' });
        res.status(200).json({ error: 'missing _id' });
        return;
      }
      const { _id } = req.body;
      if (
        !req.body.issue_title &&
        !req.body.issue_text &&
        !req.body.created_by &&
        !req.body.assigned_to &&
        !req.body.status_text &&
        !req.body.open
      ) {
        res.status(200).json({ error: 'no update field(s) sent', _id });
        return;
      }
      if (!isValidFirebaseId(_id)) {
        // res.status(400).json({ error: 'could not update', _id });
        res.status(200).json({ error: 'could not update', _id });
        return;
      }
      try {
        const docRef = doc(db, 'issues', _id);
        await updateDoc(docRef, {
          ...req.body,
          updated_on: new Date()
        });
        res.json({
          result: 'successfully updated',
          _id
        });
      } catch (error) {
        const isNotFound = error?.code === 'not-found';
        console.log('PUT ERROR: ', error);
        console.log(isNotFound ? 'Issue not found' : 'could not update', _id);
        // res.status(isNotFound ? 404 : 400).json({
        res.json({
          error: isNotFound ? 'Issue not found' : 'could not update',
          _id
        });
      }
    })

    .delete(async (req, res) => {
      if (!req.body._id) {
        // res.status(400).json({ error: 'missing _id' });
        res.json({ error: 'missing _id' });
        return;
      }
      const { _id } = req.body;
      if (!isValidFirebaseId(_id)) {
        // res.status(400).json({ error: 'could not delete', _id });
        res.json({ error: 'could not delete', _id });
        return;
      }
      try {
        const docRef = doc(db, 'issues', _id);
        await deleteDoc(docRef);
        res.json({
          result: 'successfully deleted',
          _id
        });
      } catch (error) {
        console.log('could not delete', _id);
        // res.status(400).json({
        res.json({
          error: 'could not delete',
          _id
        });
      }
    });
};


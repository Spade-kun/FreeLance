import express from 'express';
import { proxyRequest } from '../utils/proxyHelper.js';

const router = express.Router();
const USER_SERVICE = process.env.USER_SERVICE_URL || 'http://localhost:1003';

// Admin routes
router.get('/admins', (req, res) => proxyRequest(req, res, `${USER_SERVICE}/api/users/admins`));
router.get('/admins/:id', (req, res) => proxyRequest(req, res, `${USER_SERVICE}/api/users/admins/${req.params.id}`));
router.post('/admins', (req, res) => proxyRequest(req, res, `${USER_SERVICE}/api/users/admins`));
router.put('/admins/:id', (req, res) => proxyRequest(req, res, `${USER_SERVICE}/api/users/admins/${req.params.id}`));
router.delete('/admins/:id', (req, res) => proxyRequest(req, res, `${USER_SERVICE}/api/users/admins/${req.params.id}`));

// Instructor routes
router.get('/instructors', (req, res) => proxyRequest(req, res, `${USER_SERVICE}/api/users/instructors`));
router.get('/instructors/:id', (req, res) => proxyRequest(req, res, `${USER_SERVICE}/api/users/instructors/${req.params.id}`));
router.post('/instructors', (req, res) => proxyRequest(req, res, `${USER_SERVICE}/api/users/instructors`));
router.put('/instructors/:id', (req, res) => proxyRequest(req, res, `${USER_SERVICE}/api/users/instructors/${req.params.id}`));
router.delete('/instructors/:id', (req, res) => proxyRequest(req, res, `${USER_SERVICE}/api/users/instructors/${req.params.id}`));

// Student routes
router.get('/students', (req, res) => proxyRequest(req, res, `${USER_SERVICE}/api/users/students`));
router.get('/students/:id', (req, res) => proxyRequest(req, res, `${USER_SERVICE}/api/users/students/${req.params.id}`));
router.post('/students', (req, res) => proxyRequest(req, res, `${USER_SERVICE}/api/users/students`));
router.put('/students/:id', (req, res) => proxyRequest(req, res, `${USER_SERVICE}/api/users/students/${req.params.id}`));
router.delete('/students/:id', (req, res) => proxyRequest(req, res, `${USER_SERVICE}/api/users/students/${req.params.id}`));

// Profile routes
router.get('/profile/:id', (req, res) => proxyRequest(req, res, `${USER_SERVICE}/api/users/profile/${req.params.id}`));
router.put('/profile/:id', (req, res) => proxyRequest(req, res, `${USER_SERVICE}/api/users/profile/${req.params.id}`));

export default router;

exports.login = (req, res, sendJson) => {
  const { email, password } = req.body;
  if (!email || !email.includes('@') || !password) {
    return sendJson(res, 400, { success: false, message: 'Valid email and password are required.' });
  }
  return sendJson(res, 200, { success: true, message: 'Login endpoint stub successful.', user: { id: 1, email } });
};

exports.register = (req, res, sendJson) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !email.includes('@') || !password || password.length < 6) {
    return sendJson(res, 400, { success: false, message: 'Name, valid email, and 6+ character password are required.' });
  }
  return sendJson(res, 201, { success: true, message: 'Registration endpoint stub successful.', user: { id: 1, fullName, email } });
};

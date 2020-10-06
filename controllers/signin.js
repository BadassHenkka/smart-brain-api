// SIGNIN ROUTE
// Selects the emaill and hashes/passwords from login table in the database.
// Checks if there's a match with the entered email and then compares
// entered password to the hash (in this case synchronously but async could be used as well).
// Bcrypt compareSync returns true or false. If it checks out
// it returns the user information and otherwise throws error.

const handleSignin = (db, bcrypt) => (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json('incorrect form submission');
  }
  db.select('email', 'hash')
    .from('login')
    .where('email', '=', email)
    .then((data) => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return db
          .select('*')
          .from('users')
          .where('email', '=', email)
          .then((user) => {
            res.json(user[0]);
          })
          .catch((err) => res.status(400).json('unable to get user'));
      } else {
        res.status(400).json('wrong credentials');
      }
    })
    .catch((err) => res.status(400).json('wrong credentials'));
};

module.exports = {
  handleSignin: handleSignin,
};

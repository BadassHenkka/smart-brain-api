// REGISTER ROUTE
// Gets the email, name and password that the user wrote from the body
// and uses Knex to insert new user information into the database.

// A transaction (trx) is needed when you're trying to do more than one thing at a time.
// Here we insert the hashed password and email into the login table in the database.
// It then returns the email and then we use the login email to return another
// trx transaction to insert into the users table and responds with the
// newly created user in json. Then finally it has to be committed and in case
// anything fails we roll back the changes.

const handleRegister = (req, res, db, bcrypt) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json('incorrect form submission');
  }
  const hash = bcrypt.hashSync(password);
  db.transaction((trx) => {
    trx
      .insert({
        hash: hash,
        email: email,
      })
      .into('login')
      .returning('email')
      .then((loginEmail) => {
        return trx('users')
          .returning('*')
          .insert({
            email: loginEmail[0],
            name: name,
            joined: new Date(),
          })
          .then((user) => {
            res.json(user[0]);
          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch((err) => res.status(400).json('unable to register'));
};

module.exports = {
  handleRegister: handleRegister,
};

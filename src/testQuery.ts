export const insertExampleUserAndExercise = async (db: any, username: string) => {
  try {
    const result = await db.run('INSERT INTO Users (username) VALUES (?)', username);
    console.log('Inserting test username: ', result);
    const user = await db.get('SELECT * FROM Users WHERE username = ?', username);
    console.log('Getting user from db', user);
  } catch (error) {
    console.log('error');
    console.log(error);
  }
};

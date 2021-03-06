const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
});

// Returns one user and its data or all users and their data, used in getUsers
exports.selectUsers = async (username) => {
    let select = 'SELECT username, userpassword, firstname, lastname, useremail, avatar, showavatar FROM giftuser';
    if (username) {
        select += ` WHERE username = $1`;
    }
    const query = {
        text: select,
        values: [username ? `${username}` : []],
    };
    const { rows } = await pool.query(query);
    const allUsers = [];
    for (const row of rows) {
        allUsers.push({ username: row.username, userpassword: row.userpassword, firstname: row.firstname, lastname: row.lastname, useremail: row.useremail, avatar: row.avatar, showavatar: row.showavatar });
    }
    return allUsers;
};

// Inserts user data in giftusers table.
exports.insertUser = async (username, userpassword, firstname, lastname, useremail, avatar, showavatar) => {
    console.log('db.js: insertUsers called');
    let insert = `INSERT INTO giftuser(username, userpassword, firstname, lastname, useremail, avatar, showavatar) VALUES('${username}', '${userpassword}', '${firstname}', '${lastname}', '${useremail}', '${avatar}', '${showavatar}')`;
    // console.log(insert);
    // const { rows } = await pool.query(query);
    // if (rows.length == 1) {
    //     rows[0].userpassword = userpassword;
    // }

    pool.query(insert, (err, res) => {
        if (err) {
            console.log("db.js: insertUsers: error!")
            console.error(err);
            return;
        }
        console.log("db.js: insertUsers: user info inserted into giftusers table!");
    });
}

// Update the current username with the new username the user changed
exports.updateUsername = async (username) => {
    let splitArrayUsername = username.split(" ")
    let oldUser = splitArrayUsername[0]
    // console.log(oldUser);
    let newUser = splitArrayUsername[1]
    // console.log(newUser);
   
    // update other tables with new username
    const updateQuestionnaire = `UPDATE questionnaireresponses SET username = '${newUser}' WHERE username = '${oldUser}'`;
    const q = await pool.query(updateQuestionnaire);
    const updateWishlist = `UPDATE wishlist SET username = '${newUser}' WHERE username = '${oldUser}'`;
    // const w = await pool.query(updateWishlist)

    // delete row in giftusers table containing old username
    const deleteOldUser = `DELETE FROM giftuser WHERE username='${oldUser}'`
    const d = await pool.query(deleteOldUser);
    
    console.log("db.js: updateUsername: new username updated in giftusers and questionnaireresponses table!");

    return;
};

// gift.js sends username to db.js. if username is found, it returns all parameters of that row
exports.selectQResponses = async (username) => {
    let select = `SELECT * FROM questionnaireresponses WHERE username = '${username}'`;
    console.log('db.js: selectQResponse: start selectQResponse');
    try {
        const result =  await pool.query(select);
        console.log(result.rowCount);
        console.log(result.rows[0]);
        if (result) {
            console.log('db.js: selectQResponse: finish selectQResponse');
            return result.rows[0];
        }
    } catch (err) {
        console.log(err.stack)
        return;
    }
};

// Inserts questionnaire responses in questionnaireresponses table.
exports.insertQResponses = async (username, outdooractivity, place, store, musicgenre, musician, band, indooractivity, movietvshow, videogame, sport, sportsteam, exercise) => {
    console.log('db.js: insertQResponses called');
    let insert = `INSERT INTO questionnaireresponses(username, outdooractivity, place, store, musicgenre, musician, band, indooractivity, movietvshow, videogame, sport, sportsteam, exercise) VALUES('${username}', '${outdooractivity}', '${place}', '${store}', '${musicgenre}', '${musician}', '${band}', '${indooractivity}', '${movietvshow}', '${videogame}', '${sport}', '${sportsteam}', '${exercise}')`;
    // console.log(insert);
    pool.query(insert, (err, res) => {
        if (err) {
            console.log("db.js: error!")
            console.error(err);
            return;
        }
        console.log("db.js: insertQResponse: responses inserted into questionnaireresponses table!");
    });
}

// Updates questionnaire responses in questionnaireresponses table.
exports.updateQResponses = async (username, outdooractivity, place, store, musicgenre, musician, band, indooractivity, movietvshow, videogame, sport, sportsteam, exercise) => {
    console.log('db.js: updateQResponses called');

    let update = 'UPDATE questionnaireresponses ';
    update += `SET outdooractivity = '${outdooractivity}', place = '${place}', store = '${store}', musicgenre = '${musicgenre}', musician = '${musician}', band = '${band}', indooractivity = '${indooractivity}', movietvshow = '${movietvshow}', videogame = '${videogame}', sport = '${sport}', sportsteam = '${sportsteam}', exercise = '${exercise}' `;
    update += `WHERE username = '${username}'`;
    // console.log(update);

    pool.query(update, (err, res) => {
        if (err) {
            console.log("db.js: error!")
            console.error(err);
            return;
        }
        console.log("db.js: updateQResponse: responses updated in questionnaireresponses table!");
        return;
    });
}



// Returns one user and its data or all users and their data, used in getUsers
exports.authenticateUser = async (username) => {
    let select = 'SELECT username, userpassword FROM giftuser';
    if (username) {
        select += ` WHERE username = $1`;
    }
    const query = {
        text: select,
        values: [username ? `${username}` : []],
    };
    const { rows } = await pool.query(query);
    const allUsers = [];
    for (const row of rows) {
        allUsers.push({ username: row.username, userpassword: row.userpassword, firstname: row.firstname, lastname: row.lastname, useremail: row.useremail, avatar: row.avatar, showavatar: row.showavatar });
    }
    return allUsers;
};

console.log(`Connected to database '${process.env.POSTGRES_DB}'`);
